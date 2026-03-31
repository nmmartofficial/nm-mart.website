export default async function handler(req: any, res: any) {
  // Sirf POST request allow karna
  if (req.method === "POST") {
    try {
      const data = req.body;
      console.log("Data received from NM Mart:", Array.isArray(data) ? data.length : "object", "items");
      
      return res.status(200).json({
        success: true,
        message: "Sync Successful!",
        count: Array.isArray(data) ? data.length : 0
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: "Invalid Data" });
    }
  } 
  
  // Baaki saare methods ke liye 405 error
  else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
