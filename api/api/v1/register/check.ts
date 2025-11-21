import { VercelRequest, VercelResponse } from '@vercel/node';
import { OrderlyClient } from '../../../lib/orderlyClient.js';
import { sendSuccess, sendError, handle500 } from '../../../lib/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return sendError(res, 'VALIDATION_ERROR', 'address query parameter is required');
    }

    const { broker_id } = req.query;
    const brokerId = typeof broker_id === 'string' ? broker_id : undefined;

    const client = new OrderlyClient();
    const result = await client.checkAccountExists(address, brokerId);

    if (!result.success) {
      return sendError(
        res,
        result.code?.toString() || 'CHECK_FAILED',
        result.message || 'Failed to check account'
      );
    }

    return sendSuccess(res, result.data);
  } catch (error) {
    console.error('Check account API error:', error);
    return handle500(res, error);
  }
}
