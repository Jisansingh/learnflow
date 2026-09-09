import { createClient } from '@supabase/supabase-js';

// Simple Supabase client for the LearnFlow frontend.
// Uses only the public (publishable) key. Never expose secret keys.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);