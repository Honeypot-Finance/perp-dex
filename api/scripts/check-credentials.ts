import { config } from 'dotenv';
import { resolve } from 'path';
import { query, closePool } from '../lib/db.js';

config({ path: resolve(process.cwd(), '../.env') });

async function checkCredentials() {
  try {
    console.log('\nChecking Orderly credentials in database...\n');

    const result = await query(`
      SELECT oc.id, p.name as partner_name, oc.account_id, oc.orderly_key, oc.is_active, oc.created_at
      FROM orderly_credentials oc
      JOIN partners p ON oc.partner_id = p.id
      ORDER BY oc.created_at DESC
    `);

    if (result.rows.length === 0) {
      console.log('No Orderly credentials found in database.');
      console.log('\nTo enable stateful mode (credentials stored on server):');
      console.log('  1. Run: npm run manage-keys');
      console.log('  2. Add Orderly credentials for a partner\n');
    } else {
      console.log(`Found ${result.rows.length} credential(s):\n`);
      result.rows.forEach((cred: any) => {
        console.log(`  Partner: ${cred.partner_name}`);
        console.log(`  Account ID: ${cred.account_id}`);
        console.log(`  Orderly Key: ${cred.orderly_key?.substring(0, 20)}...`);
        console.log(`  Active: ${cred.is_active}`);
        console.log(`  Created: ${cred.created_at}`);
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

checkCredentials();
