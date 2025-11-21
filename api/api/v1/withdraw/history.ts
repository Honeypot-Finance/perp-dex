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

    const { token, status, side, page, size, start_t, end_t } = req.query;

    const params: any = {};
    if (token) params.token = String(token);
    if (status) params.status = String(status);
    if (side) params.side = String(side);
    if (page) params.page = Number(page);
    if (size) params.size = Number(size);
    if (start_t) params.start_t = Number(start_t);
    if (end_t) params.end_t = Number(end_t);

    const client = createClient(auth.orderly);
    const result = await client.getWithdrawHistory(params);

    if (!result.success) {
      return sendError(res, result.code?.toString() || 'FETCH_FAILED', result.message || 'Failed to fetch withdrawal history');
    }

    return sendSuccess(res, result.data);

  } catch (error) {
    console.error('Withdraw history API error:', error);
    return handle500(res, error);
  }
}
