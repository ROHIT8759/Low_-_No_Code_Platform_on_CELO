import * as StellarSdk from '@stellar/stellar-sdk';

/**
 * Horizon API Integration
 * 
 * Provides a client for interacting with Stellar's Horizon API.
 * Handles transaction submission, status polling, and account queries.
 * 
 * Requirements: 3.1, 3.3
 */

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

/**
 * Network configurations for Stellar Horizon API
 */
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

/**
 * Horizon API Client
 * 
 * Provides methods for interacting with Stellar's Horizon API:
 * - Transaction submission
 * - Transaction status polling
 * - Account queries for sequence numbers
 */
export class HorizonClient {
  private server: StellarSdk.Horizon.Server;
  private config: HorizonConfig;

  constructor(network: 'testnet' | 'mainnet') {
    this.config = HORIZON_NETWORKS[network];
    this.server = new StellarSdk.Horizon.Server(this.config.horizonUrl);
  }

  /**
   * Get the Horizon server instance
   * 
   * @returns Horizon server instance
   */
  getServer(): StellarSdk.Horizon.Server {
    return this.server;
  }

  /**
   * Get the network passphrase
   * 
   * @returns Network passphrase for transaction signing
   */
  getNetworkPassphrase(): string {
    return this.config.networkPassphrase;
  }

  /**
   * Submit a signed transaction to the Stellar network
   * 
   * Takes a signed transaction envelope and submits it to Horizon.
   * Returns the transaction hash and submission status.
   * 
   * @param transaction Signed Stellar transaction
   * @returns Submission result with transaction hash
   */
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

  /**
   * Poll for transaction status
   * 
   * Polls Horizon API to check if a transaction has been confirmed.
   * Uses exponential backoff for retries.
   * 
   * @param txHash Transaction hash to poll
   * @param maxAttempts Maximum number of polling attempts (default: 30)
   * @param initialDelay Initial delay in milliseconds (default: 2000)
   * @returns Transaction status result
   */
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
        // Transaction not found yet (404) - continue polling
        if (error.response?.status === 404) {
          console.log(`[HorizonClient] Transaction not found yet (attempt ${attempts + 1}/${maxAttempts})`);
          
          await this.sleep(delay);
          delay = Math.min(delay * 1.5, 10000); // Exponential backoff, max 10s
          attempts++;
          continue;
        }

        // Other errors - return failure
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

  /**
   * Get transaction details
   * 
   * Retrieves full transaction details from Horizon.
   * 
   * @param txHash Transaction hash
   * @returns Transaction details or null if not found
   */
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

  /**
   * Query account information
   * 
   * Fetches account details including sequence number and balances.
   * The sequence number is required for building transactions.
   * 
   * @param accountId Stellar account ID (public key)
   * @returns Account information including sequence number
   */
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

  /**
   * Get account sequence number
   * 
   * Convenience method to fetch just the sequence number for an account.
   * This is commonly needed when building transactions.
   * 
   * @param accountId Stellar account ID (public key)
   * @returns Account sequence number as string
   */
  async getAccountSequence(accountId: string): Promise<string> {
    const accountInfo = await this.getAccount(accountId);
    return accountInfo.sequence;
  }

  /**
   * Load account for transaction building
   * 
   * Returns a Stellar SDK Account object that can be used directly
   * in TransactionBuilder. This is the most common method for
   * building transactions.
   * 
   * @param accountId Stellar account ID (public key)
   * @returns Stellar SDK Account object
   */
  async loadAccount(accountId: string): Promise<StellarSdk.Account> {
    try {
      return await this.server.loadAccount(accountId);
    } catch (error: any) {
      console.error('[HorizonClient] Error loading account:', error);
      throw new Error(`Failed to load account ${accountId}: ${error.message}`);
    }
  }

  /**
   * Check if account exists
   * 
   * Verifies whether an account exists on the Stellar network.
   * 
   * @param accountId Stellar account ID (public key)
   * @returns True if account exists, false otherwise
   */
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

  /**
   * Get network information
   * 
   * Fetches current network information from Horizon.
   * 
   * @returns Network information
   */
  async getNetworkInfo(): Promise<any> {
    try {
      // Fetch the root endpoint for network info
      const response = await fetch(this.config.horizonUrl);
      return await response.json();
    } catch (error: any) {
      console.error('[HorizonClient] Error fetching network info:', error);
      throw new Error(`Failed to fetch network info: ${error.message}`);
    }
  }

  /**
   * Sleep utility for polling delays
   * 
   * @param ms Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create a Horizon client for the specified network
 * 
 * Factory function to create a configured Horizon client.
 * 
 * @param network Network identifier (testnet or mainnet)
 * @returns Configured Horizon client
 */
export function createHorizonClient(network: 'testnet' | 'mainnet'): HorizonClient {
  return new HorizonClient(network);
}

/**
 * Get Horizon URL for network
 * 
 * Helper function to get the Horizon API URL for a network.
 * 
 * @param network Network identifier (testnet or mainnet)
 * @returns Horizon API URL
 */
export function getHorizonUrl(network: 'testnet' | 'mainnet'): string {
  return HORIZON_NETWORKS[network].horizonUrl;
}

/**
 * Get network passphrase
 * 
 * Helper function to get the network passphrase for transaction signing.
 * 
 * @param network Network identifier (testnet or mainnet)
 * @returns Network passphrase
 */
export function getNetworkPassphrase(network: 'testnet' | 'mainnet'): string {
  return HORIZON_NETWORKS[network].networkPassphrase;
}
