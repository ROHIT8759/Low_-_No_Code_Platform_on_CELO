import { DeploymentService } from '@/lib/services/deployment';
import { storage } from '@/lib/storage';
import { createHash } from 'crypto';
import * as fc from 'fast-check';

jest.mock('@/lib/storage', () => {
  const artifacts = new Map<string, { bytecode?: string; wasm?: Buffer; abi?: any }>();
  
  return {
    storage: {
      retrieveEVMArtifact: jest.fn(async (artifactId: string) => {
        const artifact = artifacts.get(artifactId);
        if (!artifact || !artifact.bytecode) return null;
        return {
          artifactId,
          bytecode: artifact.bytecode,
          abi: artifact.abi || [],
        };
      }),
      retrieveStellarArtifact: jest.fn(async (artifactId: string) => {
        const artifact = artifacts.get(artifactId);
        if (!artifact || !artifact.wasm) return null;
        return {
          artifactId,
          wasm: artifact.wasm,
          abi: artifact.abi || {},
        };
      }),
      storeEVMArtifact: jest.fn(async (bytecode: string, abi: any) => {
        const cleanBytecode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
        const buffer = Buffer.from(cleanBytecode, 'hex');
        const hash = createHash('sha256').update(buffer).digest('hex');
        artifacts.set(hash, { bytecode, abi });
        return { artifactId: hash };
      }),
      storeStellarArtifact: jest.fn(async (wasm: Buffer, abi: any) => {
        const hash = createHash('sha256').update(wasm).digest('hex');
        artifacts.set(hash, { wasm, abi });
        return { artifactId: hash };
      }),
    },
  };
});

jest.mock('@/lib/supabase', () => ({
  supabase: null,
}));

jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  
  
  let mockBehavior: 'success' | 'gas-estimation-failure' | 'broadcast-failure' | 'receipt-failure' = 'success';
  
  const setMockBehavior = (behavior: typeof mockBehavior) => {
    mockBehavior = behavior;
  };
  
  return {
    ...originalModule,
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      estimateGas: jest.fn().mockImplementation(() => {
        if (mockBehavior === 'gas-estimation-failure') {
          return Promise.reject(new Error('Gas estimation failed: execution reverted'));
        }
        return Promise.resolve(BigInt(500000));
      }),
      getTransactionReceipt: jest.fn().mockImplementation(() => {
        if (mockBehavior === 'receipt-failure') {
          
          return Promise.resolve(null);
        }
        return Promise.resolve({
          status: 1,
          contractAddress: '0x' + Math.random().toString(16).substring(2, 42).padEnd(40, '0'),
          hash: '0x' + Math.random().toString(16).substring(2, 66).padEnd(64, '0'),
          blockNumber: Math.floor(Math.random() * 1000000),
          gasUsed: BigInt(Math.floor(Math.random() * 500000) + 100000),
        });
      }),
      broadcastTransaction: jest.fn().mockImplementation(() => {
        if (mockBehavior === 'broadcast-failure') {
          return Promise.reject(new Error('Transaction broadcast failed: insufficient funds'));
        }
        const txHash = '0x' + Math.random().toString(16).substring(2, 66).padEnd(64, '0');
        return Promise.resolve({ hash: txHash });
      }),
    })),
    AbiCoder: originalModule.AbiCoder,
    __setMockBehavior: setMockBehavior,
  };
});

jest.mock('@stellar/stellar-sdk', () => {
  let mockBehavior: 'success' | 'account-load-failure' | 'submit-failure' | 'transaction-not-found' = 'success';
  
  const setMockBehavior = (behavior: typeof mockBehavior) => {
    mockBehavior = behavior;
  };

  const mockAccount = {
    accountId: () => 'GABC123',
    sequenceNumber: () => '1',
    incrementSequenceNumber: jest.fn(),
  };

  const mockTransaction = {
    toXDR: jest.fn().mockReturnValue('AAAA...mock-xdr...'),
    hash: jest.fn().mockReturnValue(Buffer.from('mockhash')),
  };

  const mockTransactionBuilder = jest.fn().mockImplementation(() => ({
    addOperation: jest.fn().mockReturnThis(),
    setTimeout: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue(mockTransaction),
  }));

  mockTransactionBuilder.fromXDR = jest.fn().mockReturnValue(mockTransaction);

  return {
    Horizon: {
      Server: jest.fn().mockImplementation(() => ({
        loadAccount: jest.fn().mockImplementation(() => {
          if (mockBehavior === 'account-load-failure') {
            return Promise.reject(new Error('Account not found'));
          }
          return Promise.resolve(mockAccount);
        }),
        submitTransaction: jest.fn().mockImplementation(() => {
          if (mockBehavior === 'submit-failure') {
            return Promise.reject(new Error('Transaction submission failed: insufficient balance'));
          }
          return Promise.resolve({
            hash: 'stellar-tx-' + Math.random().toString(36).substring(7),
            successful: true,
          });
        }),
        transactions: jest.fn().mockReturnValue({
          transaction: jest.fn().mockReturnValue({
            call: jest.fn().mockImplementation(() => {
              if (mockBehavior === 'transaction-not-found') {
                return Promise.reject({ response: { status: 404 } });
              }
              return Promise.resolve({
                successful: true,
                hash: 'stellar-tx-hash',
                result_meta_xdr: 'mock-meta-xdr',
              });
            }),
          }),
        }),
      })),
    },
    TransactionBuilder: mockTransactionBuilder,
    Operation: {
      invokeHostFunction: jest.fn().mockReturnValue({}),
    },
    xdr: {
      HostFunction: {
        hostFunctionTypeUploadContractWasm: jest.fn().mockReturnValue(Buffer.from('wasm')),
      },
      TransactionMeta: {
        fromXDR: jest.fn().mockReturnValue({
          v3: jest.fn().mockReturnValue({
            sorobanMeta: jest.fn().mockReturnValue({
              returnValue: jest.fn().mockReturnValue({
                toString: () => 'C' + Math.random().toString(36).substring(2, 58).toUpperCase(),
              }),
            }),
          }),
        }),
      },
    },
    BASE_FEE: '100',
    TimeoutInfinite: 0,
    __setMockBehavior: setMockBehavior,
  };
});

describe('DeploymentService - Error Handling Property Tests', () => {
  const deploymentService = new DeploymentService();

  describe('Property 8: Failed Deployments Return Error Information', () => {
    
    
    
    
    test('EVM deployment with non-existent artifact returns error with failure reason', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[0-9a-f]{64}$/),
          
          fc.constantFrom('CELO_MAINNET' as const, 'CELO_ALFAJORES' as const),
          async (artifactId, network) => {
            const result = await deploymentService.deployEVM({
              artifactId,
              network,
              constructorArgs: [],
            });

            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error.length).toBeGreaterThan(0);
            
            
            expect(result.error).toContain('Artifact not found');
            
            
            expect(result.details).toBeDefined();
            expect(result.details).toContain(artifactId);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Stellar deployment with non-existent artifact returns error with failure reason', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[0-9a-f]{64}$/),
          
          fc.constantFrom('testnet' as const, 'mainnet' as const),
          
          fc.stringMatching(/^G[A-Z2-7]{55}$/),
          async (artifactId, network, sourceAccount) => {
            const result = await deploymentService.deployStellar({
              artifactId,
              network,
              sourceAccount,
            });

            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error.length).toBeGreaterThan(0);
            
            
            expect(result.error).toContain('Artifact not found');
            
            
            expect(result.details).toBeDefined();
            expect(result.details).toContain(artifactId);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('EVM deployment failure during transaction submission includes transaction hash', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[0-9a-f]{100,500}$/),
          
          fc.stringMatching(/^[0-9a-f]{40}$/).map(h => '0x' + h),
          async (bytecode, deployer) => {
            const fullBytecode = '0x' + bytecode;
            const { artifactId } = await storage.storeEVMArtifact(fullBytecode, []);
            
            
            const signedTx = '0x' + Math.random().toString(16).substring(2, 200).padEnd(198, '0');
            const result = await deploymentService.submitSignedEVMTransaction(
              signedTx,
              'CELO_MAINNET',
              artifactId,
              deployer
            );

            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain('Transaction submission failed');
            
            
            expect(result.details).toBeDefined();
            expect(typeof result.details).toBe('string');
          }
        ),
        { numRuns: 50 }
      );
    }, 30000);

    test('EVM deployment failure when receipt not found includes transaction hash', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[0-9a-f]{100,500}$/),
          
          fc.stringMatching(/^[0-9a-f]{40}$/).map(h => '0x' + h),
          async (bytecode, deployer) => {
            const fullBytecode = '0x' + bytecode;
            const { artifactId } = await storage.storeEVMArtifact(fullBytecode, []);
            
            
            const signedTx = '0x' + Math.random().toString(16).substring(2, 200).padEnd(198, '0');
            const result = await deploymentService.submitSignedEVMTransaction(
              signedTx,
              'CELO_MAINNET',
              artifactId,
              deployer
            );

            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain('Transaction submission failed');
            
            
            expect(result.details).toBeDefined();
            expect(typeof result.details).toBe('string');
          }
        ),
        { numRuns: 50 }
      );
    }, 30000);

    test('Stellar deployment failure during envelope creation returns error with reason', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.uint8Array({ minLength: 100, maxLength: 500 }),
          
          fc.stringMatching(/^G[A-Z2-7]{55}$/),
          async (wasmArray, sourceAccount) => {
            const wasm = Buffer.from(wasmArray);
            const { artifactId } = await storage.storeStellarArtifact(wasm, {});
            
            
            const stellarSdk = require('@stellar/stellar-sdk');
            stellarSdk.__setMockBehavior('account-load-failure');

            try {
              const result = await deploymentService.deployStellar({
                artifactId,
                network: 'testnet',
                sourceAccount,
              });

              
              expect(result.success).toBe(false);
              expect(result.error).toBeDefined();
              expect(result.error).toContain('Deployment preparation failed');
              
              
              expect(result.details).toBeDefined();
              expect(result.details).toContain('Account not found');
            } finally {
              
              stellarSdk.__setMockBehavior('success');
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    test('Stellar deployment failure during transaction submission includes transaction hash', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.uint8Array({ minLength: 100, maxLength: 500 }),
          
          fc.stringMatching(/^G[A-Z2-7]{55}$/),
          async (wasmArray, sourceAccount) => {
            const wasm = Buffer.from(wasmArray);
            const { artifactId } = await storage.storeStellarArtifact(wasm, {});
            
            
            const stellarSdk = require('@stellar/stellar-sdk');
            stellarSdk.__setMockBehavior('submit-failure');

            try {
              const signedEnvelopeXDR = 'AAAA...signed-envelope-xdr...';
              const result = await deploymentService.submitSignedStellarTransaction(
                signedEnvelopeXDR,
                'testnet',
                artifactId,
                sourceAccount
              );

              
              expect(result.success).toBe(false);
              expect(result.error).toBeDefined();
              expect(result.error).toContain('Transaction submission failed');
              
              
              expect(result.details).toBeDefined();
              expect(result.details).toContain('insufficient balance');
            } finally {
              
              stellarSdk.__setMockBehavior('success');
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    test('all deployment errors include success: false flag', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[0-9a-f]{64}$/),
          
          fc.constantFrom('evm' as const, 'stellar' as const),
          async (artifactId, deploymentType) => {
            let result;
            
            if (deploymentType === 'evm') {
              result = await deploymentService.deployEVM({
                artifactId,
                network: 'CELO_MAINNET',
                constructorArgs: [],
              });
            } else {
              result = await deploymentService.deployStellar({
                artifactId,
                network: 'testnet',
                sourceAccount: 'GABC123DEFG456HIJK789LMNO012PQRS345TUVW678XYZA901BCDE234',
              });
            }

            
            expect(result.success).toBe(false);
            
            
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('deployment errors provide actionable error messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[0-9a-f]{64}$/),
          async (artifactId) => {
            
            const result = await deploymentService.deployEVM({
              artifactId,
              network: 'CELO_MAINNET',
              constructorArgs: [],
            });

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            
            
            expect(result.error).not.toBe('Error');
            expect(result.error).not.toBe('Failed');
            expect(result.error.length).toBeGreaterThan(10);
            
            
            expect(
              result.error.toLowerCase().includes('artifact') ||
              result.error.toLowerCase().includes('not found') ||
              result.error.toLowerCase().includes('failed')
            ).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('error details field provides additional context when available', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[0-9a-f]{64}$/),
          
          fc.constantFrom('evm' as const, 'stellar' as const),
          async (artifactId, deploymentType) => {
            let result;
            
            if (deploymentType === 'evm') {
              result = await deploymentService.deployEVM({
                artifactId,
                network: 'CELO_MAINNET',
                constructorArgs: [],
              });
            } else {
              result = await deploymentService.deployStellar({
                artifactId,
                network: 'testnet',
                sourceAccount: 'GABC123DEFG456HIJK789LMNO012PQRS345TUVW678XYZA901BCDE234',
              });
            }

            expect(result.success).toBe(false);
            
            
            if (result.details) {
              expect(typeof result.details).toBe('string');
              expect(result.details.length).toBeGreaterThan(0);
              
              
              expect(result.details).not.toBe(result.error);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    test('deployment errors maintain consistent response structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[0-9a-f]{64}$/),
          async (artifactId) => {
            const result = await deploymentService.deployEVM({
              artifactId,
              network: 'CELO_MAINNET',
              constructorArgs: [],
            });

            
            expect(result).toHaveProperty('success');
            expect(result.success).toBe(false);
            
            
            expect(result).toHaveProperty('error');
            expect(result.error).toBeDefined();
            
            
            if (result.contractAddress !== undefined) {
              expect(typeof result.contractAddress).toBe('string');
            }
            
            if (result.txHash !== undefined) {
              expect(typeof result.txHash).toBe('string');
            }
            
            if (result.details !== undefined) {
              expect(typeof result.details).toBe('string');
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
