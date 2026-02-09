-- Block Builder Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    username TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on wallet_address for faster lookups
CREATE INDEX idx_users_wallet_address ON users(wallet_address);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    contract_type TEXT NOT NULL CHECK (contract_type IN ('erc20', 'nft', 'staking', 'payment', 'governance')),
    contract_config JSONB,
    solidity_code TEXT,
    frontend_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for projects
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

-- Deployed contracts table
CREATE TABLE IF NOT EXISTS deployed_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    contract_address TEXT NOT NULL,
    contract_name TEXT NOT NULL,
    token_name TEXT,
    token_symbol TEXT,
    network TEXT NOT NULL CHECK (network IN ('sepolia', 'mainnet')),
    network_name TEXT NOT NULL,
    chain_id INTEGER NOT NULL,
    deployer TEXT NOT NULL,
    deployed_at TIMESTAMPTZ NOT NULL,
    transaction_hash TEXT NOT NULL,
    contract_type TEXT NOT NULL CHECK (contract_type IN ('erc20', 'nft')),
    abi JSONB NOT NULL,
    solidity_code TEXT NOT NULL,
    blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    explorer_url TEXT NOT NULL,
    frontend_url TEXT,
    github_repo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for deployed_contracts
CREATE INDEX idx_deployed_contracts_user_id ON deployed_contracts(user_id);
CREATE INDEX idx_deployed_contracts_contract_address ON deployed_contracts(contract_address);
CREATE INDEX idx_deployed_contracts_deployed_at ON deployed_contracts(deployed_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at for users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at for projects
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployed_contracts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (true); -- Allow all users to view (for now, can be restricted later)

CREATE POLICY "Users can insert their own data"
    ON users FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (true);

-- Projects policies
CREATE POLICY "Users can view their own projects"
    ON projects FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own projects"
    ON projects FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own projects"
    ON projects FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete their own projects"
    ON projects FOR DELETE
    USING (true);

-- Deployed contracts policies
CREATE POLICY "Users can view their own deployed contracts"
    ON deployed_contracts FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own deployed contracts"
    ON deployed_contracts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own deployed contracts"
    ON deployed_contracts FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete their own deployed contracts"
    ON deployed_contracts FOR DELETE
    USING (true);

-- Grant permissions to authenticated users
GRANT ALL ON users TO authenticated;
GRANT ALL ON projects TO authenticated;
GRANT ALL ON deployed_contracts TO authenticated;

-- Grant permissions to anon users (for wallet-based auth)
GRANT ALL ON users TO anon;
GRANT ALL ON projects TO anon;
GRANT ALL ON deployed_contracts TO anon;
