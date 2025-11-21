-- Honeypot Perp DEX API Database Schema

-- Partners table: API key authentication
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orderly credentials table: Store Orderly keys per partner
CREATE TABLE IF NOT EXISTS orderly_credentials (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    account_id VARCHAR(255) NOT NULL,
    orderly_key TEXT NOT NULL,
    orderly_secret TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(partner_id, account_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_partners_name ON partners(name);
CREATE INDEX IF NOT EXISTS idx_partners_api_key_hash ON partners(api_key_hash);
CREATE INDEX IF NOT EXISTS idx_orderly_credentials_partner_id ON orderly_credentials(partner_id);
CREATE INDEX IF NOT EXISTS idx_orderly_credentials_account_id ON orderly_credentials(account_id);
CREATE INDEX IF NOT EXISTS idx_orderly_credentials_active ON orderly_credentials(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orderly_credentials_updated_at ON orderly_credentials;
CREATE TRIGGER update_orderly_credentials_updated_at
    BEFORE UPDATE ON orderly_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE partners IS 'API partners with authentication keys';
COMMENT ON TABLE orderly_credentials IS 'Orderly Network credentials per partner';
COMMENT ON COLUMN orderly_credentials.is_active IS 'Flag to enable/disable credentials without deletion';
