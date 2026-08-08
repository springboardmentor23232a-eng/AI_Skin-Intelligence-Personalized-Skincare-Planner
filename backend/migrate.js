const pool = require('./db/pool');
const fs = require('fs');

async function migrate() {
    try {
        console.log('Running database migration...');

        // Read the migration SQL file
        const migrationSQL = fs.readFileSync('./migrations/add_assessment_fields.sql', 'utf8');

        // Split by semicolon and execute each statement
        const statements = migrationSQL.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await pool.query(statement);
                console.log('✅ Executed:', statement.trim().substring(0, 50) + '...');
            }
        }

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
