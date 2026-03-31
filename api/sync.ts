import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET: Fetch all inventory for website
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*');
      
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST: Sync data from Desktop
  if (req.method === 'POST') {
    try {
      const body = req.body;
      const items = Array.isArray(body) ? body : [body];
      
      const sanitizedData = items.map((item: any) => ({
        barcode: String(item.Barcode || item.barcode || ""),
        name: item.Name || item.name || "Unknown Product",
        category: item.Category || item.category || "General",
        subCategory: item.SubCategory || item.subCategory || "",
        mrp: Number(item.MRP || item.Mrp || item.mrp || 0),
        saleRate: Number(item.Price || item.saleRate || 0),
        discount: Number(item.Discount !== undefined ? item.Discount : 0),
        imageUrl: item.ImageUrl || item.imageUrl || ""
      }));

      // Save to Supabase (Upsert based on barcode)
      const { error } = await supabase
        .from('inventory')
        .upsert(sanitizedData, { onConflict: 'barcode' });

      if (error) throw error;

      return res.status(200).json({ 
        success: true, 
        message: "Inventory Synced to Supabase!",
        count: sanitizedData.length 
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  return res.status(405).end();
}
