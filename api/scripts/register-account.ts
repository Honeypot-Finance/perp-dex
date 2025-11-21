import { Wallet } from 'ethers';
import axios from 'axios';
import { createInterface } from 'readline';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from parent directory
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

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const BROKER_ID = process.env.ORDERLY_BROKER_ID || 'honeypot';
const PRIVATE_KEY_ENV = process.env.PRIVATE_KEY;
const CHAIN_ID_ENV = process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID) : null;

// Orderly Network contract addresses (used for EIP-712 domain)
const ORDERLY_CONTRACTS: Record<number, string> = {
  // BSC Testnet
  97: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  // BSC Mainnet
  56: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  // Add other chains as needed
};

async function registerAccount() {
  console.log('');
  console.log('='.repeat(70));
  console.log('  Orderly Network - Account Registration');
  console.log('='.repeat(70));
  console.log('');

  // Get private key (from env or prompt)
  let privateKey = PRIVATE_KEY_ENV;
  if (privateKey) {
    console.log('✓ Using private key from environment variable');
  } else {
    privateKey = await question('Enter your private key (0x...): ');
  }

  if (!privateKey || !privateKey.startsWith('0x')) {
    console.error('Error: Invalid private key format (must start with 0x)');
    readline.close();
    return;
  }

  // Get chain ID (from env or prompt)
  let chainId = CHAIN_ID_ENV;
  if (chainId) {
    console.log(`✓ Using chain ID from environment variable: ${chainId}`);
  } else {
    const chainIdStr = await question('Enter chain ID (97 for BSC Testnet, 56 for BSC Mainnet): ');
    chainId = parseInt(chainIdStr);
  }

  if (!chainId || !ORDERLY_CONTRACTS[chainId]) {
    console.error('Error: Unsupported chain ID');
    readline.close();
    return;
  }

  try {
    // Create wallet from private key
    const wallet = new Wallet(privateKey);
    const userAddress = wallet.address;

    console.log('');
    console.log(`Wallet address: ${userAddress}`);
    console.log('');

    // Step 1: Get registration nonce
    console.log('Step 1: Fetching registration nonce...');
    const nonceResponse = await axios.get(`${BASE_URL}/api/v1/register/nonce`);

    if (!nonceResponse.data.success) {
      throw new Error(`Failed to get registration nonce: ${nonceResponse.data.error?.message || 'Unknown error'}`);
    }

    const registrationNonce = nonceResponse.data.data.registration_nonce;
    console.log(`✓ Got nonce: ${registrationNonce}`);
    console.log('');

    // Step 2: Prepare message
    const timestamp = Date.now();
    const message = {
      brokerId: BROKER_ID,
      chainId,
      timestamp: timestamp.toString(), // Must be string!
      registrationNonce: registrationNonce.toString(), // Must be string!
    };

    console.log('Step 2: Preparing EIP-712 message...');
    console.log('Message:', JSON.stringify(message, null, 2));
    console.log('');

    // Step 3: Sign with EIP-712
    console.log('Step 3: Signing message with EIP-712...');

    const domain = {
      name: 'Orderly',
      version: '1',
      chainId,
      verifyingContract: ORDERLY_CONTRACTS[chainId],
    };

    const types = {
      Registration: [
        { name: 'brokerId', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'registrationNonce', type: 'uint256' },
      ],
    };

    const signature = await wallet.signTypedData(domain, types, message);
    console.log(`✓ Signature generated: ${signature.substring(0, 20)}...`);
    console.log('');

    // Step 4: Register account
    console.log('Step 4: Registering account on Orderly Network...');

    const registerResponse = await axios.post(`${BASE_URL}/api/v1/register/account`, {
      message, // Send as object, not stringified!
      signature,
      userAddress,
    });

    if (!registerResponse.data.success) {
      throw new Error(registerResponse.data.error?.message || 'Registration failed');
    }

    console.log('✓ Registration successful!');
    console.log('');
    console.log('='.repeat(70));
    console.log('  Registration Complete');
    console.log('='.repeat(70));
    console.log('');
    console.log('Account Details:');
    console.log(JSON.stringify(registerResponse.data.data, null, 2));
    console.log('');
    console.log('Next Steps:');
    console.log('1. Save your account ID');
    console.log('2. Generate Orderly API keys through the Orderly dashboard');
    console.log('3. Update your .env file with the credentials');
    console.log('');
    console.log('='.repeat(70));
    console.log('');

  } catch (error: any) {
    console.error('');
    console.error('='.repeat(70));
    console.error('  Registration Failed');
    console.error('='.repeat(70));
    console.error('');

    if (error.response?.data) {
      console.error('Error:', error.response.data.error?.message || error.response.data.message);
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Error: Cannot connect to server');
      console.error('Make sure vercel dev is running on', BASE_URL);
    } else {
      console.error('Error:', error.message);
      if (error.stack) {
        console.error('\nStack trace:', error.stack);
      }
    }
    console.error('');
    process.exit(1);
  }

  readline.close();
}

registerAccount().catch((error) => {
  console.error('Fatal error:', error);
  readline.close();
  process.exit(1);
});
