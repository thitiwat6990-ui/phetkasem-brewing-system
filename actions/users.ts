"use server";

import { sql } from '@/lib/db';
import { cookies } from 'next/headers';

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
