import { storage } from '../storage';
import { supabase } from '../supabase';
import { EVM_NETWORKS } from '../multi-chain/chain-config';
import { ethers } from 'ethers';
import * as StellarSdk from '@stellar/stellar-sdk';

export interface EVMDeploymentOptions {
  artifactId: string;
  network: keyof typeof EVM_NETWORKS;
  constructorArgs?: any[];
  gasLimit?: number;
}

export interface StellarDeploymentOptions {
  artifactId: string;
  network: 'testnet' | 'mainnet';
  sourceAccount: string;
}

export interface EVMDeploymentResult {
  success: boolean;
  contractAddress?: string;
  txHash?: string;
  network?: string;
  gasUsed?: number;
  unsignedTransaction?: {
    data: string;
    chainId: number;
    gasLimit: string;
    to?: string;
  };
  error?: string;
  details?: string;
}

export interface StellarDeploymentResult {
  success: boolean;
  contractId?: string;
  txHash?: string;
  network?: string;
  envelopeXDR?: string; 
  error?: string;
  details?: string;
}

export interface TransactionReceipt {
  success: boolean;
  contractAddress?: string;
  contractId?: string;
  txHash: string;
  blockNumber?: number;
  gasUsed?: number;
}

export const STELLAR_NETWORK_CONFIG = {
  testnet: {
    horizonUrl: 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
  },
  mainnet: {
    horizonUrl: 'https://horizon.stellar.org',
    sorobanRpcUrl: 'https://soroban-mainnet.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
  },
} as const;

export const EVM_NETWORK_CONFIG = {
  CELO_MAINNET: {
    rpcUrl: EVM_NETWORKS.CELO_MAINNET.rpcUrl,
    chainId: EVM_NETWORKS.CELO_MAINNET.chainId,
    name: EVM_NETWORKS.CELO_MAINNET.name,
  },
  CELO_ALFAJORES: {
    rpcUrl: EVM_NETWORKS.CELO_ALFAJORES.rpcUrl,
    chainId: EVM_NETWORKS.CELO_ALFAJORES.chainId,
    name: EVM_NETWORKS.CELO_ALFAJORES.name,
  },
} as const;

export class DeploymentService {
  
  getEVMNetworkConfig(network: keyof typeof EVM_NETWORKS) {
    const config = EVM_NETWORK_CONFIG[network];
    if (!config) {
      throw new Error(`Unknown EVM network: ${network}`);
    }
    return config;
  }

  
  getStellarNetworkConfig(network: 'testnet' | 'mainnet') {
    const config = STELLAR_NETWORK_CONFIG[network];
    if (!config) {
      throw new Error(`Unknown Stellar network: ${network}`);
    }
    return config;
  }

  
  async deployEVM(options: EVMDeploymentOptions): Promise<EVMDeploymentResult> {
    try {
      
      const networkConfig = this.getEVMNetworkConfig(options.network);

      
      const artifact = await storage.retrieveEVMArtifact(options.artifactId);
      if (!artifact) {
        return {
          success: false,
          error: 'Artifact not found',
          details: `No artifact found with ID: ${options.artifactId}`,
        };
      }

      
      const deploymentData = this.createEVMDeploymentData(
        artifact.bytecode,
        options.constructorArgs || []
      );

      
      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);

      
      let gasLimit: bigint;
      try {
        gasLimit = await provider.estimateGas({
          data: deploymentData,
        });
        
        
        gasLimit = (gasLimit * BigInt(120)) / BigInt(100);
      } catch (error: any) {
        console.error('[DeploymentService] Gas estimation failed:', error);
        
        gasLimit = BigInt(options.gasLimit || this.estimateGasFromBytecode(deploymentData));
      }

      
      const unsignedTransaction = {
        data: deploymentData,
        chainId: networkConfig.chainId,
        gasLimit: gasLimit.toString(),
      };

      
      return {
        success: true,
        network: networkConfig.name,
        unsignedTransaction,
      };
    } catch (error: any) {
      console.error('[DeploymentService] EVM deployment error:', error);
      return {
        success: false,
        error: 'Deployment preparation failed',
        details: error.message,
      };
    }
  }

  
  async submitSignedEVMTransaction(
    signedTx: string,
    network: keyof typeof EVM_NETWORKS,
    artifactId: string,
    deployer: string
  ): Promise<EVMDeploymentResult> {
    try {
      const networkConfig = this.getEVMNetworkConfig(network);
      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);

      
      const tx = await provider.broadcastTransaction(signedTx);
      console.log(`[DeploymentService] Transaction submitted: ${tx.hash}`);

      
      const receipt = await this.pollForEVMReceipt(tx.hash, provider);

      if (!receipt || !receipt.contractAddress) {
        return {
          success: false,
          error: 'Deployment failed',
          details: 'Transaction was mined but no contract address was returned',
          txHash: tx.hash,
        };
      }

      
      await this.storeDeploymentRecord({
        artifactId,
        network: networkConfig.name,
        deployer,
        contractAddress: receipt.contractAddress,
        txHash: tx.hash,
      });

      return {
        success: true,
        contractAddress: receipt.contractAddress,
        txHash: tx.hash,
        network: networkConfig.name,
        gasUsed: Number(receipt.gasUsed),
      };
    } catch (error: any) {
      console.error('[DeploymentService] Transaction submission error:', error);
      return {
        success: false,
        error: 'Transaction submission failed',
        details: error.message,
      };
    }
  }

  
  private async pollForEVMReceipt(
    txHash: string,
    provider: ethers.JsonRpcProvider,
    maxAttempts: number = 60
  ): Promise<ethers.TransactionReceipt | null> {
    let attempts = 0;
    let delay = 2000; 

    while (attempts < maxAttempts) {
      try {
        const receipt = await provider.getTransactionReceipt(txHash);
        
        if (receipt) {
          console.log(`[DeploymentService] Transaction confirmed in block ${receipt.blockNumber}`);
          return receipt;
        }

        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        
        delay = Math.min(delay * 1.5, 10000);
        attempts++;
      } catch (error) {
        console.error(`[DeploymentService] Error polling receipt (attempt ${attempts}):`, error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.error(`[DeploymentService] Transaction receipt not found after ${maxAttempts} attempts`);
    return null;
  }

  
  private estimateGasFromBytecode(bytecode: string): number {
    const bytecodeLength = (bytecode.length - 2) / 2; 
    const baseGas = 21000; 
    const deploymentGas = bytecodeLength * 200; 
    return baseGas + deploymentGas;
  }

  
  async deployStellar(options: StellarDeploymentOptions): Promise<StellarDeploymentResult> {
    try {
      
      const networkConfig = this.getStellarNetworkConfig(options.network);

      
      const artifact = await storage.retrieveStellarArtifact(options.artifactId);
      if (!artifact) {
        return {
          success: false,
          error: 'Artifact not found',
          details: `No artifact found with ID: ${options.artifactId}`,
        };
      }

      
      const envelopeXDR = await this.createStellarDeploymentEnvelope(
        artifact.wasm,
        options.sourceAccount,
        networkConfig
      );

      
      return {
        success: true,
        network: `stellar-${options.network}`,
        envelopeXDR,
      };
    } catch (error: any) {
      console.error('[DeploymentService] Stellar deployment error:', error);
      return {
        success: false,
        error: 'Deployment preparation failed',
        details: error.message,
      };
    }
  }

  
  createEVMDeploymentData(bytecode: string, constructorArgs: any[]): string {
    
    const cleanBytecode = bytecode.startsWith('0x') ? bytecode : `0x${bytecode}`;

    
    if (!constructorArgs || constructorArgs.length === 0) {
      return cleanBytecode;
    }

    try {
      
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      
      
      const types = constructorArgs.map(arg => {
        if (typeof arg === 'string' && arg.startsWith('0x') && arg.length === 42) {
          return 'address';
        } else if (typeof arg === 'number' || typeof arg === 'bigint') {
          return 'uint256';
        } else if (typeof arg === 'string') {
          return 'string';
        } else if (typeof arg === 'boolean') {
          return 'bool';
        } else if (Array.isArray(arg)) {
          return 'bytes';
        }
        return 'bytes';
      });

      const encodedArgs = abiCoder.encode(types, constructorArgs);
      
      
      const cleanEncodedArgs = encodedArgs.startsWith('0x') ? encodedArgs.slice(2) : encodedArgs;
      
      return cleanBytecode + cleanEncodedArgs;
    } catch (error) {
      console.error('[DeploymentService] Error encoding constructor args:', error);
      
      return cleanBytecode;
    }
  }

  
  async createStellarDeploymentEnvelope(
    wasm: Buffer,
    sourceAccount: string,
    networkConfig: typeof STELLAR_NETWORK_CONFIG.testnet | typeof STELLAR_NETWORK_CONFIG.mainnet
  ): Promise<string> {
    try {
      
      const server = new StellarSdk.Horizon.Server(networkConfig.horizonUrl);

      
      const account = await server.loadAccount(sourceAccount);

      
      const operation = StellarSdk.Operation.invokeHostFunction({
        func: StellarSdk.xdr.HostFunction.hostFunctionTypeUploadContractWasm(
          wasm
        ),
        auth: [],
      });

      
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: networkConfig.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      
      return transaction.toXDR();
    } catch (error: any) {
      console.error('[DeploymentService] Error creating Stellar envelope:', error);
      throw new Error(`Failed to create deployment envelope: ${error.message}`);
    }
  }

  
  async submitSignedStellarTransaction(
    signedEnvelopeXDR: string,
    network: 'testnet' | 'mainnet',
    artifactId: string,
    deployer: string
  ): Promise<StellarDeploymentResult> {
    try {
      const networkConfig = this.getStellarNetworkConfig(network);
      const server = new StellarSdk.Horizon.Server(networkConfig.horizonUrl);

      
      const transaction = StellarSdk.TransactionBuilder.fromXDR(
        signedEnvelopeXDR,
        networkConfig.networkPassphrase
      ) as StellarSdk.Transaction;

      
      console.log('[DeploymentService] Submitting Stellar transaction...');
      const response = await server.submitTransaction(transaction);
      console.log(`[DeploymentService] Transaction submitted: ${response.hash}`);

      
      const result = await this.pollForStellarTransaction(response.hash, server);

      if (!result.success) {
        return {
          success: false,
          error: 'Transaction failed',
          details: 'Transaction was submitted but did not succeed',
          txHash: response.hash,
        };
      }

      
      const contractId = this.extractContractIdFromResult(result);

      if (!contractId) {
        return {
          success: false,
          error: 'Contract ID not found',
          details: 'Transaction succeeded but contract ID could not be extracted',
          txHash: response.hash,
        };
      }

      
      await this.storeDeploymentRecord({
        artifactId,
        network: `stellar-${network}`,
        deployer,
        contractId,
        txHash: response.hash,
      });

      return {
        success: true,
        contractId,
        txHash: response.hash,
        network: `stellar-${network}`,
      };
    } catch (error: any) {
      console.error('[DeploymentService] Stellar transaction submission error:', error);
      return {
        success: false,
        error: 'Transaction submission failed',
        details: error.message,
      };
    }
  }

  
  private async pollForStellarTransaction(
    txHash: string,
    server: StellarSdk.Horizon.Server,
    maxAttempts: number = 30
  ): Promise<{ success: boolean; result?: any }> {
    let attempts = 0;
    let delay = 2000; 

    while (attempts < maxAttempts) {
      try {
        const transaction = await server.transactions().transaction(txHash).call();
        
        if (transaction) {
          console.log(`[DeploymentService] Stellar transaction confirmed`);
          return {
            success: transaction.successful,
            result: transaction,
          };
        }

        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        
        delay = Math.min(delay * 1.5, 10000);
        attempts++;
      } catch (error: any) {
        
        if (error.response?.status === 404) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * 1.5, 10000);
          attempts++;
          continue;
        }
        
        console.error(`[DeploymentService] Error polling Stellar transaction (attempt ${attempts}):`, error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.error(`[DeploymentService] Stellar transaction not found after ${maxAttempts} attempts`);
    return { success: false };
  }

  
  private extractContractIdFromResult(result: any): string | null {
    try {
      
      
      
      
      if (!result || !result.result_meta_xdr) {
        return null;
      }

      
      const meta = StellarSdk.xdr.TransactionMeta.fromXDR(
        result.result_meta_xdr,
        'base64'
      );

      
      
      
      
      
      const v3 = meta.v3?.();
      if (v3) {
        const sorobanMeta = v3.sorobanMeta?.();
        if (sorobanMeta) {
          const returnValue = sorobanMeta.returnValue?.();
          if (returnValue) {
            
            
            return returnValue.toString();
          }
        }
      }

      return null;
    } catch (error) {
      console.error('[DeploymentService] Error extracting contract ID:', error);
      return null;
    }
  }

  
  async confirmTransaction(
    txHash: string,
    network: string
  ): Promise<TransactionReceipt> {
    try {
      
      if (network.startsWith('stellar-')) {
        
        const stellarNetwork = network.replace('stellar-', '') as 'testnet' | 'mainnet';
        const networkConfig = this.getStellarNetworkConfig(stellarNetwork);
        const server = new StellarSdk.Horizon.Server(networkConfig.horizonUrl);

        const result = await this.pollForStellarTransaction(txHash, server);

        if (!result.success) {
          return {
            success: false,
            txHash,
          };
        }

        const contractId = this.extractContractIdFromResult(result.result);

        return {
          success: true,
          contractId: contractId || undefined,
          txHash,
        };
      } else {
        
        const networkKey = network as keyof typeof EVM_NETWORKS;
        const networkConfig = this.getEVMNetworkConfig(networkKey);
        const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);

        const receipt = await this.pollForEVMReceipt(txHash, provider);

        if (!receipt) {
          return {
            success: false,
            txHash,
          };
        }

        return {
          success: receipt.status === 1,
          contractAddress: receipt.contractAddress || undefined,
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: Number(receipt.gasUsed),
        };
      }
    } catch (error) {
      console.error('[DeploymentService] Transaction confirmation error:', error);
      return {
        success: false,
        txHash,
      };
    }
  }

  
  async storeDeploymentRecord(data: {
    artifactId: string;
    network: string;
    deployer: string;
    contractAddress?: string;
    contractId?: string;
    txHash: string;
  }): Promise<void> {
    try {
      
      if (!supabase) {
        console.warn('[DeploymentService] Supabase not configured - skipping deployment record');
        return;
      }

      
      const { error } = await supabase
        .from('contracts')
        .update({
          deployer: data.deployer,
          contract_address: data.contractAddress || data.contractId || null,
          tx_hash: data.txHash,
        })
        .eq('artifact_id', data.artifactId);

      if (error) {
        console.error('[DeploymentService] Error storing deployment record:', error);
        
      }
    } catch (error) {
      console.error('[DeploymentService] Error storing deployment record:', error);
      
    }
  }

  
  async estimateEVMGas(
    bytecode: string,
    network: keyof typeof EVM_NETWORKS
  ): Promise<number> {
    try {
      const networkConfig = this.getEVMNetworkConfig(network);
      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);

      
      const gasEstimate = await provider.estimateGas({
        data: bytecode,
      });

      
      const gasWithBuffer = (gasEstimate * BigInt(120)) / BigInt(100);
      
      return Number(gasWithBuffer);
    } catch (error) {
      console.error('[DeploymentService] Gas estimation error:', error);
      
      return this.estimateGasFromBytecode(bytecode);
    }
  }

  
  async estimateStellarFee(
    wasmSize: number,
    network: 'testnet' | 'mainnet'
  ): Promise<number> {
    
    
    const baseFee = 100; 
    const perByteFee = 10; 
    return baseFee + (wasmSize * perByteFee);
  }

  
  validateDeploymentOptions(
    options: EVMDeploymentOptions | StellarDeploymentOptions,
    type: 'evm' | 'stellar'
  ): { valid: boolean; error?: string } {
    if (!options.artifactId) {
      return { valid: false, error: 'Artifact ID is required' };
    }

    if (!options.network) {
      return { valid: false, error: 'Network is required' };
    }

    if (type === 'stellar') {
      const stellarOptions = options as StellarDeploymentOptions;
      if (!stellarOptions.sourceAccount) {
        return { valid: false, error: 'Source account is required for Stellar deployment' };
      }
      if (!['testnet', 'mainnet'].includes(stellarOptions.network)) {
        return { valid: false, error: 'Invalid Stellar network (must be testnet or mainnet)' };
      }
    }

    if (type === 'evm') {
      const evmOptions = options as EVMDeploymentOptions;
      if (!EVM_NETWORK_CONFIG[evmOptions.network]) {
        return { valid: false, error: `Unknown EVM network: ${evmOptions.network}` };
      }
    }

    return { valid: true };
  }

  
  createUnsignedEVMTransaction(
    bytecode: string,
    network: keyof typeof EVM_NETWORKS,
    gasLimit?: number
  ): {
    data: string;
    chainId: number;
    gasLimit?: number;
  } {
    const networkConfig = this.getEVMNetworkConfig(network);
    
    return {
      data: bytecode,
      chainId: networkConfig.chainId,
      gasLimit,
    };
  }

  
  getHorizonUrl(network: 'testnet' | 'mainnet'): string {
    return STELLAR_NETWORK_CONFIG[network].horizonUrl;
  }

  
  getSorobanRpcUrl(network: 'testnet' | 'mainnet'): string {
    return STELLAR_NETWORK_CONFIG[network].sorobanRpcUrl;
  }

  
  getNetworkPassphrase(network: 'testnet' | 'mainnet'): string {
    return STELLAR_NETWORK_CONFIG[network].networkPassphrase;
  }

  
  formatContractAddress(address: string, type: 'evm' | 'stellar'): string {
    if (type === 'evm') {
      
      return address.startsWith('0x') ? address : `0x${address}`;
    }
    
    return address;
  }
}

export const deploymentService = new DeploymentService();
