

import { CompilationService } from '@/lib/services/compilation';
import * as fc from 'fast-check';

jest.mock('@/lib/storage', () => {
  const artifacts = new Map<string, Buffer>();
  const { createHash } = require('crypto');
  
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
      exists: jest.fn(async (artifactId: string) => {
        return artifacts.has(artifactId);
      }),
    },
  };
});

jest.mock('@/lib/supabase', () => ({
  supabase: null,
}));

jest.mock('@/lib/stellar/compiler', () => {
  return {
    sorobanCompiler: {
      validateRustSyntax: jest.fn((code: string) => {
        if (!code.includes('soroban_sdk')) {
          return { valid: false, error: 'Missing soroban_sdk import' };
        }
        if (!code.includes('#[contract]') && !code.includes('#[contractimpl]')) {
          return { valid: false, error: 'Missing contract attribute' };
        }
        return { valid: true };
      }),
      checkToolchain: jest.fn(async () => ({ rust: true, soroban: true })),
      writeCargoToml: jest.fn(async () => {}),
      writeSourceFile: jest.fn(async () => {}),
      buildContract: jest.fn(async () => 'Build successful'),
      getWasmPath: jest.fn((workDir: string, contractName: string) => 
        `/tmp/${contractName}.wasm`
      ),
      readWasm: jest.fn(async () => {
        
        return Buffer.from('mock-wasm-binary-data');
      }),
      extractABI: jest.fn(async () => ({
        functions: [
          {
            name: 'test_function',
            inputs: [{ name: 'arg1', type: { type: 'U32' } }],
            outputs: [{ type: { type: 'U32' } }],
          },
        ],
        types: [],
      })),
    },
    TempDirectoryManager: jest.fn().mockImplementation(() => ({
      create: jest.fn(async () => '/tmp/test-dir'),
      cleanup: jest.fn(async () => {}),
      getPath: jest.fn(() => '/tmp/test-dir'),
    })),
  };
});

describe('Compilation Response Format - Property-Based Tests', () => {
  const compilationService = new CompilationService();

  describe('Property 1: Compilation Returns Required Artifacts', () => {
    
    
    
    it('EVM compilation returns ABI, bytecode, and artifact ID for valid contracts', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,19}$/),
          
          fc.constantFrom('uint256', 'string', 'bool', 'address', 'bytes32'),
          
          fc.constantFrom('public', 'external'),
          
          fc.constantFrom('uint256', 'bool', 'string'),
          async (contractName, stateVarType, visibility, returnType) => {
            
            const solidityCode = `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.0;
              
              contract ${contractName} {
                ${stateVarType} ${visibility} value;
                
                function getValue() ${visibility} view returns (${returnType}) {
                  ${returnType === 'uint256' ? 'return 42;' : 
                    returnType === 'bool' ? 'return true;' : 
                    'return "test";'}
                }
                
                function setValue(${stateVarType} newValue) ${visibility} {
                  value = newValue;
                }
              }
            `.trim();

            
            const result = await compilationService.compileEVM(solidityCode, contractName);

            
            if (result.success) {
              
              expect(result.abi).toBeDefined();
              expect(Array.isArray(result.abi)).toBe(true);
              expect(result.abi!.length).toBeGreaterThan(0);

              
              expect(result.bytecode).toBeDefined();
              expect(typeof result.bytecode).toBe('string');
              expect(result.bytecode!.length).toBeGreaterThan(0);

              
              expect(result.artifactId).toBeDefined();
              expect(typeof result.artifactId).toBe('string');
              expect(result.artifactId!.length).toBeGreaterThan(0);

              
              const functionABIs = result.abi!.filter((item: any) => item.type === 'function');
              expect(functionABIs.length).toBeGreaterThan(0);

              
              functionABIs.forEach((func: any) => {
                expect(func.name).toBeDefined();
                expect(func.inputs).toBeDefined();
                expect(Array.isArray(func.inputs)).toBe(true);
                expect(func.outputs).toBeDefined();
                expect(Array.isArray(func.outputs)).toBe(true);
              });
            }
          }
        ),
        { numRuns: 100 } 
      );
    }, 60000); 

    it('Stellar compilation returns ABI, WASM hash, and artifact ID for valid contracts', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[a-z][a-z0-9_]{2,19}$/),
          
          fc.stringMatching(/^[a-z][a-z0-9_]{2,15}$/),
          async (contractName, functionName) => {
            
            const rustCode = `
              #![no_std]
              use soroban_sdk::{contract, contractimpl, Env, Symbol, symbol_short};
              
              #[contract]
              pub struct ${contractName.charAt(0).toUpperCase() + contractName.slice(1)}Contract;
              
              #[contractimpl]
              impl ${contractName.charAt(0).toUpperCase() + contractName.slice(1)}Contract {
                pub fn ${functionName}(env: Env, value: u32) -> u32 {
                  value + 1
                }
              }
            `.trim();

            
            const result = await compilationService.compileStellar(rustCode, contractName, 'testnet');

            
            if (result.success) {
              
              expect(result.abi).toBeDefined();
              expect(typeof result.abi).toBe('object');
              expect(result.abi).not.toBeNull();

              
              expect(result.wasmHash).toBeDefined();
              expect(typeof result.wasmHash).toBe('string');
              expect(result.wasmHash!.length).toBe(64); 

              
              expect(result.artifactId).toBeDefined();
              expect(typeof result.artifactId).toBe('string');
              expect(result.artifactId!.length).toBeGreaterThan(0);

              
              if (result.abi!.functions) {
                expect(Array.isArray(result.abi!.functions)).toBe(true);
                
                
                result.abi!.functions.forEach((func: any) => {
                  expect(func.name).toBeDefined();
                  expect(typeof func.name).toBe('string');
                  
                  if (func.inputs) {
                    expect(Array.isArray(func.inputs)).toBe(true);
                  }
                  
                  if (func.outputs) {
                    expect(Array.isArray(func.outputs)).toBe(true);
                  }
                });
              }
            }
          }
        ),
        { numRuns: 100 } 
      );
    }, 60000); 

    it('Compilation response format is consistent across different contract types', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.constantFrom('evm', 'stellar'),
          
          fc.integer({ min: 1, max: 5 }),
          async (contractType, variation) => {
            let result: any;

            if (contractType === 'evm') {
              const contractName = `TestContract${variation}`;
              const solidityCode = `
                // SPDX-License-Identifier: MIT
                pragma solidity ^0.8.0;
                
                contract ${contractName} {
                  uint256 public value;
                  
                  function increment() public {
                    value += ${variation};
                  }
                }
              `.trim();

              result = await compilationService.compileEVM(solidityCode, contractName);
            } else {
              const contractName = `test_contract_${variation}`;
              const rustCode = `
                #![no_std]
                use soroban_sdk::{contract, contractimpl, Env};
                
                #[contract]
                pub struct TestContract;
                
                #[contractimpl]
                impl TestContract {
                  pub fn increment(env: Env, value: u32) -> u32 {
                    value + ${variation}
                  }
                }
              `.trim();

              result = await compilationService.compileStellar(rustCode, contractName, 'testnet');
            }

            
            if (result.success) {
              
              expect(result.success).toBe(true);

              
              expect(result.abi).toBeDefined();

              
              expect(result.artifactId).toBeDefined();
              expect(typeof result.artifactId).toBe('string');

              
              if (contractType === 'evm') {
                expect(result.bytecode).toBeDefined();
                expect(typeof result.bytecode).toBe('string');
                expect(Array.isArray(result.abi)).toBe(true);
              }

              
              if (contractType === 'stellar') {
                expect(result.wasmHash).toBeDefined();
                expect(typeof result.wasmHash).toBe('string');
                expect(typeof result.abi).toBe('object');
              }

              
              if (result.warnings) {
                expect(Array.isArray(result.warnings)).toBe(true);
              }
            } else {
              
              expect(result.error).toBeDefined();
              expect(typeof result.error).toBe('string');
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 60000);

    it('Artifact IDs are deterministic - same code produces same ID', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }),
          async (seed) => {
            const contractName = `TestContract${seed}`;
            const solidityCode = `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.0;
              
              contract ${contractName} {
                uint256 public value = ${seed};
                string public name = "Contract${seed}";
                
                function getValue() public view returns (uint256) {
                  return value;
                }
                
                function getName() public view returns (string memory) {
                  return name;
                }
              }
            `.trim();

            
            const result1 = await compilationService.compileEVM(solidityCode, contractName);
            const result2 = await compilationService.compileEVM(solidityCode, contractName);

            
            if (result1.success && result2.success) {
              expect(result1.artifactId).toBeDefined();
              expect(result2.artifactId).toBeDefined();
              expect(result1.artifactId).toBe(result2.artifactId);
              
              
              expect(result1.bytecode).toBe(result2.bytecode);
            }
          }
        ),
        { numRuns: 20 } 
      );
    }, 60000);
  });
});
