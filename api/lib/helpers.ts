import { OrderlyClient } from './orderlyClient.js';
import { OrderlyCredentials } from './auth.js';

/**
 * Creates an OrderlyClient instance with provided credentials
 * If no credentials provided, creates client without authentication (for public endpoints)
 */
export function createClient(credentials?: OrderlyCredentials): OrderlyClient {
  if (credentials) {
    return new OrderlyClient(
      credentials.accountId,
      credentials.orderlyKey,
      credentials.orderlySecret
    );
  }

  // No credentials - client can only access public endpoints
  return new OrderlyClient();
}
