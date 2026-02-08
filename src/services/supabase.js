import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';

// Initialize Supabase client
// Replace with your Supabase project URL and anon key
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
