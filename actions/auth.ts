"use server";

import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

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

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, error: 'Email is required.' };
  }

  try {
    const { rows } = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (rows.length === 0) {
      // Don't reveal if email exists or not for security, just return success
      return { success: true, message: 'If this email is registered, you will receive a password reset link.' };
    }

    const token = uuidv4();
    const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

    await sql`UPDATE users SET reset_token = ${token}, reset_token_expiry = ${expiry} WHERE email = ${email}`;

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Brewery System" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: sans-serif; p-4">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password for the Phetkasem Brewery System.</p>
          <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #ffbf00; color: #000; text-decoration: none; font-weight: bold; border-radius: 5px;">Reset Password</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      await transporter.sendMail(mailOptions);
    } else {
      console.warn("WARNING: GMAIL_USER or GMAIL_APP_PASSWORD is not set. Email not sent.");
      console.warn("Reset link generated:", resetLink);
      return { success: false, error: 'Email service is not configured. Check server logs for the reset link.' };
    }

    return { success: true, message: 'Password reset link sent to your email.' };
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return { success: false, error: 'An error occurred. Please try again later.' };
  }
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (!token || !password || !confirmPassword) {
    return { success: false, error: 'All fields are required.' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  try {
    const { rows } = await sql`
      SELECT id, reset_token_expiry FROM users 
      WHERE reset_token = ${token}
    `;

    if (rows.length === 0) {
      return { success: false, error: 'Invalid or expired reset token.' };
    }

    const user = rows[0];
    if (new Date(user.reset_token_expiry) < new Date()) {
      return { success: false, error: 'Reset token has expired. Please request a new one.' };
    }

    const hash = bcrypt.hashSync(password, 10);

    await sql`
      UPDATE users 
      SET password_hash = ${hash}, reset_token = NULL, reset_token_expiry = NULL 
      WHERE id = ${user.id}
    `;

    return { success: true, message: 'Password has been successfully reset. You can now log in.' };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return { success: false, error: 'An error occurred. Please try again later.' };
  }
}
