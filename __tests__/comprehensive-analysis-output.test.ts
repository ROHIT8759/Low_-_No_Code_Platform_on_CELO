

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
            
            const contract = generateContract(contractName, functionCount, hasParameters);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            expect(result).toBeDefined();
            expect(result).toHaveProperty('riskScores');
            expect(result).toHaveProperty('gasEstimates');
            expect(result).toHaveProperty('uiSuggestions');
            expect(result).toHaveProperty('recommendations');

            
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
            
            const contract = generateContract(contractName, functionCount, true);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            expect(Object.keys(result.riskScores).length).toBeGreaterThan(0);

            
            for (const [functionName, riskScore] of Object.entries(result.riskScores)) {
              expect(riskScore).toHaveProperty('score');
              expect(riskScore).toHaveProperty('level');
              expect(riskScore).toHaveProperty('reasons');

              
              expect(riskScore.score).toBeGreaterThanOrEqual(0);
              expect(riskScore.score).toBeLessThanOrEqual(100);
              expect(typeof riskScore.score).toBe('number');

              
              expect(['low', 'medium', 'high', 'critical']).toContain(riskScore.level);

              
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
            
            const contract = generateContract(contractName, functionCount, true);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            expect(Object.keys(result.gasEstimates).length).toBeGreaterThan(0);

            
            for (const [functionName, gasEstimate] of Object.entries(result.gasEstimates)) {
              expect(typeof gasEstimate).toBe('number');
              expect(gasEstimate).toBeGreaterThan(0);
              expect(Number.isFinite(gasEstimate)).toBe(true);
              
              
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
            
            const contract = generateContractWithParameters(contractName, parameterTypes);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            
            const uiSuggestionKeys = Object.keys(result.uiSuggestions);
            
            if (parameterTypes.length > 0) {
              expect(uiSuggestionKeys.length).toBeGreaterThan(0);

              
              for (const [key, suggestion] of Object.entries(result.uiSuggestions)) {
                expect(suggestion).toHaveProperty('fieldType');
                expect(suggestion).toHaveProperty('validation');
                expect(suggestion).toHaveProperty('placeholder');

                
                expect(typeof suggestion.fieldType).toBe('string');
                expect(suggestion.fieldType.length).toBeGreaterThan(0);

                
                expect(typeof suggestion.validation).toBe('string');

                
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
            
            const contract = generateContractWithFeatures(contractName, {
              hasPayable,
              hasPublicFunctions,
            });

            
            const result = aiEngine.performFullAnalysis(contract);

            
            expect(Array.isArray(result.recommendations)).toBe(true);

            
            for (const recommendation of result.recommendations) {
              expect(recommendation).toHaveProperty('type');
              expect(recommendation).toHaveProperty('severity');
              expect(recommendation).toHaveProperty('message');
              expect(recommendation).toHaveProperty('location');

              
              expect(['security', 'optimization', 'best-practice']).toContain(recommendation.type);

              
              expect(['info', 'warning', 'error']).toContain(recommendation.severity);

              
              expect(typeof recommendation.message).toBe('string');
              expect(recommendation.message.length).toBeGreaterThan(0);

              
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
            
            const contract = generateContract(contractName, functionCount, true);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            expect(result.recommendations.length).toBeGreaterThan(0);

            
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
            
            const contract = generateContract(contractName, functionCount, true);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            let jsonString: string;
            let parsed: any;

            expect(() => {
              jsonString = JSON.stringify(result);
            }).not.toThrow();

            expect(() => {
              parsed = JSON.parse(JSON.stringify(result));
            }).not.toThrow();

            
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
            
            const contract = generateContract(contractName, functionCount, true);

            
            const result1 = aiEngine.performFullAnalysis(contract);
            const result2 = aiEngine.performFullAnalysis(contract);

            
            expect(Object.keys(result1.riskScores).length).toBe(Object.keys(result2.riskScores).length);
            expect(Object.keys(result1.gasEstimates).length).toBe(Object.keys(result2.gasEstimates).length);

            
            for (const key of Object.keys(result1.riskScores)) {
              expect(result1.riskScores[key].score).toBe(result2.riskScores[key].score);
              expect(result1.riskScores[key].level).toBe(result2.riskScores[key].level);
            }

            
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
            
            const contract = generateContractByComplexity(contractName, complexity);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            expect(result).toBeDefined();
            expect(Object.keys(result.riskScores).length).toBeGreaterThan(0);
            expect(Object.keys(result.gasEstimates).length).toBeGreaterThan(0);
            expect(Array.isArray(result.recommendations)).toBe(true);

            
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
            
            const contract = generateHighRiskContract(contractName);

            
            const result = aiEngine.performFullAnalysis(contract);

            
            const highRiskFunctions = Object.entries(result.riskScores).filter(
              ([_, score]) => score.level === 'high' || score.level === 'critical'
            );

            if (highRiskFunctions.length > 0) {
              
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

function generateContract(
  contractName: string,
  functionCount: number,
  hasParameters: boolean
): string {
  let functions = '';

  
  functions += `
    function getValue() public view returns (uint256) {
      return 42;
    }
  `;

  
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
