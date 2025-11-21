import { config } from 'dotenv';
import { resolve } from 'path';
import { query, closePool } from '../lib/db.js';

config({ path: resolve(process.cwd(), '../.env') });

async function checkPartners() {
  try {
    console.log('\nChecking partners in database...\n');

    const result = await query('SELECT id, name, created_at FROM partners ORDER BY created_at DESC');

    if (result.rows.length === 0) {
      console.log('No partners found in database.');
      console.log('\nRun `npm run generate-key` to create a partner.');
    } else {
      console.log(`Found ${result.rows.length} partner(s):\n`);
      result.rows.forEach((partner: any) => {
        console.log(`  ID: ${partner.id}`);
        console.log(`  Name: ${partner.name}`);
        console.log(`  Created: ${partner.created_at}`);
        console.log();
      });
    }

    await closePool();
  } catch (error: any) {
    console.error('Error:', error.message);
    await closePool();
    process.exit(1);
  }
}

checkPartners();
