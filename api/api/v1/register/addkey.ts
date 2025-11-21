import { VercelRequest, VercelResponse } from '@vercel/node';
import { OrderlyClient } from '../../../lib/orderlyClient.js';
import { sendSuccess, sendError, handle401, handle500 } from '../../../lib/response.js';
import { authenticateRequest } from '../../../lib/auth.js';
import { query } from '../../../lib/db.js';

/**
 * Add Orderly key endpoint - proxy to Orderly Network and store in database
 * This endpoint handles both submitting the key to Orderly and persisting it locally
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

    // Authentication required
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return handle401(res, auth.error || 'Authentication failed');
    }

    const { message, signature, userAddress, orderlySecret } = req.body;

    // Validate required parameters
    if (!message || !signature || !userAddress) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'message, signature, and userAddress are required'
      );
    }

    // Validate message fields
    if (!message.brokerId || !message.chainId || !message.orderlyKey || !message.scope || !message.timestamp || !message.expiration) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'message must contain brokerId, chainId, orderlyKey, scope, timestamp, and expiration'
      );
    }

    // Validate orderlySecret is provided (we need this to store)
    if (!orderlySecret) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'orderlySecret is required for storage'
      );
    }

    // Validate key formats
    if (!message.orderlyKey.startsWith('ed25519:') || !orderlySecret.startsWith('ed25519:')) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'Keys must be in format: ed25519:{base58_encoded_key}'
      );
    }

    // Step 1: Submit to Orderly Network
    const client = new OrderlyClient();
    const result = await client.addOrderlyKey({
      message,
      signature,
      userAddress,
    });

    console.log('Orderly addOrderlyKey response:', JSON.stringify(result, null, 2));

    if (!result.success) {
      console.error('Failed to add Orderly key:', result);
      return sendError(
        res,
        result.code?.toString() || 'KEY_ADDITION_FAILED',
        result.message || 'Failed to add Orderly key'
      );
    }

    // Step 2: Get account ID hash from Orderly
    // After successful key addition, fetch the account to get the bytes32 account_id
    const checkResult = await client.checkAccountExists(userAddress, message.brokerId);

    if (!checkResult.success || !checkResult.data) {
      return sendError(res, 'ACCOUNT_NOT_FOUND', 'Could not retrieve account information from Orderly');
    }

    const accountId = checkResult.data.account_id;

    // Step 3: Store keys in database
    const partnerId = auth.partner?.id;

    if (!partnerId) {
      return sendError(res, 'AUTH_ERROR', 'Partner ID not found in authentication');
    }

    // Check if credentials already exist
    const existingCreds = await query(
      'SELECT id FROM orderly_credentials WHERE partner_id = $1 AND account_id = $2',
      [partnerId, accountId]
    );

    if (existingCreds.rows.length > 0) {
      // Update existing credentials
      await query(
        `UPDATE orderly_credentials
         SET orderly_key = $1, orderly_secret = $2, is_active = true, created_at = CURRENT_TIMESTAMP
         WHERE partner_id = $3 AND account_id = $4`,
        [message.orderlyKey, orderlySecret, partnerId, accountId]
      );
    } else {
      // Insert new credentials
      await query(
        `INSERT INTO orderly_credentials (partner_id, account_id, orderly_key, orderly_secret, is_active)
         VALUES ($1, $2, $3, $4, true)`,
        [partnerId, accountId, message.orderlyKey, orderlySecret]
      );
    }

    return sendSuccess(res, {
      success: true,
      accountId,
      orderlyKey: message.orderlyKey,
      message: 'Orderly key added and stored successfully. You can now use the trading API.',
    });
  } catch (error) {
    console.error('Add Orderly key API error:', error);
    return handle500(res, error);
  }
}
