import { VercelRequest } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { getAllPartners, Partner, getOrderlyCredentialsByAccountId, OrderlyCredentials as StoredOrderlyCredentials } from './storage.js';

export interface OrderlyCredentials {
  accountId: string;
  orderlyKey: string;
  orderlySecret: string;
}

/**
 * Validates an API key against stored partners
 * @returns The partner if valid, undefined otherwise
 */
async function validateApiKey(apiKey: string): Promise<Partner | undefined> {
  const partners = await getAllPartners();

  for (const partner of partners) {
    if (bcrypt.compareSync(apiKey, partner.apiKeyHash)) {
      return partner;
    }
  }

  return undefined;
}

/**
 * Authenticates a request
 * Method 1: Partner provides Orderly credentials in headers (stateless)
 * Method 2: Partner provides Account ID, we look up stored credentials (stateful)
 */
export async function authenticateRequest(req: VercelRequest): Promise<{
  authenticated: boolean;
  partner?: Partner;
  orderly?: OrderlyCredentials;
  error?: string;
}> {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return {
      authenticated: false,
      error: 'API key is required. Include it in X-API-KEY header.'
    };
  }

  const partner = await validateApiKey(apiKey);
  if (!partner) {
    return {
      authenticated: false,
      error: 'Invalid API key provided'
    };
  }

  // Extract credentials from headers
  const accountId = req.headers['x-account-id'] as string;
  const orderlyKey = req.headers['x-orderly-key'] as string;
  const orderlySecret = req.headers['x-orderly-secret'] as string;

  // Method 1: All credentials provided in headers (stateless)
  if (accountId && orderlyKey && orderlySecret) {
    return {
      authenticated: true,
      partner,
      orderly: {
        accountId,
        orderlyKey,
        orderlySecret,
      },
    };
  }

  // Method 2: Only Account ID provided, look up stored credentials (stateful)
  if (accountId) {
    const storedCreds = await getOrderlyCredentialsByAccountId(accountId);
    if (storedCreds && storedCreds.partnerId === partner.id) {
      return {
        authenticated: true,
        partner,
        orderly: {
          accountId: storedCreds.accountId,
          orderlyKey: storedCreds.orderlyKey,
          orderlySecret: storedCreds.orderlySecret,
        },
      };
    }
  }

  // Valid API key but no Orderly credentials
  return { authenticated: true, partner };
}

/**
 * Optional authentication - doesn't fail if no key provided
 */
export async function optionalAuth(req: VercelRequest): Promise<{ keyName?: string }> {
  const apiKey = req.headers['x-api-key'] as string;
  if (!apiKey) return {};

  const partner = await validateApiKey(apiKey);
  return partner ? { keyName: partner.name } : {};
}
