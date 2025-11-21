import axios from 'axios';
import { Wallet } from 'ethers';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '../.env') });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '97');
const BROKER_ID = process.env.ORDERLY_BROKER_ID || 'honeypot';
const ORDERLY_BASE_URL = process.env.ORDERLY_BASE_URL || 'https://testnet-api.orderly.org';

async function generateRegistrationParams() {
  if (!PRIVATE_KEY) {
    console.error('Error: PRIVATE_KEY not found in .env');
    process.exit(1);
  }

  try {
    console.log('');
    console.log('='.repeat(70));
    console.log('  Orderly Registration Parameters Generator');
    console.log('='.repeat(70));
    console.log('');

    // Create wallet
    const wallet = new Wallet(PRIVATE_KEY);
    const userAddress = wallet.address;

    console.log('📝 Step 1: Get Registration Nonce');
    console.log('');
    console.log(`GET ${ORDERLY_BASE_URL}/v1/registration_nonce`);
    console.log('');

    // Get nonce
    const nonceResponse = await axios.get(`${ORDERLY_BASE_URL}/v1/registration_nonce`);
    const registrationNonce = nonceResponse.data.data.registration_nonce;

    console.log('✅ Response:');
    console.log(JSON.stringify(nonceResponse.data, null, 2));
    console.log('');

    // Prepare message (per Orderly's official EIP-712 structure)
    const timestamp = Date.now();
    const message = {
      brokerId: BROKER_ID,
      chainId: CHAIN_ID,
      timestamp: timestamp.toString(),
      registrationNonce: registrationNonce.toString(),
    };

    console.log('='.repeat(70));
    console.log('');
    console.log('📝 Step 2: Sign with EIP-712');
    console.log('');
    console.log('Domain:');
    const domain = {
      name: 'Orderly',
      version: '1',
      chainId: CHAIN_ID,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC', // Off-chain verification placeholder
    };
    console.log(JSON.stringify(domain, null, 2));
    console.log('');

    console.log('Types:');
    const types = {
      Registration: [
        { name: 'brokerId', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'registrationNonce', type: 'uint256' },
      ],
    };
    console.log(JSON.stringify(types, null, 2));
    console.log('');

    console.log('Message:');
    console.log(JSON.stringify(message, null, 2));
    console.log('');

    // Sign with EIP-712
    const signature = await wallet.signTypedData(domain, types, message);

    console.log('✅ Signature:');
    console.log(signature);
    console.log('');

    console.log('='.repeat(70));
    console.log('');
    console.log('📝 Step 3: Register Account');
    console.log('');
    console.log(`POST ${ORDERLY_BASE_URL}/v1/register_account`);
    console.log('');
    console.log('Request Body:');
    const requestBody = {
      message,
      signature,
      userAddress,
    };
    console.log(JSON.stringify(requestBody, null, 2));
    console.log('');

    console.log('='.repeat(70));
    console.log('');
    console.log('📋 CURL Command:');
    console.log('');
    console.log(`curl -X POST '${ORDERLY_BASE_URL}/v1/register_account' \\`);
    console.log(`  -H 'Content-Type: application/json' \\`);
    console.log(`  -d '${JSON.stringify(requestBody)}'`);
    console.log('');

    console.log('='.repeat(70));
    console.log('');
    console.log('🔍 Testing Registration...');
    console.log('');

    try {
      const registerResponse = await axios.post(
        `${ORDERLY_BASE_URL}/v1/register_account`,
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true,
        }
      );

      console.log('Response Status:', registerResponse.status);
      console.log('Response Body:');
      console.log(JSON.stringify(registerResponse.data, null, 2));
      console.log('');

      if (registerResponse.data.success) {
        console.log('✅ SUCCESS! Account registered!');
        console.log(`Account ID: ${registerResponse.data.data?.account_id}`);
      } else {
        console.log('❌ FAILED:', registerResponse.data.message || registerResponse.data);
      }
    } catch (error: any) {
      console.log('❌ Request failed:', error.message);
      if (error.response?.data) {
        console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
      }
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

generateRegistrationParams().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
