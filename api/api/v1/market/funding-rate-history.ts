import { VercelRequest, VercelResponse } from '@vercel/node';
import { OrderlyClient } from '../../../lib/orderlyClient.js';
import { sendSuccess, sendError, handle500 } from '../../../lib/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

    const { symbol, start_t, end_t, page, size } = req.query;

    if (!symbol) {
      return sendError(res, 'VALIDATION_ERROR', 'symbol query parameter is required');
    }

    const params: any = { symbol: String(symbol) };
    if (start_t) params.start_t = Number(start_t);
    if (end_t) params.end_t = Number(end_t);
    if (page) params.page = Number(page);
    if (size) params.size = Number(size);

    const client = new OrderlyClient();
    const result = await client.getFundingRateHistory(params);

    if (!result.success) {
      return sendError(res, result.code?.toString() || 'FETCH_FAILED', result.message || 'Failed to fetch funding rate history');
    }

    return sendSuccess(res, result.data);

  } catch (error) {
    console.error('Market funding rate history API error:', error);
    return handle500(res, error);
  }
}
