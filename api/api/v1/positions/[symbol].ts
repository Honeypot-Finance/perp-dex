import { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../../../lib/auth.js';
import { sendSuccess, sendError, handle401, handle500, handle404 } from '../../../lib/response.js';
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

    const { symbol } = req.query;
    if (!symbol || typeof symbol !== 'string') {
      return sendError(res, 'VALIDATION_ERROR', 'symbol is required');
    }

    const client = createClient(auth.orderly);
    const result = await client.getPosition(symbol);

    if (!result.success) {
      return handle404(res, result.message || 'Position not found');
    }

    return sendSuccess(res, result.data);

  } catch (error) {
    console.error('Position by symbol API error:', error);
    return handle500(res, error);
  }
}
