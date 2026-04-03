const { createClient } = require('@supabase/supabase-js');
const sql = require('mssql');

// --- NM MART CONFIGURATION ---
const SUPABASE_URL = 'https://wcoymnkyqjlncztyabxc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8yFEGZaTqzkOirj2ax---g_R8E4PiSV'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const sqlConfig = {
    user: 'SyncUser',         
    password: 'nmmart07',     
    database: 'ERP7H2627', 
    server: 'localhost', 
    options: {
        encrypt: false,                
        trustServerCertificate: true,  
        enableArithAbort: true
    }
};

/**
 * Sync function with batching (100 items per batch)
 */
async function syncToWebsite() {
    let pool;
    try {
        console.log('Connecting to Local SQL Server...');
        pool = await sql.connect(sqlConfig);
        
        console.log('Fetching products from RawMas...');
        const result = await pool.request().query(`
            SELECT 
                RawCodeNew AS barcode, 
                RawName AS name, 
                Rate AS salerate, 
                MRP AS mrp,
                discountPerc AS discount,
                It_StyleName AS category,
                OpStock AS stock_quantity
            FROM RawMas
            WHERE RawCodeNew IS NOT NULL AND RawName <> 'TEST ITEM'
        `);

        const products = result.recordset;
        console.log(`Found ${products.length} items. Starting batch sync...`);

        const BATCH_SIZE = 100;
        let successCount = 0;

        for (let i = 0; i < products.length; i += BATCH_SIZE) {
            const batch = products.slice(i, i + BATCH_SIZE);
            
            // MAP COLUMNS: We use columns that definitely exist in the 'products' table
            const sanitizedBatch = batch.map(item => ({
                barcode: String(item.barcode).trim(),
                name: String(item.name).trim(),
                mrp: Number(item.mrp || 0),
                salerate: Number(item.salerate || 0),
                discount: Number(item.discount || 0),
                category: item.category || 'General',
                stock_quantity: Number(item.stock_quantity || 0),
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('products') 
                .upsert(sanitizedBatch, { onConflict: 'barcode' });

            if (error) {
                console.error(`Batch Error (Index ${i}):`, error.message);
            } else {
                successCount += sanitizedBatch.length;
                process.stdout.write(`Progress: ${successCount}/${products.length} synced...\r`);
            }
        }

        console.log('\nSync Complete!');
        console.log(`Total successfully synced: ${successCount}`);

    } catch (err) {
        console.error('System Error:', err.message);
    } finally {
        if (pool) await pool.close();
    }
}

syncToWebsite();
