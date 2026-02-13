import { createHash } from 'crypto';
import { storage } from '../storage';
import { supabase } from '../supabase';
import { sorobanCompiler, TempDirectoryManager } from '../stellar/compiler';
import { validateABI } from '../validation/abi';
import { mkdir } from 'fs/promises';
import { join } from 'path';

export interface CompileOptions {
  optimizerRuns?: number;
}

export interface StellarCompilationResult {
  success: boolean;
  abi?: any;
  wasmHash?: string;
  artifactId?: string;
  warnings?: string[];
  error?: string;
  details?: string;
}

export type Network = 'testnet' | 'mainnet';

export class CompilationService {
  async compileStellar(
    code: string,
    contractName: string,
    network: Network = 'testnet'
  ): Promise<StellarCompilationResult> {
    const tempDirManager = new TempDirectoryManager();

    try {
      
      const validation = sorobanCompiler.validateRustSyntax(code);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Invalid Rust syntax',
          details: validation.error,
        };
      }

      
      const toolchain = await sorobanCompiler.checkToolchain();
      if (!toolchain.rust || !toolchain.soroban) {
        return {
          success: false,
          error: 'Soroban toolchain not available',
          details: `Rust: ${toolchain.rust ? 'installed' : 'missing'}, Soroban CLI: ${toolchain.soroban ? 'installed' : 'missing'}`,
        };
      }

      
      const workDir = await tempDirManager.create();

      
      await mkdir(join(workDir, 'src'), { recursive: true });

      
      await sorobanCompiler.writeCargoToml(workDir, contractName);

      
      await sorobanCompiler.writeSourceFile(workDir, code);

      
      const buildOutput = await sorobanCompiler.buildContract(workDir);

      
      const wasmPath = sorobanCompiler.getWasmPath(workDir, contractName);

      
      const wasm = await sorobanCompiler.readWasm(wasmPath);

      
      const wasmHash = this.computeWasmHash(wasm);

      
      let abi: any;
      try {
        abi = await sorobanCompiler.extractABI(wasmPath);
        
        
        const abiValidation = validateABI(abi, 'stellar');
        if (!abiValidation.valid) {
          console.warn('[CompilationService] Soroban ABI validation warnings:', abiValidation.errors);
          
        }
      } catch (error: any) {
        console.warn('[CompilationService] Failed to extract ABI:', error);
        
        abi = { functions: [], types: [] };
      }

      
      const { artifactId } = await storage.storeStellarWASM(wasm);

      
      await this.storeContractMetadata({
        network: `stellar-${network}`,
        contractType: 'stellar',
        abi,
        wasmHash,
        artifactId,
      });

      
      const warnings = this.extractWarnings(buildOutput);

      return {
        success: true,
        abi,
        wasmHash,
        artifactId,
        warnings,
      };
    } catch (error: any) {
      console.error('[CompilationService] Stellar compilation error:', error);
      return {
        success: false,
        error: 'Compilation failed',
        details: error.message,
      };
    } finally {
      
      await tempDirManager.cleanup();
    }
  }

  
  private computeWasmHash(wasm: Buffer): string {
    return createHash('sha256').update(wasm).digest('hex');
  }

  
  private extractWarnings(output: string): string[] {
    const warnings: string[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      if (line.includes('warning:')) {
        warnings.push(line.trim());
      }
    }

    return warnings;
  }

  
  private async storeContractMetadata(metadata: {
    network: string;
    contractType: 'stellar';
    abi: any;
    wasmHash?: string;
    artifactId: string;
    deployer?: string;
    contractAddress?: string;
    txHash?: string;
  }): Promise<void> {
    try {
      
      if (!supabase) {
        console.warn('[CompilationService] Supabase not configured - skipping metadata storage');
        return;
      }

      const { error } = await supabase.from('contracts').insert({
        network: metadata.network,
        contract_type: metadata.contractType,
        abi: metadata.abi,
        wasm_hash: metadata.wasmHash || null,
        artifact_id: metadata.artifactId,
        deployer: metadata.deployer || null,
        contract_address: metadata.contractAddress || null,
        tx_hash: metadata.txHash || null,
      });

      if (error) {
        console.error('[CompilationService] Error storing contract metadata:', error);
        
      }
    } catch (error) {
      console.error('[CompilationService] Error storing contract metadata:', error);
      
    }
  }
}

export const compilationService = new CompilationService();
