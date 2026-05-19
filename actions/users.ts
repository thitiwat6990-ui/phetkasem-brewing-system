"use server";

import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function getUsers() {
  try {
    const cookieStore = await cookies();
    const sessionStr = cookieStore.get('session')?.value;
    if (!sessionStr) return [];
    
    const session = JSON.parse(sessionStr);
    if (session.role !== 'Master brewer' && session.role !== 'admin') return [];

    const result = await sql`SELECT id, username, first_name, last_name, phone, email, role, created_at FROM users ORDER BY id ASC`;
    return result.rows;
  } catch (e) {
    return [];
  }
}

export async function updateUserRole(userId: number, newRole: string) {
  try {
    const cookieStore = await cookies();
    const sessionStr = cookieStore.get('session')?.value;
    if (!sessionStr) return { success: false, error: 'Unauthorized' };
    
    const session = JSON.parse(sessionStr);
    if (session.role !== 'Master brewer' && session.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    await sql`UPDATE users SET role = ${newRole} WHERE id = ${userId}`;
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteUserAction(userId: number) {
  try {
    const cookieStore = await cookies();
    const sessionStr = cookieStore.get('session')?.value;
    if (!sessionStr) return { success: false, error: 'Unauthorized' };
    
    const session = JSON.parse(sessionStr);
    if (session.role !== 'Master brewer' && session.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    // Prevent deleting oneself
    if (session.id === userId) {
      return { success: false, error: 'Cannot delete your own account.' };
    }

    await sql`DELETE FROM users WHERE id = ${userId}`;
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createAccountAction(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const sessionStr = cookieStore.get('session')?.value;
    if (!sessionStr) return { success: false, error: 'Unauthorized' };
    
    const session = JSON.parse(sessionStr);
    if (session.role !== 'Master brewer' && session.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    if (!username || !password || !firstName || !lastName || !role) {
      return { success: false, error: 'Required fields are missing.' };
    }

    const { rowCount } = await sql`SELECT id FROM users WHERE username = ${username}`;
    if ((rowCount ?? 0) > 0) {
      return { success: false, error: 'Username already exists.' };
    }

    const hash = bcrypt.hashSync(password, 10);
    await sql`
      INSERT INTO users (username, password_hash, first_name, last_name, phone, email, role) 
      VALUES (${username}, ${hash}, ${firstName}, ${lastName}, ${phone || null}, ${email || null}, ${role})
    `;
    
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
