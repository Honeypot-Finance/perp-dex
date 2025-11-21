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
      // Request withdrawal
      const { token, amount, chain_id, allow_cross_chain_withdrawal } = req.body;

      if (!token) {
        return sendError(res, 'VALIDATION_ERROR', 'token is required');
      }

      if (amount === undefined || amount === null) {
        return sendError(res, 'VALIDATION_ERROR', 'amount is required');
      }

      if (chain_id === undefined || chain_id === null) {
        return sendError(res, 'VALIDATION_ERROR', 'chain_id is required');
      }

      if (Number(amount) <= 0) {
        return sendError(res, 'VALIDATION_ERROR', 'amount must be greater than 0');
      }

      const result = await client.requestWithdraw({
        token,
        amount: Number(amount),
        chain_id: Number(chain_id),
        allow_cross_chain_withdrawal: allow_cross_chain_withdrawal || false,
      });

      if (!result.success) {
        return sendError(res, result.code?.toString() || 'WITHDRAW_FAILED', result.message || 'Failed to request withdrawal');
      }

      return sendSuccess(res, result.data);

    } else if (req.method === 'GET') {
      // Get settlement info, withdrawal history, or specific withdrawal
      const { withdrawId, settlement } = req.query;

      // Check balances (available for withdrawal)
      if (settlement === 'true') {
        const result = await client.getBalances();

        if (!result.success) {
          return sendError(res, result.code?.toString() || 'FETCH_FAILED', result.message || 'Failed to fetch balance info');
        }

        return sendSuccess(res, result.data);
      }

      if (withdrawId && typeof withdrawId === 'string') {
        // Get specific withdrawal by ID
        const result = await client.getWithdraw(withdrawId);

        if (!result.success) {
          return sendError(res, result.code?.toString() || 'FETCH_FAILED', result.message || 'Withdrawal not found', 404);
        }

        return sendSuccess(res, result.data);
      } else {
        // Get withdrawal history with filters
        const { token, status, side, page, size, start_t, end_t } = req.query;

        const params: any = {};
        if (token) params.token = String(token);
        if (status) params.status = String(status);
        if (side) params.side = String(side);
        if (page) params.page = Number(page);
        if (size) params.size = Number(size);
        if (start_t) params.start_t = Number(start_t);
        if (end_t) params.end_t = Number(end_t);

        const result = await client.getWithdrawHistory(params);

        if (!result.success) {
          return sendError(res, result.code?.toString() || 'FETCH_FAILED', result.message || 'Failed to fetch withdrawal history');
        }

        return sendSuccess(res, result.data);
      }

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

  } catch (error) {
    console.error('Withdraw API error:', error);
    return handle500(res, error);
  }
}
