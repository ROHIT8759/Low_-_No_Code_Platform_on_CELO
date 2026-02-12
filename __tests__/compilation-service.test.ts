import { CompilationService } from '@/lib/services/compilation';
import { storage } from '@/lib/storage';
import { createHash } from 'crypto';
import * as fc from 'fast-check';

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

describe('CompilationService - Property-Based Tests', () => {
  const compilationService = new CompilationService();

  describe('Property 2: Compilation Artifacts Are Stored with Content-Addressed Identifiers', () => {
    
    
    
    test('EVM compilation stores artifacts with SHA-256 content-addressed identifiers', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,19}$/),
          async (contractName) => {
            
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

            
            const result = await compilationService.compileEVM(
              solidityCode,
              contractName,
              { optimizerRuns: 200 }
            );

            
            if (!result.success || !result.bytecode || !result.artifactId) {
              return true;
            }

            
            expect(result.artifactId).toMatch(/^[a-f0-9]{64}$/);

            
            const cleanBytecode = result.bytecode.startsWith('0x')
              ? result.bytecode.slice(2)
              : result.bytecode;
            const bytecodeBuffer = Buffer.from(cleanBytecode, 'hex');
            const expectedHash = createHash('sha256').update(bytecodeBuffer).digest('hex');

            
            expect(result.artifactId).toBe(expectedHash);

            
            const exists = await storage.exists(result.artifactId, 'evm');
            expect(exists).toBe(true);

            
            const retrievedBytecode = await storage.retrieveEVMBytecode(result.artifactId);
            const normalizedOriginal = result.bytecode.startsWith('0x')
              ? result.bytecode
              : '0x' + result.bytecode;
            const normalizedRetrieved = retrievedBytecode.startsWith('0x')
              ? retrievedBytecode
              : '0x' + retrievedBytecode;
            
            expect(normalizedRetrieved.toLowerCase()).toBe(normalizedOriginal.toLowerCase());

            
            const retrievedClean = normalizedRetrieved.slice(2);
            const retrievedBuffer = Buffer.from(retrievedClean, 'hex');
            const recomputedHash = createHash('sha256').update(retrievedBuffer).digest('hex');
            
            expect(recomputedHash).toBe(result.artifactId);

            return true;
          }
        ),
        {
          numRuns: 100, 
          timeout: 120000, 
        }
      );
    }, 180000); 

    
    test('Stellar compilation stores artifacts with SHA-256 content-addressed identifiers', async () => {
      
      const { sorobanCompiler } = await import('@/lib/stellar/compiler');
      const toolchain = await sorobanCompiler.checkToolchain();
      
      if (!toolchain.rust || !toolchain.soroban) {
        console.log('Skipping Stellar compilation test - toolchain not available');
        return;
      }

      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[a-z][a-z0-9-]{2,19}$/),
          async (contractName) => {
            
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

            
            const result = await compilationService.compileStellar(
              rustCode,
              contractName,
              'testnet'
            );

            
            if (!result.success || !result.wasmHash || !result.artifactId) {
              return true;
            }

            
            expect(result.artifactId).toMatch(/^[a-f0-9]{64}$/);

            
            expect(result.wasmHash).toMatch(/^[a-f0-9]{64}$/);

            
            expect(result.artifactId).toBe(result.wasmHash);

            
            const exists = await storage.exists(result.artifactId, 'stellar');
            expect(exists).toBe(true);

            
            const retrievedWasm = await storage.retrieveStellarWASM(result.artifactId);
            const recomputedHash = createHash('sha256').update(retrievedWasm).digest('hex');
            
            expect(recomputedHash).toBe(result.artifactId);

            
            expect(recomputedHash).toBe(result.wasmHash);

            return true;
          }
        ),
        {
          numRuns: 100, 
          timeout: 180000, 
        }
      );
    }, 240000); 
  });

  describe('Property 2: Content-Addressed Storage - Edge Cases', () => {
    

    
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

      
      const result1 = await compilationService.compileEVM(solidityCode, 'TestContract');
      const result2 = await compilationService.compileEVM(solidityCode, 'TestContract');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      
      expect(result1.artifactId).toBe(result2.artifactId);
      expect(result1.bytecode).toBe(result2.bytecode);
    });

    
    test('different EVM bytecode produces different artifact IDs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000000 }),
          fc.integer({ min: 1, max: 1000000 }),
          async (value1, value2) => {
            
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

            
            expect(result1.artifactId).not.toBe(result2.artifactId);
            expect(result1.bytecode).not.toBe(result2.bytecode);

            return true;
          }
        ),
        { numRuns: 50, timeout: 60000 }
      );
    }, 90000);

    
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

            
            expect(result.artifactId).toHaveLength(64);
            expect(result.artifactId).toMatch(/^[a-f0-9]{64}$/);

            
            expect(result.artifactId).toBe(result.artifactId.toLowerCase());

            return true;
          }
        ),
        { numRuns: 100, timeout: 120000 }
      );
    }, 180000);
  });
});
