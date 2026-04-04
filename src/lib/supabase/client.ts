import { createClient } from '@supabase/supabase-js';

// NM MART - Final Supabase Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ydqjrtgrzetyxhcuqvoy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_secret_3MzreJNOmCAHfqczDukXIA_dCabn2rL';

// क्लाइंट बनाना
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* अब्दुल भाई, एक बात का ध्यान रखियेगा: 
  अगर वेबसाइट पर अब भी सामान (Items) नहीं दिख रहे, 
  तो इसका मतलब है कि आपका बाकी कोड 'items' नाम की टेबल ढूंढ रहा है।
  उसे ठीक करने के लिए आपको कोड में जहाँ भी '.from('items')' लिखा है, 
  उसे बदलकर '.from('products')' करना होगा।
*/
