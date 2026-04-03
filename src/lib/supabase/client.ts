import { createClient } from '@supabase/supabase-js';

// NM MART - Final Supabase Configuration
const supabaseUrl = 'https://wcoymnkyqjlncztyabxc.supabase.co';
const supabaseAnonKey = 'sb_publishable_8yFEGZaTqzkOirj2ax---g_R8E4PiSV';

// क्लाइंट बनाना
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* अब्दुल भाई, एक बात का ध्यान रखियेगा: 
  अगर वेबसाइट पर अब भी सामान (Items) नहीं दिख रहे, 
  तो इसका मतलब है कि आपका बाकी कोड 'items' नाम की टेबल ढूंढ रहा है।
  उसे ठीक करने के लिए आपको कोड में जहाँ भी '.from('items')' लिखा है, 
  उसे बदलकर '.from('products')' करना होगा।
*/
