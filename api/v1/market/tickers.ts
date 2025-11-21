import { VercelRequest, VercelResponse } from '@vercel/node';
import { OrderlyClient } from '../../../lib/orderlyClient.js';
import { sendSuccess, sendError, handle500 } from '../../../lib/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

    const client = new OrderlyClient();
    const result = await client.getAllTickers();

    if (!result.success) {
      return sendError(res, result.code?.toString() || 'FETCH_FAILED', result.message || 'Failed to fetch tickers');
    }

    return sendSuccess(res, result.data);

  } catch (error) {
    console.error('Market tickers API error:', error);
    return handle500(res, error);
  }
}
