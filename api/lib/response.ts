import { VercelResponse } from '@vercel/node';
import { ApiResponse } from './types.js';

export function sendSuccess<T>(res: VercelResponse, data: T, status = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: Date.now(),
  };
  res.status(status).json(response);
}

export function sendError(
  res: VercelResponse,
  code: string,
  message: string,
  status = 400
) {
  const response: ApiResponse = {
    success: false,
    error: { code, message },
    timestamp: Date.now(),
  };
  res.status(status).json(response);
}

export function handle401(res: VercelResponse, message: string) {
  sendError(res, 'UNAUTHORIZED', message, 401);
}

export function handle400(res: VercelResponse, message: string) {
  sendError(res, 'BAD_REQUEST', message, 400);
}

export function handle404(res: VercelResponse, message: string) {
  sendError(res, 'NOT_FOUND', message, 404);
}

export function handle500(res: VercelResponse, error: any) {
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : error.message || 'Internal server error';
  sendError(res, 'INTERNAL_ERROR', message, 500);
}
