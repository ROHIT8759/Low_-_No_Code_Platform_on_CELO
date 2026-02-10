import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validate Supabase credentials
const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))

// Create Supabase client only if properly configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper to check if Supabase is available
export const isSupabaseAvailable = () => isSupabaseConfigured

// Log configuration status (only in development)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  if (!isSupabaseConfigured) {
    console.log('ℹ️ Supabase not configured - cloud features disabled')
    console.log('   Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to enable')
  } else {
    console.log('✅ Supabase configured and ready')
  }
}

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          email: string | null
          username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          email?: string | null
          username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          email?: string | null
          username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          blocks: any[]
          contract_type: 'erc20' | 'nft' | 'staking' | 'payment' | 'governance'
          contract_config: any
          solidity_code: string | null
          frontend_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          blocks: any[]
          contract_type: 'erc20' | 'nft' | 'staking' | 'payment' | 'governance'
          contract_config?: any
          solidity_code?: string | null
          frontend_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          blocks?: any[]
          contract_type?: 'erc20' | 'nft' | 'staking' | 'payment' | 'governance'
          contract_config?: any
          solidity_code?: string | null
          frontend_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deployed_contracts: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          contract_address: string
          contract_name: string
          token_name: string | null
          token_symbol: string | null
          network: 'sepolia' | 'mainnet'
          network_name: string
          chain_id: number
          deployer: string
          deployed_at: string
          transaction_hash: string
          contract_type: 'erc20' | 'nft'
          abi: any[]
          solidity_code: string
          blocks: any[]
          explorer_url: string
          frontend_url: string | null
          github_repo: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          contract_address: string
          contract_name: string
          token_name?: string | null
          token_symbol?: string | null
          network: 'sepolia' | 'mainnet'
          network_name: string
          chain_id: number
          deployer: string
          deployed_at: string
          transaction_hash: string
          contract_type: 'erc20' | 'nft'
          abi: any[]
          solidity_code: string
          blocks: any[]
          explorer_url: string
          frontend_url?: string | null
          github_repo?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          contract_address?: string
          contract_name?: string
          token_name?: string | null
          token_symbol?: string | null
          network?: 'sepolia' | 'mainnet'
          network_name?: string
          chain_id?: number
          deployer?: string
          deployed_at?: string
          transaction_hash?: string
          contract_type?: 'erc20' | 'nft'
          abi?: any[]
          solidity_code?: string
          blocks?: any[]
          explorer_url?: string
          frontend_url?: string | null
          github_repo?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Helper functions for user management
export async function getUserByWallet(walletAddress: string) {
  if (!supabase) {
    console.warn('Supabase not configured - skipping user fetch')
    return null
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single()

  if (error && error.code !== 'PGRST116') {
    // Silently ignore - backend not configured yet
    // console.error('Error fetching user:', error)
    return null
  }

  return data
}

export async function createUser(walletAddress: string, username?: string) {
  if (!supabase) {
    console.warn('Supabase not configured - skipping user creation')
    return null
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      wallet_address: walletAddress.toLowerCase(),
      username: username || null,
    })
    .select()
    .single()

  if (error) {
    // Silently ignore - backend not configured yet
    // console.error('Error creating user:', error)
    return null
  }

  return data
}

export async function getOrCreateUser(walletAddress: string) {
  let user = await getUserByWallet(walletAddress)

  if (!user) {
    user = await createUser(walletAddress)
  }

  return user
}

// Project management
export async function saveProject(userId: string, project: any) {
  if (!supabase) {
    console.warn('Supabase not configured - skipping project save')
    return null
  }

  const { data, error } = await supabase
    .from('projects')
    .upsert({
      user_id: userId,
      name: project.name,
      description: project.description,
      blocks: project.blocks,
      contract_type: project.contractType,
      contract_config: project.config,
      solidity_code: project.solidityCode,
      frontend_code: project.frontendCode,
    }, {
      onConflict: 'id'
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving project:', error)
    return null
  }

  return data
}

export async function updateProject(projectId: string, updates: any) {
  if (!supabase) {
    console.warn('Supabase not configured - skipping project update')
    return null
  }

  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error.message || error)
    return null
  }

  return data
}

// Upsert project (insert or update)
export async function upsertProject(projectId: string, userId: string, project: any) {
  if (!supabase) {
    console.warn('Supabase not configured - skipping project upsert')
    return null
  }

  const { data, error } = await supabase
    .from('projects')
    .upsert({
      id: projectId,
      user_id: userId,
      name: project.name,
      description: project.description,
      blocks: project.blocks,
      contract_type: project.contractType,
      contract_config: project.config,
      solidity_code: project.solidityCode,
      frontend_code: project.frontendCode,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id'
    })
    .select()
    .single()

  if (error) {
    // Silently ignore - backend not configured yet
    // console.error('Error upserting project:', error.message || error)
    return null
  }

  return data
}

export async function getUserProjects(userId: string) {
  if (!supabase) {
    console.warn('Supabase not configured - returning empty projects')
    return []
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    // Silently ignore - backend not configured yet
    // console.error('Error fetching projects:', error)
    return []
  }

  return data || []
}

export async function deleteProject(projectId: string) {
  if (!supabase) {
    console.warn('Supabase not configured - skipping project delete')
    return false
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    console.error('Error deleting project:', error)
    return false
  }

  return true
}

// Deployed contracts management
export async function saveDeployedContract(userId: string, contract: any) {
  if (!supabase) {
    console.warn('Supabase not configured - skipping contract save')
    return null
  }

  const { data, error } = await supabase
    .from('deployed_contracts')
    .insert({
      user_id: userId,
      project_id: contract.projectId,
      contract_address: contract.contractAddress,
      contract_name: contract.contractName,
      token_name: contract.tokenName,
      token_symbol: contract.tokenSymbol,
      network: contract.network,
      network_name: contract.networkName,
      chain_id: contract.chainId,
      deployer: contract.deployer,
      deployed_at: contract.deployedAt,
      transaction_hash: contract.transactionHash,
      contract_type: contract.contractType,
      abi: contract.abi,
      solidity_code: contract.solidityCode,
      blocks: contract.blocks,
      explorer_url: contract.explorerUrl,
      frontend_url: contract.frontendUrl,
      github_repo: contract.githubRepo,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving deployed contract:', error)
    return null
  }

  return data
}

export async function getUserDeployedContracts(userId: string) {
  if (!supabase) {
    console.warn('Supabase not configured - returning empty contracts')
    return []
  }

  const { data, error } = await supabase
    .from('deployed_contracts')
    .select('*')
    .eq('user_id', userId)
    .order('deployed_at', { ascending: false })

  if (error) {
    console.error('Error fetching deployed contracts:', error)
    return []
  }

  return data || []
}

export async function updateDeployedContract(contractId: string, updates: any) {
  if (!supabase) {
    console.warn('Supabase not configured - skipping contract update')
    return null
  }

  const { data, error } = await supabase
    .from('deployed_contracts')
    .update(updates)
    .eq('id', contractId)
    .select()
    .single()

  if (error) {
    console.error('Error updating deployed contract:', error)
    return null
  }

  return data
}

export async function deleteDeployedContract(contractId: string) {
  if (!supabase) {
    console.warn('Supabase not configured - skipping contract delete')
    return false
  }

  const { error } = await supabase
    .from('deployed_contracts')
    .delete()
    .eq('id', contractId)

  if (error) {
    console.error('Error deleting deployed contract:', error)
    return false
  }

  return true
}
