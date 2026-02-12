import { compilationService } from '@/lib/services/compilation';
import * as fc from 'fast-check';
import { createHash } from 'crypto';

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

// Mock Supabase to avoid database issues in Jest
jest.mock('@/lib/supabase', () => ({
  supabase: null,
}));

describe('Compilation Error Handling', () => {
  /**
   * Property-Based Test: Compilation Errors Include Diagnostic Information
   * 
   * Feature: stellar-backend-infrastructure, Property 3: Compilation Errors Include Diagnostic Information
   * 
   * Property: For any invalid contract code that fails compilation, the error response
   * should contain descriptive error messages with line numbers and error types.
   * 
   * **Validates: Requirements 1.4**
   */
  describe('Property 3: Compilation Errors Include Diagnostic Information', () => {
    test('EVM compilation errors include descriptive messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary contract names
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,19}$/),
          // Generate arbitrary error types
          fc.oneof(
            fc.constant('syntax'),
            fc.constant('type'),
            fc.constant('undeclared'),
            fc.constant('visibility')
          ),
          async (contractName, errorType) => {
            let invalidCode: string;

            // Generate invalid Solidity code based on error type
            switch (errorType) {
              case 'syntax':
                // Missing semicolon
                invalidCode = `
                  // SPDX-License-Identifier: MIT
                  pragma solidity ^0.8.0;
                  
                  contract ${contractName} {
                    uint256 public value
                    
                    function setValue(uint256 _value) public {
                      value = _value;
                    }
                  }
                `;
                break;
              
              case 'type':
                // Type mismatch
                invalidCode = `
                  // SPDX-License-Identifier: MIT
                  pragma solidity ^0.8.0;
                  
                  contract ${contractName} {
                    function test() public returns (uint256) {
                      return "string";
                    }
                  }
                `;
                break;
              
              case 'undeclared':
                // Undeclared identifier
                invalidCode = `
                  // SPDX-License-Identifier: MIT
                  pragma solidity ^0.8.0;
                  
                  contract ${contractName} {
                    function test() public {
                      undeclaredVariable = 42;
                    }
                  }
                `;
                break;
              
              case 'visibility':
                // Invalid visibility
                invalidCode = `
                  // SPDX-License-Identifier: MIT
                  pragma solidity ^0.8.0;
                  
                  contract ${contractName} {
                    uint256 value;
                    
                    function test() {
                      value = 42;
                    }
                  }
                `;
                break;
              
              default:
                invalidCode = '';
            }

            // Compile the invalid contract
            const result = await compilationService.compileEVM(
              invalidCode,
              contractName,
              { optimizerRuns: 200 }
            );

            // Property 1: Compilation should fail
            expect(result.success).toBe(false);

            // Property 2: Error message should be present
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error.length).toBeGreaterThan(0);

            // Property 3: Details should be present for diagnostic information
            expect(result.details).toBeDefined();
            expect(typeof result.details).toBe('string');
            expect(result.details!.length).toBeGreaterThan(0);

            // Property 4: Details should contain error-related keywords
            const detailsLower = result.details!.toLowerCase();
            const hasErrorKeywords = 
              detailsLower.includes('error') ||
              detailsLower.includes('expected') ||
              detailsLower.includes('invalid') ||
              detailsLower.includes('undeclared') ||
              detailsLower.includes('type');
            expect(hasErrorKeywords).toBe(true);

            // Property 5: ABI and bytecode should not be present on failure
            expect(result.abi).toBeUndefined();
            expect(result.bytecode).toBeUndefined();
            expect(result.artifactId).toBeUndefined();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    }, 30000);

    test('Stellar compilation errors include descriptive messages', async () => {
      // Check if Soroban toolchain is available
      const { sorobanCompiler } = await import('@/lib/stellar/compiler');
      const toolchain = await sorobanCompiler.checkToolchain();
      
      if (!toolchain.rust || !toolchain.soroban) {
        console.log('Skipping Stellar error handling test - Soroban toolchain not available');
        return;
      }

      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary contract names
          fc.stringMatching(/^[a-z][a-z0-9_]{2,19}$/),
          // Generate arbitrary error types
          fc.oneof(
            fc.constant('syntax'),
            fc.constant('type'),
            fc.constant('missing_import')
          ),
          async (contractName, errorType) => {
            let invalidCode: string;

            // Generate invalid Rust code based on error type
            switch (errorType) {
              case 'syntax':
                // Missing semicolon
                invalidCode = `
                  #![no_std]
                  use soroban_sdk::{contract, contractimpl, Env};
                  
                  #[contract]
                  pub struct ${contractName.charAt(0).toUpperCase() + contractName.slice(1)};
                  
                  #[contractimpl]
                  impl ${contractName.charAt(0).toUpperCase() + contractName.slice(1)} {
                      pub fn test(env: Env) -> u32 {
                          let value = 42
                          value
                      }
                  }
                `;
                break;
              
              case 'type':
                // Type mismatch
                invalidCode = `
                  #![no_std]
                  use soroban_sdk::{contract, contractimpl, Env};
                  
                  #[contract]
                  pub struct ${contractName.charAt(0).toUpperCase() + contractName.slice(1)};
                  
                  #[contractimpl]
                  impl ${contractName.charAt(0).toUpperCase() + contractName.slice(1)} {
                      pub fn test(env: Env) -> u32 {
                          "string"
                      }
                  }
                `;
                break;
              
              case 'missing_import':
                // Missing import
                invalidCode = `
                  #![no_std]
                  
                  #[contract]
                  pub struct ${contractName.charAt(0).toUpperCase() + contractName.slice(1)};
                  
                  #[contractimpl]
                  impl ${contractName.charAt(0).toUpperCase() + contractName.slice(1)} {
                      pub fn test(env: Env) -> u32 {
                          42
                      }
                  }
                `;
                break;
              
              default:
                invalidCode = '';
            }

            // Compile the invalid contract
            const result = await compilationService.compileStellar(
              invalidCode,
              contractName,
              'testnet'
            );

            // Property 1: Compilation should fail
            expect(result.success).toBe(false);

            // Property 2: Error message should be present
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error.length).toBeGreaterThan(0);

            // Property 3: Details should be present for diagnostic information
            expect(result.details).toBeDefined();
            expect(typeof result.details).toBe('string');
            expect(result.details!.length).toBeGreaterThan(0);

            // Property 4: Details should contain error-related keywords
            const detailsLower = result.details!.toLowerCase();
            const hasErrorKeywords = 
              detailsLower.includes('error') ||
              detailsLower.includes('expected') ||
              detailsLower.includes('cannot') ||
              detailsLower.includes('not found') ||
              detailsLower.includes('mismatched');
            expect(hasErrorKeywords).toBe(true);

            // Property 5: ABI, WASM hash, and artifact ID should not be present on failure
            expect(result.abi).toBeUndefined();
            expect(result.wasmHash).toBeUndefined();
            expect(result.artifactId).toBeUndefined();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    }, 60000);

    test('Missing contract name in EVM compilation returns specific error', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,19}$/),
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,19}$/),
          async (actualContractName, requestedContractName) => {
            // Ensure the names are different
            fc.pre(actualContractName !== requestedContractName);

            const validCode = `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.0;
              
              contract ${actualContractName} {
                uint256 public value;
                
                function setValue(uint256 _value) public {
                  value = _value;
                }
              }
            `;

            // Try to compile with wrong contract name
            const result = await compilationService.compileEVM(
              validCode,
              requestedContractName,
              { optimizerRuns: 200 }
            );

            // Property 1: Compilation should fail
            expect(result.success).toBe(false);

            // Property 2: Error should mention the contract not being found
            expect(result.error).toBeDefined();
            expect(result.error).toContain(requestedContractName);
            expect(result.error!.toLowerCase()).toContain('not found');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Empty or invalid code returns appropriate error', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,19}$/),
          fc.oneof(
            fc.constant(''),
            fc.constant('   '),
            fc.constant('invalid code'),
            fc.constant('123456')
          ),
          async (contractName, invalidCode) => {
            const result = await compilationService.compileEVM(
              invalidCode,
              contractName,
              { optimizerRuns: 200 }
            );

            // Property 1: Compilation should fail
            expect(result.success).toBe(false);

            // Property 2: Error message should be present
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');

            // Property 3: Either error or details should provide diagnostic information
            const hasDetails = result.details !== undefined && result.details.length > 0;
            const hasError = result.error !== undefined && result.error.length > 0;
            expect(hasDetails || hasError).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Stellar compilation with invalid Rust syntax returns validation error', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[a-z][a-z0-9_]{2,19}$/),
          fc.oneof(
            fc.constant(''),
            fc.constant('   '),
            fc.constant('not rust code'),
            fc.constant('fn test() { invalid }')
          ),
          async (contractName, invalidCode) => {
            const result = await compilationService.compileStellar(
              invalidCode,
              contractName,
              'testnet'
            );

            // Property 1: Compilation should fail
            expect(result.success).toBe(false);

            // Property 2: Error message should be present
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');

            // Property 3: Error should indicate syntax or validation issue
            const errorLower = result.error!.toLowerCase();
            const isValidationError = 
              errorLower.includes('syntax') ||
              errorLower.includes('invalid') ||
              errorLower.includes('toolchain') ||
              errorLower.includes('failed');
            expect(isValidationError).toBe(true);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    test('Compilation errors are consistent across multiple attempts', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,19}$/),
          async (contractName) => {
            // Create invalid code with syntax error
            const invalidCode = `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.0;
              
              contract ${contractName} {
                uint256 public value
              }
            `;

            // Compile twice
            const result1 = await compilationService.compileEVM(
              invalidCode,
              contractName,
              { optimizerRuns: 200 }
            );

            const result2 = await compilationService.compileEVM(
              invalidCode,
              contractName,
              { optimizerRuns: 200 }
            );

            // Property 1: Both should fail
            expect(result1.success).toBe(false);
            expect(result2.success).toBe(false);

            // Property 2: Error messages should be consistent
            expect(result1.error).toBe(result2.error);

            // Property 3: Details should be consistent
            if (result1.details && result2.details) {
              expect(result1.details).toBe(result2.details);
            }

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
