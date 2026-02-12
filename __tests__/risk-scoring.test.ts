

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
          
          fc.record({
            contractName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
            functionCount: fc.integer({ min: 1, max: 5 }),
            hasPayable: fc.boolean(),
            hasExternalCalls: fc.boolean(),
            hasStateChanges: fc.boolean(),
          }),
          async ({ contractName, functionCount, hasPayable, hasExternalCalls, hasStateChanges }) => {
            
            const contract = generateContract({
              contractName,
              functionCount,
              hasPayable,
              hasExternalCalls,
              hasStateChanges,
            });

            
            const result = aiEngine.performFullAnalysis(contract);

            
            const functionKeys = Object.keys(result.riskScores);
            expect(functionKeys.length).toBeGreaterThan(0);

            
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
            
            const contract = generateContractWithRiskFactors(contractName, functionCount, riskFactors);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            for (const [functionName, riskScore] of Object.entries(result.riskScores)) {
              expect(['low', 'medium', 'high', 'critical']).toContain(riskScore.level);
              
              
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

            
            const result = aiEngine.performFullAnalysis(contract);

            
            const payableFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('deposit')
            );
            const viewFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('readValue')
            );

            if (payableFunc && viewFunc) {
              
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

            
            const result = aiEngine.performFullAnalysis(contract);

            
            const externalCallFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('externalCall')
            );
            const simpleFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('simpleSet')
            );

            if (externalCallFunc && simpleFunc) {
              
              expect(externalCallFunc[1].score).toBeGreaterThan(simpleFunc[1].score);
              
              
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

            
            const result = aiEngine.performFullAnalysis(contract);

            
            const delegatecallFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('dangerousCall')
            );
            const normalCallFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('normalCall')
            );

            if (delegatecallFunc && normalCallFunc) {
              
              
              expect(delegatecallFunc[1].score).toBeGreaterThanOrEqual(normalCallFunc[1].score);
              
              
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

            
            const result = aiEngine.performFullAnalysis(contract);

            
            const viewFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('getValue')
            );
            const modifyFunc = Object.entries(result.riskScores).find(([name]) => 
              name.includes('modifyValue')
            );

            if (viewFunc && modifyFunc) {
              
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
            
            const contract = hasRiskFactors
              ? generateHighRiskContract(contractName)
              : generateLowRiskContract(contractName);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            for (const [functionName, riskScore] of Object.entries(result.riskScores)) {
              expect(Array.isArray(riskScore.reasons)).toBe(true);
              
              
              if (riskScore.score > 0) {
                expect(riskScore.reasons.length).toBeGreaterThan(0);
                
                
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

            
            const result1 = aiEngine.performFullAnalysis(contract);
            const result2 = aiEngine.performFullAnalysis(contract);

            
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

function generateContract(options: {
  contractName: string;
  functionCount: number;
  hasPayable: boolean;
  hasExternalCalls: boolean;
  hasStateChanges: boolean;
}): string {
  const { contractName, functionCount, hasPayable, hasExternalCalls, hasStateChanges } = options;

  let functions = '';

  
  functions += `
    function getValue() public view returns (uint256) {
      return value;
    }
  `;

  
  if (hasStateChanges) {
    functions += `
    function setValue(uint256 _value) public {
      value = _value;
    }
  `;
  }

  
  if (hasPayable) {
    functions += `
    function deposit() public payable {
      value += msg.value;
    }
  `;
  }

  
  if (hasExternalCalls) {
    functions += `
    function callExternal(address target) public {
      (bool success, ) = target.call("");
      require(success, "Call failed");
    }
  `;
  }

  
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
