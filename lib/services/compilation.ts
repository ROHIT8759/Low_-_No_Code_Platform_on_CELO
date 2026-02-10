import solc from 'solc';
import { createHash } from 'crypto';
import { storage } from '../storage';
import { supabase } from '../supabase';
import { sorobanCompiler, TempDirectoryManager } from '../stellar/compiler';
import { validateABI } from '../validation/abi';
import { mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * Compilation Service
 * 
 * Handles contract compilation for both EVM and Stellar/Soroban contracts.
 * Integrates with artifact storage and database for persistence.
 */

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

/**
 * Compilation Service Class
 */
export class CompilationService {
  /**
   * Compile EVM Solidity contract
   * 
   * @param code Solidity source code
   * @param contractName Name of the contract to compile
   * @param options Compilation options
   * @returns Compilation result with ABI, bytecode, and artifact ID
   */
  async compileEVM(
    code: string,
    contractName: string,
    options: CompileOptions = {}
  ): Promise<EVMCompilationResult> {
    try {
      const optimizerRuns = options.optimizerRuns || 200;

      // Prepare the compiler input
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

      // Compile the contract
      const output = JSON.parse(solc.compile(JSON.stringify(input)));

      // Check for compilation errors
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

      // Extract the compiled contract
      const contract = output.contracts['contract.sol'][contractName];

      if (!contract) {
        return {
          success: false,
          error: `Contract ${contractName} not found in compiled output`,
        };
      }

      const abi = contract.abi;
      const bytecode = contract.evm.bytecode.object;

      // Validate ABI structure
      const abiValidation = validateABI(abi, 'evm');
      if (!abiValidation.valid) {
        console.warn('[CompilationService] ABI validation warnings:', abiValidation.errors);
        // Continue with compilation but log warnings
      }

      // Compute SHA-256 hash of bytecode
      const bytecodeHash = this.computeBytecodeHash(bytecode);

      // Store artifact in S3 (compressed)
      const { artifactId } = await storage.storeEVMBytecode(bytecode);

      // Insert metadata into database
      await this.storeContractMetadata({
        network: 'evm', // Generic EVM, specific network set during deployment
        contractType: 'evm',
        abi,
        bytecodeHash,
        artifactId,
      });

      // Extract warnings
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

  /**
   * Compile Stellar/Soroban contract
   * 
   * @param code Rust source code
   * @param contractName Name of the contract
   * @param network Target network (testnet or mainnet)
   * @returns Compilation result with ABI, WASM hash, and artifact ID
   */
  async compileStellar(
    code: string,
    contractName: string,
    network: Network = 'testnet'
  ): Promise<StellarCompilationResult> {
    const tempDirManager = new TempDirectoryManager();

    try {
      // Validate Rust syntax
      const validation = sorobanCompiler.validateRustSyntax(code);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Invalid Rust syntax',
          details: validation.error,
        };
      }

      // Check toolchain availability
      const toolchain = await sorobanCompiler.checkToolchain();
      if (!toolchain.rust || !toolchain.soroban) {
        return {
          success: false,
          error: 'Soroban toolchain not available',
          details: `Rust: ${toolchain.rust ? 'installed' : 'missing'}, Soroban CLI: ${toolchain.soroban ? 'installed' : 'missing'}`,
        };
      }

      // Create temporary directory
      const workDir = await tempDirManager.create();

      // Create src directory
      await mkdir(join(workDir, 'src'), { recursive: true });

      // Write Cargo.toml
      await sorobanCompiler.writeCargoToml(workDir, contractName);

      // Write source code to src/lib.rs
      await sorobanCompiler.writeSourceFile(workDir, code);

      // Execute soroban contract build
      const buildOutput = await sorobanCompiler.buildContract(workDir);

      // Get WASM path
      const wasmPath = sorobanCompiler.getWasmPath(workDir, contractName);

      // Read WASM file
      const wasm = await sorobanCompiler.readWasm(wasmPath);

      // Compute SHA-256 hash of WASM
      const wasmHash = this.computeWasmHash(wasm);

      // Extract ABI using soroban contract inspect
      let abi: any;
      try {
        abi = await sorobanCompiler.extractABI(wasmPath);
        
        // Validate ABI structure
        const abiValidation = validateABI(abi, 'stellar');
        if (!abiValidation.valid) {
          console.warn('[CompilationService] Soroban ABI validation warnings:', abiValidation.errors);
          // Continue with compilation but log warnings
        }
      } catch (error: any) {
        console.warn('[CompilationService] Failed to extract ABI:', error);
        // Continue without ABI - some contracts may not have inspectable ABIs
        abi = { functions: [], types: [] };
      }

      // Store WASM in S3
      const { artifactId } = await storage.storeStellarWASM(wasm);

      // Insert metadata into database
      await this.storeContractMetadata({
        network: `stellar-${network}`,
        contractType: 'stellar',
        abi,
        wasmHash,
        artifactId,
      });

      // Extract warnings from build output
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
      // Always cleanup temporary directory
      await tempDirManager.cleanup();
    }
  }

  /**
   * Compute SHA-256 hash of WASM
   * 
   * @param wasm WASM binary data
   * @returns SHA-256 hash
   */
  private computeWasmHash(wasm: Buffer): string {
    return createHash('sha256').update(wasm).digest('hex');
  }

  /**
   * Extract warnings from build output
   * 
   * @param output Build output string
   * @returns Array of warning messages
   */
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

  /**
   * Compute SHA-256 hash of bytecode
   * 
   * @param bytecode Hex string of bytecode
   * @returns SHA-256 hash
   */
  private computeBytecodeHash(bytecode: string): string {
    const cleanBytecode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
    const buffer = Buffer.from(cleanBytecode, 'hex');
    return createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Store contract metadata in database
   * 
   * @param metadata Contract metadata
   */
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
      // Only store if Supabase is configured
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
        // Don't throw - compilation succeeded even if metadata storage failed
      }
    } catch (error) {
      console.error('[CompilationService] Error storing contract metadata:', error);
      // Don't throw - compilation succeeded even if metadata storage failed
    }
  }
}

// Export singleton instance
export const compilationService = new CompilationService();
