import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const syncToken = process.env.SYNC_TOKEN;
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://nmmart.in';


export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Validate Supabase credentials early
  if (!supabaseUrl || !supabaseKey) {
    console.error("CRITICAL: Supabase credentials missing from Environment Variables.");
    return res.status(500).json({ error: "Server Configuration Error: Database credentials missing." });
  }

  if (req.method === 'POST') {
    const authorization = String(req.headers.authorization || '');
    if (!syncToken || authorization !== `Bearer ${syncToken}`) {
      return res.status(401).json({ error: 'Unauthorized sync request.' });
    }
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // GET: Fetch all products for website
  if (req.method === 'GET') {
    try {
      console.log("Fetching all products from Supabase...");
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error("Supabase GET Error:", error);
        throw error;
      }
      return res.status(200).json(data || []);
    } catch (error: any) {
      console.error("GET 500 Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  // POST: Sync data from SQL Server
  if (req.method === 'POST') {
    try {
      const items = Array.isArray(req.body) ? req.body : [req.body];
      
      console.log(`Received ${items.length} products for sync.`);

      if (items.length === 0) {
        return res.status(200).json({ success: true, message: "No products to sync." });
      }

      // Map incoming fields from SQL Server (Barcode, ItemName, MRP, SalesRate, Stock)
      const sanitizedData = items.map((item: any) => ({
        RawCodeNew: String(item.RawCodeNew ?? item.Barcode ?? "").trim(),
        RawName: String(item.RawName ?? item.ItemName ?? "Unknown Product").trim(),
        MRP: Number(item.MRP || 0),
        Rate: Number(item.Rate ?? item.SalesRate ?? 0),
        OpStock: Number(item.OpStock ?? item.Stock ?? 0),
        discountPerc: Number(item.discountPerc ?? item.Discount ?? 0),
        ItemGroupName: String(item.ItemGroupName ?? item.Category ?? "General").trim(),
        image_url: item.image_url ? String(item.image_url).trim() : null,
        updated_at: new Date().toISOString()
      }));

      if (sanitizedData.some((item) => !item.RawCodeNew || !Number.isFinite(item.Rate) || !Number.isFinite(item.OpStock))) {
        return res.status(400).json({ error: 'Invalid sync payload.' });
      }

      // Use upsert to handle inserts/updates based on 'barcode' conflict
      const { error } = await supabase
        .from('products')
        .upsert(sanitizedData, { onConflict: 'RawCodeNew' });

      if (error) {
        console.error("Supabase UPSERT Error:", error.message);
        return res.status(500).json({ 
          success: false, 
          error: `Database Error: ${error.message}`
        });
      }

      console.log(`Sync complete: ${sanitizedData.length} products processed successfully.`);
      return res.status(200).json({ 
        success: true, 
        message: "Products Synced Successfully!",
        count: sanitizedData.length 
      });

    } catch (error: any) {
      console.error("CRITICAL Sync Error:", error.message);
      return res.status(500).json({ error: `Server Error: ${error.message}` });
    }
  }

  return res.status(405).end();
}
