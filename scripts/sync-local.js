const { createClient } = require('@supabase/supabase-js');
const sql = require('mssql');

// --- NM MART CONFIGURATION ---
const SUPABASE_URL = 'https://ydqjrtgrzetyxhcuqvoy.supabase.co';
const SUPABASE_KEY = 'sb_secret_3MzreJNOmCAHfqczDukXIA_dCabn2rL'; 
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
                RawCodeNew, 
                RawName, 
                Rate, 
                MRP,
                discountPerc,
                ItemGroupName,
                OpStock
            FROM RawMas
            WHERE RawCodeNew IS NOT NULL AND RawName <> 'TEST ITEM'
        `);

        const products = result.recordset;
        console.log(`Found ${products.length} items. Starting batch sync...`);

        const BATCH_SIZE = 100;
        let successCount = 0;

        for (let i = 0; i < products.length; i += BATCH_SIZE) {
            const batch = products.slice(i, i + BATCH_SIZE);
            
            // MAP COLUMNS: Upsert exact fields into Supabase without renaming
            const sanitizedBatch = batch.map(item => ({
                RawCodeNew: String(item.RawCodeNew).trim(),
                RawName: String(item.RawName).trim(),
                Rate: Number(item.Rate || 0),
                MRP: Number(item.MRP || 0),
                discountPerc: Number(item.discountPerc || 0),
                ItemGroupName: String(item.ItemGroupName || 'General').trim(),
                OpStock: Number(item.OpStock || 0),
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('products') 
                .upsert(sanitizedBatch, { onConflict: 'RawCodeNew' });

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
