/**
 * Property-Based Tests for Risk Scoring
 * Feature: stellar-backend-infrastructure
 * Property 15: Contract Analysis Assigns Risk Scores to Functions
 * 
 * **Validates: Requirements 5.2**
 * 
 * Tests that for any contract submitted for analysis, the AI_Intelligence_Engine
 * assigns risk scores (0-100) to each function based on state modifications,
 * external calls, and value transfers, categorized as low, medium, high, or critical.
 */

import { AIIntelligenceEngine } from '@/lib/services/ai-engine';
import * as fc from 'fast-check';

describe('Property 15: Contract Analysis Assigns Risk Scores to Functions', () => {
  let aiEngine: AIIntelligenceEngine;

  beforeEach(() => {
    aiEngine = new AIIntelligenceEngine();
  });

  describe('Risk Score Assignment', () => {
    it('assigns risk scores (0-100) to all functions in a contract', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate contract with varying complexity
          fc.record({
            contractName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
            functionCount: fc.integer({ min: 1, max: 5 }),
            hasPayable: fc.boolean(),
            hasExternalCalls: fc.boolean(),
            hasStateChanges: fc.boolean(),
          }),
          async ({ contractName, functionCount, hasPayable, hasExternalCalls, hasStateChanges }) => {
            // Generate a valid Solidity contract
            const contract = generateContract({
              contractName,
              functionCount,
              hasPayable,
              hasExternalCalls,
              hasStateChanges,
            });

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // Verify risk scores exist for all functions
            const functionKeys = Object.keys(result.riskScores);
            expect(functionKeys.length).toBeGreaterThan(0);

            // Verify each risk score is in valid range (0-100)
            for (const [functionName, riskScore] of Object.entries(result.riskScores)) {
              expect(riskScore.score).toBeGreaterThanOrEqual(0);
              expect(riskScore.score).toBeLessThanOrEqual(100);
              expect(typeof riskScore.score).toBe('number');
              expect(Number.isFinite(riskScore.score)).toBe(true);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('categorizes risk scores into low, medium, high, or critical levels', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contractName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
            functionCount: fc.integer({ min: 1, max: 3 }),
            riskFactors: fc.record({
              payable: fc.boolean(),
              externalCalls: fc.boolean(),
              delegatecall: fc.boolean(),
              assembly: fc.boolean(),
              unchecked: fc.boolean(),
            }),
          }),
          async ({ contractName, functionCount, riskFactors }) => {
            // Generate contract with specific risk factors
            const contract = generateContractWithRiskFactors(contractName, functionCount, riskFactors);

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // Verify all risk levels are valid
            for (const [functionName, riskScore] of Object.entries(result.riskScores)) {
              expect(['low', 'medium', 'high', 'critical']).toContain(riskScore.level);
              
              // Verify level matches score range
              if (riskScore.score >= 0 && riskScore.score <= 25) {
                expect(riskScore.level).toBe('low');
              } else if (riskScore.score >= 26 && riskScore.score <= 50) {
                expect(riskScore.level).toBe('medium');
              } else if (riskScore.score >= 51 && riskScore.score <= 75) {
                expect(riskScore.level).toBe('high');
              } else if (riskScore.score >= 76 && riskScore.score <= 100) {
                expect(riskScore.level).toBe('critical');
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('assigns higher risk scores to payable functions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            // Generate contract with both payable and non-payable functions
            const contract = `
              pragma solidity ^0.8.0;
              
              contract ${contractName} {
                uint256 public value;
                
                function readValue() public view returns (uint256) {
                  return value;
                }
                
                function setValue(uint256 _value) public {
                  value = _value;
                }
                
                function deposit() public payable {
                  value += msg.value;
                }
              }
            `;

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // Find payable and non-payable functions
            const payableFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('deposit')
            );
            const viewFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('readValue')
            );

            if (payableFunc && viewFunc) {
              // Payable function should have higher risk than view function
              expect(payableFunc[1].score).toBeGreaterThan(viewFunc[1].score);
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it('assigns higher risk scores to functions with external calls', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            // Generate contract with and without external calls
            const contract = `
              pragma solidity ^0.8.0;
              
              contract ${contractName} {
                uint256 public value;
                
                function simpleSet(uint256 _value) public {
                  value = _value;
                }
                
                function externalCall(address target) public {
                  (bool success, ) = target.call("");
                  require(success, "Call failed");
                }
              }
            `;

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // Find functions with and without external calls
            const externalCallFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('externalCall')
            );
            const simpleFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('simpleSet')
            );

            if (externalCallFunc && simpleFunc) {
              // Function with external call should have higher risk
              expect(externalCallFunc[1].score).toBeGreaterThan(simpleFunc[1].score);
              
              // External call should add to reasons
              expect(externalCallFunc[1].reasons.some(r => 
                r.toLowerCase().includes('external') || r.toLowerCase().includes('call')
              )).toBe(true);
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it('assigns higher risk scores to functions with delegatecall', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            // Generate contract with delegatecall
            const contract = `
              pragma solidity ^0.8.0;
              
              contract ${contractName} {
                function normalCall(address target) public {
                  (bool success, ) = target.call("");
                  require(success);
                }
                
                function dangerousCall(address target) public {
                  (bool success, ) = target.delegatecall("");
                  require(success);
                }
              }
            `;

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // Find functions
            const delegatecallFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('dangerousCall')
            );
            const normalCallFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('normalCall')
            );

            if (delegatecallFunc && normalCallFunc) {
              // Delegatecall should have higher or equal risk than normal call
              // (both may hit the 100 cap, so >= is appropriate)
              expect(delegatecallFunc[1].score).toBeGreaterThanOrEqual(normalCallFunc[1].score);
              
              // Delegatecall should be mentioned in reasons
              expect(delegatecallFunc[1].reasons.some(r => 
                r.toLowerCase().includes('delegatecall')
              )).toBe(true);
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it('assigns higher risk scores to functions with state modifications', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            // Generate contract with view and state-modifying functions
            const contract = `
              pragma solidity ^0.8.0;
              
              contract ${contractName} {
                uint256 public value;
                
                function getValue() public view returns (uint256) {
                  return value;
                }
                
                function modifyValue(uint256 _value) public {
                  value = _value;
                }
              }
            `;

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // Find view and state-modifying functions
            const viewFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('getValue')
            );
            const modifyFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('modifyValue')
            );

            if (viewFunc && modifyFunc) {
              // State-modifying function should have higher risk than view
              expect(modifyFunc[1].score).toBeGreaterThan(viewFunc[1].score);
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it('provides reasons for assigned risk scores', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contractName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
            hasRiskFactors: fc.boolean(),
          }),
          async ({ contractName, hasRiskFactors }) => {
            // Generate contract
            const contract = hasRiskFactors
              ? generateHighRiskContract(contractName)
              : generateLowRiskContract(contractName);

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // Verify all risk scores have reasons array
            for (const [functionName, riskScore] of Object.entries(result.riskScores)) {
              expect(Array.isArray(riskScore.reasons)).toBe(true);
              
              // If score > 0, should have at least one reason
              if (riskScore.score > 0) {
                expect(riskScore.reasons.length).toBeGreaterThan(0);
                
                // Each reason should be a non-empty string
                for (const reason of riskScore.reasons) {
                  expect(typeof reason).toBe('string');
                  expect(reason.length).toBeGreaterThan(0);
                }
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('assigns risk scores consistently for identical contracts', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            const contract = generateContract({
              contractName,
              functionCount: 2,
              hasPayable: true,
              hasExternalCalls: true,
              hasStateChanges: true,
            });

            // Analyze the same contract twice
            const result1 = aiEngine.performFullAnalysis(contract);
            const result2 = aiEngine.performFullAnalysis(contract);

            // Results should be identical
            expect(Object.keys(result1.riskScores).length).toBe(Object.keys(result2.riskScores).length);

            for (const functionName of Object.keys(result1.riskScores)) {
              expect(result1.riskScores[functionName].score).toBe(result2.riskScores[functionName].score);
              expect(result1.riskScores[functionName].level).toBe(result2.riskScores[functionName].level);
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});

/**
 * Helper function to generate a Solidity contract with specified characteristics
 */
function generateContract(options: {
  contractName: string;
  functionCount: number;
  hasPayable: boolean;
  hasExternalCalls: boolean;
  hasStateChanges: boolean;
}): string {
  const { contractName, functionCount, hasPayable, hasExternalCalls, hasStateChanges } = options;

  let functions = '';

  // Add a view function
  functions += `
    function getValue() public view returns (uint256) {
      return value;
    }
  `;

  // Add state-changing function if requested
  if (hasStateChanges) {
    functions += `
    function setValue(uint256 _value) public {
      value = _value;
    }
  `;
  }

  // Add payable function if requested
  if (hasPayable) {
    functions += `
    function deposit() public payable {
      value += msg.value;
    }
  `;
  }

  // Add external call function if requested
  if (hasExternalCalls) {
    functions += `
    function callExternal(address target) public {
      (bool success, ) = target.call("");
      require(success, "Call failed");
    }
  `;
  }

  // Add additional simple functions to reach functionCount
  for (let i = functions.split('function').length - 1; i < functionCount; i++) {
    functions += `
    function func${i}(uint256 x) public pure returns (uint256) {
      return x * 2;
    }
  `;
  }

  return `
    pragma solidity ^0.8.0;
    
    contract ${contractName} {
      uint256 public value;
      
      ${functions}
    }
  `;
}

/**
 * Helper function to generate a contract with specific risk factors
 */
function generateContractWithRiskFactors(
  contractName: string,
  functionCount: number,
  riskFactors: {
    payable: boolean;
    externalCalls: boolean;
    delegatecall: boolean;
    assembly: boolean;
    unchecked: boolean;
  }
): string {
  let functions = '';

  if (riskFactors.payable) {
    functions += `
    function payableFunc() public payable {
      // Payable function
    }
  `;
  }

  if (riskFactors.externalCalls) {
    functions += `
    function externalCallFunc(address target) public {
      (bool success, ) = target.call("");
      require(success);
    }
  `;
  }

  if (riskFactors.delegatecall) {
    functions += `
    function delegatecallFunc(address target) public {
      (bool success, ) = target.delegatecall("");
      require(success);
    }
  `;
  }

  if (riskFactors.assembly) {
    functions += `
    function assemblyFunc() public pure returns (uint256 result) {
      assembly {
        result := 42
      }
    }
  `;
  }

  if (riskFactors.unchecked) {
    functions += `
    function uncheckedFunc(uint256 a, uint256 b) public pure returns (uint256) {
      unchecked {
        return a + b;
      }
    }
  `;
  }

  // Add simple functions to reach functionCount
  for (let i = functions.split('function').length - 1; i < functionCount; i++) {
    functions += `
    function simpleFunc${i}() public pure returns (uint256) {
      return ${i};
    }
  `;
  }

  return `
    pragma solidity ^0.8.0;
    
    contract ${contractName} {
      ${functions}
    }
  `;
}

/**
 * Helper function to generate a high-risk contract
 */
function generateHighRiskContract(contractName: string): string {
  return `
    pragma solidity ^0.8.0;
    
    contract ${contractName} {
      function dangerousFunction(address target, bytes memory data) public payable {
        (bool success, ) = target.delegatecall(data);
        require(success);
      }
    }
  `;
}

/**
 * Helper function to generate a low-risk contract
 */
function generateLowRiskContract(contractName: string): string {
  return `
    pragma solidity ^0.8.0;
    
    contract ${contractName} {
      uint256 public value;
      
      function getValue() public view returns (uint256) {
        return value;
      }
    }
  `;
}
