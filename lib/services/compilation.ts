import solc from 'solc';
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

export interface EVMCompilationResult {
  success: boolean;
  abi?: any[];
  bytecode?: string;
  warnings?: string[];
  artifactId?: string;
  error?: string;
  details?: string;
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
  
  async compileEVM(
    code: string,
    contractName: string,
    options: CompileOptions = {}
  ): Promise<EVMCompilationResult> {
    try {
      const optimizerRuns = options.optimizerRuns || 200;

      
      const input = {
        language: 'Solidity',
        sources: {
          'contract.sol': {
            content: code,
          },
        },
        settings: {
          outputSelection: {
            '*': {
              '*': ['abi', 'evm.bytecode'],
            },
          },
          optimizer: {
            enabled: true,
            runs: optimizerRuns,
          },
        },
      };

      
      const output = JSON.parse(solc.compile(JSON.stringify(input)));

      
      if (output.errors) {
        const errors = output.errors.filter((error: any) => error.severity === 'error');
        if (errors.length > 0) {
          return {
            success: false,
            error: 'Compilation failed',
            details: errors.map((e: any) => e.formattedMessage).join('\n'),
          };
        }
      }

      
      const contract = output.contracts['contract.sol'][contractName];

      if (!contract) {
        return {
          success: false,
          error: `Contract ${contractName} not found in compiled output`,
        };
      }

      const abi = contract.abi;
      const bytecode = contract.evm.bytecode.object;

      
      const abiValidation = validateABI(abi, 'evm');
      if (!abiValidation.valid) {
        console.warn('[CompilationService] ABI validation warnings:', abiValidation.errors);
        
      }

      
      const bytecodeHash = this.computeBytecodeHash(bytecode);

      
      const { artifactId } = await storage.storeEVMBytecode(bytecode);

      
      await this.storeContractMetadata({
        network: 'evm', 
        contractType: 'evm',
        abi,
        bytecodeHash,
        artifactId,
      });

      
      const warnings = output.errors
        ?.filter((e: any) => e.severity === 'warning')
        .map((e: any) => e.formattedMessage) || [];

      return {
        success: true,
        abi,
        bytecode,
        warnings,
        artifactId,
      };
    } catch (error: any) {
      console.error('[CompilationService] EVM compilation error:', error);
      return {
        success: false,
        error: 'Internal compilation error',
        details: error.message,
      };
    }
  }

  
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

  
  private computeBytecodeHash(bytecode: string): string {
    const cleanBytecode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
    const buffer = Buffer.from(cleanBytecode, 'hex');
    return createHash('sha256').update(buffer).digest('hex');
  }

  
  private async storeContractMetadata(metadata: {
    network: string;
    contractType: 'evm' | 'stellar';
    abi: any;
    bytecodeHash?: string;
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
        bytecode_hash: metadata.bytecodeHash || null,
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
