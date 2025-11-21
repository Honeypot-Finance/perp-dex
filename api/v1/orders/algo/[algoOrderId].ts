import { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../../../lib/auth.js';
import { sendSuccess, sendError, handle401, handle500, handle404 } from '../../../lib/response.js';
import { createClient } from '../../../lib/helpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return handle401(res, auth.error || 'Authentication failed');
    }

    if (!auth.orderly) {
      return sendError(res, 'ORDERLY_CREDENTIALS_REQUIRED', 'Orderly credentials required. Include X-Account-ID, X-Orderly-Key, and X-Orderly-Secret headers', 400);
    }

    const { algoOrderId } = req.query;
    if (!algoOrderId || typeof algoOrderId !== 'string') {
      return sendError(res, 'VALIDATION_ERROR', 'algoOrderId is required');
    }

    const client = createClient(auth.orderly);

    if (req.method === 'GET') {
      // Get algo order by ID
      const result = await client.getAlgoOrder(algoOrderId);

      if (!result.success) {
        return handle404(res, result.message || 'Algo order not found');
      }

      return sendSuccess(res, result.data);

    } else if (req.method === 'PUT') {
      // Edit algo order
      const orderData = req.body;

      if (!orderData.symbol || !orderData.algo_type) {
        return sendError(res, 'VALIDATION_ERROR', 'Missing required fields: symbol, algo_type');
      }

      const result = await client.editAlgoOrder(algoOrderId, orderData);

      if (!result.success) {
        return sendError(res, result.code?.toString() || 'EDIT_FAILED', result.message || 'Failed to edit algo order');
      }

      return sendSuccess(res, result.data);

    } else if (req.method === 'DELETE') {
      // Cancel algo order
      const result = await client.cancelAlgoOrder(algoOrderId);

      if (!result.success) {
        return sendError(res, result.code?.toString() || 'CANCEL_FAILED', result.message || 'Failed to cancel algo order');
      }

      return sendSuccess(res, result.data);

    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

  } catch (error) {
    console.error('Algo order by ID API error:', error);
    return handle500(res, error);
  }
}
