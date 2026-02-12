/**
 * Property-Based Tests for Comprehensive Analysis Output
 * Feature: stellar-backend-infrastructure
 * Property 16: Contract Analysis Provides Comprehensive Output
 * 
 * **Validates: Requirements 5.3, 5.4, 5.5, 5.6, 5.7**
 * 
 * Tests that for any contract analysis, the response includes risk scores,
 * gas estimates, UI field suggestions, error handling recommendations, and
 * frontend integration suggestions in structured JSON format.
 */

import { AIIntelligenceEngine } from '@/lib/services/ai-engine';
import * as fc from 'fast-check';

describe('Property 16: Contract Analysis Provides Comprehensive Output', () => {
  let aiEngine: AIIntelligenceEngine;

  beforeEach(() => {
    aiEngine = new AIIntelligenceEngine();
  });

  describe('Comprehensive Analysis Output Structure', () => {
    it('analysis result contains all required top-level fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contractName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
            functionCount: fc.integer({ min: 1, max: 4 }),
            hasParameters: fc.boolean(),
          }),
          async ({ contractName, functionCount, hasParameters }) => {
            // Generate a valid contract
            const contract = generateContract(contractName, functionCount, hasParameters);

            // Perform full analysis
            const result = aiEngine.performFullAnalysis(contract);

            // Property: Analysis result must have all required top-level fields
            expect(result).toBeDefined();
            expect(result).toHaveProperty('riskScores');
            expect(result).toHaveProperty('gasEstimates');
            expect(result).toHaveProperty('uiSuggestions');
            expect(result).toHaveProperty('recommendations');

            // Verify types
            expect(typeof result.riskScores).toBe('object');
            expect(typeof result.gasEstimates).toBe('object');
            expect(typeof result.uiSuggestions).toBe('object');
            expect(Array.isArray(result.recommendations)).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('analysis includes risk scores for all functions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contractName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
            functionCount: fc.integer({ min: 1, max: 5 }),
          }),
          async ({ contractName, functionCount }) => {
            // Generate contract with multiple functions
            const contract = generateContract(contractName, functionCount, true);

            // Perform analysis
            const result = aiEngine.performFullAnalysis(contract);

            // Property: Risk scores must be provided for functions
            expect(Object.keys(result.riskScores).length).toBeGreaterThan(0);

            // Each risk score must have required structure
            for (const [functionName, riskScore] of Object.entries(result.riskScores)) {
              expect(riskScore).toHaveProperty('score');
              expect(riskScore).toHaveProperty('level');
              expect(riskScore).toHaveProperty('reasons');

              // Validate score range (0-100)
              expect(riskScore.score).toBeGreaterThanOrEqual(0);
              expect(riskScore.score).toBeLessThanOrEqual(100);
              expect(typeof riskScore.score).toBe('number');

              // Validate level
              expect(['low', 'medium', 'high', 'critical']).toContain(riskScore.level);

              // Validate reasons array
              expect(Array.isArray(riskScore.reasons)).toBe(true);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('analysis includes gas estimates for all functions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contractName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
            functionCount: fc.integer({ min: 1, max: 5 }),
          }),
          async ({ contractName, functionCount }) => {
            // Generate contract
            const contract = generateContract(contractName, functionCount, true);

            // Perform analysis
            const result = aiEngine.performFullAnalysis(contract);

            // Property: Gas estimates must be provided for functions
            expect(Object.keys(result.gasEstimates).length).toBeGreaterThan(0);

            // Each gas estimate must be a positive number
            for (const [functionName, gasEstimate] of Object.entries(result.gasEstimates)) {
              expect(typeof gasEstimate).toBe('number');
              expect(gasEstimate).toBeGreaterThan(0);
              expect(Number.isFinite(gasEstimate)).toBe(true);
              
              // Gas estimates should be reasonable (at least base transaction cost)
              expect(gasEstimate).toBeGreaterThanOrEqual(21000);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('analysis includes UI field suggestions for function parameters', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contractName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
            parameterTypes: fc.array(
              fc.constantFrom('address', 'uint256', 'string', 'bool', 'bytes32'),
              { minLength: 1, maxLength: 3 }
            ),
          }),
          async ({ contractName, parameterTypes }) => {
            // Generate contract with parameters
            const contract = generateContractWithParameters(contractName, parameterTypes);

            // Perform analysis
            const result = aiEngine.performFullAnalysis(contract);

            // Property: UI suggestions must be provided for parameters
            // Note: UI suggestions are keyed by functionName.parameterName
            const uiSuggestionKeys = Object.keys(result.uiSuggestions);
            
            if (parameterTypes.length > 0) {
              expect(uiSuggestionKeys.length).toBeGreaterThan(0);

              // Each UI suggestion must have required structure
              for (const [key, suggestion] of Object.entries(result.uiSuggestions)) {
                expect(suggestion).toHaveProperty('fieldType');
                expect(suggestion).toHaveProperty('validation');
                expect(suggestion).toHaveProperty('placeholder');

                // Validate field types
                expect(typeof suggestion.fieldType).toBe('string');
                expect(suggestion.fieldType.length).toBeGreaterThan(0);

                // Validate validation (can be empty string)
                expect(typeof suggestion.validation).toBe('string');

                // Validate placeholder (can be empty string)
                expect(typeof suggestion.placeholder).toBe('string');
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('analysis includes error handling recommendations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contractName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
            hasPayable: fc.boolean(),
            hasPublicFunctions: fc.boolean(),
          }),
          async ({ contractName, hasPayable, hasPublicFunctions }) => {
            // Generate contract
            const contract = generateContractWithFeatures(contractName, {
              hasPayable,
              hasPublicFunctions,
            });

            // Perform analysis
            const result = aiEngine.performFullAnalysis(contract);

            // Property: Recommendations array must exist
            expect(Array.isArray(result.recommendations)).toBe(true);

            // Each recommendation must have required structure
            for (const recommendation of result.recommendations) {
              expect(recommendation).toHaveProperty('type');
              expect(recommendation).toHaveProperty('severity');
              expect(recommendation).toHaveProperty('message');
              expect(recommendation).toHaveProperty('location');

              // Validate type
              expect(['security', 'optimization', 'best-practice']).toContain(recommendation.type);

              // Validate severity
              expect(['info', 'warning', 'error']).toContain(recommendation.severity);

              // Validate message
              expect(typeof recommendation.message).toBe('string');
              expect(recommendation.message.length).toBeGreaterThan(0);

              // Validate location
              expect(typeof recommendation.location).toBe('string');
              expect(recommendation.location.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('analysis includes frontend integration suggestions in recommendations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contractName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
            functionCount: fc.integer({ min: 1, max: 3 }),
          }),
          async ({ contractName, functionCount }) => {
            // Generate contract
            const contract = generateContract(contractName, functionCount, true);

            // Perform analysis
            const result = aiEngine.performFullAnalysis(contract);

            // Property: Recommendations should include frontend integration suggestions
            expect(result.recommendations.length).toBeGreaterThan(0);

            // Check that some recommendations are best-practice type (frontend suggestions)
            const bestPracticeRecommendations = result.recommendations.filter(
              r => r.type === 'best-practice'
            );
            expect(bestPracticeRecommendations.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('analysis output is valid JSON-serializable', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contractName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
            functionCount: fc.integer({ min: 1, max: 3 }),
          }),
          async ({ contractName, functionCount }) => {
            // Generate contract
            const contract = generateContract(contractName, functionCount, true);

            // Perform analysis
            const result = aiEngine.performFullAnalysis(contract);

            // Property: Result must be JSON-serializable
            let jsonString: string;
            let parsed: any;

            expect(() => {
              jsonString = JSON.stringify(result);
            }).not.toThrow();

            expect(() => {
              parsed = JSON.parse(JSON.stringify(result));
            }).not.toThrow();

            // Verify structure is preserved after serialization
            expect(parsed).toHaveProperty('riskScores');
            expect(parsed).toHaveProperty('gasEstimates');
            expect(parsed).toHaveProperty('uiSuggestions');
            expect(parsed).toHaveProperty('recommendations');
          }
        ),
        { numRuns: 20 }
      );
    });

    it('analysis provides consistent output for identical contracts', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contractName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
            functionCount: fc.integer({ min: 1, max: 3 }),
          }),
          async ({ contractName, functionCount }) => {
            // Generate contract
            const contract = generateContract(contractName, functionCount, true);

            // Perform analysis twice
            const result1 = aiEngine.performFullAnalysis(contract);
            const result2 = aiEngine.performFullAnalysis(contract);

            // Property: Same contract should produce identical analysis
            expect(Object.keys(result1.riskScores).length).toBe(Object.keys(result2.riskScores).length);
            expect(Object.keys(result1.gasEstimates).length).toBe(Object.keys(result2.gasEstimates).length);

            // Risk scores should be identical
            for (const key of Object.keys(result1.riskScores)) {
              expect(result1.riskScores[key].score).toBe(result2.riskScores[key].score);
              expect(result1.riskScores[key].level).toBe(result2.riskScores[key].level);
            }

            // Gas estimates should be identical
            for (const key of Object.keys(result1.gasEstimates)) {
              expect(result1.gasEstimates[key]).toBe(result2.gasEstimates[key]);
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it('analysis handles contracts with varying complexity levels', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contractName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
            complexity: fc.constantFrom('simple', 'medium', 'complex'),
          }),
          async ({ contractName, complexity }) => {
            // Generate contract with different complexity
            const contract = generateContractByComplexity(contractName, complexity);

            // Perform analysis
            const result = aiEngine.performFullAnalysis(contract);

            // Property: Analysis should work for all complexity levels
            expect(result).toBeDefined();
            expect(Object.keys(result.riskScores).length).toBeGreaterThan(0);
            expect(Object.keys(result.gasEstimates).length).toBeGreaterThan(0);
            expect(Array.isArray(result.recommendations)).toBe(true);

            // More complex contracts should generally have more recommendations
            if (complexity === 'complex') {
              expect(result.recommendations.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('analysis correlates risk scores with recommendations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/),
          async (contractName) => {
            // Generate high-risk contract
            const contract = generateHighRiskContract(contractName);

            // Perform analysis
            const result = aiEngine.performFullAnalysis(contract);

            // Property: High-risk functions should generate security recommendations
            const highRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, score]) => score.level === 'high' || score.level === 'critical'
            );

            if (highRiskFunctions.length > 0) {
              // Should have security recommendations
              const securityRecommendations = result.recommendations.filter(
                r => r.type === 'security'
              );
              expect(securityRecommendations.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});

/**
 * Helper function to generate a basic contract
 */
function generateContract(
  contractName: string,
  functionCount: number,
  hasParameters: boolean
): string {
  let functions = '';

  // Add view function
  functions += `
    function getValue() public view returns (uint256) {
      return 42;
    }
  `;

  // Add state-changing functions
  for (let i = 1; i < functionCount; i++) {
    if (hasParameters) {
      functions += `
    function setFunc${i}(uint256 value) public {
      // State change
    }
  `;
    } else {
      functions += `
    function func${i}() public {
      // State change
    }
  `;
    }
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
 * Helper function to generate contract with specific parameter types
 */
function generateContractWithParameters(
  contractName: string,
  parameterTypes: string[]
): string {
  const params = parameterTypes.map((type, i) => `${type} param${i}`).join(', ');

  return `
    pragma solidity ^0.8.0;
    
    contract ${contractName} {
      function testFunction(${params}) public {
        // Function with parameters
      }
    }
  `;
}

/**
 * Helper function to generate contract with specific features
 */
function generateContractWithFeatures(
  contractName: string,
  features: { hasPayable: boolean; hasPublicFunctions: boolean }
): string {
  let functions = '';

  if (features.hasPayable) {
    functions += `
    function deposit() public payable {
      // Payable function
    }
  `;
  }

  if (features.hasPublicFunctions) {
    functions += `
    function publicFunction() public {
      // Public function without access control
    }
  `;
  }

  // Always add at least one function
  if (!functions) {
    functions = `
    function defaultFunction() public view returns (uint256) {
      return 1;
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
 * Helper function to generate contract by complexity level
 */
function generateContractByComplexity(
  contractName: string,
  complexity: 'simple' | 'medium' | 'complex'
): string {
  if (complexity === 'simple') {
    return `
      pragma solidity ^0.8.0;
      
      contract ${contractName} {
        uint256 public value;
        
        function getValue() public view returns (uint256) {
          return value;
        }
      }
    `;
  } else if (complexity === 'medium') {
    return `
      pragma solidity ^0.8.0;
      
      contract ${contractName} {
        uint256 public value;
        
        function getValue() public view returns (uint256) {
          return value;
        }
        
        function setValue(uint256 _value) public {
          value = _value;
        }
        
        function increment() public {
          value += 1;
        }
      }
    `;
  } else {
    // complex
    return `
      pragma solidity ^0.8.0;
      
      contract ${contractName} {
        uint256 public value;
        mapping(address => uint256) public balances;
        
        function getValue() public view returns (uint256) {
          return value;
        }
        
        function setValue(uint256 _value) public {
          value = _value;
        }
        
        function deposit() public payable {
          balances[msg.sender] += msg.value;
        }
        
        function withdraw(uint256 amount) public {
          require(balances[msg.sender] >= amount, "Insufficient balance");
          (bool success, ) = msg.sender.call{value: amount}("");
          require(success, "Transfer failed");
          balances[msg.sender] -= amount;
        }
      }
    `;
  }
}

/**
 * Helper function to generate high-risk contract
 */
function generateHighRiskContract(contractName: string): string {
  return `
    pragma solidity ^0.8.0;
    
    contract ${contractName} {
      function dangerousFunction(address target, bytes memory data) public payable {
        (bool success, ) = target.delegatecall(data);
        require(success, "Call failed");
      }
      
      function unsafeWithdraw(address payable recipient, uint256 amount) public {
        (bool success, ) = recipient.call{value: amount}("");
        require(success);
      }
    }
  `;
}
