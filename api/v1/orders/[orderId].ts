import { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../../../lib/auth.js';
import { sendSuccess, sendError, handle401, handle500, handle404 } from '../../../lib/response.js';
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

    const { orderId } = req.query;
    if (!orderId || typeof orderId !== 'string') {
      return sendError(res, 'VALIDATION_ERROR', 'orderId is required');
    }

    const client = createClient(auth.orderly);

    if (req.method === 'GET') {
      // Get order by ID
      const result = await client.getOrder(orderId);

      if (!result.success) {
        return handle404(res, result.message || 'Order not found');
      }

      return sendSuccess(res, result.data);

    } else if (req.method === 'DELETE') {
      // Cancel order
      const { symbol } = req.query;

      if (!symbol || typeof symbol !== 'string') {
        return sendError(res, 'VALIDATION_ERROR', 'symbol query parameter is required');
      }

      const result = await client.cancelOrder(orderId, symbol);

      if (!result.success) {
        return sendError(res, result.code?.toString() || 'CANCEL_FAILED', result.message || 'Failed to cancel order');
      }

      return sendSuccess(res, result.data);

    } else if (req.method === 'PUT') {
      // Edit order
      const orderData = req.body;

      // Add order_id from path
      orderData.order_id = orderId;

      // Validation
      if (!orderData.order_type || !orderData.side || !orderData.symbol) {
        return sendError(res, 'VALIDATION_ERROR', 'Missing required fields: order_type, side, symbol');
      }

      if (!orderData.order_price && !orderData.order_quantity) {
        return sendError(res, 'VALIDATION_ERROR', 'At least one of order_price or order_quantity must be provided');
      }

      const result = await client.editOrder(orderData);

      if (!result.success) {
        return sendError(res, result.code?.toString() || 'EDIT_FAILED', result.message || 'Failed to edit order');
      }

      return sendSuccess(res, result.data);

    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

  } catch (error) {
    console.error('Order by ID API error:', error);
    return handle500(res, error);
  }
}
