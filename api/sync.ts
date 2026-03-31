import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Chunk size for batch processing to avoid memory/timeout issues
const CHUNK_SIZE = 500;

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

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
      console.log(`Processing in chunks of ${CHUNK_SIZE}...`);
      let successCount = 0;
      
      for (let i = 0; i < sanitizedData.length; i += CHUNK_SIZE) {
        const chunk = sanitizedData.slice(i, i + CHUNK_SIZE);
        const { error } = await supabase
          .from('inventory')
          .upsert(chunk, { onConflict: 'barcode' });

        if (error) {
          console.error(`Chunk ${i / CHUNK_SIZE} Error:`, error);
          throw error;
        }
        successCount += chunk.length;
        console.log(`Uploaded chunk: ${successCount}/${sanitizedData.length}`);
      }

      return res.status(200).json({ 
        success: true, 
        message: "Inventory Synced Successfully!",
        count: successCount 
      });
    } catch (error: any) {
      console.error("POST 500 Error:", error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).end();
}
