import { createClient } from '@supabase/supabase-js';

const LIVE_PROJECT_FALLBACK_URL = 'https://mggkadgemqcyybsplkqc.supabase.co';
const LIVE_PROJECT_FALLBACK_ANON_KEY = 'sb_publishable_2OxrgQFimvpPG8OXPdxvmw_Qur7wHUj';

function resolveSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    LIVE_PROJECT_FALLBACK_URL;

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    LIVE_PROJECT_FALLBACK_ANON_KEY;

  const isUsingFallback = !import.meta.env.VITE_SUPABASE_URL &&
    !import.meta.env.NEXT_PUBLIC_SUPABASE_URL &&
    !import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isUsingFallback) {
    console.warn(
      '[Supabase] No explicit .env values detected. Using the project fallback public config. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local to control the connection safely.'
    );
  }

  return {
    url,
    anonKey,
    isUsingFallback,
  };
}

export const supabaseConfig = resolveSupabaseConfig();

// Client is intentionally created with public anon values only.
// This app should not use service-role credentials in the browser.
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
