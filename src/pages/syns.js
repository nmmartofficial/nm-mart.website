const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const axios = require('axios');

// Sirf folder ka rasta
const FOLDER_PATH = 'C:/NM_Mart_Sync/';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8XYEt7z_oOxcKwNqQY67Aes7kvupx7Fkh6McS5TRfhiwo3_UETtIL8c74cUZlvTMQNw/exec';

console.log("------------------------------------------");
console.log("🚀 NM MART SYNC SYSTEM START HO GAYA HAI!");
console.log("Watching folder: " + FOLDER_PATH);
console.log("------------------------------------------");

// Folder mein kisi bhi file par nazar rakhna
fs.watch(FOLDER_PATH, (eventType, filename) => {
    if (filename && (filename.endsWith('.xls') || filename.endsWith('.xlsx'))) {
        console.log(`📢 File badlav detect hua: ${filename}`);
        const fullPath = path.join(FOLDER_PATH, filename);
        // Thoda intezar taaki file poori save ho jaye
        setTimeout(() => sendDataToGoogle(fullPath), 1000);
    }
});

async function sendDataToGoogle(filePath) {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        const itemsToSync = [];

        for (let i = 5; i < data.length; i++) {
            const row = data[i];
            if (row[3]) { 
                itemsToSync.push({
                    brand: row[2],
                    barcode: row[3],
                    discount: row[4],
                    stock: row[11],
                    mrp: row[12],
                    salePrice: row[13]
                });
            }
        }

        if (itemsToSync.length > 0) {
            console.log(`📦 ${itemsToSync.length} items upload ho rahe hain...`);
            const response = await axios.post(GOOGLE_SCRIPT_URL, JSON.stringify(itemsToSync));
            if(response.data.status === "success") {
                console.log("✅ Mubarak ho! Google Sheet update ho gayi.");
            }
        }
    } catch (error) {
        console.error("❌ Error: File open hai ya read nahi ho rahi.");
    }
}

// Shuruat mein agar koi file hai toh sync kar dein
const files = fs.readdirSync(FOLDER_PATH);
const excelFile = files.find(f => f.endsWith('.xls') || f.endsWith('.xlsx'));
if (excelFile) sendDataToGoogle(path.join(FOLDER_PATH, excelFile));