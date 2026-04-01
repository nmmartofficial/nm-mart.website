import { createClient } from '@supabase/supabase-js';

// Fallback values provided by user for immediate setup
const FALLBACK_URL = "https://ydqjrtgrzetyxhcuqvoy.supabase.co";
const FALLBACK_KEY = "sb_publishable_NOZCBGcyAm5SVWREtn9_Vw_LhynM0Py";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || FALLBACK_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || FALLBACK_KEY;

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

  // GET: Fetch all inventory for website
  if (req.method === 'GET') {
    try {
      console.log("Fetching all products from Supabase...");
      const { data, error } = await supabase
        .from('inventory')
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

  // POST: Sync data from Desktop
  if (req.method === 'POST') {
    try {
      const body = req.body;
      const items = Array.isArray(body) ? body : [body];
      
      console.log(`Received ${items.length} items for sync.`);

      if (items.length === 0) {
        return res.status(200).json({ success: true, message: "No items to sync." });
      }

      const sanitizedData = items.map((item: any) => ({
        barcode: String(item.Barcode || item.barcode || ""),
        name: String(item.Name || item.name || "Unknown Product"),
        category: String(item.Category || item.category || "General"),
        subCategory: String(item.SubCategory || item.subCategory || ""),
        mrp: Number(item.MRP || item.Mrp || item.mrp || 0),
        saleRate: Number(item.Price || item.saleRate || 0),
        discount: Number(item.Discount !== undefined ? item.Discount : (item.discountPerc || item.discount || 0)),
        imageUrl: String(item.ImageUrl || item.imageUrl || "")
      }));

      // Split into chunks to handle heavy data (7k+ items)
      console.log(`Processing ${sanitizedData.length} items in chunks of ${CHUNK_SIZE}...`);
      let successCount = 0;
      
      for (let i = 0; i < sanitizedData.length; i += CHUNK_SIZE) {
        const chunk = sanitizedData.slice(i, i + CHUNK_SIZE);
        
        const { error } = await supabase
          .from('inventory')
          .upsert(chunk, { onConflict: 'barcode' });

        if (error) {
          console.error(`Batch starting at index ${i} failed:`, error.message);
          return res.status(500).json({ 
            success: false, 
            error: `Database Error in batch ${i / CHUNK_SIZE + 1}: ${error.message}`,
            details: error
          });
        }
        
        successCount += chunk.length;
      }

      console.log(`Sync complete: ${successCount} items processed successfully.`);
      return res.status(200).json({ 
        success: true, 
        message: "Inventory Synced Successfully!",
        count: successCount 
      });

    } catch (error: any) {
      console.error("Sync Crash (500):", error.message);
      return res.status(500).json({ success: false, error: "Server Error during sync: " + error.message });
    }
  }

  return res.status(405).end();
}
