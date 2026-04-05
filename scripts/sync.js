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
 * Bi-directional Sync Function
 */
async function syncEverything() {
    let pool;
    try {
        console.log('Connecting to Local SQL Server...');
        pool = await sql.connect(sqlConfig);
        
        // --- 1. PULL FROM WEBSITE (Supabase -> Local POS) ---
        console.log('\n--- PHASE 1: PULLING CHANGES FROM WEBSITE ---');
        // Fetch products updated on the website in the last 7 days (or any cutoff)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: webProducts, error: webError } = await supabase
            .from('products')
            .select('*')
            .gte('updated_at', sevenDaysAgo.toISOString());

        if (webError) {
            console.error('Error fetching from website:', webError.message);
        } else if (webProducts && webProducts.length > 0) {
            console.log(`Found ${webProducts.length} updated items on the website. Syncing to POS...`);
            
            for (const item of webProducts) {
                try {
                    // Update Local SQL RawMas table
                    await pool.request()
                        .input('RawCodeNew', sql.VarChar, item.RawCodeNew)
                        .input('RawName', sql.VarChar, item.RawName)
                        .input('Rate', sql.Decimal(18, 2), item.Rate)
                        .input('MRP', sql.Decimal(18, 2), item.MRP)
                        .input('discountPerc', sql.Decimal(18, 2), item.discountPerc)
                        .input('ItemGroupName', sql.VarChar, item.ItemGroupName)
                        .input('OpStock', sql.Decimal(18, 3), item.OpStock)
                        .query(`
                            IF EXISTS (SELECT 1 FROM RawMas WHERE RawCodeNew = @RawCodeNew)
                            BEGIN
                                UPDATE RawMas SET 
                                    RawName = @RawName,
                                    Rate = @Rate,
                                    MRP = @MRP,
                                    discountPerc = @discountPerc,
                                    ItemGroupName = @ItemGroupName,
                                    OpStock = @OpStock
                                WHERE RawCodeNew = @RawCodeNew
                            END
                            ELSE
                            BEGIN
                                INSERT INTO RawMas (RawCodeNew, RawName, Rate, MRP, discountPerc, ItemGroupName, OpStock)
                                VALUES (@RawCodeNew, @RawName, @Rate, @MRP, @discountPerc, @ItemGroupName, @OpStock)
                            END
                        `);
                } catch (err) {
                    console.error(`Failed to update POS for item ${item.RawCodeNew}:`, err.message);
                }
            }
            console.log('Phase 1 (Pull) complete!');
        } else {
            console.log('No recent updates found on the website.');
        }

        // --- 2. PUSH TO WEBSITE (Local POS -> Supabase) ---
        console.log('\n--- PHASE 2: PUSHING POS CHANGES TO WEBSITE ---');
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
        console.log(`Found ${products.length} items in POS. Starting batch sync...`);

        const BATCH_SIZE = 100;
        let successCount = 0;

        for (let i = 0; i < products.length; i += BATCH_SIZE) {
            const batch = products.slice(i, i + BATCH_SIZE);
            
            /** 
             * IMPORTANT: We do NOT include 'image_url' here. 
             * This ensures that if a product already has a photo on the website, 
             * it will NOT be removed or overwritten by the POS sync.
             */
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

            // Upsert: Updates existing products and inserts new ones automatically
            const { error } = await supabase
                .from('products') 
                .upsert(sanitizedBatch, { 
                    onConflict: 'RawCodeNew',
                    ignoreDuplicates: false 
                });

            if (error) {
                console.error(`Batch Error (Index ${i}):`, error.message);
            } else {
                successCount += sanitizedBatch.length;
                process.stdout.write(`Progress: ${successCount}/${products.length} pushed...\r`);
            }
        }

        console.log('\n\nSync Complete!');
        console.log(`Total successfully pushed: ${successCount}`);

    } catch (err) {
        console.error('System Error:', err.message);
    } finally {
        if (pool) await pool.close();
    }
}

syncEverything();
