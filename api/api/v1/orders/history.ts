import { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../../../lib/auth.js';
import { sendSuccess, sendError, handle401, handle500 } from '../../../lib/response.js';
import { createClient } from '../../../lib/helpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return handle401(res, auth.error || 'Authentication failed');
    }

    if (!auth.orderly) {
      return sendError(res, 'ORDERLY_CREDENTIALS_REQUIRED', 'Orderly credentials required. Include X-Account-ID, X-Orderly-Key, and X-Orderly-Secret headers', 400);
    }

    const { symbol, side, status, start_t, end_t, page, size } = req.query;

    const params: any = {};
    if (symbol) params.symbol = String(symbol);
    if (side) params.side = String(side);
    if (status) params.status = String(status);
    if (start_t) params.start_t = Number(start_t);
    if (end_t) params.end_t = Number(end_t);
    if (page) params.page = Number(page);
    if (size) params.size = Number(size);

    const client = createClient(auth.orderly);
    const result = await client.getOrderHistory(params);

    if (!result.success) {
      return sendError(res, result.code?.toString() || 'FETCH_FAILED', result.message || 'Failed to fetch order history');
    }

    return sendSuccess(res, result.data);

  } catch (error) {
    console.error('Order history API error:', error);
    return handle500(res, error);
  }
}
