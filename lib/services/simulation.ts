import { ethers } from 'ethers';
import { cache, CacheKeys, CacheTTL } from '../cache';
import { createHash } from 'crypto';
import { STELLAR_NETWORK_CONFIG } from './deployment';

export interface SimulationRequest {
  contractType: 'evm' | 'stellar';
  contractAddress?: string;
  contractCode?: string;
  functionName: string;
  args: any[];
  network: string;
  accountState?: {
    address: string;
    balance?: string;
  };
}

export interface EVMSimulationResult {
  success: boolean;
  result?: any;
  gasEstimate?: number;
  stateChanges?: StateChange[];
  logs?: Log[];
  revertReason?: string;
  error?: string;
  details?: string;
}

export interface StellarSimulationResult {
  success: boolean;
  result?: any;
  gasEstimate?: number; 
  stateChanges?: StateChange[];
  logs?: Log[];
  revertReason?: string;
  error?: string;
  details?: string;
}

export interface StateChange {
  address: string;
  slot: string;
  previousValue: string;
  newValue: string;
}

export interface Log {
  address: string;
  topics: string[];
  data: string;
}

export type SimulationResult = EVMSimulationResult | StellarSimulationResult;

export class SimulationService {
  
  async simulate(request: SimulationRequest): Promise<SimulationResult> {
    try {
      
      const validation = this.validateRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Invalid simulation request',
          details: validation.error,
        };
      }

      
      const cacheKey = this.generateCacheKey(request);

      
      const cached = await cache.get<SimulationResult>(cacheKey);
      if (cached) {
        console.log('[SimulationService] Returning cached simulation result');
        return cached;
      }

      
      let result: SimulationResult;
      if (request.contractType === 'evm') {
        result = await this.simulateEVM(request);
      } else {
        result = await this.simulateStellar(request);
      }

      
      if (result.success) {
        await cache.set(cacheKey, result, CacheTTL.SIMULATION);
      }

      return result;
    } catch (error: any) {
      console.error('[SimulationService] Simulation error:', error);
      return {
        success: false,
        error: 'Simulation failed',
        details: error.message,
      };
    }
  }

  
  async simulateEVM(request: SimulationRequest): Promise<EVMSimulationResult> {
    try {
      
      const rpcUrl = this.getEVMRpcUrl(request.network);
      if (!rpcUrl) {
        return {
          success: false,
          error: 'Invalid network',
          details: `Unknown EVM network: ${request.network}`,
        };
      }

      
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      
      if (request.contractCode) {
        return await this.simulateEVMWithCode(
          request.contractCode,
          request.functionName,
          request.args,
          provider,
          request.accountState
        );
      }

      
      if (request.contractAddress) {
        return await this.simulateEVMWithAddress(
          request.contractAddress,
          request.functionName,
          request.args,
          provider,
          request.accountState
        );
      }

      return {
        success: false,
        error: 'Missing contract information',
        details: 'Either contractCode or contractAddress must be provided',
      };
    } catch (error: any) {
      console.error('[SimulationService] EVM simulation error:', error);
      return {
        success: false,
        error: 'EVM simulation failed',
        details: error.message,
        revertReason: this.extractRevertReason(error),
      };
    }
  }

  
  private async simulateEVMWithCode(
    contractCode: string,
    functionName: string,
    args: any[],
    provider: ethers.JsonRpcProvider,
    accountState?: { address: string; balance?: string }
  ): Promise<EVMSimulationResult> {
    try {
      
      
      
      
      const deploymentGas = await provider.estimateGas({
        data: contractCode,
      });

      
      
      return {
        success: true,
        result: null,
        gasEstimate: Number(deploymentGas),
        stateChanges: [],
        logs: [],
      };
    } catch (error: any) {
      console.error('[SimulationService] EVM code simulation error:', error);
      throw error;
    }
  }

  
  private async simulateEVMWithAddress(
    contractAddress: string,
    functionName: string,
    args: any[],
    provider: ethers.JsonRpcProvider,
    accountState?: { address: string; balance?: string }
  ): Promise<EVMSimulationResult> {
    try {
      
      
      const abi = this.createMinimalABI(functionName, args);
      
      
      const contract = new ethers.Contract(contractAddress, abi, provider);

      
      const gasEstimate = await contract[functionName].estimateGas(...args);

      
      const result = await contract[functionName].staticCall(...args);

      return {
        success: true,
        result: this.formatEVMResult(result),
        gasEstimate: Number(gasEstimate),
        stateChanges: [], 
        logs: [],
      };
    } catch (error: any) {
      console.error('[SimulationService] EVM address simulation error:', error);
      throw error;
    }
  }

  
  async simulateStellar(request: SimulationRequest): Promise<StellarSimulationResult> {
    try {
      
      const network = this.parseStellarNetwork(request.network);
      if (!network) {
        return {
          success: false,
          error: 'Invalid network',
          details: `Invalid Stellar network: ${request.network}`,
        };
      }

      const sorobanRpcUrl = STELLAR_NETWORK_CONFIG[network].sorobanRpcUrl;

      
      if (!request.contractAddress) {
        return {
          success: false,
          error: 'Missing contract address',
          details: 'Contract address is required for Stellar simulation',
        };
      }

      
      const simulationResult = await this.callSorobanRPC(
        sorobanRpcUrl,
        request.contractAddress,
        request.functionName,
        request.args,
        request.accountState
      );

      return simulationResult;
    } catch (error: any) {
      console.error('[SimulationService] Stellar simulation error:', error);
      return {
        success: false,
        error: 'Stellar simulation failed',
        details: error.message,
        revertReason: this.extractStellarError(error),
      };
    }
  }

  
  private async callSorobanRPC(
    rpcUrl: string,
    contractAddress: string,
    functionName: string,
    args: any[],
    accountState?: { address: string; balance?: string }
  ): Promise<StellarSimulationResult> {
    try {
      
      const rpcRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'simulateTransaction',
        params: {
          transaction: this.buildSorobanTransaction(
            contractAddress,
            functionName,
            args,
            accountState
          ),
        },
      };

      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rpcRequest),
      });

      if (!response.ok) {
        throw new Error(`Soroban RPC request failed: ${response.statusText}`);
      }

      const data = await response.json();

      
      if (data.error) {
        return {
          success: false,
          error: 'Soroban RPC error',
          details: data.error.message || JSON.stringify(data.error),
        };
      }

      
      return this.parseSorobanSimulationResult(data.result);
    } catch (error: any) {
      console.error('[SimulationService] Soroban RPC call error:', error);
      throw error;
    }
  }

  
  private buildSorobanTransaction(
    contractAddress: string,
    functionName: string,
    args: any[],
    accountState?: { address: string; balance?: string }
  ): any {
    
    
    return {
      contractId: contractAddress,
      function: functionName,
      args: this.encodeSorobanArgs(args),
      source: accountState?.address || 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', 
    };
  }

  
  private encodeSorobanArgs(args: any[]): any[] {
    
    return args.map(arg => {
      if (typeof arg === 'number') {
        return { type: 'u64', value: arg.toString() };
      } else if (typeof arg === 'string') {
        return { type: 'string', value: arg };
      } else if (typeof arg === 'boolean') {
        return { type: 'bool', value: arg };
      } else if (Array.isArray(arg)) {
        return { type: 'vec', value: this.encodeSorobanArgs(arg) };
      } else {
        return { type: 'bytes', value: arg };
      }
    });
  }

  
  private parseSorobanSimulationResult(result: any): StellarSimulationResult {
    try {
      
      if (!result || result.error) {
        return {
          success: false,
          error: 'Simulation failed',
          details: result?.error || 'Unknown error',
        };
      }

      
      const gasEstimate = result.cost?.cpuInsns || 0;

      
      const returnValue = result.results?.[0]?.xdr || result.returnValue;

      
      const stateChanges = this.extractSorobanStateChanges(result);

      
      const logs = this.extractSorobanLogs(result);

      return {
        success: true,
        result: returnValue,
        gasEstimate,
        stateChanges,
        logs,
      };
    } catch (error: any) {
      console.error('[SimulationService] Error parsing Soroban result:', error);
      return {
        success: false,
        error: 'Failed to parse simulation result',
        details: error.message,
      };
    }
  }

  
  private extractSorobanStateChanges(result: any): StateChange[] {
    const stateChanges: StateChange[] = [];

    try {
      if (result.stateChanges && Array.isArray(result.stateChanges)) {
        for (const change of result.stateChanges) {
          stateChanges.push({
            address: change.contractId || '',
            slot: change.key || '',
            previousValue: change.before || '',
            newValue: change.after || '',
          });
        }
      }
    } catch (error) {
      console.warn('[SimulationService] Error extracting state changes:', error);
    }

    return stateChanges;
  }

  
  private extractSorobanLogs(result: any): Log[] {
    const logs: Log[] = [];

    try {
      if (result.events && Array.isArray(result.events)) {
        for (const event of result.events) {
          logs.push({
            address: event.contractId || '',
            topics: event.topics || [],
            data: event.data || '',
          });
        }
      }
    } catch (error) {
      console.warn('[SimulationService] Error extracting logs:', error);
    }

    return logs;
  }

  
  private getEVMRpcUrl(network: string): string | null {
    
    const networkMap: Record<string, string> = {
      'CELO_MAINNET': process.env.CELO_RPC_URL || 'https://forno.celo.org',
      'CELO_ALFAJORES': process.env.CELO_ALFAJORES_RPC_URL || 'https://alfajores-forno.celo-testnet.org',
      'celo': process.env.CELO_RPC_URL || 'https://forno.celo.org',
      'celo-testnet': process.env.CELO_ALFAJORES_RPC_URL || 'https://alfajores-forno.celo-testnet.org',
    };

    return networkMap[network] || null;
  }

  
  private parseStellarNetwork(network: string): 'testnet' | 'mainnet' | null {
    const normalized = network.toLowerCase();
    
    if (normalized.includes('testnet')) {
      return 'testnet';
    } else if (normalized.includes('mainnet')) {
      return 'mainnet';
    }
    
    return null;
  }

  
  private createMinimalABI(functionName: string, args: any[]): any[] {
    
    const inputs = args.map((arg, index) => {
      let type = 'bytes';
      
      if (typeof arg === 'number' || typeof arg === 'bigint') {
        type = 'uint256';
      } else if (typeof arg === 'string' && arg.startsWith('0x') && arg.length === 42) {
        type = 'address';
      } else if (typeof arg === 'string') {
        type = 'string';
      } else if (typeof arg === 'boolean') {
        type = 'bool';
      }

      return {
        name: `param${index}`,
        type,
      };
    });

    return [
      {
        name: functionName,
        type: 'function',
        inputs,
        outputs: [],
        stateMutability: 'view',
      },
    ];
  }

  
  private formatEVMResult(result: any): any {
    if (result === null || result === undefined) {
      return null;
    }

    
    if (typeof result === 'bigint') {
      return result.toString();
    }

    
    if (Array.isArray(result)) {
      return result.map(item => this.formatEVMResult(item));
    }

    
    if (typeof result === 'object') {
      const formatted: any = {};
      for (const key in result) {
        formatted[key] = this.formatEVMResult(result[key]);
      }
      return formatted;
    }

    return result;
  }

  
  private extractRevertReason(error: any): string | undefined {
    if (error.reason) {
      return error.reason;
    }

    if (error.message && error.message.includes('revert')) {
      const match = error.message.match(/revert (.+)/);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  
  private extractStellarError(error: any): string | undefined {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    if (error.message) {
      return error.message;
    }

    return undefined;
  }

  
  private validateRequest(request: SimulationRequest): { valid: boolean; error?: string } {
    if (!request.contractType) {
      return { valid: false, error: 'Contract type is required' };
    }

    if (!['evm', 'stellar'].includes(request.contractType)) {
      return { valid: false, error: 'Contract type must be "evm" or "stellar"' };
    }

    if (!request.functionName) {
      return { valid: false, error: 'Function name is required' };
    }

    if (!request.network) {
      return { valid: false, error: 'Network is required' };
    }

    if (!request.contractAddress && !request.contractCode) {
      return { valid: false, error: 'Either contractAddress or contractCode must be provided' };
    }

    if (!Array.isArray(request.args)) {
      return { valid: false, error: 'Args must be an array' };
    }

    return { valid: true };
  }

  
  private generateCacheKey(request: SimulationRequest): string {
    const hash = createHash('sha256')
      .update(JSON.stringify({
        contractType: request.contractType,
        contractAddress: request.contractAddress,
        contractCode: request.contractCode,
        functionName: request.functionName,
        args: request.args,
        network: request.network,
        accountState: request.accountState,
      }))
      .digest('hex');

    return CacheKeys.SIMULATION(hash);
  }
}

export const simulationService = new SimulationService();
