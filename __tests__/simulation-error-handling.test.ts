/**
 * @jest-environment node
 */

import { simulationService } from '@/lib/services/simulation';
import * as fc from 'fast-check';

/**
 * Property-Based Tests for Simulation Error Handling
 * 
 * These tests validate that when a simulation fails or reverts, the Backend_System
 * returns the revert reason or error message explaining why the execution failed.
 * 
 * Feature: stellar-backend-infrastructure, Property 13: Failed Simulations Return Revert Reasons
 */

// Mock ethers.js with error scenarios
jest.mock('ethers', () => {
  const actualEthers = jest.requireActual('ethers');
  
  return {
    ...actualEthers,
    ethers: {
      ...actualEthers.ethers,
      JsonRpcProvider: jest.fn().mockImplementation(() => ({
        estimateGas: jest.fn(async (tx: any) => {
          // Simulate revert for specific patterns
          if (tx.data && tx.data.includes('deadbeef')) {
            const error: any = new Error('execution reverted: Insufficient balance');
            error.reason = 'Insufficient balance';
            error.code = 'CALL_EXCEPTION';
            throw error;
          }
          
          if (tx.data && tx.data.includes('baddcafe')) {
            const error: any = new Error('execution reverted: Unauthorized access');
            error.reason = 'Unauthorized access';
            error.code = 'CALL_EXCEPTION';
            throw error;
          }

          if (tx.data && tx.data.includes('badc0de')) {
            const error: any = new Error('execution reverted');
            error.code = 'CALL_EXCEPTION';
            throw error;
          }

          return 50000n;
        }),
      })),
      Contract: jest.fn().mockImplementation((address: string, abi: any, provider: any) => {
        const contract: any = {
          address,
          interface: { fragments: abi },
        };
        
        abi.forEach((item: any) => {
          if (item.type === 'function') {
            contract[item.name] = {
              estimateGas: jest.fn(async (...args: any[]) => {
                // Simulate various error conditions based on function name
                if (item.name.includes('revert')) {
                  const error: any = new Error('execution reverted: Custom revert message');
                  error.reason = 'Custom revert message';
                  error.code = 'CALL_EXCEPTION';
                  throw error;
                }

                if (item.name.includes('unauthorized')) {
                  const error: any = new Error('execution reverted: Caller is not authorized');
                  error.reason = 'Caller is not authorized';
                  error.code = 'CALL_EXCEPTION';
                  throw error;
                }

                if (item.name.includes('overflow')) {
                  const error: any = new Error('execution reverted: Arithmetic overflow');
                  error.reason = 'Arithmetic overflow';
                  error.code = 'CALL_EXCEPTION';
                  throw error;
                }

                if (item.name.includes('underflow')) {
                  const error: any = new Error('execution reverted: Arithmetic underflow');
                  error.reason = 'Arithmetic underflow';
                  error.code = 'CALL_EXCEPTION';
                  throw error;
                }

                if (item.name.includes('outofgas')) {
                  const error: any = new Error('execution reverted: Out of gas');
                  error.reason = 'Out of gas';
                  error.code = 'CALL_EXCEPTION';
                  throw error;
                }

                if (item.name.includes('fail')) {
                  const error: any = new Error('execution reverted');
                  error.code = 'CALL_EXCEPTION';
                  throw error;
                }

                return 50000n;
              }),
              staticCall: jest.fn(async (...args: any[]) => {
                // Same error conditions for staticCall
                if (item.name.includes('revert') || item.name.includes('fail')) {
                  const error: any = new Error('execution reverted: Function reverted');
                  error.reason = 'Function reverted';
                  error.code = 'CALL_EXCEPTION';
                  throw error;
                }
                return 42n;
              }),
            };
          }
        });
        
        return contract;
      }),
    },
  };
});

// Mock cache
jest.mock('@/lib/cache', () => ({
  cache: {
    get: jest.fn(async () => null),
    set: jest.fn(async () => {}),
  },
  CacheKeys: {
    SIMULATION: (hash: string) => `simulation:${hash}`,
  },
  CacheTTL: {
    SIMULATION: 300,
  },
}));

// Mock fetch for Soroban RPC calls with error scenarios
global.fetch = jest.fn((url: string, options?: any) => {
  const body = options?.body ? JSON.parse(options.body) : {};
  
  if (body.method === 'simulateTransaction') {
    const tx = body.params?.transaction || {};
    const functionName = tx.function || '';
    
    // Simulate various Stellar/Soroban error conditions
    if (functionName.includes('revert') || functionName.includes('fail')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: {
            error: 'Contract execution failed: Insufficient funds',
            cost: {
              cpuInsns: 0,
            },
          },
        }),
      } as Response);
    }

    if (functionName.includes('unauthorized')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: {
            error: 'Contract execution failed: Unauthorized caller',
            cost: {
              cpuInsns: 0,
            },
          },
        }),
      } as Response);
    }

    if (functionName.includes('invalid')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          error: {
            code: -32602,
            message: 'Invalid transaction format',
          },
        }),
      } as Response);
    }

    if (functionName.includes('notfound')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          error: {
            code: -32000,
            message: 'Contract not found',
          },
        }),
      } as Response);
    }

    // Successful simulation
    return Promise.resolve({
      ok: true,
      json: async () => ({
        jsonrpc: '2.0',
        id: 1,
        result: {
          cost: {
            cpuInsns: 150000,
          },
          results: [
            {
              xdr: 'AAAAAAAAAAE=',
            },
          ],
          returnValue: 'AAAAAAAAAAE=',
          stateChanges: [],
          events: [],
        },
      }),
    } as Response);
  }
  
  return Promise.resolve({
    ok: false,
    statusText: 'Not Found',
  } as Response);
}) as jest.Mock;

describe('Simulation Error Handling - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 13: Failed Simulations Return Revert Reasons', () => {
    /**
     * **Validates: Requirements 4.5**
     * 
     * Property: For any simulation that fails or reverts, the Backend_System should 
     * return the revert reason or error message explaining why the execution failed.
     */
    
    it('EVM simulation failures include revert reasons or error messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate contract addresses
          fc.string({ minLength: 40, maxLength: 40 }).map(s => 
            '0x' + s.split('').map(c => c.charCodeAt(0).toString(16).slice(-1)).join('').padEnd(40, '0').slice(0, 40)
          ),
          // Generate error-triggering function names
          fc.constantFrom(
            'revertTransaction',
            'unauthorizedAccess',
            'overflowCheck',
            'underflowCheck',
            'outofgasFunction',
            'failedOperation'
          ),
          // Generate network
          fc.constantFrom('celo', 'celo-testnet'),
          async (contractAddress, functionName, network) => {
            const request = {
              contractType: 'evm' as const,
              contractAddress,
              functionName,
              args: [100, '0x' + '1'.repeat(40)],
              network,
            };

            const result = await simulationService.simulate(request);

            // Property: Failed simulations must provide error information
            expect(result.success).toBe(false);
            
            // Must have an error field
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error!.length).toBeGreaterThan(0);

            // Should have either revertReason or details explaining the failure
            const hasRevertReason = result.revertReason !== undefined && result.revertReason !== null;
            const hasDetails = result.details !== undefined && result.details !== null;
            
            expect(hasRevertReason || hasDetails).toBe(true);

            // If revertReason is provided, it should be a non-empty string
            if (hasRevertReason) {
              expect(typeof result.revertReason).toBe('string');
              expect(result.revertReason!.length).toBeGreaterThan(0);
            }

            // If details are provided, they should be a non-empty string
            if (hasDetails) {
              expect(typeof result.details).toBe('string');
              expect(result.details!.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 20 }
      );
    }, 30000);

    it('Stellar simulation failures include error messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate Stellar contract IDs
          fc.stringMatching(/^C[A-Z2-7]{55}$/),
          // Generate error-triggering function names
          fc.constantFrom(
            'revert_transaction',
            'unauthorized_access',
            'fail_operation',
            'invalid_params',
            'notfound_contract'
          ),
          // Generate network
          fc.constantFrom('testnet', 'mainnet'),
          async (contractAddress, functionName, network) => {
            const request = {
              contractType: 'stellar' as const,
              contractAddress,
              functionName,
              args: [100, 'test'],
              network,
            };

            const result = await simulationService.simulate(request);

            // Property: Failed simulations must provide error information
            expect(result.success).toBe(false);
            
            // Must have an error field
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error!.length).toBeGreaterThan(0);

            // Should have either revertReason or details explaining the failure
            const hasRevertReason = result.revertReason !== undefined && result.revertReason !== null;
            const hasDetails = result.details !== undefined && result.details !== null;
            
            expect(hasRevertReason || hasDetails).toBe(true);

            // Error information should be descriptive
            const errorInfo = result.revertReason || result.details || result.error;
            expect(errorInfo!.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 20 }
      );
    }, 30000);

    it('EVM simulation with invalid bytecode returns descriptive error', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate invalid bytecode patterns
          fc.constantFrom(
            '0xdeadbeef',
            '0xbaddcafe',
            '0xbadc0de'
          ),
          fc.constantFrom('celo', 'celo-testnet'),
          async (contractCode, network) => {
            const request = {
              contractType: 'evm' as const,
              contractCode,
              functionName: 'deploy',
              args: [],
              network,
            };

            const result = await simulationService.simulate(request);

            // Property: Invalid bytecode simulations must return error information
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            expect(result.error!.length).toBeGreaterThan(0);

            // Should provide details or revert reason
            expect(result.details || result.revertReason).toBeDefined();
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    it('Error messages are descriptive and actionable', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('evm', 'stellar'),
          fc.record({
            errorType: fc.constantFrom('revert', 'unauthorized', 'overflow', 'fail'),
            seed: fc.integer({ min: 1, max: 100 }),
          }),
          async (contractType, { errorType, seed }) => {
            let request: any;

            if (contractType === 'evm') {
              request = {
                contractType: 'evm',
                contractAddress: '0x' + seed.toString().repeat(40).slice(0, 40),
                functionName: `${errorType}Function${seed}`,
                args: [seed],
                network: 'celo',
              };
            } else {
              request = {
                contractType: 'stellar',
                contractAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
                functionName: `${errorType}_function_${seed}`,
                args: [seed],
                network: 'testnet',
              };
            }

            const result = await simulationService.simulate(request);

            // Property: Error messages should be descriptive
            if (!result.success) {
              expect(result.error).toBeDefined();
              
              // Error message should not be empty or generic
              expect(result.error!.length).toBeGreaterThan(0);
              expect(result.error).not.toBe('Error');
              expect(result.error).not.toBe('Failed');
              
              // Should provide context through error, details, or revertReason
              const totalErrorInfo = [
                result.error,
                result.details,
                result.revertReason
              ].filter(Boolean).join(' ');
              
              expect(totalErrorInfo.length).toBeGreaterThan(10);
            }
          }
        ),
        { numRuns: 20 }
      );
    }, 30000);

    it('Failed simulations do not return success=true', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('evm', 'stellar'),
          fc.constantFrom('revert', 'fail', 'unauthorized'),
          async (contractType, errorType) => {
            let request: any;

            if (contractType === 'evm') {
              request = {
                contractType: 'evm',
                contractAddress: '0x' + '1'.repeat(40),
                functionName: `${errorType}Function`,
                args: [],
                network: 'celo',
              };
            } else {
              request = {
                contractType: 'stellar',
                contractAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
                functionName: `${errorType}_function`,
                args: [],
                network: 'testnet',
              };
            }

            const result = await simulationService.simulate(request);

            // Property: Failed simulations must have success=false
            expect(result.success).toBe(false);
            
            // Failed simulations should not have gasEstimate or result
            // (or if they do, they should be 0/null)
            if (result.gasEstimate !== undefined) {
              expect(result.gasEstimate).toBe(0);
            }
          }
        ),
        { numRuns: 20 }
      );
    }, 30000);

    it('Revert reasons are extracted from EVM errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 40, maxLength: 40 }).map(s => 
            '0x' + s.split('').map(c => c.charCodeAt(0).toString(16).slice(-1)).join('').padEnd(40, '0').slice(0, 40)
          ),
          fc.constantFrom(
            'revertTransaction',
            'unauthorizedAccess',
            'overflowCheck'
          ),
          async (contractAddress, functionName) => {
            const request = {
              contractType: 'evm' as const,
              contractAddress,
              functionName,
              args: [],
              network: 'celo',
            };

            const result = await simulationService.simulate(request);

            // Property: EVM errors should extract revert reasons when available
            if (!result.success && result.revertReason) {
              expect(typeof result.revertReason).toBe('string');
              expect(result.revertReason.length).toBeGreaterThan(0);
              
              // Revert reason should be meaningful
              expect(result.revertReason).not.toBe('revert');
              expect(result.revertReason).not.toBe('error');
            }
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    it('Stellar RPC errors are properly formatted', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^C[A-Z2-7]{55}$/),
          fc.constantFrom('invalid_params', 'notfound_contract'),
          async (contractAddress, functionName) => {
            const request = {
              contractType: 'stellar' as const,
              contractAddress,
              functionName,
              args: [],
              network: 'testnet',
            };

            const result = await simulationService.simulate(request);

            // Property: Stellar RPC errors should be properly formatted
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            
            // Error should provide context about the RPC failure
            const errorText = result.error! + (result.details || '');
            expect(errorText.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    it('Error response structure is consistent across contract types', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('evm', 'stellar'),
          fc.constantFrom('revert', 'fail', 'unauthorized'),
          async (contractType, errorType) => {
            let request: any;

            if (contractType === 'evm') {
              request = {
                contractType: 'evm',
                contractAddress: '0x' + '1'.repeat(40),
                functionName: `${errorType}Function`,
                args: [],
                network: 'celo',
              };
            } else {
              request = {
                contractType: 'stellar',
                contractAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
                functionName: `${errorType}_function`,
                args: [],
                network: 'testnet',
              };
            }

            const result = await simulationService.simulate(request);

            // Property: Error responses must have consistent structure
            expect(result).toHaveProperty('success');
            expect(result.success).toBe(false);
            expect(result).toHaveProperty('error');
            expect(typeof result.error).toBe('string');
            
            // Optional fields should be strings if present
            if (result.details !== undefined) {
              expect(typeof result.details).toBe('string');
            }
            if (result.revertReason !== undefined) {
              expect(typeof result.revertReason).toBe('string');
            }
          }
        ),
        { numRuns: 20 }
      );
    }, 30000);
  });
});
