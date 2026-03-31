// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: any, res: any) {
  // 1. CORS Headers (Security check bypass karne ke liye)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Testing ke liye (Agar Browser mein kholein toh ye dikhe)
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: "Online", 
      message: "NM Mart API is Live!",
      path: "src/pages/api/sync-inventory.ts" 
    });
  }

  // 3. Main Data Sync (POST)
  if (req.method === 'POST') {
    try {
      const data = req.body;
      console.log("Data Received from Desktop:", Array.isArray(data) ? data.length : "Object");

      return res.status(200).json({
        success: true,
        message: "Inventory Synced Successfully!",
        count: Array.isArray(data) ? data.length : 0
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: "Data Error" });
    }
  }
}