"use server";

import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { success: false, error: 'Username and password are required.' };
  }

  try {
    const user = db.prepare('SELECT id, username, password_hash, role FROM users WHERE username = ?').get(username) as any;

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
    return { success: false, error: 'An error occurred during login.' };
  }
  
  redirect('/');
}

export async function registerAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (!username || !password || !confirmPassword) {
    return { success: false, error: 'All fields are required.' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return { success: false, error: 'Username already exists.' };
    }

    const hash = bcrypt.hashSync(password, 10);
    const insert = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
    const result = insert.run(username, hash, 'brewer');

    // Automatically log in the new user
    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify({ id: result.lastInsertRowid, username, role: 'brewer' }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

  } catch (error: any) {
    return { success: false, error: 'An error occurred during registration.' };
  }
  
  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}
