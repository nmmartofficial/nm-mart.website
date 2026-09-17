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

if (!url || !key) {
  console.error('Missing Supabase URL or key in .env');
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
};

async function fetchOpenApiSchema() {
  const res = await fetch(`${url}/rest/v1/`, { headers });
  if (!res.ok) return null;
  const schema = await res.json();
  const tables = {};
  for (const [path, methods] of Object.entries(schema.paths || {})) {
    const tableName = path.replace(/^\//, '');
    if (!tableName || tableName.includes('{')) continue;
    const getDef = methods.get?.responses?.['200']?.content?.['application/json']?.schema;
    const postDef = methods.post?.requestBody?.content?.['application/json']?.schema;
    const def = getDef || postDef;
    if (!def?.properties) continue;
    tables[tableName] = Object.keys(def.properties).sort();
  }
  return tables;
}

async function probeKnownTables() {
  const candidates = [
    'products', 'product_master', 'items', 'catalog_products', 'inventory',
    'orders', 'profiles', 'categories', 'website_banners', 'banners',
    'hero_banners', 'banner', 'sync_back', 'store_config', 'highlights',
    'reviews', 'admin_config',
  ];
  const tables = {};
  for (const table of candidates) {
    const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers });
    if (res.ok) {
      const row = await res.json();
      const sample = Array.isArray(row) ? row[0] : row;
      tables[table] = sample ? Object.keys(sample).sort() : ['(empty table)'];
    }
  }
  return tables;
}

const openApi = await fetchOpenApiSchema();
const tables = openApi && Object.keys(openApi).length > 0 ? openApi : await probeKnownTables();
console.log(JSON.stringify(tables, null, 2));
