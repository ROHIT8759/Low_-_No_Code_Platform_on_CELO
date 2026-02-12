import { storage } from '../storage';
import { supabase } from '../supabase';
import * as StellarSdk from '@stellar/stellar-sdk';

export interface StellarDeploymentOptions {
  artifactId: string;
  network: 'testnet' | 'mainnet';
  sourceAccount: string;
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
  contractId?: string;
  txHash: string;
  blockNumber?: number;
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

export class DeploymentService {
  
  getStellarNetworkConfig(network: 'testnet' | 'mainnet') {
    const config = STELLAR_NETWORK_CONFIG[network];
    if (!config) {
      throw new Error(`Unknown Stellar network: ${network}`);
    }
    return config;
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
          contract_address: data.contractId || null,
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

  async estimateStellarFee(
    wasmSize: number,
    network: 'testnet' | 'mainnet'
  ): Promise<number> {
    const baseFee = 100; 
    const perByteFee = 10; 
    return baseFee + (wasmSize * perByteFee);
  }

  validateDeploymentOptions(
    options: StellarDeploymentOptions
  ): { valid: boolean; error?: string } {
    if (!options.artifactId) {
      return { valid: false, error: 'Artifact ID is required' };
    }

    if (!options.network) {
      return { valid: false, error: 'Network is required' };
    }

    if (!options.sourceAccount) {
      return { valid: false, error: 'Source account is required for Stellar deployment' };
    }

    if (!['testnet', 'mainnet'].includes(options.network)) {
      return { valid: false, error: 'Invalid Stellar network (must be testnet or mainnet)' };
    }

    return { valid: true };
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

  formatContractAddress(address: string): string {
    return address;
  }
}

export const deploymentService = new DeploymentService();
