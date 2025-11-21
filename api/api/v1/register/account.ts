import { VercelRequest, VercelResponse } from '@vercel/node';
import { OrderlyClient } from '../../../lib/orderlyClient.js';
import { sendSuccess, sendError, handle401, handle500 } from '../../../lib/response.js';
import { authenticateRequest } from '../../../lib/auth.js';
import { Wallet } from 'ethers';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

/**
 * Register account endpoint - proxy to Orderly Network
 * Partners should save the returned account_id securely along with their Orderly keys
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

    // Authentication optional for registration
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return handle401(res, auth.error || 'Authentication failed');
    }

    const { message, signature, userAddress } = req.body;

    if (!message || !signature || !userAddress) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'message, signature, and userAddress are required'
      );
    }

    // Validate message fields
    if (!message.brokerId || !message.chainId || !message.timestamp || !message.registrationNonce) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'message must contain brokerId, chainId, timestamp, and registrationNonce'
      );
    }

    const client = new OrderlyClient();
    const result = await client.registerAccount({
      message,
      signature,
      userAddress,
    });

    if (!result.success) {
      return sendError(
        res,
        result.code?.toString() || 'REGISTRATION_FAILED',
        result.message || 'Failed to register account'
      );
    }

    const data = result.data as any;

    // Step 2: Automatically generate and add Orderly keys
    console.log('Generating Orderly keys for wallet:', userAddress);

    // Generate ed25519 key pair
    const keyPair = nacl.sign.keyPair();
    const seed = keyPair.secretKey.slice(0, 32);
    const publicKeyBase58 = bs58.encode(keyPair.publicKey);
    const secretKeyBase58 = bs58.encode(seed);
    const orderlyKey = `ed25519:${publicKeyBase58}`;

    // Prepare Orderly key message
    const timestamp = Date.now();
    const expiration = timestamp + (365 * 24 * 60 * 60 * 1000); // 365 days

    const keyMessage = {
      brokerId: message.brokerId,
      chainId: message.chainId,
      orderlyKey: orderlyKey,
      scope: 'read,trading,asset',
      timestamp: timestamp.toString(),
      expiration: expiration.toString(),
    };

    // Sign with wallet (reconstruct from signature verification)
    // We need the partner's private key to sign this, which we don't have
    // Instead, we'll return the unsigned message for them to sign
    // OR we ask for the private key in the request (not recommended)
    //
    // For now, let's add a separate step that can be called after registration
    // or accept a signature parameter

    console.log('Orderly keys generated. Partner needs to store these securely.');

    return sendSuccess(res, {
      ...data,
      orderlyKeys: {
        publicKey: orderlyKey,
        secretKey: `ed25519:${secretKeyBase58}`,
        keyMessage,
        note: 'Store these keys securely. Use them for API authentication with orderly-key and orderly-signature headers.'
      },
      message: 'Account registered. Orderly keys generated. Add keys to Orderly by signing keyMessage and calling POST /v1/orderly_key'
    });
  } catch (error) {
    console.error('Register account API error:', error);
    return handle500(res, error);
  }
}
