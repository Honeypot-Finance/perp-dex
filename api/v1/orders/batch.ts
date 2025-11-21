import { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../../../lib/auth.js';
import { sendSuccess, sendError, handle401, handle500 } from '../../../lib/response.js';
import { createClient } from '../../../lib/helpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Authentication required
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return handle401(res, auth.error || 'Authentication failed');
    }

    // Wallet address required for trading operations
    if (!auth.orderly) {
      return sendError(res, 'ORDERLY_CREDENTIALS_REQUIRED', 'Orderly credentials required. Include X-Account-ID, X-Orderly-Key, and X-Orderly-Secret headers', 400);
    }

    const client = createClient(auth.orderly);

    if (req.method === 'DELETE') {
      // Batch cancel orders
      const { order_ids } = req.body;

      if (!order_ids || !Array.isArray(order_ids)) {
        return sendError(res, 'VALIDATION_ERROR', 'order_ids array is required in request body');
      }

      if (order_ids.length === 0 || order_ids.length > 10) {
        return sendError(res, 'VALIDATION_ERROR', 'order_ids must contain 1-10 order IDs');
      }

      const result = await client.batchCancelOrders(order_ids);

      if (!result.success) {
        return sendError(res, result.code?.toString() || 'CANCEL_FAILED', result.message || 'Failed to cancel orders');
      }

      return sendSuccess(res, result.data);

    } else {
      res.setHeader('Allow', ['DELETE']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

  } catch (error) {
    console.error('Batch orders API error:', error);
    return handle500(res, error);
  }
}
