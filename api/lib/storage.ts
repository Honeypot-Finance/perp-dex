import { query } from './db.js';

export interface Partner {
  id: number;
  name: string;
  apiKeyHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderlyCredentials {
  id: number;
  partnerId: number;
  accountId: string;
  orderlyKey: string;
  orderlySecret: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Save a new partner
 */
export async function savePartner(partner: {
  name: string;
  apiKeyHash: string;
}): Promise<Partner> {
  const result = await query<any>(
    `INSERT INTO partners (name, api_key_hash)
     VALUES ($1, $2)
     RETURNING *`,
    [partner.name, partner.apiKeyHash]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    apiKeyHash: row.api_key_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get partner by name
 */
export async function getPartnerByName(name: string): Promise<Partner | null> {
  const result = await query<any>(
    'SELECT * FROM partners WHERE name = $1',
    [name]
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    apiKeyHash: row.api_key_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get partner by ID
 */
export async function getPartnerById(id: number): Promise<Partner | null> {
  const result = await query<any>(
    'SELECT * FROM partners WHERE id = $1',
    [id]
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    apiKeyHash: row.api_key_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get all partners
 */
export async function getAllPartners(): Promise<Partner[]> {
  const result = await query<any>('SELECT * FROM partners ORDER BY created_at DESC');
  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    apiKeyHash: row.api_key_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Save Orderly credentials for a partner
 */
export async function saveOrderlyCredentials(credentials: {
  partnerId: number;
  accountId: string;
  orderlyKey: string;
  orderlySecret: string;
}): Promise<OrderlyCredentials> {
  const result = await query<any>(
    `INSERT INTO orderly_credentials (partner_id, account_id, orderly_key, orderly_secret)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (partner_id, account_id)
     DO UPDATE SET
       orderly_key = EXCLUDED.orderly_key,
       orderly_secret = EXCLUDED.orderly_secret,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [credentials.partnerId, credentials.accountId, credentials.orderlyKey, credentials.orderlySecret]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    partnerId: row.partner_id,
    accountId: row.account_id,
    orderlyKey: row.orderly_key,
    orderlySecret: row.orderly_secret,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get Orderly credentials by account ID
 */
export async function getOrderlyCredentialsByAccountId(
  accountId: string
): Promise<OrderlyCredentials | null> {
  const result = await query<any>(
    'SELECT * FROM orderly_credentials WHERE account_id = $1 AND is_active = TRUE',
    [accountId]
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: row.id,
    partnerId: row.partner_id,
    accountId: row.account_id,
    orderlyKey: row.orderly_key,
    orderlySecret: row.orderly_secret,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get all Orderly credentials for a partner
 */
export async function getPartnerOrderlyCredentials(
  partnerId: number
): Promise<OrderlyCredentials[]> {
  const result = await query<any>(
    'SELECT * FROM orderly_credentials WHERE partner_id = $1 AND is_active = TRUE ORDER BY created_at DESC',
    [partnerId]
  );

  return result.rows.map((row: any) => ({
    id: row.id,
    partnerId: row.partner_id,
    accountId: row.account_id,
    orderlyKey: row.orderly_key,
    orderlySecret: row.orderly_secret,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Deactivate Orderly credentials (soft delete)
 */
export async function deactivateOrderlyCredentials(id: number): Promise<void> {
  await query(
    'UPDATE orderly_credentials SET is_active = FALSE WHERE id = $1',
    [id]
  );
}

/**
 * Delete partner (cascade deletes credentials)
 */
export async function deletePartner(id: number): Promise<void> {
  await query('DELETE FROM partners WHERE id = $1', [id]);
}
