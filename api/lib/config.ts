import { OrderlyConfig } from './types.js';

export const getOrderlyConfig = (accountId?: string, orderlyKey?: string, orderlySecret?: string): OrderlyConfig => ({
  baseUrl: process.env.ORDERLY_BASE_URL || 'https://testnet-api.orderly.org',
  accountId: accountId || process.env.ORDERLY_ACCOUNT_ID || '',
  orderlyKey: orderlyKey || process.env.ORDERLY_KEY || '',
  orderlySecret: orderlySecret || process.env.ORDERLY_SECRET || '',
  brokerId: process.env.ORDERLY_BROKER_ID || 'honeypot',
});

export const validateConfig = () => {
  const config = getOrderlyConfig();

  if (!config.accountId || !config.orderlyKey || !config.orderlySecret) {
    throw new Error('Missing required Orderly Network credentials');
  }

  if (!config.orderlyKey.startsWith('ed25519:') || !config.orderlySecret.startsWith('ed25519:')) {
    throw new Error('Orderly keys must be in ed25519: format');
  }
};

// API Keys stored as comma-separated "name:hashedKey" pairs
export const getApiKeys = (): Map<string, string> => {
  const keys = new Map<string, string>();
  const apiKeysEnv = process.env.API_KEYS || '';

  if (!apiKeysEnv) return keys;

  const keyPairs = apiKeysEnv.split(',');
  for (const pair of keyPairs) {
    const [name, hashedKey] = pair.split(':');
    if (name && hashedKey) {
      keys.set(name.trim(), hashedKey.trim());
    }
  }

  return keys;
};
