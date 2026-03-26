'use server'

import connectDB from '@/lib/mongoose';
import User, { IUser, UserRole } from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const AUTH_SECRET = process.env.AUTH_SECRET || 'default_secret';
const key = new TextEncoder().encode(AUTH_SECRET);

/**
 * Creates a session JWT token.
 */
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

/**
 * Decrypts a session JWT token.
 */
export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

/**
 * Handles User Registration.
 */
export async function registerAction(formData: FormData) {
  try {
    await connectDB();
    
    const fullName = formData.get('fullName') as string;
    const identification = formData.get('identification') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { identification }] 
    });

    if (existingUser) {
      return { success: false, error: 'La identificación o el correo ya están registrados.' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (default role is DOCENTE)
    const newUser = await User.create({
      fullName,
      identification,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'DOCENTE',
    });

    // Automatically log in after registration
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ 
      user: { 
        id: newUser._id.toString(), 
        fullName: newUser.fullName, 
        email: newUser.email,
        role: newUser.role
      }, 
      expires 
    });

    (await cookies()).set('session', session, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return { success: true };

  } catch (error: any) {
    console.error('Registration Error:', error);
    return { success: false, error: 'No se pudo completar el registro. Intente de nuevo.' };
  }
}

/**
 * Handles User Login.
 */
export async function loginAction(formData: FormData) {
  try {
    await connectDB();
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return { success: false, error: 'Credenciales inválidas.' };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { success: false, error: 'Credenciales inválidas.' };
    }

    // Create session
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ 
      user: { 
        id: user._id.toString(), 
        fullName: user.fullName, 
        email: user.email,
        role: user.role
      }, 
      expires 
    });

    (await cookies()).set('session', session, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return { success: true };

  } catch (error: any) {
    console.error('Login Error:', error);
    return { success: false, error: 'Error al iniciar sesión.' };
  }
}

/**
 * Logs out the user.
 */
export async function logoutAction() {
  (await cookies()).delete('session');
  redirect('/login');
}

/**
 * Gets the current session user.
 */
export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  return await decrypt(session);
}
