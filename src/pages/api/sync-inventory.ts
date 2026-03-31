// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: any, res: any) {
  // Sirf POST request allow karein
  if (req.method === 'POST') {
    try {
      const data = req.body;
      
      // Console mein check karne ke liye (Vercel Logs mein dikhega)
      console.log("Data received from NM Mart:", Array.isArray(data) ? data.length : "object", "items");

      // Bina kisi security (401) ke data accept karna
      return res.status(200).json({
        success: true,
        message: "NM Mart Inventory Synced Successfully!",
        count: Array.isArray(data) ? data.length : 0
      });

    } catch (error) {
      return res.status(400).json({ success: false, error: "Invalid Data received" });
    }
  } 
  
  // Agar Browser (GET) se khola jaye toh 405 dikhayega
  else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed. Use POST.` });
  }
}