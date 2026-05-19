"use server";

import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { success: false, error: 'Username and password are required.' };
  }

  try {
    const { rows } = await sql`SELECT id, username, password_hash, role FROM users WHERE username = ${username}`;
    const user = rows[0];

    if (!user) {
      return { success: false, error: 'Invalid username or password.' };
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return { success: false, error: 'Invalid username or password.' };
    }

    // Set a simple session cookie for this prototype
    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify({ id: user.id, username: user.username, role: user.role }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: 'An error occurred during login: ' + error.message };
  }
  
  redirect('/');
}

export async function registerAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm_password') as string;
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;

  if (!username || !password || !confirmPassword || !firstName || !lastName || !phone || !email) {
    return { success: false, error: 'All fields are required.' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  try {
    const { rowCount } = await sql`SELECT id FROM users WHERE username = ${username}`;
    if (rowCount && rowCount > 0) {
      return { success: false, error: 'Username already exists.' };
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = await sql`
      INSERT INTO users (username, password_hash, first_name, last_name, phone, email, role) 
      VALUES (${username}, ${hash}, ${firstName}, ${lastName}, ${phone}, ${email}, 'employee')
      RETURNING id
    `;
    const newUserId = result.rows[0].id;

    // Automatically log in the new user
    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify({ id: newUserId, username, role: 'employee' }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: 'An error occurred during registration: ' + error.message };
  }
  
  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}


