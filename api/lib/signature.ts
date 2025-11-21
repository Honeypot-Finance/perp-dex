import nacl from 'tweetnacl';
import tweetnacl_util from 'tweetnacl-util';
const { decodeUTF8, encodeBase64 } = tweetnacl_util;

export function generateSignature(secret: string, message: string): string {
  const seed = decodeEd25519Secret(secret);
  const keyPair = nacl.sign.keyPair.fromSeed(seed);
  const messageBytes = decodeUTF8(message);
  const signature = nacl.sign.detached(messageBytes, keyPair.secretKey);
  return encodeBase64(signature);
}

function decodeEd25519Secret(secret: string): Uint8Array {
  const base58Key = secret.replace('ed25519:', '');
  const decoded = base58Decode(base58Key);

  // Ed25519 seed should be 32 bytes
  if (decoded.length !== 32) {
    throw new Error(`Invalid Ed25519 seed length: ${decoded.length} (expected 32)`);
  }

  return decoded;
}

function base58Decode(str: string): Uint8Array {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const base = BigInt(58);

  let num = BigInt(0);
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const value = alphabet.indexOf(char);
    if (value === -1) throw new Error(`Invalid base58 character: ${char}`);
    num = num * base + BigInt(value);
  }

  const hex = num.toString(16);
  const paddedHex = hex.length % 2 === 0 ? hex : '0' + hex;
  const bytes = new Uint8Array(paddedHex.length / 2);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(paddedHex.substr(i * 2, 2), 16);
  }

  return bytes;
}

export function createSignatureMessage(
  timestamp: number,
  method: string,
  path: string,
  body?: any
): string {
  const bodyStr = body ? JSON.stringify(body) : '';
  return `${timestamp}${method.toUpperCase()}${path}${bodyStr}`;
}

export function getTimestamp(): number {
  return Date.now();
}
