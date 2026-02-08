import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Sign up a student - requires college email (e.g. @college.edu, @university.edu)
 */
export async function signUpStudent(email, password, name, phone) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_type: 'student',
        full_name: name,
        phone,
      },
    },
  });

  if (error) throw error;

  if (data?.user) {
    await createProfile(data.user.id, 'student', name, phone, null);
  }

  return data;
}

/**
 * Sign up a driver - requires license number
 */
export async function signUpDriver(email, password, name, phone, licenseNumber) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_type: 'driver',
        full_name: name,
        phone,
        license_number: licenseNumber,
      },
    },
  });

  if (error) throw error;

  if (data?.user) {
    await createProfile(data.user.id, 'driver', name, phone, licenseNumber);
  }

  return data;
}

/**
 * Create or update profile in profiles table
 */
async function createProfile(userId, userType, name, phone, licenseNumber) {
  const profile = {
    id: userId,
    user_type: userType,
    full_name: name,
    phone,
    updated_at: new Date().toISOString(),
  };

  if (userType === 'driver' && licenseNumber) {
    profile.license_number = licenseNumber;
  }

  const { error } = await supabase.from('profiles').upsert(profile, {
    onConflict: 'id',
  });

  if (error) console.warn('Profile creation warning:', error.message);
}

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get currently authenticated user
 */
export function getCurrentUser() {
  return supabase.auth.getUser();
}

/**
 * Get user profile (includes user_type: student/driver)
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
