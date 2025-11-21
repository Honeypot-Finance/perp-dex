import nacl from 'tweetnacl';
import bs58 from 'bs58';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
  console.log('');
  console.log('='.repeat(70));
  console.log('  Orderly Key Management Utility');
  console.log('='.repeat(70));
  console.log('');
  console.log('Options:');
  console.log('  1. Generate new keys');
  console.log('  2. Derive public key from secret');
  console.log('  3. Validate key format');
  console.log('');

  const choice = await question('Select option (1-3): ');

  switch (choice.trim()) {
    case '1':
      await generateNewKeys();
      break;
    case '2':
      await derivePublicKey();
      break;
    case '3':
      await validateKeyFormat();
      break;
    default:
      console.log('Invalid option');
  }

  rl.close();
}

async function generateNewKeys() {
  console.log('');
  console.log('='.repeat(70));
  console.log('  Generating New Ed25519 Key Pair');
  console.log('='.repeat(70));
  console.log('');

  // Generate key pair
  const keyPair = nacl.sign.keyPair();

  // Extract seed (first 32 bytes of secret key)
  const seed = keyPair.secretKey.slice(0, 32);

  // Encode in base58
  const publicKey = `ed25519:${bs58.encode(keyPair.publicKey)}`;
  const secretKey = `ed25519:${bs58.encode(seed)}`;

  console.log('✅ Keys Generated:');
  console.log('');
  console.log(`  Public Key:  ${publicKey}`);
  console.log(`  Secret Key:  ${secretKey}`);
  console.log('');
  console.log('⚠️  IMPORTANT:');
  console.log('  1. Save BOTH keys securely (environment variables, vault, etc.)');
  console.log('  2. NEVER commit these to git');
  console.log('  3. The secret key cannot be recovered if lost');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('  1. Register this key with Orderly (sign EIP-712 AddOrderlyKey message)');
  console.log('  2. POST to https://api.orderly.org/v1/orderly_key');
  console.log('  3. Use these keys in your API request headers');
  console.log('');
  console.log('='.repeat(70));
  console.log('');
}

async function derivePublicKey() {
  console.log('');
  console.log('='.repeat(70));
  console.log('  Derive Public Key from Secret');
  console.log('='.repeat(70));
  console.log('');

  const secret = await question('Enter your secret key (ed25519:...): ');

  try {
    // Remove prefix if present
    const secretBase58 = secret.trim().replace(/^ed25519:/, '');

    // Decode base58
    const seed = bs58.decode(secretBase58);

    if (seed.length !== 32) {
      throw new Error(`Invalid seed length: ${seed.length} bytes (expected 32)`);
    }

    // Regenerate key pair from seed
    const keyPair = nacl.sign.keyPair.fromSeed(seed);

    // Derive public key
    const publicKey = `ed25519:${bs58.encode(keyPair.publicKey)}`;

    console.log('');
    console.log('✅ Derived Public Key:');
    console.log('');
    console.log(`  ${publicKey}`);
    console.log('');
    console.log('This is the public key that corresponds to your secret.');
    console.log('Use this in the X-Orderly-Key header.');
    console.log('');
    console.log('='.repeat(70));
    console.log('');
  } catch (error: any) {
    console.log('');
    console.log('❌ Error:', error.message);
    console.log('');
    console.log('Make sure your secret key is in the correct format:');
    console.log('  ed25519:BASE58_ENCODED_32_BYTES');
    console.log('');
  }
}

async function validateKeyFormat() {
  console.log('');
  console.log('='.repeat(70));
  console.log('  Validate Key Format');
  console.log('='.repeat(70));
  console.log('');

  const key = await question('Enter key to validate (ed25519:...): ');

  try {
    // Remove prefix
    const keyBase58 = key.trim().replace(/^ed25519:/, '');

    // Check if it was prefixed
    const hasPrefix = key.trim().startsWith('ed25519:');

    // Decode base58
    const decoded = bs58.decode(keyBase58);

    console.log('');
    console.log('✅ Valid Key:');
    console.log('');
    console.log(`  Has prefix:   ${hasPrefix ? 'Yes' : 'No (should add ed25519:)'}`);
    console.log(`  Base58:       Valid`);
    console.log(`  Length:       ${decoded.length} bytes`);
    console.log(`  Type:         ${decoded.length === 32 ? 'Secret (seed)' : decoded.length === 64 ? 'Full secret key' : 'Public key (32 bytes expected)'}`);
    console.log('');

    if (decoded.length === 64) {
      console.log('⚠️  Note: Your key is 64 bytes (full secret key)');
      console.log('   For Orderly, you need the 32-byte seed (first half)');
      console.log('');
      const seed = decoded.slice(0, 32);
      const seedBase58 = bs58.encode(seed);
      console.log('   Use this instead:');
      console.log(`   ed25519:${seedBase58}`);
      console.log('');
    } else if (decoded.length === 32) {
      console.log('✅ Correct length for secret seed or public key');
    }

    console.log('='.repeat(70));
    console.log('');
  } catch (error: any) {
    console.log('');
    console.log('❌ Invalid Key:', error.message);
    console.log('');
    console.log('Expected format: ed25519:BASE58_STRING');
    console.log('');
  }
}

main().catch((error) => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
