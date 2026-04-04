import { createClient } from '@supabase/supabase-js';

// NM MART - Final Supabase Configuration (Supports both Vite and Next.js prefixes)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                    'https://ydqjrtgrzetyxhcuqvoy.supabase.co';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                        import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                        'sb_publishable_NOZCBGcyAm5SVWREtn9_Vw_LhynM0Py';

// क्लाइंट बनाना
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* अब्दुल भाई, एक बात का ध्यान रखियेगा: 
  1. Supabase Dashboard में जाइये (https://supabase.com).
  2. SQL Editor में ये कमांड रन कीजिये ताकि सामान (Products) दिखने लगें:
     
     CREATE POLICY "Allow public select" ON "public"."products"
     FOR SELECT USING (true);
     
  3. अगर टेबल का नाम 'Products' (P बड़ा) है, तो ऊपर 'products' की जगह 'Products' लिखें।
*/
