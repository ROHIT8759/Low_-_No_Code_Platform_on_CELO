import { compilationService } from '@/lib/services/compilation';
import * as fc from 'fast-check';

/**
 * Property-Based Tests for Legacy Endpoint Routing
 * 
 * These tests validate that the legacy /api/compile endpoint maintains backward
 * compatibility by routing to the new EVM compilation handler.
 */

// Mock Next.js server components before importing the route handler
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

// Mock the compilation service
jest.mock('@/lib/services/compilation', () => ({
  compilationService: {
    compileEVM: jest.fn(),
  },
}));

// Import route handler after mocks are set up
import { POST as legacyCompileHandler } from '@/app/api/compile/route';

describe('Legacy Endpoint Routing - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 27: Legacy Endpoint Routes to New Handler', () => {
    // Feature: stellar-backend-infrastructure, Property 27: Legacy Endpoint Routes to New Handler
    
    /**
     * **Validates: Requirements 9.2, 9.3**
     * 
     * Property: For any request to the legacy /api/compile endpoint, the Backend_System
     * should route it to the new /api/compile/evm handler and return a response in the
     * original format.
     * 
     * This property ensures backward compatibility for existing clients.
     */
    test('legacy endpoint routes all valid requests to new EVM handler', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary valid Solidity contract names
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,30}$/),
          // Generate arbitrary optimizer runs (0-10000)
          fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
          async (contractName, optimizerRuns) => {
            // Create a simple valid Solidity contract
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

            // Mock successful compilation result
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

            // Create request to legacy endpoint
            const requestBody = {
              solidityCode,
              contractName,
              ...(optimizerRuns !== undefined && { optimizerRuns }),
            };

            // Create mock request object
            const request = {
              json: jest.fn().mockResolvedValue(requestBody),
              method: 'POST',
              url: 'http://localhost:3000/api/compile',
            } as any;

            // Call legacy endpoint handler
            const response = await legacyCompileHandler(request);
            const responseData = await response.json();

            // Property 1: Legacy endpoint should call the new EVM compilation service
            expect(compilationService.compileEVM).toHaveBeenCalledWith(
              solidityCode,
              contractName,
              { optimizerRuns }
            );

            // Property 2: Response should have HTTP 200 status for successful compilation
            expect(response.status).toBe(200);

            // Property 3: Response should maintain legacy format with success field
            expect(responseData).toHaveProperty('success', true);

            // Property 4: Response should include ABI in legacy format
            expect(responseData).toHaveProperty('abi');
            expect(Array.isArray(responseData.abi)).toBe(true);
            expect(responseData.abi).toEqual(mockResult.abi);

            // Property 5: Response should include bytecode in legacy format
            expect(responseData).toHaveProperty('bytecode');
            expect(responseData.bytecode).toBe(mockResult.bytecode);

            // Property 6: Response should include warnings array (even if empty)
            expect(responseData).toHaveProperty('warnings');
            expect(Array.isArray(responseData.warnings)).toBe(true);

            // Property 7: Legacy format should NOT include artifactId (backward compatibility)
            // The new endpoint includes artifactId, but legacy format should not
            expect(responseData).not.toHaveProperty('artifactId');

            return true;
          }
        ),
        {
          numRuns: 100, // Minimum 100 iterations as specified
          timeout: 60000, // 1 minute timeout
        }
      );
    }, 90000); // 1.5 minutes test timeout

    /**
     * Property: Legacy endpoint handles compilation failures with proper error format
     * 
     * **Validates: Requirements 9.2, 9.3**
     */
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

            // Mock compilation failure
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

            // Property 1: Failed compilation should return HTTP 400
            expect(response.status).toBe(400);

            // Property 2: Response should include error field
            expect(responseData).toHaveProperty('error');
            expect(responseData.error).toBe(errorMessage);

            // Property 3: Response should include details if available
            expect(responseData).toHaveProperty('details');
            expect(responseData.details).toBe(mockResult.details);

            // Property 4: Failed response should NOT have success: true
            expect(responseData.success).not.toBe(true);

            return true;
          }
        ),
        { numRuns: 100, timeout: 30000 }
      );
    }, 60000);

    /**
     * Property: Legacy endpoint validates input and rejects invalid requests
     * 
     * **Validates: Requirements 9.2, 9.3**
     */
    test('legacy endpoint validates input before routing to new handler', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate invalid inputs: missing solidityCode or contractName
          fc.oneof(
            fc.record({ contractName: fc.string() }), // Missing solidityCode
            fc.record({ solidityCode: fc.string() }), // Missing contractName
            fc.record({ solidityCode: fc.constant(''), contractName: fc.string() }), // Empty solidityCode
            fc.record({ solidityCode: fc.string(), contractName: fc.constant('') }) // Empty contractName
          ),
          async (invalidBody) => {
            const request = {
              json: jest.fn().mockResolvedValue(invalidBody),
              method: 'POST',
            } as any;

            const response = await legacyCompileHandler(request);
            const responseData = await response.json();

            // Property 1: Invalid input should return HTTP 400
            expect(response.status).toBe(400);

            // Property 2: Response should include error message
            expect(responseData).toHaveProperty('error');
            expect(typeof responseData.error).toBe('string');

            // Property 3: Compilation service should NOT be called for invalid input
            expect(compilationService.compileEVM).not.toHaveBeenCalled();

            return true;
          }
        ),
        { numRuns: 100, timeout: 30000 }
      );
    }, 60000);

    /**
     * Property: Legacy endpoint preserves optimizer runs parameter when routing
     * 
     * **Validates: Requirements 9.2, 9.3**
     */
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

            // Property: Optimizer runs should be passed to new handler
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

    /**
     * Property: Legacy endpoint handles internal errors gracefully
     * 
     * **Validates: Requirements 9.2, 9.3**
     */
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

            // Mock internal error (e.g., service unavailable)
            (compilationService.compileEVM as jest.Mock).mockRejectedValue(
              new Error('Internal service error')
            );

            const request = {
              json: jest.fn().mockResolvedValue({ solidityCode, contractName }),
              method: 'POST',
            } as any;

            const response = await legacyCompileHandler(request);
            const responseData = await response.json();

            // Property 1: Internal errors should return HTTP 500
            expect(response.status).toBe(500);

            // Property 2: Response should include error field
            expect(responseData).toHaveProperty('error');
            expect(responseData.error).toBe('Internal server error');

            // Property 3: Response should include error details
            expect(responseData).toHaveProperty('details');

            return true;
          }
        ),
        { numRuns: 100, timeout: 30000 }
      );
    }, 60000);
  });

  describe('Property 27: Legacy Format Compatibility - Edge Cases', () => {
    // Feature: stellar-backend-infrastructure, Property 27: Legacy Endpoint Routes to New Handler

    /**
     * Property: Legacy endpoint handles empty warnings array correctly
     */
    test('legacy endpoint returns empty warnings array when no warnings exist', async () => {
      const mockResult = {
        success: true,
        abi: [],
        bytecode: '0x6080604052',
        warnings: [], // Empty warnings
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

      // Property: Empty warnings array should be preserved
      expect(responseData.warnings).toEqual([]);
      expect(Array.isArray(responseData.warnings)).toBe(true);
    });

    /**
     * Property: Legacy endpoint handles missing warnings field gracefully
     */
    test('legacy endpoint provides empty warnings array when service returns undefined', async () => {
      const mockResult = {
        success: true,
        abi: [],
        bytecode: '0x6080604052',
        // warnings field is undefined
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

      // Property: Missing warnings should default to empty array for backward compatibility
      expect(responseData.warnings).toEqual([]);
      expect(Array.isArray(responseData.warnings)).toBe(true);
    });

    /**
     * Property: Legacy endpoint handles requests without optimizer runs
     */
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
          // optimizerRuns not provided
        }),
        method: 'POST',
      } as any;

      const response = await legacyCompileHandler(request);
      const responseData = await response.json();

      // Property 1: Request should succeed
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);

      // Property 2: Service should be called with undefined optimizerRuns
      expect(compilationService.compileEVM).toHaveBeenCalledWith(
        expect.any(String),
        'Test',
        { optimizerRuns: undefined }
      );
    });
  });
});
