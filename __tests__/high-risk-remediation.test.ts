/**
 * Property-Based Tests for High-Risk Remediation
 * Feature: stellar-backend-infrastructure
 * Property 17: High-Risk Patterns Trigger Remediation Recommendations
 * 
 * **Validates: Requirements 5.8**
 * 
 * Tests that for any contract analysis that detects functions with high or critical
 * risk scores, the AI_Intelligence_Engine provides specific remediation recommendations
 * for those functions.
 */

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
            // Generate a contract with high-risk patterns
            const contract = generateHighRiskContract(contractName);

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // Find functions with high risk scores
            const highRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, riskScore]) => riskScore.level === 'high' || riskScore.level === 'critical'
            );

            // If there are high-risk functions, there should be recommendations
            if (highRiskFunctions.length > 0) {
              expect(result.recommendations.length).toBeGreaterThan(0);

              // Check that recommendations exist for high-risk functions
              for (const [functionName, riskScore] of highRiskFunctions) {
                const functionRecommendations = result.recommendations.filter(
                  rec => rec.location === functionName
                );

                // Should have at least one recommendation for this high-risk function
                expect(functionRecommendations.length).toBeGreaterThan(0);

                // Recommendations should be security-related
                const securityRecs = functionRecommendations.filter(
                  rec => rec.type === 'security'
                );
                expect(securityRecs.length).toBeGreaterThan(0);

                // Recommendations should mention the risk level
                const hasRiskMention = functionRecommendations.some(rec =>
                  rec.message.toLowerCase().includes('high') ||
                  rec.message.toLowerCase().includes('critical')
                );
                expect(hasRiskMention).toBe(true);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('provides remediation recommendations for functions with critical risk scores', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            // Generate a contract with critical-risk patterns (delegatecall + payable + no access control)
            const contract = generateCriticalRiskContract(contractName);

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // Find functions with critical risk scores
            const criticalRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, riskScore]) => riskScore.level === 'critical'
            );

            // If there are critical-risk functions, there should be error-level recommendations
            if (criticalRiskFunctions.length > 0) {
              const errorRecommendations = result.recommendations.filter(
                rec => rec.severity === 'error'
              );
              expect(errorRecommendations.length).toBeGreaterThan(0);

              // Check that critical functions have error-level recommendations
              for (const [functionName, _] of criticalRiskFunctions) {
                const functionErrorRecs = result.recommendations.filter(
                  rec => rec.location === functionName && rec.severity === 'error'
                );
                expect(functionErrorRecs.length).toBeGreaterThan(0);
              }
            }
          }
        ),
        { numRuns: 100 }
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
            // Generate contract with specific risk pattern
            const contract = generateContractWithPattern(contractName, riskPattern);

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // Find high or critical risk functions
            const highRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, riskScore]) => riskScore.level === 'high' || riskScore.level === 'critical'
            );

            if (highRiskFunctions.length > 0) {
              // Recommendations should include the risk reasons
              for (const [functionName, riskScore] of highRiskFunctions) {
                const functionRecommendations = result.recommendations.filter(
                  rec => rec.location === functionName && rec.type === 'security'
                );

                if (functionRecommendations.length > 0) {
                  // At least one recommendation should mention the risk reasons
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
        { numRuns: 100 }
      );
    });

    it('does not provide high-risk remediation for low-risk functions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            // Generate a low-risk contract (view functions only)
            const contract = generateLowRiskContract(contractName);

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // Find low-risk functions
            const lowRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, riskScore]) => riskScore.level === 'low'
            );

            // Low-risk functions should not have error-level security recommendations
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
        { numRuns: 50 }
      );
    });

    it('provides remediation recommendations with appropriate severity levels', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            // Generate contract with mixed risk levels
            const contract = generateMixedRiskContract(contractName);

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // Check severity alignment with risk levels
            for (const [functionName, riskScore] of Object.entries(result.riskScores)) {
              const functionSecurityRecs = result.recommendations.filter(
                rec => rec.location === functionName && rec.type === 'security'
              );

              if (functionSecurityRecs.length > 0) {
                if (riskScore.level === 'critical') {
                  // Critical risk should have error severity
                  const hasError = functionSecurityRecs.some(rec => rec.severity === 'error');
                  expect(hasError).toBe(true);
                } else if (riskScore.level === 'high') {
                  // High risk should have warning or error severity
                  const hasWarningOrError = functionSecurityRecs.some(
                    rec => rec.severity === 'warning' || rec.severity === 'error'
                  );
                  expect(hasWarningOrError).toBe(true);
                }
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('provides actionable remediation messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            // Generate high-risk contract
            const contract = generateHighRiskContract(contractName);

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // Find high or critical risk functions
            const highRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, riskScore]) => riskScore.level === 'high' || riskScore.level === 'critical'
            );

            if (highRiskFunctions.length > 0) {
              for (const [functionName, _] of highRiskFunctions) {
                const functionSecurityRecs = result.recommendations.filter(
                  rec => rec.location === functionName && rec.type === 'security'
                );

                // Each recommendation should have a non-empty message
                for (const rec of functionSecurityRecs) {
                  expect(rec.message).toBeTruthy();
                  expect(rec.message.length).toBeGreaterThan(10);
                  expect(typeof rec.message).toBe('string');
                }
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('provides remediation for multiple high-risk functions in the same contract', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            // Generate contract with multiple high-risk functions
            const contract = generateMultipleHighRiskContract(contractName);

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // Find all high or critical risk functions
            const highRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, riskScore]) => riskScore.level === 'high' || riskScore.level === 'critical'
            );

            // If there are multiple high-risk functions
            if (highRiskFunctions.length >= 2) {
              // Each should have its own recommendations
              for (const [functionName, _] of highRiskFunctions) {
                const functionSecurityRecs = result.recommendations.filter(
                  rec => rec.location === functionName && rec.type === 'security'
                );
                expect(functionSecurityRecs.length).toBeGreaterThan(0);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('includes location information in remediation recommendations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            // Generate high-risk contract
            const contract = generateHighRiskContract(contractName);

            // Analyze the contract
            const result = aiEngine.performFullAnalysis(contract);

            // All recommendations should have location information
            for (const rec of result.recommendations) {
              expect(rec.location).toBeTruthy();
              expect(typeof rec.location).toBe('string');
              expect(rec.location.length).toBeGreaterThan(0);
            }

            // High-risk security recommendations should point to specific functions
            const highRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, riskScore]) => riskScore.level === 'high' || riskScore.level === 'critical'
            );

            if (highRiskFunctions.length > 0) {
              const securityRecs = result.recommendations.filter(rec => rec.type === 'security');
              
              for (const rec of securityRecs) {
                // Location should match a function name pattern
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
        { numRuns: 100 }
      );
    });
  });
});

/**
 * Helper function to generate a high-risk contract
 */
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

/**
 * Helper function to generate a critical-risk contract
 */
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
      
      function calculateSum(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
      }
    }
  `;
}

/**
 * Helper function to generate a contract with a specific risk pattern
 */
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

/**
 * Helper function to generate a contract with mixed risk levels
 */
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

/**
 * Helper function to generate a contract with multiple high-risk functions
 */
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
