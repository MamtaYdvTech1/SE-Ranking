import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vbymsyjjaygipxfkyqxm.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'placeholder-anon-key';

let cachedClient: any = null;

export function getBrowserSupabaseClient() {
  if (cachedClient) return cachedClient;
  try {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  } catch (err) {
    console.error('Supabase browser client init warning:', err);
    cachedClient = null;
  }
  return cachedClient;
}

export const supabase = getBrowserSupabaseClient();
