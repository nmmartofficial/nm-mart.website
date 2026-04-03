import { createClient } from '@supabase/supabase-js';

// Supabase credentials provided by user
const SUPABASE_URL = "https://wcoymnkyqjlncztyabxc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_8yFEGZaTqzkOirj2ax---g_R8E4PiSV";

const supabaseUrl = process.env.SUPABASE_URL || SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

// Chunk size for batch processing to avoid memory/timeout issues
const CHUNK_SIZE = 100;

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Validate Supabase credentials early
  if (!supabaseUrl || !supabaseKey) {
    console.error("CRITICAL: Supabase credentials missing from Environment Variables.");
    return res.status(500).json({ error: "Server Configuration Error: Database credentials missing." });
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
        barcode: String(item.Barcode || ""),
        name: String(item.ItemName || "Unknown Product"),
        mrp: Number(item.MRP || 0),
        salerate: Number(item.SalesRate || 0),
        stock_quantity: Number(item.Stock || 0),
        discount: Math.round(Math.max(0, Number(item.MRP || 0) - Number(item.SalesRate || 0))),
        updated_at: new Date().toISOString()
      }));

      // Use upsert to handle inserts/updates based on 'barcode' conflict
      const { error } = await supabase
        .from('products')
        .upsert(sanitizedData, { onConflict: 'barcode' });

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
