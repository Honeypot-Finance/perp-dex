import { VercelRequest, VercelResponse } from '@vercel/node';
import { OrderlyClient } from '../../../lib/orderlyClient.js';
import { sendSuccess, sendError, handle500, handle404 } from '../../../lib/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

    const { symbol, depth } = req.query;
    if (!symbol || typeof symbol !== 'string') {
      return sendError(res, 'VALIDATION_ERROR', 'symbol is required');
    }

    const depthNumber = depth ? Number(depth) : undefined;

    const client = new OrderlyClient();
    const result = await client.getOrderbook(symbol, depthNumber);

    if (!result.success) {
      return handle404(res, result.message || 'Orderbook not found');
    }

    return sendSuccess(res, result.data);

  } catch (error) {
    console.error('Market orderbook API error:', error);
    return handle500(res, error);
  }
}
