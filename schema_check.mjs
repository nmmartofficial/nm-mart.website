import { createClient } from '@supabase/supabase-js';

const url = 'https://mggkadgemqcyybsplkqc.supabase.co';
const key = 'sb_publishable_2OxrgQFimvpPG8OXPdxvmw_Qur7wHUj';
const tables = ['products', 'categories', 'website_banners', 'banners', 'brands', 'highlights', 'profiles', 'orders', 'order_items', 'wishlist', 'cart_items', 'reviews', 'store_settings', 'shop_sections'];

const supabase = createClient(url, key);

for (const table of tables) {
  const { data, error } = await supabase.from(table).select('*').limit(1);
  if (error) {
    console.log(`TABLE ${table}: ERROR ${error.message}`);
  } else if (Array.isArray(data) && data.length > 0) {
    console.log(`TABLE ${table}: OK count=${data.length} keys=${JSON.stringify(Object.keys(data[0]).slice(0, 20))}`);
  } else {
    console.log(`TABLE ${table}: OK empty`);
  }
}
