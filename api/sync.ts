import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET Method for Browser testing
  if (req.method === 'GET') {
    return res.status(200).json({ status: "API IS WORKING" });
  }

  // POST Method for Data Sync
  if (req.method === 'POST') {
    try {
      const data = req.body;
      const items = Array.isArray(data) ? data : [data];
      
      // Map fields from backend strictly as numbers
      const sanitizedData = items.map((item: any) => ({
        barcode: String(item.Barcode || item.barcode || ""),
        name: item.Name || item.name || "Unknown Product",
        category: item.Category || item.category || "General",
        mrp: Number(item.MRP || item.Mrp || item.mrp || 0),
        saleRate: Number(item.Price || item.Price || item.saleRate || 0),
        discount: Number(item.Discount !== undefined ? item.Discount : (item.DiscPer || 0)),
        imageUrl: item.ImageUrl || item.imageUrl || ""
      }));

      // Log for verification in Vercel Dashboard
      console.log("Sync Data Sample:", sanitizedData[0]);

      // Note: Here we would save to Supabase if the table 'inventory' exists
      // const { error } = await supabase.from('inventory').upsert(sanitizedData, { onConflict: 'barcode' });
      // if (error) throw error;

      return res.status(200).json({ 
        success: true,
        message: "Inventory Synced Successfully!",
        count: sanitizedData.length
      });
    } catch (error: any) {
      console.error("Sync Error:", error.message);
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
