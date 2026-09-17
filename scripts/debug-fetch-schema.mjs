import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');
const envText = readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envText
    .split('\n')
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const idx = line.indexOf('=');
      const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      return [line.slice(0, idx).trim(), value];
    })
);

const url = (env.VITE_SUPABASE_URL || env.SUPABASE_URL || '').replace(/\/$/, '');
const key =
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', url);
console.log('Key prefix:', key ? key.substring(0, 15) + '...' : 'MISSING');

if (!url || !key) {
  console.error('Missing Supabase URL or key in .env');
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Accept-Profile': 'public',
};

console.log('\n=== Fetching OpenAPI schema ===');
try {
  const res = await fetch(`${url}/rest/v1/`, { headers });
  console.log('REST v1 status:', res.status, res.statusText);
  if (!res.ok) {
    const errText = await res.text();
    console.log('Error body:', errText.substring(0, 500));
  } else {
    const schema = await res.json();
    console.log('Schema keys:', Object.keys(schema));
    if (schema.paths) {
      console.log('Paths found:', Object.keys(schema.paths));
      const tables = {};
      for (const [path, methods] of Object.entries(schema.paths || {})) {
        const tableName = path.replace(/^\//, '');
        if (!tableName || tableName.includes('{')) continue;
        const getDef = methods.get?.responses?.['200']?.content?.['application/json']?.schema;
        const postDef = methods.post?.requestBody?.content?.['application/json']?.schema;
        const def = getDef || postDef;
        if (def?.properties) {
          tables[tableName] = Object.keys(def.properties).sort();
        }
      }
      console.log('\n=== OpenAPI Tables ===');
      console.log(JSON.stringify(tables, null, 2));
    }
  }
} catch (e) {
  console.error('OpenAPI fetch error:', e.message);
}

console.log('\n=== Probing known tables directly ===');
const candidates = [
  'products', 'product_master', 'items', 'catalog_products', 'inventory',
  'orders', 'profiles', 'categories', 'website_banners', 'banners',
  'hero_banners', 'banner', 'sync_back', 'store_config', 'highlights',
  'reviews', 'admin_config',
];
const tables = {};
for (const table of candidates) {
  try {
    const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers });
    console.log(`[${table}] status: ${res.status}`);
    if (res.ok) {
      const row = await res.json();
      const sample = Array.isArray(row) ? row[0] : row;
      tables[table] = sample ? Object.keys(sample).sort() : ['(empty table)'];
    } else if (res.status !== 404) {
      const errText = await res.text();
      console.log(`  err: ${errText.substring(0, 200)}`);
    }
  } catch (e) {
    console.log(`[${table}] fetch error: ${e.message}`);
  }
}
console.log('\n=== Probed Tables ===');
console.log(JSON.stringify(tables, null, 2));
