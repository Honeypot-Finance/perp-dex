import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createInterface } from 'readline';
import { config } from 'dotenv';
import { resolve } from 'path';
import { savePartner, getPartnerByName } from '../lib/storage.js';
import { closePool } from '../lib/db.js';

config({ path: resolve(process.cwd(), '../.env') });

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    readline.question(prompt, resolve);
  });
}

async function generateApiKey() {
  console.log('');
  console.log('='.repeat(60));
  console.log('  Honeypot Perp API - API Key Generator');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Get partner name
    const partnerName = await question('Enter partner name (e.g., partner1): ');

    if (!partnerName || partnerName.trim() === '') {
      console.log('Error: Partner name is required');
      readline.close();
      return;
    }

    // Check if partner already exists
    const existingPartner = await getPartnerByName(partnerName.trim());
    if (existingPartner) {
      console.log(`\nError: Partner "${partnerName.trim()}" already exists`);
      console.log('Please use a different partner name.');
      readline.close();
      await closePool();
      return;
    }

    // Generate random API key
    const apiKey = crypto.randomBytes(32).toString('hex');

    // Hash the API key
    const hashedKey = bcrypt.hashSync(apiKey, 10);

    // Save partner to database
    await savePartner({
      name: partnerName.trim(),
      apiKeyHash: hashedKey,
    });

    console.log('');
    console.log('='.repeat(70));
    console.log('  Generated API Key');
    console.log('='.repeat(70));
    console.log('');
    console.log(`  Partner Name:   ${partnerName.trim()}`);
    console.log(`  API Key:        ${apiKey}`);
    console.log('');
    console.log('  IMPORTANT: Save this API key securely!');
    console.log('  You will not be able to see it again.');
    console.log('');
    console.log('='.repeat(70));
    console.log('');
    console.log('  Partner Setup Instructions:');
    console.log('');
    console.log('  1. Register with Orderly Network (run separately):');
    console.log('     - Use your wallet to sign EIP-712 registration message');
    console.log('     - Get Account ID from Orderly');
    console.log('');
    console.log('  2. Generate Orderly API Keys:');
    console.log('     - Create ed25519 key pair');
    console.log('     - Register keys with Orderly (scope: read,trading,asset)');
    console.log('     - Save Orderly Key and Secret securely');
    console.log('');
    console.log('  3. Make API Requests:');
    console.log('     Include these headers in all requests:');
    console.log('       X-API-KEY: <this API key>');
    console.log('       X-Account-ID: <your Orderly account ID>');
    console.log('       X-Orderly-Key: ed25519:...');
    console.log('       X-Orderly-Secret: ed25519:...');
    console.log('');
    console.log('  See PARTNER_SETUP.md for detailed instructions.');
    console.log('');
    console.log('='.repeat(70));
    console.log('');

    readline.close();
    await closePool();
  } catch (error: any) {
    console.error('\nError:', error.message || error);
    readline.close();
    await closePool();
    process.exit(1);
  }
}

generateApiKey().catch(async (error) => {
  console.error('Error generating API key:', error);
  readline.close();
  await closePool();
  process.exit(1);
});
