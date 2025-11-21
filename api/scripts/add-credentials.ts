import { config } from 'dotenv';
import { resolve } from 'path';
import { getPartnerByName, saveOrderlyCredentials } from '../lib/storage.js';
import { closePool } from '../lib/db.js';

config({ path: resolve(process.cwd(), '../.env') });

async function addCredentials() {
  try {
    const partnerName = process.argv[2] || 'chenxing';
    const accountId = process.env.ORDERLY_ACCOUNT_ID;
    const orderlyKey = process.env.ORDERLY_KEY;
    const orderlySecret = process.env.ORDERLY_SECRET;

    if (!accountId || !orderlyKey || !orderlySecret) {
      console.error('Error: Missing Orderly credentials in .env');
      console.error('Required: ORDERLY_ACCOUNT_ID, ORDERLY_KEY, ORDERLY_SECRET');
      await closePool();
      process.exit(1);
    }

    console.log(`\nAdding Orderly credentials for partner: ${partnerName}\n`);

    const partner = await getPartnerByName(partnerName);
    if (!partner) {
      console.error(`Error: Partner "${partnerName}" not found`);
      console.error('Run: npm run generate-key');
      await closePool();
      process.exit(1);
    }

    const credentials = await saveOrderlyCredentials({
      partnerId: partner.id,
      accountId,
      orderlyKey,
      orderlySecret,
    });

    console.log('✅ Credentials saved successfully!\n');
    console.log(`  Partner: ${partner.name}`);
    console.log(`  Account ID: ${credentials.accountId}`);
    console.log(`  Orderly Key: ${credentials.orderlyKey?.substring(0, 25)}...`);
    console.log('\nNow partners can authenticate with just:');
    console.log('  X-API-KEY: <api-key>');
    console.log('  X-Account-ID: <account-id>');
    console.log('\n(Server will look up Orderly Key/Secret from database)\n');

    await closePool();
  } catch (error: any) {
    console.error('Error:', error.message);
    await closePool();
    process.exit(1);
  }
}

addCredentials();
