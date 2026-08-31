const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.backup' });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'skin_intelligence',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
});

async function runMigration() {
    try {
        console.log('🔄 Running product database migration...');
        
        const migrationSQL = fs.readFileSync('./migrations/add_products_table.sql', 'utf8');
        await pool.query(migrationSQL);
        
        console.log('✅ Migration completed successfully!');
        console.log('📊 Products and categories have been added to the database.');
        
        // Verify the migration
        const result = await pool.query(`
            SELECT 
                pc.name as category,
                COUNT(p.id) as product_count
            FROM product_categories pc
            LEFT JOIN products p ON pc.id = p.category_id
            GROUP BY pc.name, pc.sort_order
            ORDER BY pc.sort_order
        `);
        
        console.log('\n📋 Product Categories Created:');
        result.rows.forEach(row => {
            console.log(`   ${row.category}: ${row.product_count} products`);
        });
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

runMigration();