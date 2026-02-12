import { compilationService } from '@/lib/services/compilation';
import * as fc from 'fast-check';
import { createHash } from 'crypto';

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

jest.mock('@/lib/supabase', () => ({
  supabase: null,
}));

describe('Compilation Error Handling', () => {
  
  describe('Property 3: Compilation Errors Include Diagnostic Information', () => {
    test('EVM compilation errors include descriptive messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,19}$/),
          
          fc.oneof(
            fc.constant('syntax'),
            fc.constant('type'),
            fc.constant('undeclared'),
            fc.constant('visibility')
          ),
          async (contractName, errorType) => {
            let invalidCode: string;

            
            switch (errorType) {
              case 'syntax':
                
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

            
            const result = await compilationService.compileEVM(
              invalidCode,
              contractName,
              { optimizerRuns: 200 }
            );

            
            expect(result.success).toBe(false);

            
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error.length).toBeGreaterThan(0);

            
            expect(result.details).toBeDefined();
            expect(typeof result.details).toBe('string');
            expect(result.details!.length).toBeGreaterThan(0);

            
            const detailsLower = result.details!.toLowerCase();
            const hasErrorKeywords = 
              detailsLower.includes('error') ||
              detailsLower.includes('expected') ||
              detailsLower.includes('invalid') ||
              detailsLower.includes('undeclared') ||
              detailsLower.includes('type');
            expect(hasErrorKeywords).toBe(true);

            
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
      
      const { sorobanCompiler } = await import('@/lib/stellar/compiler');
      const toolchain = await sorobanCompiler.checkToolchain();
      
      if (!toolchain.rust || !toolchain.soroban) {
        console.log('Skipping Stellar error handling test - Soroban toolchain not available');
        return;
      }

      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[a-z][a-z0-9_]{2,19}$/),
          
          fc.oneof(
            fc.constant('syntax'),
            fc.constant('type'),
            fc.constant('missing_import')
          ),
          async (contractName, errorType) => {
            let invalidCode: string;

            
            switch (errorType) {
              case 'syntax':
                
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

            
            const result = await compilationService.compileStellar(
              invalidCode,
              contractName,
              'testnet'
            );

            
            expect(result.success).toBe(false);

            
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error.length).toBeGreaterThan(0);

            
            expect(result.details).toBeDefined();
            expect(typeof result.details).toBe('string');
            expect(result.details!.length).toBeGreaterThan(0);

            
            const detailsLower = result.details!.toLowerCase();
            const hasErrorKeywords = 
              detailsLower.includes('error') ||
              detailsLower.includes('expected') ||
              detailsLower.includes('cannot') ||
              detailsLower.includes('not found') ||
              detailsLower.includes('mismatched');
            expect(hasErrorKeywords).toBe(true);

            
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

            
            const result = await compilationService.compileEVM(
              validCode,
              requestedContractName,
              { optimizerRuns: 200 }
            );

            
            expect(result.success).toBe(false);

            
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

            
            expect(result.success).toBe(false);

            
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');

            
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

            
            expect(result.success).toBe(false);

            
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');

            
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
            
            const invalidCode = `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.0;
              
              contract ${contractName} {
                uint256 public value
              }
            `;

            
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

            
            expect(result1.success).toBe(false);
            expect(result2.success).toBe(false);

            
            expect(result1.error).toBe(result2.error);

            
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
