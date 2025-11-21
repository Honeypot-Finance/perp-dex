import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { getPool, closePool } from '../lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

async function initDatabase() {
  console.log('');
  console.log('='.repeat(70));
  console.log('  Database Initialization');
  console.log('='.repeat(70));
  console.log('');

  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('📊 Connecting to database...');
    const pool = getPool();

    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    client.release();

    // Read schema file
    const schemaPath = resolve(__dirname, '../db/schema.sql');
    console.log('');
    console.log('📝 Reading schema from:', schemaPath);
    const schema = readFileSync(schemaPath, 'utf-8');

    // Execute schema
    console.log('🔨 Creating tables...');
    await pool.query(schema);

    console.log('✅ Database schema created successfully');
    console.log('');
    console.log('📋 Tables created:');
    const tablesResult = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    tablesResult.rows.forEach((row) => {
      console.log(`  - ${row.tablename}`);
    });

    console.log('');
    console.log('='.repeat(70));
    console.log('  Database initialized successfully!');
    console.log('='.repeat(70));
    console.log('');
    console.log('Next steps:');
    console.log('  1. Generate an API key: npm run generate-key');
    console.log('  2. Start your development server');
    console.log('');

    await closePool();
    process.exit(0);
  } catch (error: any) {
    console.error('');
    console.error('❌ Error initializing database:', error.message);
    console.error('');

    if (error.code === 'ECONNREFUSED') {
      console.error('Make sure PostgreSQL is running and DATABASE_URL is correct.');
      console.error('');
      console.error('To start PostgreSQL:');
      console.error('  - macOS (Homebrew): brew services start postgresql');
      console.error('  - Linux: sudo systemctl start postgresql');
      console.error('  - Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres');
    }

    console.error('');
    await closePool();
    process.exit(1);
  }
}

initDatabase();
