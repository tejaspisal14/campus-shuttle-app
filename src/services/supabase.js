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

// --- Shuttle & Ride Services ---

/**
 * Fetch all active shuttles
 */
export async function getActiveShuttles() {
  const { data, error } = await supabase
    .from('shuttles')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;
  return data || [];
}

/**
 * Subscribe to real-time shuttle updates (location, occupancy)
 */
export function subscribeToShuttles(callback) {
  const channel = supabase
    .channel('shuttles-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'shuttles' },
      (payload) => callback(payload)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/**
 * Subscribe to active shuttles with initial fetch + real-time
 */
export async function getActiveShuttlesWithRealtime(callback) {
  try {
    const shuttles = await getActiveShuttles();
    callback(shuttles?.length ? shuttles : []);
  } catch {
    callback([]);
  }

  return subscribeToShuttles(async () => {
    try {
      const updated = await getActiveShuttles();
      callback(updated?.length ? updated : []);
    } catch {
      callback([]);
    }
  });
}

/**
 * Start a ride - create ride entry when student boards with vehicle 4-digit
 */
export async function startRide(studentId, vehicle4digit) {
  const { data, error } = await supabase
    .from('rides')
    .insert({
      student_id: studentId,
      vehicle_code: String(vehicle4digit).padStart(4, '0'),
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get student's active ride
 */
export async function getStudentActiveRide(studentId) {
  const { data, error } = await supabase
    .from('rides')
    .select('*, shuttles(*)')
    .eq('student_id', studentId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Subscribe to ride updates for a student
 */
export function subscribeToStudentRide(studentId, callback) {
  const channel = supabase
    .channel(`rides-${studentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rides',
        filter: `student_id=eq.${studentId}`,
      },
      async () => {
        const ride = await getStudentActiveRide(studentId);
        callback(ride);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
