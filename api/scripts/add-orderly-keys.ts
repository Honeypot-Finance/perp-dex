import axios from 'axios';
import { Wallet } from 'ethers';
import { config } from 'dotenv';
import { resolve } from 'path';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

config({ path: resolve(process.cwd(), '../.env') });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '56');
const BROKER_ID = process.env.ORDERLY_BROKER_ID || 'honeypot';
const ORDERLY_BASE_URL = process.env.ORDERLY_BASE_URL || 'https://api.orderly.org';

async function addOrderlyKeys() {
  if (!PRIVATE_KEY) {
    console.error('Error: PRIVATE_KEY not found in .env');
    process.exit(1);
  }

  try {
    console.log('');
    console.log('='.repeat(70));
    console.log('  Orderly Keys Generator');
    console.log('='.repeat(70));
    console.log('');

    // Create wallet
    const wallet = new Wallet(PRIVATE_KEY);
    const userAddress = wallet.address;

    console.log('📝 Step 1: Generate ed25519 Key Pair');
    console.log('');

    // Generate ed25519 key pair
    const keyPair = nacl.sign.keyPair();

    // Encode keys in base58 (Orderly uses base58, not base64)
    // The secret key is 64 bytes: first 32 bytes are the seed, last 32 are the public key
    // We only need to store the 32-byte seed
    const seed = keyPair.secretKey.slice(0, 32);
    const publicKeyBase58 = bs58.encode(keyPair.publicKey);
    const secretKeyBase58 = bs58.encode(seed);
    const orderlyKey = `ed25519:${publicKeyBase58}`;

    console.log('✅ Generated Keys:');
    console.log(`  Public Key:  ${orderlyKey}`);
    console.log(`  Secret Key:  ed25519:${secretKeyBase58}`);
    console.log('');

    console.log('='.repeat(70));
    console.log('');
    console.log('📝 Step 2: Sign with EIP-712');
    console.log('');

    // Prepare message
    const timestamp = Date.now();
    const expiration = timestamp + (365 * 24 * 60 * 60 * 1000); // 365 days from now

    const message = {
      brokerId: BROKER_ID,
      chainId: CHAIN_ID,
      orderlyKey: orderlyKey,
      scope: 'read,trading,asset',
      timestamp: timestamp.toString(),
      expiration: expiration.toString(),
    };

    console.log('Message:');
    console.log(JSON.stringify(message, null, 2));
    console.log('');

    // Sign with EIP-712
    const domain = {
      name: 'Orderly',
      version: '1',
      chainId: CHAIN_ID,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC', // Off-chain verification
    };

    const types = {
      AddOrderlyKey: [
        { name: 'brokerId', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'orderlyKey', type: 'string' },
        { name: 'scope', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'expiration', type: 'uint64' },
      ],
    };

    const signature = await wallet.signTypedData(domain, types, message);

    console.log('✅ Signature:');
    console.log(signature);
    console.log('');

    console.log('='.repeat(70));
    console.log('');
    console.log('📝 Step 3: Add Orderly Key');
    console.log('');
    console.log(`POST ${ORDERLY_BASE_URL}/v1/orderly_key`);
    console.log('');

    const requestBody = {
      message,
      signature,
      userAddress,
    };

    console.log('Request Body:');
    console.log(JSON.stringify(requestBody, null, 2));
    console.log('');

    console.log('='.repeat(70));
    console.log('');
    console.log('🔍 Testing Key Addition...');
    console.log('');

    const response = await axios.post(
      `${ORDERLY_BASE_URL}/v1/orderly_key`,
      requestBody,
      {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true,
      }
    );

    console.log('Response Status:', response.status);
    console.log('Response Body:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');

    if (response.data.success) {
      console.log('✅ SUCCESS! Orderly keys added!');
      console.log('');
      console.log('='.repeat(70));
      console.log('');
      console.log('📋 Add these to your .api-keys.json:');
      console.log('');
      console.log(`  "orderly": {`);
      console.log(`    "key": "${orderlyKey}",`);
      console.log(`    "secret": "ed25519:${secretKeyBase58}"`);
      console.log(`  }`);
      console.log('');
      console.log('Add this under the wallet object for address:', userAddress);
    } else {
      console.log('❌ FAILED:', response.data.message || response.data);
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('');

  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

addOrderlyKeys().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
