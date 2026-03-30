import { createClient } from '@supabase/supabase-js';

// आपकी नई Supabase की चाबियाँ यहाँ सेट कर दी गई हैं
const supabaseUrl = 'https://ydqjrtgrzetyxhcuqvoy.supabase.co';
const supabaseAnonKey = 'sb_publishable_NOZCBGcyAm5SVWREtn9_Vw_LhynM0Py';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
