import { storage } from '../storage';
import { supabase } from '../supabase';
import { EVM_NETWORKS } from '../multi-chain/chain-config';
import { ethers } from 'ethers';
import * as StellarSdk from '@stellar/stellar-sdk';

/**
 * Deployment Service
 * 
 * Handles contract deployment for both EVM and Stellar/Soroban contracts.
 * Manages network configurations, transaction creation, and deployment tracking.
 */

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
  envelopeXDR?: string; // For client-side signing
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

/**
 * Network configuration for Stellar
 */
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

/**
 * Network configuration for EVM chains
 */
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

/**
 * Deployment Service Class
 */
export class DeploymentService {
  /**
   * Get network configuration for EVM networks
   * 
   * @param network Network identifier
   * @returns Network configuration
   */
  getEVMNetworkConfig(network: keyof typeof EVM_NETWORKS) {
    const config = EVM_NETWORK_CONFIG[network];
    if (!config) {
      throw new Error(`Unknown EVM network: ${network}`);
    }
    return config;
  }

  /**
   * Get network configuration for Stellar networks
   * 
   * @param network Network identifier (testnet or mainnet)
   * @returns Network configuration
   */
  getStellarNetworkConfig(network: 'testnet' | 'mainnet') {
    const config = STELLAR_NETWORK_CONFIG[network];
    if (!config) {
      throw new Error(`Unknown Stellar network: ${network}`);
    }
    return config;
  }

  /**
   * Deploy EVM contract
   * 
   * This method handles the complete EVM deployment flow:
   * 1. Retrieves bytecode from artifact storage
   * 2. Creates unsigned deployment transaction with constructor args
   * 3. Estimates gas using ethers.js
   * 4. Returns transaction for client-side signing
   * 5. Can accept signed transaction and submit to network
   * 6. Polls for transaction receipt
   * 7. Stores deployment record in database
   * 
   * @param options Deployment options
   * @returns Deployment result with transaction data or contract address
   */
  async deployEVM(options: EVMDeploymentOptions): Promise<EVMDeploymentResult> {
    try {
      // Validate network
      const networkConfig = this.getEVMNetworkConfig(options.network);

      // Retrieve bytecode from artifact storage
      const artifact = await storage.retrieveEVMArtifact(options.artifactId);
      if (!artifact) {
        return {
          success: false,
          error: 'Artifact not found',
          details: `No artifact found with ID: ${options.artifactId}`,
        };
      }

      // Create deployment transaction data with constructor args
      const deploymentData = this.createEVMDeploymentData(
        artifact.bytecode,
        options.constructorArgs || []
      );

      // Create provider for gas estimation
      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);

      // Estimate gas for deployment
      let gasLimit: bigint;
      try {
        gasLimit = await provider.estimateGas({
          data: deploymentData,
        });
        
        // Add 20% buffer to gas estimate for safety
        gasLimit = (gasLimit * BigInt(120)) / BigInt(100);
      } catch (error: any) {
        console.error('[DeploymentService] Gas estimation failed:', error);
        // Fallback to manual estimation if RPC call fails
        gasLimit = BigInt(options.gasLimit || this.estimateGasFromBytecode(deploymentData));
      }

      // Create unsigned transaction for client-side signing
      const unsignedTransaction = {
        data: deploymentData,
        chainId: networkConfig.chainId,
        gasLimit: gasLimit.toString(),
      };

      // Return transaction for client-side signing
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

  /**
   * Submit signed EVM transaction and wait for confirmation
   * 
   * This method accepts a signed transaction, submits it to the network,
   * polls for confirmation, and stores the deployment record.
   * 
   * @param signedTx Signed transaction hex string
   * @param network Network identifier
   * @param artifactId Artifact ID for database record
   * @param deployer Deployer address
   * @returns Deployment result with contract address
   */
  async submitSignedEVMTransaction(
    signedTx: string,
    network: keyof typeof EVM_NETWORKS,
    artifactId: string,
    deployer: string
  ): Promise<EVMDeploymentResult> {
    try {
      const networkConfig = this.getEVMNetworkConfig(network);
      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);

      // Submit signed transaction to network
      const tx = await provider.broadcastTransaction(signedTx);
      console.log(`[DeploymentService] Transaction submitted: ${tx.hash}`);

      // Poll for transaction receipt
      const receipt = await this.pollForEVMReceipt(tx.hash, provider);

      if (!receipt || !receipt.contractAddress) {
        return {
          success: false,
          error: 'Deployment failed',
          details: 'Transaction was mined but no contract address was returned',
          txHash: tx.hash,
        };
      }

      // Store deployment record in database
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

  /**
   * Poll for EVM transaction receipt
   * 
   * Polls the network for transaction confirmation with exponential backoff
   * 
   * @param txHash Transaction hash
   * @param provider Ethers provider
   * @param maxAttempts Maximum polling attempts (default: 60)
   * @returns Transaction receipt
   */
  private async pollForEVMReceipt(
    txHash: string,
    provider: ethers.JsonRpcProvider,
    maxAttempts: number = 60
  ): Promise<ethers.TransactionReceipt | null> {
    let attempts = 0;
    let delay = 2000; // Start with 2 second delay

    while (attempts < maxAttempts) {
      try {
        const receipt = await provider.getTransactionReceipt(txHash);
        
        if (receipt) {
          console.log(`[DeploymentService] Transaction confirmed in block ${receipt.blockNumber}`);
          return receipt;
        }

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Exponential backoff with max delay of 10 seconds
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

  /**
   * Estimate gas from bytecode size (fallback method)
   * 
   * @param bytecode Deployment bytecode
   * @returns Estimated gas units
   */
  private estimateGasFromBytecode(bytecode: string): number {
    const bytecodeLength = (bytecode.length - 2) / 2; // Remove 0x and convert hex chars to bytes
    const baseGas = 21000; // Base transaction cost
    const deploymentGas = bytecodeLength * 200; // Approximate cost per byte
    return baseGas + deploymentGas;
  }

  /**
   * Deploy Stellar/Soroban contract
   * 
   * This method handles the complete Stellar deployment flow:
   * 1. Retrieves WASM from artifact storage
   * 2. Creates InstallContractCode operation
   * 3. Builds transaction envelope with network passphrase
   * 4. Fetches sequence number from Horizon API
   * 5. Returns envelope XDR for Freighter signing
   * 
   * After client signs, call submitSignedStellarTransaction to complete deployment.
   * 
   * @param options Deployment options
   * @returns Deployment result with transaction envelope XDR
   */
  async deployStellar(options: StellarDeploymentOptions): Promise<StellarDeploymentResult> {
    try {
      // Validate network
      const networkConfig = this.getStellarNetworkConfig(options.network);

      // Retrieve WASM from artifact storage
      const artifact = await storage.retrieveStellarArtifact(options.artifactId);
      if (!artifact) {
        return {
          success: false,
          error: 'Artifact not found',
          details: `No artifact found with ID: ${options.artifactId}`,
        };
      }

      // Create transaction envelope for contract installation
      const envelopeXDR = await this.createStellarDeploymentEnvelope(
        artifact.wasm,
        options.sourceAccount,
        networkConfig
      );

      // Return envelope XDR for client-side signing with Freighter
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

  /**
   * Create EVM deployment transaction data
   * 
   * Combines bytecode with encoded constructor arguments using ethers.js
   * 
   * @param bytecode Contract bytecode
   * @param constructorArgs Constructor arguments
   * @returns Deployment transaction data
   */
  createEVMDeploymentData(bytecode: string, constructorArgs: any[]): string {
    // Ensure bytecode has 0x prefix
    const cleanBytecode = bytecode.startsWith('0x') ? bytecode : `0x${bytecode}`;

    // If no constructor args, return bytecode as-is
    if (!constructorArgs || constructorArgs.length === 0) {
      return cleanBytecode;
    }

    try {
      // Encode constructor arguments using ethers AbiCoder
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      
      // Infer types from arguments (simplified - in production, types should be provided)
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
      
      // Remove 0x prefix from encoded args before concatenating
      const cleanEncodedArgs = encodedArgs.startsWith('0x') ? encodedArgs.slice(2) : encodedArgs;
      
      return cleanBytecode + cleanEncodedArgs;
    } catch (error) {
      console.error('[DeploymentService] Error encoding constructor args:', error);
      // Fallback to bytecode only if encoding fails
      return cleanBytecode;
    }
  }

  /**
   * Create Stellar deployment transaction envelope
   * 
   * Creates an InstallContractCode operation wrapped in a transaction envelope:
   * 1. Creates InstallContractCode operation with WASM
   * 2. Fetches source account sequence number from Horizon
   * 3. Builds transaction with proper fee and sequence
   * 4. Returns transaction envelope XDR for signing
   * 
   * @param wasm WASM binary data
   * @param sourceAccount Source account address
   * @param networkConfig Network configuration
   * @returns Transaction envelope XDR string
   */
  async createStellarDeploymentEnvelope(
    wasm: Buffer,
    sourceAccount: string,
    networkConfig: typeof STELLAR_NETWORK_CONFIG.testnet | typeof STELLAR_NETWORK_CONFIG.mainnet
  ): Promise<string> {
    try {
      // Create Horizon server instance
      const server = new StellarSdk.Horizon.Server(networkConfig.horizonUrl);

      // Fetch source account to get sequence number
      const account = await server.loadAccount(sourceAccount);

      // Create InstallContractCode operation
      const operation = StellarSdk.Operation.invokeHostFunction({
        func: StellarSdk.xdr.HostFunction.hostFunctionTypeUploadContractWasm(
          wasm
        ),
        auth: [],
      });

      // Build transaction envelope
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: networkConfig.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      // Return transaction envelope XDR for client-side signing
      return transaction.toXDR();
    } catch (error: any) {
      console.error('[DeploymentService] Error creating Stellar envelope:', error);
      throw new Error(`Failed to create deployment envelope: ${error.message}`);
    }
  }

  /**
   * Submit signed Stellar transaction and wait for confirmation
   * 
   * This method accepts a signed transaction envelope, submits it to Horizon,
   * polls for confirmation, extracts the contract ID, and stores the deployment record.
   * 
   * @param signedEnvelopeXDR Signed transaction envelope XDR string
   * @param network Network identifier (testnet or mainnet)
   * @param artifactId Artifact ID for database record
   * @param deployer Deployer address
   * @returns Deployment result with contract ID
   */
  async submitSignedStellarTransaction(
    signedEnvelopeXDR: string,
    network: 'testnet' | 'mainnet',
    artifactId: string,
    deployer: string
  ): Promise<StellarDeploymentResult> {
    try {
      const networkConfig = this.getStellarNetworkConfig(network);
      const server = new StellarSdk.Horizon.Server(networkConfig.horizonUrl);

      // Parse the signed transaction
      const transaction = StellarSdk.TransactionBuilder.fromXDR(
        signedEnvelopeXDR,
        networkConfig.networkPassphrase
      ) as StellarSdk.Transaction;

      // Submit transaction to Horizon
      console.log('[DeploymentService] Submitting Stellar transaction...');
      const response = await server.submitTransaction(transaction);
      console.log(`[DeploymentService] Transaction submitted: ${response.hash}`);

      // Poll for transaction status
      const result = await this.pollForStellarTransaction(response.hash, server);

      if (!result.success) {
        return {
          success: false,
          error: 'Transaction failed',
          details: 'Transaction was submitted but did not succeed',
          txHash: response.hash,
        };
      }

      // Extract contract ID from transaction result
      const contractId = this.extractContractIdFromResult(result);

      if (!contractId) {
        return {
          success: false,
          error: 'Contract ID not found',
          details: 'Transaction succeeded but contract ID could not be extracted',
          txHash: response.hash,
        };
      }

      // Store deployment record in database
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

  /**
   * Poll for Stellar transaction status
   * 
   * Polls Horizon API for transaction confirmation with exponential backoff
   * 
   * @param txHash Transaction hash
   * @param server Horizon server instance
   * @param maxAttempts Maximum polling attempts (default: 30)
   * @returns Transaction result
   */
  private async pollForStellarTransaction(
    txHash: string,
    server: StellarSdk.Horizon.Server,
    maxAttempts: number = 30
  ): Promise<{ success: boolean; result?: any }> {
    let attempts = 0;
    let delay = 2000; // Start with 2 second delay

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

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Exponential backoff with max delay of 10 seconds
        delay = Math.min(delay * 1.5, 10000);
        attempts++;
      } catch (error: any) {
        // Transaction not found yet - continue polling
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

  /**
   * Extract contract ID from Stellar transaction result
   * 
   * Parses the transaction result to extract the deployed contract ID
   * 
   * @param result Transaction result from Horizon
   * @returns Contract ID or null if not found
   */
  private extractContractIdFromResult(result: any): string | null {
    try {
      // The contract ID is typically in the transaction result metadata
      // This is a simplified extraction - actual implementation may vary
      // based on Stellar SDK version and transaction structure
      
      if (!result || !result.result_meta_xdr) {
        return null;
      }

      // Parse the result metadata XDR
      const meta = StellarSdk.xdr.TransactionMeta.fromXDR(
        result.result_meta_xdr,
        'base64'
      );

      // Extract contract ID from metadata
      // The exact path depends on the operation type and SDK version
      // This is a placeholder that should be adjusted based on actual structure
      
      // For InstallContractCode, the contract ID is in the operation result
      const v3 = meta.v3?.();
      if (v3) {
        const sorobanMeta = v3.sorobanMeta?.();
        if (sorobanMeta) {
          const returnValue = sorobanMeta.returnValue?.();
          if (returnValue) {
            // Convert return value to contract ID
            // This needs to be implemented based on actual XDR structure
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

  /**
   * Confirm transaction on blockchain
   * 
   * Polls the blockchain for transaction confirmation
   * 
   * @param txHash Transaction hash
   * @param network Network identifier (e.g., 'CELO_MAINNET' or 'stellar-testnet')
   * @returns Transaction receipt
   */
  async confirmTransaction(
    txHash: string,
    network: string
  ): Promise<TransactionReceipt> {
    try {
      // Determine if this is an EVM or Stellar network
      if (network.startsWith('stellar-')) {
        // Stellar transaction confirmation
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
        // EVM transaction confirmation
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

  /**
   * Store deployment record in database
   * 
   * Records successful deployment metadata
   * 
   * @param data Deployment data
   */
  async storeDeploymentRecord(data: {
    artifactId: string;
    network: string;
    deployer: string;
    contractAddress?: string;
    contractId?: string;
    txHash: string;
  }): Promise<void> {
    try {
      // Only store if Supabase is configured
      if (!supabase) {
        console.warn('[DeploymentService] Supabase not configured - skipping deployment record');
        return;
      }

      // Update the contracts table with deployment information
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
        // Don't throw - deployment succeeded even if record storage failed
      }
    } catch (error) {
      console.error('[DeploymentService] Error storing deployment record:', error);
      // Don't throw - deployment succeeded even if record storage failed
    }
  }

  /**
   * Estimate gas for EVM deployment
   * 
   * Uses ethers.js to estimate gas for contract deployment
   * 
   * @param bytecode Contract bytecode with constructor args
   * @param network Network identifier
   * @returns Estimated gas units
   */
  async estimateEVMGas(
    bytecode: string,
    network: keyof typeof EVM_NETWORKS
  ): Promise<number> {
    try {
      const networkConfig = this.getEVMNetworkConfig(network);
      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);

      // Estimate gas using provider
      const gasEstimate = await provider.estimateGas({
        data: bytecode,
      });

      // Add 20% buffer for safety
      const gasWithBuffer = (gasEstimate * BigInt(120)) / BigInt(100);
      
      return Number(gasWithBuffer);
    } catch (error) {
      console.error('[DeploymentService] Gas estimation error:', error);
      // Fallback to bytecode-based estimation
      return this.estimateGasFromBytecode(bytecode);
    }
  }

  /**
   * Estimate fees for Stellar deployment
   * 
   * @param wasmSize Size of WASM in bytes
   * @param network Network identifier
   * @returns Estimated fee in stroops
   */
  async estimateStellarFee(
    wasmSize: number,
    network: 'testnet' | 'mainnet'
  ): Promise<number> {
    // In a real implementation, this would query Soroban RPC for fee estimation
    // For now, return a reasonable default based on WASM size
    const baseFee = 100; // Base fee in stroops
    const perByteFee = 10; // Fee per byte
    return baseFee + (wasmSize * perByteFee);
  }

  /**
   * Validate deployment options
   * 
   * @param options Deployment options
   * @param type Deployment type ('evm' or 'stellar')
   * @returns Validation result
   */
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

  /**
   * Create unsigned EVM transaction object
   * 
   * Helper function to create a complete unsigned transaction object
   * that can be signed by a wallet
   * 
   * @param bytecode Contract bytecode with constructor args
   * @param network Network identifier
   * @param gasLimit Optional gas limit
   * @returns Unsigned transaction object
   */
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

  /**
   * Get Horizon API URL for network
   * 
   * Helper to get the correct Horizon API endpoint
   * 
   * @param network Stellar network (testnet or mainnet)
   * @returns Horizon API URL
   */
  getHorizonUrl(network: 'testnet' | 'mainnet'): string {
    return STELLAR_NETWORK_CONFIG[network].horizonUrl;
  }

  /**
   * Get Soroban RPC URL for network
   * 
   * Helper to get the correct Soroban RPC endpoint
   * 
   * @param network Stellar network (testnet or mainnet)
   * @returns Soroban RPC URL
   */
  getSorobanRpcUrl(network: 'testnet' | 'mainnet'): string {
    return STELLAR_NETWORK_CONFIG[network].sorobanRpcUrl;
  }

  /**
   * Get network passphrase for Stellar network
   * 
   * Helper to get the correct network passphrase for transaction signing
   * 
   * @param network Stellar network (testnet or mainnet)
   * @returns Network passphrase
   */
  getNetworkPassphrase(network: 'testnet' | 'mainnet'): string {
    return STELLAR_NETWORK_CONFIG[network].networkPassphrase;
  }

  /**
   * Format contract address for display
   * 
   * Helper to format contract addresses/IDs consistently
   * 
   * @param address Contract address or ID
   * @param type Contract type ('evm' or 'stellar')
   * @returns Formatted address
   */
  formatContractAddress(address: string, type: 'evm' | 'stellar'): string {
    if (type === 'evm') {
      // Ensure EVM addresses have 0x prefix
      return address.startsWith('0x') ? address : `0x${address}`;
    }
    // Stellar contract IDs are returned as-is
    return address;
  }
}

// Export singleton instance
export const deploymentService = new DeploymentService();
