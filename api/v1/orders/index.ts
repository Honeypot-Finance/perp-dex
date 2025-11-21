import { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from '../../../lib/auth.js';
import { sendSuccess, sendError, handle401, handle500 } from '../../../lib/response.js';
import { CreateOrderRequest } from '../../../lib/types.js';
import { createClient } from '../../../lib/helpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Authentication required
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return handle401(res, auth.error || 'Authentication failed');
    }

    // Orderly credentials required for trading operations
    if (!auth.orderly) {
      return sendError(res, 'ORDERLY_CREDENTIALS_REQUIRED', 'Orderly credentials required. Include X-Account-ID, X-Orderly-Key, and X-Orderly-Secret headers', 400);
    }

    // Create client with provided credentials
    const client = createClient(auth.orderly);

    if (req.method === 'POST') {
      // Create order
      const orderData = req.body as CreateOrderRequest;

      // Validation
      if (!orderData.symbol || !orderData.side || !orderData.order_type) {
        return sendError(res, 'VALIDATION_ERROR', 'Missing required fields: symbol, side, order_type');
      }

      if (!orderData.order_quantity && !orderData.order_amount) {
        return sendError(res, 'VALIDATION_ERROR', 'Either order_quantity or order_amount must be provided');
      }

      if (orderData.order_type === 'LIMIT' && !orderData.order_price) {
        return sendError(res, 'VALIDATION_ERROR', 'order_price is required for LIMIT orders');
      }

      const result = await client.createOrder(orderData);

      if (!result.success) {
        return sendError(res, result.code?.toString() || 'ORDER_FAILED', result.message || 'Failed to create order');
      }

      return sendSuccess(res, result.data);

    } else if (req.method === 'GET') {
      // Get active orders
      const { symbol } = req.query;
      const result = await client.getOrders(symbol as string);

      if (!result.success) {
        return sendError(res, result.code?.toString() || 'FETCH_FAILED', result.message || 'Failed to fetch orders');
      }

      return sendSuccess(res, result.data);

    } else if (req.method === 'PUT') {
      // Edit order
      const orderData = req.body;

      // Validation
      if (!orderData.order_id || !orderData.order_type || !orderData.side || !orderData.symbol) {
        return sendError(res, 'VALIDATION_ERROR', 'Missing required fields: order_id, order_type, side, symbol');
      }

      if (!orderData.order_price && !orderData.order_quantity) {
        return sendError(res, 'VALIDATION_ERROR', 'At least one of order_price or order_quantity must be provided');
      }

      const result = await client.editOrder(orderData);

      if (!result.success) {
        return sendError(res, result.code?.toString() || 'EDIT_FAILED', result.message || 'Failed to edit order');
      }

      return sendSuccess(res, result.data);

    } else if (req.method === 'DELETE') {
      // Cancel all orders
      const { symbol } = req.query;
      const result = await client.cancelAllOrders(symbol as string);

      if (!result.success) {
        return sendError(res, result.code?.toString() || 'CANCEL_FAILED', result.message || 'Failed to cancel orders');
      }

      return sendSuccess(res, result.data);

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

  } catch (error) {
    console.error('Orders API error:', error);
    return handle500(res, error);
  }
}
