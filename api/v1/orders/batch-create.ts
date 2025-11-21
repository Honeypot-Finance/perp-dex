import { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../../../lib/auth.js';
import { sendSuccess, sendError, handle401, handle500 } from '../../../lib/response.js';
import { createClient } from '../../../lib/helpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return handle401(res, auth.error || 'Authentication failed');
    }

    if (!auth.orderly) {
      return sendError(res, 'ORDERLY_CREDENTIALS_REQUIRED', 'Orderly credentials required. Include X-Account-ID, X-Orderly-Key, and X-Orderly-Secret headers', 400);
    }

    const { orders } = req.body;

    if (!orders || !Array.isArray(orders)) {
      return sendError(res, 'VALIDATION_ERROR', 'orders array is required');
    }

    if (orders.length === 0 || orders.length > 10) {
      return sendError(res, 'VALIDATION_ERROR', 'orders must contain 1-10 orders');
    }

    // Validate each order
    for (const order of orders) {
      if (!order.symbol || !order.side || !order.order_type) {
        return sendError(res, 'VALIDATION_ERROR', 'Each order must have symbol, side, and order_type');
      }

      if (!order.order_quantity && !order.order_amount) {
        return sendError(res, 'VALIDATION_ERROR', 'Each order must have order_quantity or order_amount');
      }

      if (order.order_type === 'LIMIT' && !order.order_price) {
        return sendError(res, 'VALIDATION_ERROR', 'LIMIT orders require order_price');
      }
    }

    const client = createClient(auth.orderly);
    const result = await client.batchCreateOrders(orders);

    if (!result.success) {
      return sendError(res, result.code?.toString() || 'BATCH_ORDER_FAILED', result.message || 'Failed to create batch orders');
    }

    return sendSuccess(res, result.data);

  } catch (error) {
    console.error('Batch create orders API error:', error);
    return handle500(res, error);
  }
}
