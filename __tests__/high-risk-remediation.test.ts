

import { AIIntelligenceEngine } from '@/lib/services/ai-engine';
import * as fc from 'fast-check';

describe('Property 17: High-Risk Patterns Trigger Remediation Recommendations', () => {
  let aiEngine: AIIntelligenceEngine;

  beforeEach(() => {
    aiEngine = new AIIntelligenceEngine();
  });

  describe('High-Risk Remediation', () => {
    it('provides remediation recommendations for functions with high risk scores', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            
            const contract = generateHighRiskContract(contractName);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            const highRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, riskScore]) => riskScore.level === 'high' || riskScore.level === 'critical'
            );

            
            if (highRiskFunctions.length > 0) {
              expect(result.recommendations.length).toBeGreaterThan(0);

              
              for (const [functionName, riskScore] of highRiskFunctions) {
                const functionRecommendations = result.recommendations.filter(
                  rec => rec.location === functionName
                );

                
                expect(functionRecommendations.length).toBeGreaterThan(0);

                
                const securityRecs = functionRecommendations.filter(
                  rec => rec.type === 'security'
                );
                expect(securityRecs.length).toBeGreaterThan(0);

                
                const hasRiskMention = functionRecommendations.some(rec =>
                  rec.message.toLowerCase().includes('high') ||
                  rec.message.toLowerCase().includes('critical')
                );
                expect(hasRiskMention).toBe(true);
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('provides remediation recommendations for functions with critical risk scores', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            
            const contract = generateCriticalRiskContract(contractName);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            const criticalRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, riskScore]) => riskScore.level === 'critical'
            );

            
            if (criticalRiskFunctions.length > 0) {
              const errorRecommendations = result.recommendations.filter(
                rec => rec.severity === 'error'
              );
              expect(errorRecommendations.length).toBeGreaterThan(0);

              
              for (const [functionName, _] of criticalRiskFunctions) {
                const functionErrorRecs = result.recommendations.filter(
                  rec => rec.location === functionName && rec.severity === 'error'
                );
                expect(functionErrorRecs.length).toBeGreaterThan(0);
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('includes specific risk reasons in remediation recommendations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contractName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
            riskPattern: fc.constantFrom('delegatecall', 'externalCall', 'payable', 'reentrancy'),
          }),
          async ({ contractName, riskPattern }) => {
            
            const contract = generateContractWithPattern(contractName, riskPattern);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            const highRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, riskScore]) => riskScore.level === 'high' || riskScore.level === 'critical'
            );

            if (highRiskFunctions.length > 0) {
              
              for (const [functionName, riskScore] of highRiskFunctions) {
                const functionRecommendations = result.recommendations.filter(
                  rec => rec.location === functionName && rec.type === 'security'
                );

                if (functionRecommendations.length > 0) {
                  
                  const hasReasonMention = functionRecommendations.some(rec => {
                    const message = rec.message.toLowerCase();
                    return riskScore.reasons.some(reason =>
                      message.includes(reason.toLowerCase().split(' ')[0])
                    );
                  });
                  expect(hasReasonMention).toBe(true);
                }
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('does not provide high-risk remediation for low-risk functions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            
            const contract = generateLowRiskContract(contractName);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            const lowRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, riskScore]) => riskScore.level === 'low'
            );

            
            for (const [functionName, _] of lowRiskFunctions) {
              const errorSecurityRecs = result.recommendations.filter(
                rec =>
                  rec.location === functionName &&
                  rec.type === 'security' &&
                  rec.severity === 'error'
              );
              expect(errorSecurityRecs.length).toBe(0);
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it('provides remediation recommendations with appropriate severity levels', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            
            const contract = generateMixedRiskContract(contractName);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            for (const [functionName, riskScore] of Object.entries(result.riskScores)) {
              const functionSecurityRecs = result.recommendations.filter(
                rec => rec.location === functionName && rec.type === 'security'
              );

              if (functionSecurityRecs.length > 0) {
                if (riskScore.level === 'critical') {
                  
                  const hasError = functionSecurityRecs.some(rec => rec.severity === 'error');
                  expect(hasError).toBe(true);
                } else if (riskScore.level === 'high') {
                  
                  const hasWarningOrError = functionSecurityRecs.some(
                    rec => rec.severity === 'warning' || rec.severity === 'error'
                  );
                  expect(hasWarningOrError).toBe(true);
                }
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('provides actionable remediation messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            
            const contract = generateHighRiskContract(contractName);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            const highRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, riskScore]) => riskScore.level === 'high' || riskScore.level === 'critical'
            );

            if (highRiskFunctions.length > 0) {
              for (const [functionName, _] of highRiskFunctions) {
                const functionSecurityRecs = result.recommendations.filter(
                  rec => rec.location === functionName && rec.type === 'security'
                );

                
                for (const rec of functionSecurityRecs) {
                  expect(rec.message).toBeTruthy();
                  expect(rec.message.length).toBeGreaterThan(10);
                  expect(typeof rec.message).toBe('string');
                }
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('provides remediation for multiple high-risk functions in the same contract', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            
            const contract = generateMultipleHighRiskContract(contractName);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            const highRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, riskScore]) => riskScore.level === 'high' || riskScore.level === 'critical'
            );

            
            if (highRiskFunctions.length >= 2) {
              
              for (const [functionName, _] of highRiskFunctions) {
                const functionSecurityRecs = result.recommendations.filter(
                  rec => rec.location === functionName && rec.type === 'security'
                );
                expect(functionSecurityRecs.length).toBeGreaterThan(0);
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('includes location information in remediation recommendations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            
            const contract = generateHighRiskContract(contractName);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            for (const rec of result.recommendations) {
              expect(rec.location).toBeTruthy();
              expect(typeof rec.location).toBe('string');
              expect(rec.location.length).toBeGreaterThan(0);
            }

            
            const highRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, riskScore]) => riskScore.level === 'high' || riskScore.level === 'critical'
            );

            if (highRiskFunctions.length > 0) {
              const securityRecs = result.recommendations.filter(rec => rec.type === 'security');
              
              for (const rec of securityRecs) {
                
                const matchesFunction = highRiskFunctions.some(([funcName, _]) =>
                  rec.location === funcName
                );
                
                if (rec.severity === 'error' || rec.severity === 'warning') {
                  expect(matchesFunction).toBe(true);
                }
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});

function generateHighRiskContract(contractName: string): string {
  return `
    pragma solidity ^0.8.0;
    
    contract ${contractName} {
      uint256 public balance;
      
      function dangerousFunction(address target, bytes memory data) public payable {
        balance += msg.value;
        (bool success, ) = target.call(data);
        require(success, "Call failed");
      }
    }
  `;
}

function generateCriticalRiskContract(contractName: string): string {
  return `
    pragma solidity ^0.8.0;
    
    contract ${contractName} {
      uint256 public balance;
      
      function criticalFunction(address target, bytes memory data) public payable {
        balance += msg.value;
        (bool success, ) = target.delegatecall(data);
        require(success, "Delegatecall failed");
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
      
      function calculateSum(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
      }
    }
  `;
}

function generateContractWithPattern(contractName: string, pattern: string): string {
  switch (pattern) {
    case 'delegatecall':
      return `
        pragma solidity ^0.8.0;
        
        contract ${contractName} {
          function delegateCall(address target) public {
            (bool success, ) = target.delegatecall("");
            require(success);
          }
        }
      `;
    case 'externalCall':
      return `
        pragma solidity ^0.8.0;
        
        contract ${contractName} {
          function externalCall(address target) public {
            (bool success, ) = target.call("");
            require(success);
          }
        }
      `;
    case 'payable':
      return `
        pragma solidity ^0.8.0;
        
        contract ${contractName} {
          uint256 public balance;
          
          function deposit() public payable {
            balance += msg.value;
          }
        }
      `;
    case 'reentrancy':
      return `
        pragma solidity ^0.8.0;
        
        contract ${contractName} {
          mapping(address => uint256) public balances;
          
          function withdraw() public {
            uint256 amount = balances[msg.sender];
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success);
            balances[msg.sender] = 0;
          }
        }
      `;
    default:
      return generateHighRiskContract(contractName);
  }
}

function generateMixedRiskContract(contractName: string): string {
  return `
    pragma solidity ^0.8.0;
    
    contract ${contractName} {
      uint256 public value;
      
      // Low risk - view function
      function getValue() public view returns (uint256) {
        return value;
      }
      
      // Medium risk - state-changing function
      function setValue(uint256 _value) public {
        value = _value;
      }
      
      // High risk - external call
      function callExternal(address target) public {
        (bool success, ) = target.call("");
        require(success);
      }
      
      // Critical risk - delegatecall
      function delegateCall(address target) public {
        (bool success, ) = target.delegatecall("");
        require(success);
      }
    }
  `;
}

function generateMultipleHighRiskContract(contractName: string): string {
  return `
    pragma solidity ^0.8.0;
    
    contract ${contractName} {
      uint256 public balance;
      
      function riskyFunction1(address target) public payable {
        balance += msg.value;
        (bool success, ) = target.call("");
        require(success);
      }
      
      function riskyFunction2(address target, bytes memory data) public {
        (bool success, ) = target.delegatecall(data);
        require(success);
      }
      
      function riskyFunction3(address target) public payable {
        (bool success, ) = target.call{value: msg.value}("");
        require(success);
      }
    }
  `;
}
