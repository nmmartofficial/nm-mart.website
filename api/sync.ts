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
      
      // Map 'Discount' from DiscPer if provided, otherwise use 'Discount'
      const sanitizedData = items.map((item: any) => ({
        ...item,
        discount: item.Discount || item.DiscPer || 0
      }));

      console.log("Data received from NM Mart:", sanitizedData.length, "items");

      return res.status(200).json({ 
        success: true,
        message: "Inventory Synced Successfully!",
        count: sanitizedData.length
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: "Invalid Data" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
