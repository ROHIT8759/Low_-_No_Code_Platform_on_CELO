import { CompilationService } from '@/lib/services/compilation';
import { storage } from '@/lib/storage';
import { createHash } from 'crypto';
import * as fc from 'fast-check';

/**
 * Property-Based Tests for Compilation Service
 * 
 * These tests validate universal properties that should hold across all inputs.
 */

// Mock the storage module to avoid AWS SDK issues in Jest
jest.mock('@/lib/storage', () => {
  const artifacts = new Map<string, Buffer>();
  
  return {
    storage: {
      storeEVMBytecode: jest.fn(async (bytecode: string) => {
        const cleanBytecode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
        const buffer = Buffer.from(cleanBytecode, 'hex');
        const hash = createHash('sha256').update(buffer).digest('hex');
        artifacts.set(hash, buffer);
        return { artifactId: hash, key: `artifacts/evm/${hash}.bytecode.gz` };
      }),
      storeStellarWASM: jest.fn(async (wasm: Buffer) => {
        const hash = createHash('sha256').update(wasm).digest('hex');
        artifacts.set(hash, wasm);
        return { artifactId: hash, key: `artifacts/stellar/${hash}.wasm` };
      }),
      retrieveEVMBytecode: jest.fn(async (artifactId: string) => {
        const buffer = artifacts.get(artifactId);
        if (!buffer) throw new Error('Artifact not found');
        return '0x' + buffer.toString('hex');
      }),
      retrieveStellarWASM: jest.fn(async (artifactId: string) => {
        const buffer = artifacts.get(artifactId);
        if (!buffer) throw new Error('Artifact not found');
        return buffer;
      }),
      exists: jest.fn(async (artifactId: string) => {
        return artifacts.has(artifactId);
      }),
    },
  };
});

// Mock Supabase to avoid database connection issues
jest.mock('@/lib/supabase', () => ({
  supabase: null,
}));

describe('CompilationService - Property-Based Tests', () => {
  const compilationService = new CompilationService();

  describe('Property 2: Compilation Artifacts Are Stored with Content-Addressed Identifiers', () => {
    // Feature: stellar-backend-infrastructure, Property 2: Compilation Artifacts Are Stored with Content-Addressed Identifiers
    
    /**
     * Property: For any successful EVM compilation, the generated artifact should be stored
     * in Artifact_Storage with a cryptographic hash (SHA-256) computed from the artifact
     * content and used as the storage key.
     * 
     * Validates: Requirements 1.8, 11.1, 11.2
     */
    test('EVM compilation stores artifacts with SHA-256 content-addressed identifiers', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary contract names (alphanumeric, 3-20 chars)
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,19}$/),
          async (contractName) => {
            // Create a simple valid Solidity contract with the generated name
            const solidityCode = `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.0;
              
              contract ${contractName} {
                uint256 public value;
                
                function setValue(uint256 _value) public {
                  value = _value;
                }
                
                function getValue() public view returns (uint256) {
                  return value;
                }
              }
            `;

            // Compile the contract
            const result = await compilationService.compileEVM(
              solidityCode,
              contractName,
              { optimizerRuns: 200 }
            );

            // Skip if compilation failed (not testing compilation success here)
            if (!result.success || !result.bytecode || !result.artifactId) {
              return true;
            }

            // Property 1: Artifact ID should be a valid SHA-256 hash (64 hex characters)
            expect(result.artifactId).toMatch(/^[a-f0-9]{64}$/);

            // Property 2: Compute expected hash from bytecode
            const cleanBytecode = result.bytecode.startsWith('0x')
              ? result.bytecode.slice(2)
              : result.bytecode;
            const bytecodeBuffer = Buffer.from(cleanBytecode, 'hex');
            const expectedHash = createHash('sha256').update(bytecodeBuffer).digest('hex');

            // Property 3: Artifact ID should match the SHA-256 hash of the bytecode
            expect(result.artifactId).toBe(expectedHash);

            // Property 4: Artifact should exist in storage with the computed hash as key
            const exists = await storage.exists(result.artifactId, 'evm');
            expect(exists).toBe(true);

            // Property 5: Retrieved artifact should match original bytecode
            const retrievedBytecode = await storage.retrieveEVMBytecode(result.artifactId);
            const normalizedOriginal = result.bytecode.startsWith('0x')
              ? result.bytecode
              : '0x' + result.bytecode;
            const normalizedRetrieved = retrievedBytecode.startsWith('0x')
              ? retrievedBytecode
              : '0x' + retrievedBytecode;
            
            expect(normalizedRetrieved.toLowerCase()).toBe(normalizedOriginal.toLowerCase());

            // Property 6: Re-computing hash of retrieved artifact should yield same artifact ID
            const retrievedClean = normalizedRetrieved.slice(2);
            const retrievedBuffer = Buffer.from(retrievedClean, 'hex');
            const recomputedHash = createHash('sha256').update(retrievedBuffer).digest('hex');
            
            expect(recomputedHash).toBe(result.artifactId);

            return true;
          }
        ),
        {
          numRuns: 100, // Minimum 100 iterations as specified
          timeout: 120000, // 2 minutes timeout for compilation operations
        }
      );
    }, 180000); // 3 minutes test timeout

    /**
     * Property: For any successful Stellar compilation, the generated WASM artifact should be
     * stored in Artifact_Storage with a cryptographic hash (SHA-256) computed from the WASM
     * content and used as the storage key.
     * 
     * Validates: Requirements 1.8, 11.1, 11.2
     */
    test('Stellar compilation stores artifacts with SHA-256 content-addressed identifiers', async () => {
      // Check if Soroban toolchain is available
      const { sorobanCompiler } = await import('@/lib/stellar/compiler');
      const toolchain = await sorobanCompiler.checkToolchain();
      
      if (!toolchain.rust || !toolchain.soroban) {
        console.log('Skipping Stellar compilation test - toolchain not available');
        return;
      }

      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary contract names (lowercase alphanumeric with hyphens, 3-20 chars)
          fc.stringMatching(/^[a-z][a-z0-9-]{2,19}$/),
          async (contractName) => {
            // Create a simple valid Soroban contract
            const rustCode = `
              #![no_std]
              use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};
              
              #[contract]
              pub struct ${contractName.replace(/-/g, '_').replace(/^(.)/, (c) => c.toUpperCase())}Contract;
              
              #[contractimpl]
              impl ${contractName.replace(/-/g, '_').replace(/^(.)/, (c) => c.toUpperCase())}Contract {
                pub fn hello(env: Env) -> Symbol {
                  symbol_short!("Hello")
                }
              }
            `;

            // Compile the contract
            const result = await compilationService.compileStellar(
              rustCode,
              contractName,
              'testnet'
            );

            // Skip if compilation failed (not testing compilation success here)
            if (!result.success || !result.wasmHash || !result.artifactId) {
              return true;
            }

            // Property 1: Artifact ID should be a valid SHA-256 hash (64 hex characters)
            expect(result.artifactId).toMatch(/^[a-f0-9]{64}$/);

            // Property 2: WASM hash should be a valid SHA-256 hash
            expect(result.wasmHash).toMatch(/^[a-f0-9]{64}$/);

            // Property 3: Artifact ID should match the WASM hash
            expect(result.artifactId).toBe(result.wasmHash);

            // Property 4: Artifact should exist in storage with the computed hash as key
            const exists = await storage.exists(result.artifactId, 'stellar');
            expect(exists).toBe(true);

            // Property 5: Retrieved WASM should produce the same hash
            const retrievedWasm = await storage.retrieveStellarWASM(result.artifactId);
            const recomputedHash = createHash('sha256').update(retrievedWasm).digest('hex');
            
            expect(recomputedHash).toBe(result.artifactId);

            // Property 6: WASM hash should match the hash of retrieved content
            expect(recomputedHash).toBe(result.wasmHash);

            return true;
          }
        ),
        {
          numRuns: 100, // Minimum 100 iterations as specified
          timeout: 180000, // 3 minutes timeout for Rust compilation
        }
      );
    }, 240000); // 4 minutes test timeout
  });

  describe('Property 2: Content-Addressed Storage - Edge Cases', () => {
    // Feature: stellar-backend-infrastructure, Property 2: Compilation Artifacts Are Stored with Content-Addressed Identifiers

    /**
     * Property: Identical bytecode should produce identical artifact IDs (deterministic hashing)
     */
    test('identical EVM bytecode produces identical artifact IDs', async () => {
      const solidityCode = `
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;
        
        contract TestContract {
          uint256 public value;
          
          function setValue(uint256 _value) public {
            value = _value;
          }
        }
      `;

      // Compile the same contract twice
      const result1 = await compilationService.compileEVM(solidityCode, 'TestContract');
      const result2 = await compilationService.compileEVM(solidityCode, 'TestContract');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // Property: Same source code should produce same artifact ID
      expect(result1.artifactId).toBe(result2.artifactId);
      expect(result1.bytecode).toBe(result2.bytecode);
    });

    /**
     * Property: Different bytecode should produce different artifact IDs
     */
    test('different EVM bytecode produces different artifact IDs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000000 }),
          fc.integer({ min: 1, max: 1000000 }),
          async (value1, value2) => {
            // Ensure values are different
            fc.pre(value1 !== value2);

            const code1 = `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.0;
              contract Test { uint256 public value = ${value1}; }
            `;

            const code2 = `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.0;
              contract Test { uint256 public value = ${value2}; }
            `;

            const result1 = await compilationService.compileEVM(code1, 'Test');
            const result2 = await compilationService.compileEVM(code2, 'Test');

            if (!result1.success || !result2.success) {
              return true;
            }

            // Property: Different source code should produce different artifact IDs
            expect(result1.artifactId).not.toBe(result2.artifactId);
            expect(result1.bytecode).not.toBe(result2.bytecode);

            return true;
          }
        ),
        { numRuns: 50, timeout: 60000 }
      );
    }, 90000);

    /**
     * Property: Artifact ID format is consistent (always 64 hex characters)
     */
    test('artifact IDs are always valid SHA-256 hashes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,15}$/),
          fc.integer({ min: 0, max: 1000 }),
          async (contractName, initialValue) => {
            const solidityCode = `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.0;
              
              contract ${contractName} {
                uint256 public value = ${initialValue};
              }
            `;

            const result = await compilationService.compileEVM(solidityCode, contractName);

            if (!result.success || !result.artifactId) {
              return true;
            }

            // Property 1: Artifact ID is exactly 64 hex characters (SHA-256)
            expect(result.artifactId).toHaveLength(64);
            expect(result.artifactId).toMatch(/^[a-f0-9]{64}$/);

            // Property 2: Artifact ID is lowercase hex
            expect(result.artifactId).toBe(result.artifactId.toLowerCase());

            return true;
          }
        ),
        { numRuns: 100, timeout: 120000 }
      );
    }, 180000);
  });
});
