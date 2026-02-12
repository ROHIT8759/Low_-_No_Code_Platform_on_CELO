import * as StellarSdk from '@stellar/stellar-sdk';

export interface HorizonConfig {
  horizonUrl: string;
  networkPassphrase: string;
}

export interface TransactionSubmissionResult {
  success: boolean;
  hash: string;
  ledger?: number;
  error?: string;
}

export interface TransactionStatusResult {
  success: boolean;
  found: boolean;
  successful?: boolean;
  ledger?: number;
  createdAt?: string;
  error?: string;
}

export interface AccountInfo {
  accountId: string;
  sequence: string;
  balances: Array<{
    asset_type: string;
    balance: string;
  }>;
}

export const HORIZON_NETWORKS = {
  testnet: {
    horizonUrl: 'https://horizon-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
  },
  mainnet: {
    horizonUrl: 'https://horizon.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
  },
} as const;

export class HorizonClient {
  private server: StellarSdk.Horizon.Server;
  private config: HorizonConfig;

  constructor(network: 'testnet' | 'mainnet') {
    this.config = HORIZON_NETWORKS[network];
    this.server = new StellarSdk.Horizon.Server(this.config.horizonUrl);
  }

  
  getServer(): StellarSdk.Horizon.Server {
    return this.server;
  }

  
  getNetworkPassphrase(): string {
    return this.config.networkPassphrase;
  }

  
  async submitTransaction(
    transaction: StellarSdk.Transaction
  ): Promise<TransactionSubmissionResult> {
    try {
      console.log('[HorizonClient] Submitting transaction to Horizon...');
      
      const response = await this.server.submitTransaction(transaction);
      
      console.log(`[HorizonClient] Transaction submitted successfully: ${response.hash}`);
      
      return {
        success: true,
        hash: response.hash,
        ledger: response.ledger,
      };
    } catch (error: any) {
      console.error('[HorizonClient] Transaction submission failed:', error);
      
      return {
        success: false,
        hash: '',
        error: error.message || 'Transaction submission failed',
      };
    }
  }

  
  async pollTransactionStatus(
    txHash: string,
    maxAttempts: number = 30,
    initialDelay: number = 2000
  ): Promise<TransactionStatusResult> {
    let attempts = 0;
    let delay = initialDelay;

    console.log(`[HorizonClient] Polling for transaction ${txHash}...`);

    while (attempts < maxAttempts) {
      try {
        const transaction = await this.server
          .transactions()
          .transaction(txHash)
          .call();

        if (transaction) {
          console.log(`[HorizonClient] Transaction found and confirmed`);
          
          return {
            success: true,
            found: true,
            successful: transaction.successful,
            ledger: transaction.ledger,
            createdAt: transaction.created_at,
          };
        }
      } catch (error: any) {
        
        if (error.response?.status === 404) {
          console.log(`[HorizonClient] Transaction not found yet (attempt ${attempts + 1}/${maxAttempts})`);
          
          await this.sleep(delay);
          delay = Math.min(delay * 1.5, 10000); 
          attempts++;
          continue;
        }

        
        console.error(`[HorizonClient] Error polling transaction:`, error);
        
        return {
          success: false,
          found: false,
          error: error.message || 'Failed to poll transaction status',
        };
      }

      await this.sleep(delay);
      delay = Math.min(delay * 1.5, 10000);
      attempts++;
    }

    console.error(`[HorizonClient] Transaction not found after ${maxAttempts} attempts`);
    
    return {
      success: false,
      found: false,
      error: `Transaction not found after ${maxAttempts} polling attempts`,
    };
  }

  
  async getTransaction(txHash: string): Promise<any | null> {
    try {
      const transaction = await this.server
        .transactions()
        .transaction(txHash)
        .call();

      return transaction;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      
      console.error('[HorizonClient] Error fetching transaction:', error);
      throw error;
    }
  }

  
  async getAccount(accountId: string): Promise<AccountInfo> {
    try {
      console.log(`[HorizonClient] Fetching account info for ${accountId}...`);
      
      const account = await this.server.loadAccount(accountId);
      
      return {
        accountId: account.accountId(),
        sequence: account.sequence,
        balances: account.balances.map((balance: any) => ({
          asset_type: balance.asset_type,
          balance: balance.balance,
        })),
      };
    } catch (error: any) {
      console.error('[HorizonClient] Error fetching account:', error);
      throw new Error(`Failed to fetch account ${accountId}: ${error.message}`);
    }
  }

  
  async getAccountSequence(accountId: string): Promise<string> {
    const accountInfo = await this.getAccount(accountId);
    return accountInfo.sequence;
  }

  
  async loadAccount(accountId: string): Promise<StellarSdk.Account> {
    try {
      return await this.server.loadAccount(accountId);
    } catch (error: any) {
      console.error('[HorizonClient] Error loading account:', error);
      throw new Error(`Failed to load account ${accountId}: ${error.message}`);
    }
  }

  
  async accountExists(accountId: string): Promise<boolean> {
    try {
      await this.server.loadAccount(accountId);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  
  async getNetworkInfo(): Promise<any> {
    try {
      
      const response = await fetch(this.config.horizonUrl);
      return await response.json();
    } catch (error: any) {
      console.error('[HorizonClient] Error fetching network info:', error);
      throw new Error(`Failed to fetch network info: ${error.message}`);
    }
  }

  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function createHorizonClient(network: 'testnet' | 'mainnet'): HorizonClient {
  return new HorizonClient(network);
}

export function getHorizonUrl(network: 'testnet' | 'mainnet'): string {
  return HORIZON_NETWORKS[network].horizonUrl;
}

export function getNetworkPassphrase(network: 'testnet' | 'mainnet'): string {
  return HORIZON_NETWORKS[network].networkPassphrase;
}
