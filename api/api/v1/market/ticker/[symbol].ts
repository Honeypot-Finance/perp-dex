import { VercelRequest, VercelResponse } from '@vercel/node';
import { OrderlyClient } from '../../../lib/orderlyClient.js';
import { sendSuccess, sendError, handle500, handle404 } from '../../../lib/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

    const { symbol } = req.query;
    if (!symbol || typeof symbol !== 'string') {
      return sendError(res, 'VALIDATION_ERROR', 'symbol is required');
    }

    const client = new OrderlyClient();
    const result = await client.getTicker(symbol);

    if (!result.success) {
      return handle404(res, result.message || 'Ticker not found');
    }

    return sendSuccess(res, result.data);

  } catch (error) {
    console.error('Market ticker API error:', error);
    return handle500(res, error);
  }
}
