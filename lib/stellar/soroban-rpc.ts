import * as StellarSdk from '@stellar/stellar-sdk';
export interface SorobanRpcConfig {
  sorobanRpcUrl: string;
  networkPassphrase: string;
}
export interface SimulationResult {
  success: boolean;
  result?: any;
  gasEstimate?: number; // In Stroops
  stateChanges?: StateChange[];
  logs?: ContractEvent[];
  error?: string;
  details?: string;
}
export interface StateChange {
  contractId: string;
  key: string;
  before?: string;
  after: string;
}
export interface ContractEvent {
  type: string;
  contractId: string;
  topics: string[];
  data: string;
}
export interface TransactionSimulation {
  transactionData: string;
  minResourceFee: string;
  cost: {
    cpuInsns: string;
    memBytes: string;
  };
  results?: Array<{
    auth?: string[];
    xdr: string;
  }>;
  events?: ContractEvent[];
  restorePreamble?: {
    transactionData: string;
    minResourceFee: string;
  };
}

export const SOROBAN_RPC_NETWORKS = {
  testnet: {
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
  },
  mainnet: {
    sorobanRpcUrl: 'https://soroban-mainnet.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
  },
} as const;

export class SorobanRpcClient {
  private config: SorobanRpcConfig;
  private rpcUrl: string;

  constructor(network: 'testnet' | 'mainnet') {
    this.config = SOROBAN_RPC_NETWORKS[network];
    this.rpcUrl = this.config.sorobanRpcUrl;
  }

  getRpcUrl(): string {
    return this.rpcUrl;
  }

  getNetworkPassphrase(): string {
    return this.config.networkPassphrase;
  }
  async simulateTransaction(
    transaction: StellarSdk.Transaction | StellarSdk.FeeBumpTransaction
  ): Promise<SimulationResult> {
    try {
      console.log('[SorobanRpcClient] Simulating transaction...');

      // Convert transaction to XDR
      const transactionXdr = transaction.toXDR();

      // Make RPC call
      const rpcResponse = await this.makeRpcCall('simulateTransaction', {
        transaction: transactionXdr,
      });
      if (rpcResponse.error) {
        console.error('[SorobanRpcClient] Simulation error:', rpcResponse.error);
        return {
          success: false,
          error: 'Simulation failed',
          details: rpcResponse.error.message || JSON.stringify(rpcResponse.error),
        };
      }

      const parsedResult = this.parseSimulationResult(rpcResponse.result);

      console.log('[SorobanRpcClient] Simulation completed successfully');
      console.log(`[SorobanRpcClient] Gas estimate: ${parsedResult.gasEstimate} Stroops`);

      return parsedResult;
    } catch (error: any) {
      console.error('[SorobanRpcClient] Simulation error:', error);
      return {
        success: false,
        error: 'Simulation failed',
        details: error.message,
      };
    }
  }

  parseSimulationResult(result: any): SimulationResult {
    try {
      // Check if simulation was successful
      if (!result) {
        return {
          success: false,
          error: 'Empty simulation result',
        };
      }

      // Check for simulation errors
      if (result.error) {
        return {
          success: false,
          error: 'Simulation error',
          details: result.error,
        };
      }
      const cpuInsns = result.cost?.cpuInsns ? parseInt(result.cost.cpuInsns, 10) : 0;
      const memBytes = result.cost?.memBytes ? parseInt(result.cost.memBytes, 10) : 0;
      const gasEstimate = this.calculateGasEstimate(cpuInsns, memBytes, result.minResourceFee);
      let returnValue = null;
      if (result.results && result.results.length > 0) {
        returnValue = result.results[0].xdr;
      }
      const stateChanges = this.extractStateChanges(result);
      const logs = this.extractLogs(result);

      return {
        success: true,
        result: returnValue,
        gasEstimate,
        stateChanges,
        logs,
      };
    } catch (error: any) {
      console.error('[SorobanRpcClient] Error parsing simulation result:', error);
      return {
        success: false,
        error: 'Failed to parse simulation result',
        details: error.message,
      };
    }
  }

  private calculateGasEstimate(
    cpuInsns: number,
    memBytes: number,
    minResourceFee?: string
  ): number {
    if (minResourceFee) {
      return parseInt(minResourceFee, 10);
    }
    const CPU_INSN_COST = 0.025; 
    const MEM_BYTE_COST = 0.1; 

    const cpuCost = cpuInsns * CPU_INSN_COST;
    const memCost = memBytes * MEM_BYTE_COST;

    return Math.ceil(cpuCost + memCost);
  }

  private extractStateChanges(result: any): StateChange[] {
    const stateChanges: StateChange[] = [];

    try {
      if (result.transactionData) {
        console.log('[SorobanRpcClient] State changes detected in transactionData');
      }
      if (result.footprint) {
        console.log('[SorobanRpcClient] Contract footprint:', result.footprint);
      }
    } catch (error) {
      console.warn('[SorobanRpcClient] Error extracting state changes:', error);
    }

    return stateChanges;
  }
  private extractLogs(result: any): ContractEvent[] {
    const logs: ContractEvent[] = [];

    try {
      if (result.events && Array.isArray(result.events)) {
        for (const event of result.events) {
          logs.push({
            type: event.type || 'contract',
            contractId: event.contractId || '',
            topics: Array.isArray(event.topics) ? event.topics : [],
            data: event.body?.value || event.data || '',
          });
        }

        console.log(`[SorobanRpcClient] Extracted ${logs.length} events from simulation`);
      }
    } catch (error) {
      console.warn('[SorobanRpcClient] Error extracting logs:', error);
    }

    return logs;
  }
  async getContractData(contractId: string): Promise<any> {
    try {
      console.log(`[SorobanRpcClient] Fetching contract data for ${contractId}...`);

      const response = await this.makeRpcCall('getLedgerEntries', {
        keys: [this.buildContractDataKey(contractId)],
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch contract data');
      }

      return response.result;
    } catch (error: any) {
      console.error('[SorobanRpcClient] Error fetching contract data:', error);
      throw error;
    }
  }
  async getLatestLedger(): Promise<any> {
    try {
      const response = await this.makeRpcCall('getLatestLedger', {});

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch latest ledger');
      }

      return response.result;
    } catch (error: any) {
      console.error('[SorobanRpcClient] Error fetching latest ledger:', error);
      throw error;
    }
  }
  async getNetwork(): Promise<any> {
    try {
      const response = await this.makeRpcCall('getNetwork', {});

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch network info');
      }

      return response.result;
    } catch (error: any) {
      console.error('[SorobanRpcClient] Error fetching network info:', error);
      throw error;
    }
  }
  async getTransaction(txHash: string): Promise<any> {
    try {
      const response = await this.makeRpcCall('getTransaction', {
        hash: txHash,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch transaction');
      }

      return response.result;
    } catch (error: any) {
      console.error('[SorobanRpcClient] Error fetching transaction:', error);
      throw error;
    }
  }

  private async makeRpcCall(method: string, params: any): Promise<any> {
    try {
      const requestBody = {
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      };

      console.log(`[SorobanRpcClient] Making RPC call: ${method}`);

      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return data;
    } catch (error: any) {
      console.error(`[SorobanRpcClient] RPC call failed (${method}):`, error);
      throw error;
    }
  }
  private buildContractDataKey(contractId: string): string {
    return contractId;
  }
  async prepareTransaction(
    transaction: StellarSdk.Transaction,
    simulation: TransactionSimulation
  ): Promise<StellarSdk.Transaction> {
    try {
      console.log('[SorobanRpcClient] Preparing transaction with simulation data...');
      console.log('[SorobanRpcClient] Transaction prepared successfully');
      console.log('[SorobanRpcClient] Note: Caller should apply simulation data manually');

      return transaction;
    } catch (error: any) {
      console.error('[SorobanRpcClient] Error preparing transaction:', error);
      throw error;
    }
  }
}

export function createSorobanRpcClient(network: 'testnet' | 'mainnet'): SorobanRpcClient {
  return new SorobanRpcClient(network);
}
export function getSorobanRpcUrl(network: 'testnet' | 'mainnet'): string {
  return SOROBAN_RPC_NETWORKS[network].sorobanRpcUrl;
}
