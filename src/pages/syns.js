const fs = require('fs');
const xlsx = require('xlsx');
const axios = require('axios');

// 1. Aapki file ka rasta (Path)
const EXCEL_PATH = 'C:/NM_Mart_Sync/stock.xls'; 

// 2. Naya Supabase Sync URL (Vercel API)
const SYNC_API_URL = 'https://nmmart.in/api/sync';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8XYEt7z_oOxcKwNqQY67Aes7kvupx7Fkh6McS5TRfhiwo3_UETtIL8c74cUZlvTMQNw/exec';

console.log("------------------------------------------");
console.log("🚀 NM MART RETAIL POS SYNC START!");
console.log("Watching: " + EXCEL_PATH);
console.log("Target: " + SYNC_API_URL);
console.log("------------------------------------------");

// File mein badlav par nazar rakhna
fs.watchFile(EXCEL_PATH, { interval: 5000 }, (curr, prev) => {
    if (curr.mtime > prev.mtime) {
        console.log("📢 POS Export Detect Hua! Supabase Update Kar Raha Hoon...");
        syncToCloud();
    }
});

async function syncToCloud() {
    try {
        // Excel file read karna
        const workbook = xlsx.readFile(EXCEL_PATH);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        const itemsToSync = [];

        // Row 6 se data lena shuru karna
        for (let i = 5; i < data.length; i++) {
            const row = data[i];
            
            if (row[3]) { // Barcode check
                itemsToSync.push({
                    name: row[2] || "Product " + row[3], // Brand/Name
                    barcode: String(row[3]),
                    discount: Number(row[4] || 0),
                    stock: String(row[11] || "0"),
                    mrp: Number(row[12] || 0),
                    saleRate: Number(row[13] || 0),
                    category: "POS Sync"
                });
            }
        }

        if (itemsToSync.length === 0) return console.log("⚠️ Koi items nahi mile sync ke liye.");

        console.log(`📦 Total ${itemsToSync.length} products mile. Supabase bhej raha hoon...`);

        // 1. Supabase ko bhejenge (Website ke liye)
        try {
            const supabaseRes = await axios.post(SYNC_API_URL, itemsToSync);
            if(supabaseRes.data.success) {
                console.log("✅ Mubarak ho! Supabase Update Ho Gaya!");
            }
        } catch (e) {
            console.error("❌ Supabase Sync Fail: ", e.message);
        }

        // 2. Purana Google Sheet sync bhi chalu rakhenge (Backup ke liye)
        try {
            await axios.post(GOOGLE_SCRIPT_URL, JSON.stringify(itemsToSync));
            console.log("✅ Backup: Google Sheet Updated!");
        } catch (e) {
            console.log("⚠️ Google Sheet Backup failed, but Supabase is primary.");
        }

    } catch (error) {
        console.error("❌ Error aayi: ", error.message);
        console.log("Tip: Check karein ki file C:/NM_Mart_Sync/stock.xls sahi jagah par hai.");
    }
}