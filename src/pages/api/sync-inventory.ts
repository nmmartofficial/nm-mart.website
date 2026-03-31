import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. CORS Headers (Taaki bahar se data aa sake)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Handle OPTIONS request (Browser check ke liye)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Sirf POST allow karein data sync ke liye
  if (req.method === 'POST') {
    try {
      const data = req.body;
      
      // Console mein check karne ke liye ki data aaya ya nahi
      console.log("NM Mart Sync Data Received:", Array.isArray(data) ? data.length : "Single", "items");

      // Yahan aapka database logic aayega (abhi ke liye success return kar rahe hain)
      return res.status(200).json({
        success: true,
        message: "NM Mart Inventory Synced Successfully!",
        count: Array.isArray(data) ? data.length : 0
      });

    } catch (error) {
      console.error("Sync Error:", error);
      return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  } 
  
  // 4. Agar koi sirf link khole (GET), toh ye dikhao
  else {
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} Not Allowed. Please use POST for syncing.` 
    });
  }
}