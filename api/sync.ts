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
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
