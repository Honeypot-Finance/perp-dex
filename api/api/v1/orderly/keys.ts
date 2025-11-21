import { VercelRequest, VercelResponse } from '@vercel/node';
import { sendSuccess, sendError, handle401, handle500 } from '../../../lib/response.js';
import { authenticateRequest } from '../../../lib/auth.js';
import { query } from '../../../lib/db.js';

/**
 * Store Orderly keys endpoint
 * Saves generated Orderly ed25519 keys to database for persistent authentication
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

    // Authenticate request
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return handle401(res, auth.error || 'Authentication failed');
    }

    const { accountId, orderlyKey, orderlySecret } = req.body;

    // Validate required parameters
    if (!accountId || !orderlyKey || !orderlySecret) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'accountId, orderlyKey, and orderlySecret are required'
      );
    }

    // Validate key format (should start with ed25519:)
    if (!orderlyKey.startsWith('ed25519:') || !orderlySecret.startsWith('ed25519:')) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'Keys must be in format: ed25519:{base58_encoded_key}'
      );
    }

    // Get partner_id from authenticated API key
    const partnerId = auth.partner?.id;

    if (!partnerId) {
      return sendError(res, 'AUTH_ERROR', 'Partner ID not found in authentication');
    }

    // Check if credentials already exist for this partner and account
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
        [orderlyKey, orderlySecret, partnerId, accountId]
      );

      return sendSuccess(res, {
        message: 'Orderly keys updated successfully',
        accountId,
        orderlyKey,
      });
    } else {
      // Insert new credentials
      await query(
        `INSERT INTO orderly_credentials (partner_id, account_id, orderly_key, orderly_secret, is_active)
         VALUES ($1, $2, $3, $4, true)`,
        [partnerId, accountId, orderlyKey, orderlySecret]
      );

      return sendSuccess(res, {
        message: 'Orderly keys stored successfully',
        accountId,
        orderlyKey,
      });
    }
  } catch (error) {
    console.error('Store Orderly keys API error:', error);
    return handle500(res, error);
  }
}
