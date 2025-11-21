import { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from './auth.js';
import { handle401, handle500, sendError } from './response.js';

/**
 * Async handler wrapper that catches errors automatically
 */
export function asyncHandler(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<any>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      handle500(res, error);
    }
  };
}

/**
 * Authentication middleware - ensures request is authenticated
 */
export function requireAuth(
  handler: (req: VercelRequest, res: VercelResponse, partnerName: string) => Promise<any>
) {
  return asyncHandler(async (req, res) => {
    const auth = await authenticateRequest(req);
    if (!auth.authenticated || !auth.partner) {
      return handle401(res, auth.error || 'Authentication failed');
    }
    await handler(req, res, auth.partner.name);
  });
}

/**
 * Method guard - only allows specified HTTP methods
 */
export function allowMethods(methods: string[], handler: any) {
  return async (req: VercelRequest, res: VercelResponse) => {
    if (!methods.includes(req.method || '')) {
      res.setHeader('Allow', methods);
      return sendError(
        res,
        'METHOD_NOT_ALLOWED',
        `Method ${req.method} not allowed`,
        405
      );
    }
    await handler(req, res);
  };
}

/**
 * Combine multiple middlewares
 */
export function compose(...middlewares: any[]) {
  return (handler: any) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}
