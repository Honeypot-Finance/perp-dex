import { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../../../lib/auth.js';
import { sendSuccess, sendError, handle401, handle500 } from '../../../lib/response.js';
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

    const client = createClient(auth.orderly);

    if (req.method === 'POST') {
      // Create algo order
      const orderData = req.body;

      if (!orderData.symbol || !orderData.side || !orderData.algo_type) {
        return sendError(res, 'VALIDATION_ERROR', 'Missing required fields: symbol, side, algo_type');
      }

      const result = await client.createAlgoOrder(orderData);

      if (!result.success) {
        return sendError(res, result.code?.toString() || 'ALGO_ORDER_FAILED', result.message || 'Failed to create algo order');
      }

      return sendSuccess(res, result.data);

    } else if (req.method === 'GET') {
      // Get algo orders
      const { symbol, algo_type, status } = req.query;

      const params: any = {};
      if (symbol) params.symbol = String(symbol);
      if (algo_type) params.algo_type = String(algo_type);
      if (status) params.status = String(status);

      const result = await client.getAlgoOrders(params);

      if (!result.success) {
        return sendError(res, result.code?.toString() || 'FETCH_FAILED', result.message || 'Failed to fetch algo orders');
      }

      return sendSuccess(res, result.data);

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

  } catch (error) {
    console.error('Algo orders API error:', error);
    return handle500(res, error);
  }
}
