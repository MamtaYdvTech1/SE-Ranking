import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://vbymsyjjaygipxfkyqxm.supabase.co';

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export function getSupabaseAdmin() {
  if (!supabaseServiceRoleKey) {
    console.warn('[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY is not defined. Limited functionality.');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey || 'placeholder-service-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
