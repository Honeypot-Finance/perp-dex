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

    const { symbol, type, limit } = req.query;

    if (!symbol || !type) {
      return sendError(res, 'VALIDATION_ERROR', 'symbol and type query parameters are required');
    }

    const params: any = {
      symbol: String(symbol),
      type: String(type),
    };

    if (limit) params.limit = Number(limit);

    const client = createClient(auth.orderly);
    const result = await client.getKlines(params);

    if (!result.success) {
      return sendError(res, result.code?.toString() || 'FETCH_FAILED', result.message || 'Failed to fetch klines');
    }

    return sendSuccess(res, result.data);

  } catch (error) {
    console.error('Market klines API error:', error);
    return handle500(res, error);
  }
}
