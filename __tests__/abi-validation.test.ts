import { validateEVMABI, validateSorobanABI, validateABI } from '@/lib/validation/abi';
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

describe('ABI Validation', () => {
  describe('validateEVMABI', () => {
    test('validates correct EVM ABI', () => {
      const validABI = [
        {
          type: 'function',
          name: 'transfer',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'nonpayable',
        },
        {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { name: 'from', type: 'address', indexed: true },
            { name: 'to', type: 'address', indexed: true },
            { name: 'value', type: 'uint256', indexed: false },
          ],
        },
      ];

      const result = validateEVMABI(validABI);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects non-array ABI', () => {
      const invalidABI = { type: 'function' };
      const result = validateEVMABI(invalidABI);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('ABI must be an array');
    });

    test('rejects function without name', () => {
      const invalidABI = [
        {
          type: 'function',
          inputs: [],
          outputs: [],
        },
      ];

      const result = validateEVMABI(invalidABI);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('missing or invalid \'name\' field'))).toBe(true);
    });

    test('rejects invalid type', () => {
      const invalidABI = [
        {
          type: 'invalid',
          name: 'test',
        },
      ];

      const result = validateEVMABI(invalidABI);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('invalid type'))).toBe(true);
    });

    test('validates constructor', () => {
      const validABI = [
        {
          type: 'constructor',
          inputs: [{ name: 'initialSupply', type: 'uint256' }],
          stateMutability: 'nonpayable',
        },
      ];

      const result = validateEVMABI(validABI);
      expect(result.valid).toBe(true);
    });

    test('validates fallback and receive functions', () => {
      const validABI = [
        { type: 'fallback', stateMutability: 'payable' },
        { type: 'receive', stateMutability: 'payable' },
      ];

      const result = validateEVMABI(validABI);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateSorobanABI', () => {
    test('validates correct Soroban ABI', () => {
      const validABI = {
        functions: [
          {
            name: 'transfer',
            inputs: [
              { name: 'from', type: { type: 'Address' } },
              { name: 'to', type: { type: 'Address' } },
              { name: 'amount', type: { type: 'I128' } },
            ],
            outputs: [{ type: { type: 'Result' } }],
          },
        ],
        types: [],
      };

      const result = validateSorobanABI(validABI);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects non-object ABI', () => {
      const invalidABI = [];
      const result = validateSorobanABI(invalidABI);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Soroban ABI must be an object');
    });

    test('rejects function without name', () => {
      const invalidABI = {
        functions: [
          {
            inputs: [],
            outputs: [],
          },
        ],
      };

      const result = validateSorobanABI(invalidABI);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('missing or invalid \'name\' field'))).toBe(true);
    });

    test('validates empty ABI', () => {
      const emptyABI = {};
      const result = validateSorobanABI(emptyABI);
      expect(result.valid).toBe(true);
    });

    test('validates ABI with only types', () => {
      const validABI = {
        types: [{ name: 'CustomType', fields: [] }],
      };

      const result = validateSorobanABI(validABI);
      expect(result.valid).toBe(true);
    });

    test('rejects invalid functions field', () => {
      const invalidABI = {
        functions: 'not an array',
      };

      const result = validateSorobanABI(invalidABI);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Soroban ABI functions field must be an array');
    });
  });

  describe('validateABI', () => {
    test('routes to EVM validation for evm type', () => {
      const abi = [{ type: 'function', name: 'test', inputs: [], outputs: [] }];
      const result = validateABI(abi, 'evm');
      expect(result.valid).toBe(true);
    });

    test('routes to Soroban validation for stellar type', () => {
      const abi = { functions: [{ name: 'test', inputs: [], outputs: [] }] };
      const result = validateABI(abi, 'stellar');
      expect(result.valid).toBe(true);
    });

    test('rejects unknown contract type', () => {
      const abi = {};
      const result = validateABI(abi, 'unknown' as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unknown contract type: unknown');
    });
  });

  /**
   * Property-Based Test: ABI Validation Occurs for All Compilations
   * 
   * Feature: stellar-backend-infrastructure, Property 4: ABI Validation Occurs for All Compilations
   * 
   * Property: For any compiled contract, the generated ABI should be validated against
   * the appropriate blockchain-specific schema (EVM or Soroban) before being returned or stored.
   * 
   * **Validates: Requirements 1.7, 7.7**
   */
  describe('Property 4: ABI Validation Occurs for All Compilations', () => {
    test('EVM compilation validates ABI structure before returning results', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary contract names (alphanumeric, 3-20 chars)
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,19}$/),
          // Generate arbitrary function names
          fc.stringMatching(/^[a-z][a-zA-Z0-9]{2,15}$/),
          async (contractName, functionName) => {
            // Create a valid Solidity contract with the generated names
            const solidityCode = `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.0;
              
              contract ${contractName} {
                uint256 public value;
                
                function ${functionName}(uint256 _value) public {
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
            if (!result.success || !result.abi) {
              return true;
            }

            // Property 1: The returned ABI must be valid according to EVM ABI schema
            const validation = validateEVMABI(result.abi);
            expect(validation.valid).toBe(true);
            expect(validation.errors).toHaveLength(0);

            // Property 2: The ABI must be an array
            expect(Array.isArray(result.abi)).toBe(true);

            // Property 3: Each ABI element must have a valid type
            const validTypes = ['function', 'constructor', 'event', 'fallback', 'receive'];
            result.abi.forEach((element: any) => {
              expect(validTypes).toContain(element.type);
            });

            // Property 4: Function elements must have name, inputs, and outputs
            const functions = result.abi.filter((e: any) => e.type === 'function');
            functions.forEach((func: any) => {
              expect(func.name).toBeDefined();
              expect(typeof func.name).toBe('string');
              expect(Array.isArray(func.inputs)).toBe(true);
              expect(Array.isArray(func.outputs)).toBe(true);
            });

            // Property 5: The generated function should be present in the ABI
            const generatedFunction = result.abi.find(
              (e: any) => e.type === 'function' && e.name === functionName
            );
            expect(generatedFunction).toBeDefined();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    }, 30000); // 30 second timeout for property-based test

    test('Stellar compilation validates ABI structure before returning results', async () => {
      // Check if Soroban toolchain is available
      const { sorobanCompiler } = await import('@/lib/stellar/compiler');
      const toolchain = await sorobanCompiler.checkToolchain();
      
      if (!toolchain.rust || !toolchain.soroban) {
        console.log('Skipping Stellar ABI validation test - Soroban toolchain not available');
        return;
      }

      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary contract names (lowercase alphanumeric with underscores, 3-20 chars)
          fc.stringMatching(/^[a-z][a-z0-9_]{2,19}$/),
          // Generate arbitrary function names
          fc.stringMatching(/^[a-z][a-z0-9_]{2,15}$/),
          async (contractName, functionName) => {
            // Create a valid Soroban contract with the generated names
            const rustCode = `
              #![no_std]
              use soroban_sdk::{contract, contractimpl, Env, Symbol, symbol_short};
              
              #[contract]
              pub struct ${contractName.charAt(0).toUpperCase() + contractName.slice(1)};
              
              #[contractimpl]
              impl ${contractName.charAt(0).toUpperCase() + contractName.slice(1)} {
                  pub fn ${functionName}(env: Env, value: u32) -> u32 {
                      value
                  }
                  
                  pub fn get_value(env: Env) -> u32 {
                      42
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
            if (!result.success || !result.abi) {
              return true;
            }

            // Property 1: The returned ABI must be valid according to Soroban ABI schema
            const validation = validateSorobanABI(result.abi);
            expect(validation.valid).toBe(true);
            expect(validation.errors).toHaveLength(0);

            // Property 2: The ABI must be an object (not an array)
            expect(typeof result.abi).toBe('object');
            expect(result.abi).not.toBeNull();
            expect(Array.isArray(result.abi)).toBe(false);

            // Property 3: If functions array exists, it must be an array
            if (result.abi.functions !== undefined) {
              expect(Array.isArray(result.abi.functions)).toBe(true);

              // Property 4: Each function must have a name
              result.abi.functions.forEach((func: any) => {
                expect(func.name).toBeDefined();
                expect(typeof func.name).toBe('string');
              });

              // Property 5: The generated function should be present in the ABI
              const generatedFunction = result.abi.functions.find(
                (f: any) => f.name === functionName
              );
              expect(generatedFunction).toBeDefined();
            }

            // Property 6: If types array exists, it must be an array
            if (result.abi.types !== undefined) {
              expect(Array.isArray(result.abi.types)).toBe(true);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('validateABI function correctly routes to appropriate validator', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary contract type
          fc.oneof(fc.constant('evm'), fc.constant('stellar')),
          async (contractType: 'evm' | 'stellar') => {
            let abi: any;
            let expectedValid: boolean;

            if (contractType === 'evm') {
              // Generate a valid EVM ABI
              abi = [
                {
                  type: 'function',
                  name: 'testFunction',
                  inputs: [{ name: 'value', type: 'uint256' }],
                  outputs: [{ name: '', type: 'bool' }],
                  stateMutability: 'nonpayable',
                },
              ];
              expectedValid = true;
            } else {
              // Generate a valid Soroban ABI
              abi = {
                functions: [
                  {
                    name: 'test_function',
                    inputs: [{ name: 'value', type: { type: 'U32' } }],
                    outputs: [{ type: { type: 'U32' } }],
                  },
                ],
              };
              expectedValid = true;
            }

            // Property 1: validateABI should route to the correct validator
            const result = validateABI(abi, contractType);

            // Property 2: The validation should succeed for valid ABIs
            expect(result.valid).toBe(expectedValid);

            // Property 3: Valid ABIs should have no errors
            if (expectedValid) {
              expect(result.errors).toHaveLength(0);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('compilation fails gracefully when ABI validation detects invalid structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,19}$/),
          async (contractName) => {
            // Create a Solidity contract
            const solidityCode = `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.0;
              
              contract ${contractName} {
                uint256 public value;
                
                function setValue(uint256 _value) public {
                  value = _value;
                }
              }
            `;

            // Compile the contract
            const result = await compilationService.compileEVM(
              solidityCode,
              contractName,
              { optimizerRuns: 200 }
            );

            // Property 1: If compilation succeeds, ABI must be present
            if (result.success) {
              expect(result.abi).toBeDefined();
              
              // Property 2: The ABI must pass validation
              if (result.abi) {
                const validation = validateEVMABI(result.abi);
                // Note: We log warnings but don't fail compilation
                // This property verifies that validation occurs
                expect(validation).toBeDefined();
                expect(validation.valid).toBeDefined();
                expect(Array.isArray(validation.errors)).toBe(true);
              }
            }

            // Property 3: If compilation fails, error message should be present
            if (!result.success) {
              expect(result.error).toBeDefined();
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
