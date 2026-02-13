import { compilationService } from '@/lib/services/compilation';
import * as fc from 'fast-check';

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      headers: new Map(),
    })),
  },
}));

jest.mock('@/lib/services/compilation', () => ({
  compilationService: {
    compileEVM: jest.fn(),
  },
}));

import { POST as legacyCompileHandler } from '@/app/api/compile/route';

describe('Legacy Endpoint Routing - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 27: Legacy Endpoint Routes to New Handler', () => {
    
    
    
    test('legacy endpoint routes all valid requests to new EVM handler', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,30}$/),
          
          fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
          async (contractName, optimizerRuns) => {
            
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

            
            const mockResult = {
              success: true,
              abi: [
                {
                  type: 'function',
                  name: 'setValue',
                  inputs: [{ name: '_value', type: 'uint256' }],
                  outputs: [],
                },
                {
                  type: 'function',
                  name: 'value',
                  inputs: [],
                  outputs: [{ name: '', type: 'uint256' }],
                },
              ],
              bytecode: '0x608060405234801561001057600080fd5b50610150806100206000396000f3fe',
              warnings: ['Warning: Unused local variable'],
              artifactId: 'a'.repeat(64),
            };

            (compilationService.compileEVM as jest.Mock).mockResolvedValue(mockResult);

            
            const requestBody = {
              solidityCode,
              contractName,
              ...(optimizerRuns !== undefined && { optimizerRuns }),
            };

            
            const request = {
              json: jest.fn().mockResolvedValue(requestBody),
              method: 'POST',
              url: 'http://localhost:3000/api/compile',
            } as any;

            
            const response = await legacyCompileHandler(request);
            const responseData = await response.json();

            
            expect(compilationService.compileEVM).toHaveBeenCalledWith(
              solidityCode,
              contractName,
              { optimizerRuns }
            );

            
            expect(response.status).toBe(200);

            
            expect(responseData).toHaveProperty('success', true);

            
            expect(responseData).toHaveProperty('abi');
            expect(Array.isArray(responseData.abi)).toBe(true);
            expect(responseData.abi).toEqual(mockResult.abi);

            
            expect(responseData).toHaveProperty('bytecode');
            expect(responseData.bytecode).toBe(mockResult.bytecode);

            
            expect(responseData).toHaveProperty('warnings');
            expect(Array.isArray(responseData.warnings)).toBe(true);

            
            
            expect(responseData).not.toHaveProperty('artifactId');

            return true;
          }
        ),
        {
          numRuns: 100, 
          timeout: 60000, 
        }
      );
    }, 90000); 

    
    test('legacy endpoint returns errors in original format when compilation fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          fc.oneof(
            fc.constant('Compilation failed: Syntax error'),
            fc.constant('Compilation failed: Undeclared identifier'),
            fc.constant('Compilation failed: Type mismatch')
          ),
          async (contractName, errorMessage) => {
            const solidityCode = `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.0;
              contract ${contractName} { invalid syntax here }
            `;

            
            const mockResult = {
              success: false,
              error: errorMessage,
              details: 'Line 3: Unexpected token',
            };

            (compilationService.compileEVM as jest.Mock).mockResolvedValue(mockResult);

            const request = {
              json: jest.fn().mockResolvedValue({ solidityCode, contractName }),
              method: 'POST',
            } as any;

            const response = await legacyCompileHandler(request);
            const responseData = await response.json();

            
            expect(response.status).toBe(400);

            
            expect(responseData).toHaveProperty('error');
            expect(responseData.error).toBe(errorMessage);

            
            expect(responseData).toHaveProperty('details');
            expect(responseData.details).toBe(mockResult.details);

            
            expect(responseData.success).not.toBe(true);

            return true;
          }
        ),
        { numRuns: 100, timeout: 30000 }
      );
    }, 60000);

    
    test('legacy endpoint validates input before routing to new handler', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.oneof(
            fc.record({ contractName: fc.string() }), 
            fc.record({ solidityCode: fc.string() }), 
            fc.record({ solidityCode: fc.constant(''), contractName: fc.string() }), 
            fc.record({ solidityCode: fc.string(), contractName: fc.constant('') }) 
          ),
          async (invalidBody) => {
            const request = {
              json: jest.fn().mockResolvedValue(invalidBody),
              method: 'POST',
            } as any;

            const response = await legacyCompileHandler(request);
            const responseData = await response.json();

            
            expect(response.status).toBe(400);

            
            expect(responseData).toHaveProperty('error');
            expect(typeof responseData.error).toBe('string');

            
            expect(compilationService.compileEVM).not.toHaveBeenCalled();

            return true;
          }
        ),
        { numRuns: 100, timeout: 30000 }
      );
    }, 60000);

    
    test('legacy endpoint correctly passes optimizer runs to new handler', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 10000 }),
          async (optimizerRuns) => {
            const solidityCode = `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.0;
              contract Test { uint256 public value; }
            `;

            const mockResult = {
              success: true,
              abi: [],
              bytecode: '0x6080604052',
              warnings: [],
              artifactId: 'b'.repeat(64),
            };

            (compilationService.compileEVM as jest.Mock).mockResolvedValue(mockResult);

            const request = {
              json: jest.fn().mockResolvedValue({
                solidityCode,
                contractName: 'Test',
                optimizerRuns,
              }),
              method: 'POST',
            } as any;

            await legacyCompileHandler(request);

            
            expect(compilationService.compileEVM).toHaveBeenCalledWith(
              solidityCode,
              'Test',
              { optimizerRuns }
            );

            return true;
          }
        ),
        { numRuns: 100, timeout: 30000 }
      );
    }, 60000);

    
    test('legacy endpoint returns HTTP 500 for internal errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            const solidityCode = `
              // SPDX-License-Identifier: MIT
              pragma solidity ^0.8.0;
              contract ${contractName} { uint256 public value; }
            `;

            
            (compilationService.compileEVM as jest.Mock).mockRejectedValue(
              new Error('Internal service error')
            );

            const request = {
              json: jest.fn().mockResolvedValue({ solidityCode, contractName }),
              method: 'POST',
            } as any;

            const response = await legacyCompileHandler(request);
            const responseData = await response.json();

            
            expect(response.status).toBe(500);

            
            expect(responseData).toHaveProperty('error');
            expect(responseData.error).toBe('Internal server error');

            
            expect(responseData).toHaveProperty('details');

            return true;
          }
        ),
        { numRuns: 100, timeout: 30000 }
      );
    }, 60000);
  });

  describe('Property 27: Legacy Format Compatibility - Edge Cases', () => {
    

    
    test('legacy endpoint returns empty warnings array when no warnings exist', async () => {
      const mockResult = {
        success: true,
        abi: [],
        bytecode: '0x6080604052',
        warnings: [], 
        artifactId: 'c'.repeat(64),
      };

      (compilationService.compileEVM as jest.Mock).mockResolvedValue(mockResult);

      const request = {
        json: jest.fn().mockResolvedValue({
          solidityCode: 'pragma solidity ^0.8.0; contract Test {}',
          contractName: 'Test',
        }),
        method: 'POST',
      } as any;

      const response = await legacyCompileHandler(request);
      const responseData = await response.json();

      
      expect(responseData.warnings).toEqual([]);
      expect(Array.isArray(responseData.warnings)).toBe(true);
    });

    
    test('legacy endpoint provides empty warnings array when service returns undefined', async () => {
      const mockResult = {
        success: true,
        abi: [],
        bytecode: '0x6080604052',
        
        artifactId: 'd'.repeat(64),
      };

      (compilationService.compileEVM as jest.Mock).mockResolvedValue(mockResult);

      const request = {
        json: jest.fn().mockResolvedValue({
          solidityCode: 'pragma solidity ^0.8.0; contract Test {}',
          contractName: 'Test',
        }),
        method: 'POST',
      } as any;

      const response = await legacyCompileHandler(request);
      const responseData = await response.json();

      
      expect(responseData.warnings).toEqual([]);
      expect(Array.isArray(responseData.warnings)).toBe(true);
    });

    
    test('legacy endpoint works correctly when optimizerRuns is not provided', async () => {
      const mockResult = {
        success: true,
        abi: [],
        bytecode: '0x6080604052',
        warnings: [],
        artifactId: 'e'.repeat(64),
      };

      (compilationService.compileEVM as jest.Mock).mockResolvedValue(mockResult);

      const request = {
        json: jest.fn().mockResolvedValue({
          solidityCode: 'pragma solidity ^0.8.0; contract Test {}',
          contractName: 'Test',
          
        }),
        method: 'POST',
      } as any;

      const response = await legacyCompileHandler(request);
      const responseData = await response.json();

      
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);

      
      expect(compilationService.compileEVM).toHaveBeenCalledWith(
        expect.any(String),
        'Test',
        { optimizerRuns: undefined }
      );
    });
  });
});
