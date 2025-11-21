import { VercelRequest, VercelResponse } from '@vercel/node';
import { sendSuccess } from './lib/response.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  sendSuccess(res, {
    status: 'healthy',
    timestamp: Date.now(),
    version: '1.0.0',
  });
}
