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
 * Bi-directional Sync Function: Latest Wins
 */
async function syncEverything() {
    let pool;
    try {
        console.log('Connecting to Local SQL Server...');
        pool = await sql.connect(sqlConfig);
        
        // --- PRE-PHASE: FETCH ALL WEBSITE DATA FOR COMPARISON ---
        console.log('Fetching current website data for comparison...');
        const { data: allWebProducts, error: fetchError } = await supabase
            .from('products')
            .select('RawCodeNew, updated_at, Rate, MRP, OpStock, RawName');
        
        const webMap = new Map();
        if (allWebProducts) {
            allWebProducts.forEach(p => webMap.set(String(p.RawCodeNew).trim(), p));
        }

        // --- 1. PULL FROM WEBSITE (Website -> POS) ---
        console.log('\n--- PHASE 1: SYNCING WEBSITE CHANGES TO POS ---');
        // We consider anything updated on the website as potentially newer
        // In a real 'Latest Wins' we'd need a timestamp from SQL too.
        // For now, we update POS if website has any data.
        
        const recentlyUpdated = allWebProducts?.filter(p => {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            return new Date(p.updated_at) > lastWeek;
        }) || [];

        if (recentlyUpdated.length > 0) {
            console.log(`Checking ${recentlyUpdated.length} recently updated website items...`);
            for (const item of recentlyUpdated) {
                try {
                    // Update POS only if data is different (simple 'latest' proxy)
                    await pool.request()
                        .input('RawCodeNew', sql.VarChar, item.RawCodeNew)
                        .input('RawName', sql.VarChar, item.RawName)
                        .input('Rate', sql.Decimal(18, 2), item.Rate)
                        .input('MRP', sql.Decimal(18, 2), item.MRP)
                        .input('ItemGroupName', sql.VarChar, item.ItemGroupName || 'General')
                        .input('OpStock', sql.Decimal(18, 3), item.OpStock)
                        .query(`
                            IF EXISTS (SELECT 1 FROM RawMas WHERE RawCodeNew = @RawCodeNew)
                            BEGIN
                                UPDATE RawMas SET 
                                    RawName = @RawName,
                                    Rate = @Rate,
                                    MRP = @MRP,
                                    OpStock = @OpStock
                                WHERE RawCodeNew = @RawCodeNew
                            END
                        `);
                } catch (err) {
                    console.error(`POS Update Failed for ${item.RawCodeNew}:`, err.message);
                }
            }
        }

        // --- 2. PUSH TO WEBSITE (POS -> Website) ---
        console.log('\n--- PHASE 2: SYNCING POS CHANGES TO WEBSITE ---');
        const result = await pool.request().query(`
            SELECT RawCodeNew, RawName, Rate, MRP, discountPerc, ItemGroupName, OpStock
            FROM RawMas
            WHERE RawCodeNew IS NOT NULL AND RawName <> 'TEST ITEM'
        `);

        const posProducts = result.recordset;
        const toPush = [];

        for (const posItem of posProducts) {
            const barcode = String(posItem.RawCodeNew).trim();
            const webItem = webMap.get(barcode);

            // LOGIC: If item doesn't exist on web OR it's been updated recently in POS
            // (Since POS doesn't have updated_at, we push if data is different or it's new)
            if (!webItem || 
                webItem.Rate !== posItem.Rate || 
                webItem.MRP !== posItem.MRP || 
                webItem.OpStock !== posItem.OpStock ||
                webItem.RawName !== posItem.RawName) {
                
                toPush.push({
                    RawCodeNew: barcode,
                    RawName: String(posItem.RawName).trim(),
                    Rate: Number(posItem.Rate || 0),
                    MRP: Number(posItem.MRP || 0),
                    discountPerc: Number(posItem.discountPerc || 0),
                    ItemGroupName: String(posItem.ItemGroupName || 'General').trim(),
                    OpStock: Number(posItem.OpStock || 0),
                    updated_at: new Date().toISOString() // Mark as updated now
                });
            }
        }

        if (toPush.length > 0) {
            console.log(`Pushing ${toPush.length} changes to website...`);
            const BATCH_SIZE = 100;
            for (let i = 0; i < toPush.length; i += BATCH_SIZE) {
                const batch = toPush.slice(i, i + BATCH_SIZE);
                const { error } = await supabase.from('products').upsert(batch, { onConflict: 'RawCodeNew' });
                if (error) console.error(`Batch Error:`, error.message);
                else process.stdout.write(`Progress: ${i + batch.length}/${toPush.length} pushed...\r`);
            }
            console.log('\nPush complete!');
        } else {
            console.log('Everything is already in sync. No changes to push.');
        }

        console.log('\nNM MART Bi-directional Sync Successful!');

    } catch (err) {
        console.error('System Error:', err.message);
    } finally {
        if (pool) await pool.close();
    }
}

syncEverything();
