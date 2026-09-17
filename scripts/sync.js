const { createClient } = require('@supabase/supabase-js');
const sql = require('mssql');

// --- NM MART CONFIGURATION ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const sqlConfig = {
    user: process.env.SQL_SYNC_USER,
    password: process.env.SQL_SYNC_PASSWORD,
    database: process.env.SQL_SYNC_DATABASE,
    server: process.env.SQL_SYNC_SERVER || 'localhost',
    options: {
        encrypt: false,                
        trustServerCertificate: true,  
        enableArithAbort: true
    }
};

if (!sqlConfig.user || !sqlConfig.password || !sqlConfig.database) {
    throw new Error('SQL_SYNC_USER, SQL_SYNC_PASSWORD, and SQL_SYNC_DATABASE are required.');
}

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
            .select('RawCodeNew, updated_at, Rate, MRP, OpStock, RawName, image_url, ItemGroupName, discountPerc');
        
        const webMap = new Map();
        if (allWebProducts) {
            allWebProducts.forEach(p => webMap.set(String(p.RawCodeNew).trim(), p));
        }

        // --- 1. PULL FROM WEBSITE (Website -> POS) ---
        console.log('\n--- PHASE 1: SYNCING WEBSITE CHANGES TO POS ---');
        
        // LOGIC: Website changes (Image, Discount, Category) are leading.
        // We update POS if Website has newer or different data.
        const recentlyUpdated = allWebProducts?.filter(p => {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1); // Increase window to 1 month
            return new Date(p.updated_at) > lastMonth;
        }) || [];

        if (recentlyUpdated.length > 0) {
            console.log(`Checking ${recentlyUpdated.length} recently updated website items...`);
            for (const item of recentlyUpdated) {
                try {
                    // Update POS with website values
                    await pool.request()
                        .input('RawCodeNew', sql.VarChar, item.RawCodeNew)
                        .input('RawName', sql.VarChar, item.RawName)
                        .input('Rate', sql.Decimal(18, 2), item.Rate)
                        .input('MRP', sql.Decimal(18, 2), item.MRP)
                        .input('discountPerc', sql.Decimal(18, 2), item.discountPerc || 0)
                        .input('ItemGroupName', sql.VarChar, item.ItemGroupName || 'General')
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

            /**
             * SMART SYNC LOGIC:
             * 1. If item doesn't exist on web -> PUSH IT.
             * 2. If item exists on web but data is different -> PUSH IT.
             * 3. CRITICAL: image_url is always set on push rows — reuse the web image when present
             *    so upserts never clear admin-uploaded photos. Only price/stock/name come from POS.
             */
            
            // Only push if something actually changed in POS (Price or Stock)
            const hasChanged = !webItem || 
                             webItem.Rate !== posItem.Rate || 
                             webItem.MRP !== posItem.MRP || 
                             webItem.OpStock !== posItem.OpStock ||
                             webItem.RawName !== posItem.RawName;

            if (hasChanged) {
                const existingImage =
                    webItem && String(webItem.image_url || '').trim()
                        ? String(webItem.image_url).trim()
                        : null;

                const pushData = {
                    RawCodeNew: barcode,
                    RawName: String(posItem.RawName).trim(),
                    Rate: Number(posItem.Rate || 0),
                    MRP: Number(posItem.MRP || 0),
                    // If web has a category or discount, keep it. Otherwise use POS value.
                    discountPerc: webItem ? (webItem.discountPerc || 0) : Number(posItem.discountPerc || 0),
                    ItemGroupName: webItem ? (webItem.ItemGroupName || 'General') : String(posItem.ItemGroupName || 'General').trim(),
                    OpStock: Number(posItem.OpStock || 0),
                    updated_at: new Date().toISOString(),
                    // CRITICAL: always set explicitly so upsert never wipes admin-uploaded images with NULL.
                    image_url: existingImage
                };

                toPush.push(pushData);
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
