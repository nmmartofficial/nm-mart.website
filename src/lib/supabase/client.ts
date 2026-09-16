import { createClient } from '@supabase/supabase-js';

// NM MART - Final Supabase Configuration (Supports both Vite and Next.js prefixes)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                    'https://ydqjrtgrzetyxhcuqvoy.supabase.co';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                        import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                        'sb_publishable_NOZCBGcyAm5SVWREtn9_Vw_LhynM0Py';

// Client created from public Supabase config only.
// This app is intended to use the existing live database without changing schema.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
