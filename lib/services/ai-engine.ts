/**
 * AI Intelligence Engine
 * 
 * Provides contract analysis capabilities including:
 * - AST parsing for Solidity contracts
 * - Function signature extraction
 * - Risk scoring (to be implemented)
 * - Gas estimation (to be implemented)
 * - UI field inference (to be implemented)
 */

import * as parser from '@solidity-parser/parser';
import { createHash } from 'crypto';
import { cache, CacheKeys, CacheTTL } from '../cache';

/**
 * Represents a parsed function from a smart contract
 */
export interface FunctionSignature {
  name: string;
  visibility: string;
  stateMutability: string | null;
  parameters: Parameter[];
  returnParameters: Parameter[];
  modifiers: string[];
  isConstructor: boolean;
  isReceive: boolean;
  isFallback: boolean;
}

/**
 * Represents a function parameter
 */
export interface Parameter {
  name: string;
  type: string;
  storageLocation?: string;
}

/**
 * Represents the parsed AST of a contract
 */
export interface ContractAST {
  contractName: string;
  functions: FunctionSignature[];
  stateVariables: StateVariable[];
  events: EventDefinition[];
}

/**
 * Represents a state variable
 */
export interface StateVariable {
  name: string;
  type: string;
  visibility: string;
  isConstant: boolean;
  isImmutable: boolean;
}

/**
 * Represents an event definition
 */
export interface EventDefinition {
  name: string;
  parameters: Parameter[];
}

/**
 * Risk level categories
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Risk score result for a function
 */
export interface RiskScore {
  score: number;
  level: RiskLevel;
  reasons: string[];
}

/**
 * UI field suggestion for a parameter
 */
export interface UIFieldSuggestion {
  fieldType: string;
  validation: string;
  placeholder: string;
}

/**
 * Error handling recommendation
 */
export interface ErrorHandlingRecommendation {
  location: string;
  issue: string;
  suggestion: string;
  severity: 'info' | 'warning' | 'error';
}

/**
 * Frontend integration suggestion
 */
export interface FrontendIntegrationSuggestion {
  functionName: string;
  description: string;
  codeSnippet: string;
  web3Pattern: string;
}

/**
 * AI Intelligence Engine for smart contract analysis
 */
export class AIIntelligenceEngine {
  /**
   * Parse Solidity contract code and extract AST
   * @param code Solidity source code
   * @returns Parsed AST
   */
  parseContract(code: string): any {
    try {
      const ast = parser.parse(code, {
        loc: false,
        range: false,
        tolerant: true,
      });
      return ast;
    } catch (error) {
      throw new Error(`Failed to parse contract: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract all contracts from the AST
   * @param ast Parsed AST
   * @returns Array of contract ASTs
   */
  extractContracts(ast: any): ContractAST[] {
    const contracts: ContractAST[] = [];

    parser.visit(ast, {
      ContractDefinition: (node: any) => {
        const contractAST: ContractAST = {
          contractName: node.name,
          functions: [],
          stateVariables: [],
          events: [],
        };

        // Extract functions
        if (node.subNodes) {
          for (const subNode of node.subNodes) {
            if (subNode.type === 'FunctionDefinition') {
              contractAST.functions.push(this.extractFunctionSignature(subNode));
            } else if (subNode.type === 'StateVariableDeclaration') {
              contractAST.stateVariables.push(...this.extractStateVariables(subNode));
            } else if (subNode.type === 'EventDefinition') {
              contractAST.events.push(this.extractEventDefinition(subNode));
            }
          }
        }

        contracts.push(contractAST);
      },
    });

    return contracts;
  }

  /**
   * Extract function signature from AST node
   * @param node Function definition node
   * @returns Function signature
   */
  private extractFunctionSignature(node: any): FunctionSignature {
    const signature: FunctionSignature = {
      name: node.name || '',
      visibility: node.visibility || 'public',
      stateMutability: node.stateMutability || null,
      parameters: [],
      returnParameters: [],
      modifiers: [],
      isConstructor: node.isConstructor || false,
      isReceive: node.isReceiveEther || false,
      isFallback: node.isFallback || false,
    };

    // Extract parameters
    if (node.parameters) {
      signature.parameters = node.parameters.map((param: any) => this.extractParameter(param));
    }

    // Extract return parameters
    if (node.returnParameters) {
      signature.returnParameters = node.returnParameters.map((param: any) => this.extractParameter(param));
    }

    // Extract modifiers
    if (node.modifiers) {
      signature.modifiers = node.modifiers.map((mod: any) => mod.name);
    }

    return signature;
  }

  /**
   * Extract parameter information from AST node
   * @param node Parameter node
   * @returns Parameter information
   */
  private extractParameter(node: any): Parameter {
    return {
      name: node.name || '',
      type: this.extractTypeName(node.typeName),
      storageLocation: node.storageLocation || undefined,
    };
  }

  /**
   * Extract type name from type node
   * @param typeNode Type node
   * @returns Type name as string
   */
  private extractTypeName(typeNode: any): string {
    if (!typeNode) return 'unknown';

    switch (typeNode.type) {
      case 'ElementaryTypeName':
        return typeNode.name;
      case 'UserDefinedTypeName':
        return typeNode.namePath;
      case 'ArrayTypeName':
        return `${this.extractTypeName(typeNode.baseTypeName)}[]`;
      case 'Mapping':
        return `mapping(${this.extractTypeName(typeNode.keyType)} => ${this.extractTypeName(typeNode.valueType)})`;
      default:
        return 'unknown';
    }
  }

  /**
   * Extract state variables from state variable declaration node
   * @param node State variable declaration node
   * @returns Array of state variables
   */
  private extractStateVariables(node: any): StateVariable[] {
    const variables: StateVariable[] = [];

    if (node.variables) {
      for (const variable of node.variables) {
        variables.push({
          name: variable.name,
          type: this.extractTypeName(variable.typeName),
          visibility: variable.visibility || 'internal',
          isConstant: variable.isDeclaredConst || false,
          isImmutable: variable.isImmutable || false,
        });
      }
    }

    return variables;
  }

  /**
   * Extract event definition from AST node
   * @param node Event definition node
   * @returns Event definition
   */
  private extractEventDefinition(node: any): EventDefinition {
    return {
      name: node.name,
      parameters: node.parameters ? node.parameters.map((param: any) => this.extractParameter(param)) : [],
    };
  }

  /**
   * Analyze a Solidity contract and extract all information
   * @param code Solidity source code
   * @returns Array of contract ASTs with all extracted information
   */
  analyzeContract(code: string): ContractAST[] {
    const ast = this.parseContract(code);
    return this.extractContracts(ast);
  }

  /**
   * Extract function signatures from Solidity code
   * @param code Solidity source code
   * @returns Array of function signatures from all contracts
   */
  extractFunctionSignatures(code: string): FunctionSignature[] {
    const contracts = this.analyzeContract(code);
    const allFunctions: FunctionSignature[] = [];

    for (const contract of contracts) {
      allFunctions.push(...contract.functions);
    }

    return allFunctions;
  }

  /**
   * Get a summary of the contract structure
   * @param code Solidity source code
   * @returns Summary object with counts and lists
   */
  getContractSummary(code: string): {
    contractCount: number;
    functionCount: number;
    stateVariableCount: number;
    eventCount: number;
    contracts: Array<{
      name: string;
      functionCount: number;
      stateVariableCount: number;
      eventCount: number;
    }>;
  } {
    const contracts = this.analyzeContract(code);

    return {
      contractCount: contracts.length,
      functionCount: contracts.reduce((sum, c) => sum + c.functions.length, 0),
      stateVariableCount: contracts.reduce((sum, c) => sum + c.stateVariables.length, 0),
      eventCount: contracts.reduce((sum, c) => sum + c.events.length, 0),
      contracts: contracts.map(c => ({
        name: c.contractName,
        functionCount: c.functions.length,
        stateVariableCount: c.stateVariables.length,
        eventCount: c.events.length,
      })),
    };
  }

  /**
   * Score a function based on risk patterns
   * @param functionAST Function AST node from the parser
   * @returns Risk score with level and reasons
   */
  scoreFunction(functionAST: any): RiskScore {
    let score = 0;
    const reasons: string[] = [];

    // Base score based on state mutability
    const stateMutability = functionAST.stateMutability;
    const isPayable = stateMutability === 'payable';
    
    if (stateMutability === 'view' || stateMutability === 'pure') {
      // Read-only function: 0
      score = 0;
    } else if (isPayable) {
      // Payable function: 40
      score = 40;
      reasons.push('Payable function handles value transfers');
    } else {
      // State-modifying function: 20
      score = 20;
      reasons.push('Function modifies contract state');
    }

    // Analyze function body for risk patterns
    if (functionAST.body) {
      score = this.analyzeFunctionBody(functionAST.body, score, reasons);
    }

    // Check for missing access control on state-changing functions
    if (score > 0 && !this.hasAccessControl(functionAST)) {
      score += 25;
      reasons.push('No access control detected on state-changing function');
    }

    // Calculate final score (cap at 100)
    const finalScore = Math.min(score, 100);

    // Determine risk level
    const level = this.categorizeRiskScore(finalScore);

    return {
      score: finalScore,
      level,
      reasons,
    };
  }

  /**
   * Analyze function body for risk patterns
   * @param body Function body AST node
   * @param score Current score (modified by reference through reasons array tracking)
   * @param reasons Array of risk reasons (modified in place)
   * @returns Updated score
   */
  private analyzeFunctionBody(body: any, baseScore: number, reasons: string[]): number {
    let additionalScore = 0;
    const detectedPatterns = new Set<string>();

    // Traverse the function body to detect patterns
    const traverse = (node: any) => {
      if (!node) return;

      // Detect external calls
      if (node.type === 'FunctionCall') {
        const expression = node.expression;
        
        // Check for external calls (address.call, address.delegatecall, etc.)
        if (expression?.type === 'MemberAccess') {
          const memberName = expression.memberName;
          
          if (memberName === 'delegatecall' && !detectedPatterns.has('delegatecall')) {
            additionalScore += 50;
            reasons.push('Uses delegatecall which can be dangerous');
            detectedPatterns.add('delegatecall');
          } else if (['call', 'staticcall', 'send', 'transfer'].includes(memberName) && !detectedPatterns.has('external_call')) {
            additionalScore += 30;
            reasons.push('Makes external calls to other contracts');
            detectedPatterns.add('external_call');
          }
        }
      }

      // Detect assembly usage
      if (node.type === 'InlineAssemblyStatement' && !detectedPatterns.has('assembly')) {
        additionalScore += 15;
        reasons.push('Uses inline assembly');
        detectedPatterns.add('assembly');
      }

      // Detect unchecked math blocks
      if (node.type === 'UncheckedStatement' && !detectedPatterns.has('unchecked')) {
        additionalScore += 20;
        reasons.push('Contains unchecked math operations');
        detectedPatterns.add('unchecked');
      }

      // Detect potential reentrancy patterns (external call followed by state change)
      // This is a simplified check - looks for external calls in general
      if (node.type === 'FunctionCall' && !detectedPatterns.has('reentrancy')) {
        const expression = node.expression;
        if (expression?.type === 'MemberAccess' && 
            ['call', 'delegatecall', 'send', 'transfer'].includes(expression.memberName)) {
          // Check if there are state changes after this call (simplified heuristic)
          additionalScore += 40;
          reasons.push('Potential reentrancy vulnerability detected');
          detectedPatterns.add('reentrancy');
        }
      }

      // Recursively traverse child nodes
      for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach((child: any) => traverse(child));
          } else {
            traverse(node[key]);
          }
        }
      }
    };

    traverse(body);
    return baseScore + additionalScore;
  }

  /**
   * Check if function has access control modifiers
   * @param functionAST Function AST node
   * @returns True if function has access control
   */
  private hasAccessControl(functionAST: any): boolean {
    if (!functionAST.modifiers || functionAST.modifiers.length === 0) {
      return false;
    }

    // Common access control modifier names
    const accessControlModifiers = [
      'onlyOwner',
      'onlyAdmin',
      'onlyRole',
      'requiresAuth',
      'authorized',
      'restricted',
    ];

    return functionAST.modifiers.some((mod: any) => {
      const modName = mod.name || '';
      return accessControlModifiers.some(acMod => 
        modName.toLowerCase().includes(acMod.toLowerCase())
      );
    });
  }

  /**
   * Categorize risk score into levels
   * @param score Numeric risk score (0-100)
   * @returns Risk level category
   */
  private categorizeRiskScore(score: number): RiskLevel {
    if (score >= 0 && score <= 25) {
      return 'low';
    } else if (score >= 26 && score <= 50) {
      return 'medium';
    } else if (score >= 51 && score <= 75) {
      return 'high';
    } else {
      return 'critical';
    }
  }

  /**
   * Estimate gas cost for a function based on operation types
   * @param functionAST Function AST node from the parser
   * @returns Estimated gas cost in gas units
   */
  estimateGas(functionAST: any): number {
    let gasEstimate = 21000; // Base transaction cost

    // Gas cost table for common EVM operations
    const GAS_COSTS = {
      SLOAD: 2100,        // Storage read
      SSTORE_NEW: 20000,  // Storage write (new slot)
      SSTORE_UPDATE: 5000, // Storage write (existing slot)
      CALL: 2600,         // External call base cost
      DELEGATECALL: 2600, // Delegatecall base cost
      CREATE: 32000,      // Contract creation
      LOG: 375,           // Event emission base
      MEMORY: 3,          // Memory expansion per word
      COMPUTATION: 3,     // Basic computation
    };

    const operationCounts = {
      sload: 0,
      sstore: 0,
      call: 0,
      delegatecall: 0,
      create: 0,
      log: 0,
      computation: 0,
    };

    // Traverse function body to count operations
    const traverse = (node: any) => {
      if (!node) return;

      // Count state variable reads (SLOAD)
      if (node.type === 'Identifier') {
        // Simplified heuristic: identifiers might be state variable reads
        operationCounts.sload += 1;
      }

      // Count state variable writes (SSTORE)
      if (node.type === 'ExpressionStatement' && node.expression?.type === 'BinaryOperation') {
        if (node.expression.operator === '=') {
          operationCounts.sstore += 1;
        }
      }

      // Count external calls
      if (node.type === 'FunctionCall') {
        const expression = node.expression;
        if (expression?.type === 'MemberAccess') {
          const memberName = expression.memberName;
          if (memberName === 'delegatecall') {
            operationCounts.delegatecall += 1;
          } else if (['call', 'staticcall', 'send', 'transfer'].includes(memberName)) {
            operationCounts.call += 1;
          }
        }
        // General function calls
        operationCounts.computation += 2;
      }

      // Count event emissions (LOG)
      if (node.type === 'EmitStatement') {
        operationCounts.log += 1;
      }

      // Count loops (multiply computation cost)
      if (node.type === 'ForStatement' || node.type === 'WhileStatement') {
        operationCounts.computation += 10; // Loops are expensive
      }

      // Count basic operations
      if (node.type === 'BinaryOperation' || node.type === 'UnaryOperation') {
        operationCounts.computation += 1;
      }

      // Recursively traverse child nodes
      for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach((child: any) => traverse(child));
          } else {
            traverse(node[key]);
          }
        }
      }
    };

    if (functionAST.body) {
      traverse(functionAST.body);
    }

    // Calculate total gas estimate
    gasEstimate += operationCounts.sload * GAS_COSTS.SLOAD;
    gasEstimate += operationCounts.sstore * GAS_COSTS.SSTORE_UPDATE;
    gasEstimate += operationCounts.call * GAS_COSTS.CALL;
    gasEstimate += operationCounts.delegatecall * GAS_COSTS.DELEGATECALL;
    gasEstimate += operationCounts.log * GAS_COSTS.LOG;
    gasEstimate += operationCounts.computation * GAS_COSTS.COMPUTATION;

    return gasEstimate;
  }

  /**
   * Infer UI field types for function parameters
   * @param parameters Array of function parameters
   * @returns Map of parameter names to UI field suggestions
   */
  inferUIFields(parameters: Parameter[]): Record<string, UIFieldSuggestion> {
    const suggestions: Record<string, UIFieldSuggestion> = {};

    // UI field mapping based on Solidity types
    const UI_FIELD_MAP: Record<string, UIFieldSuggestion> = {
      address: {
        fieldType: 'text',
        validation: '^0x[a-fA-F0-9]{40}$',
        placeholder: '0x...',
      },
      uint256: {
        fieldType: 'number',
        validation: 'min:0',
        placeholder: 'Enter amount',
      },
      uint: {
        fieldType: 'number',
        validation: 'min:0',
        placeholder: 'Enter amount',
      },
      int256: {
        fieldType: 'number',
        validation: '',
        placeholder: 'Enter number',
      },
      int: {
        fieldType: 'number',
        validation: '',
        placeholder: 'Enter number',
      },
      string: {
        fieldType: 'text',
        validation: '',
        placeholder: 'Enter text',
      },
      bool: {
        fieldType: 'checkbox',
        validation: '',
        placeholder: '',
      },
      bytes: {
        fieldType: 'textarea',
        validation: '^0x[a-fA-F0-9]*$',
        placeholder: 'Enter hex data (0x...)',
      },
      bytes32: {
        fieldType: 'text',
        validation: '^0x[a-fA-F0-9]{64}$',
        placeholder: '0x... (32 bytes)',
      },
    };

    for (const param of parameters) {
      const baseType = param.type.replace(/\[\]$/, ''); // Remove array suffix for base type matching

      // Check if it's an array type
      const isArray = param.type.endsWith('[]');

      // Find matching UI field type
      let suggestion: UIFieldSuggestion;

      if (UI_FIELD_MAP[baseType]) {
        suggestion = { ...UI_FIELD_MAP[baseType] };
      } else if (baseType.startsWith('uint')) {
        suggestion = { ...UI_FIELD_MAP.uint256 };
      } else if (baseType.startsWith('int')) {
        suggestion = { ...UI_FIELD_MAP.int256 };
      } else if (baseType.startsWith('bytes')) {
        suggestion = { ...UI_FIELD_MAP.bytes };
      } else {
        // Default for unknown types
        suggestion = {
          fieldType: 'text',
          validation: '',
          placeholder: `Enter ${param.type}`,
        };
      }

      // Adjust for arrays
      if (isArray) {
        suggestion.fieldType = 'textarea';
        suggestion.placeholder = `Enter ${param.type} (comma-separated)`;
      }

      suggestions[param.name || 'unnamed'] = suggestion;
    }

    return suggestions;
  }

  /**
   * Suggest error handling improvements for a contract
   * @param code Solidity source code
   * @returns Array of error handling recommendations
   */
  suggestErrorHandling(code: string): ErrorHandlingRecommendation[] {
    const recommendations: ErrorHandlingRecommendation[] = [];

    try {
      const ast = this.parseContract(code);
      const contracts = this.extractContracts(ast);

      for (const contract of contracts) {
        for (const func of contract.functions) {
          // Skip view/pure functions
          if (func.stateMutability === 'view' || func.stateMutability === 'pure') {
            continue;
          }

          // Check for missing require statements in payable functions
          if (func.stateMutability === 'payable') {
            recommendations.push({
              location: `${contract.contractName}.${func.name}`,
              issue: 'Payable function should validate input amounts',
              suggestion: 'Add require(msg.value > 0, "Invalid amount") or similar validation',
              severity: 'warning',
            });
          }

          // Check for external calls without error handling
          if (func.name && !func.isConstructor) {
            recommendations.push({
              location: `${contract.contractName}.${func.name}`,
              issue: 'Consider adding error handling for external calls',
              suggestion: 'Wrap external calls in try-catch blocks or check return values',
              severity: 'info',
            });
          }

          // Check for missing access control
          if (func.modifiers.length === 0 && func.visibility === 'public' && !func.isConstructor) {
            recommendations.push({
              location: `${contract.contractName}.${func.name}`,
              issue: 'Public state-changing function lacks access control',
              suggestion: 'Add access control modifiers like onlyOwner or require statements',
              severity: 'error',
            });
          }

          // Suggest custom error messages
          recommendations.push({
            location: `${contract.contractName}.${func.name}`,
            issue: 'Consider using custom errors for gas efficiency',
            suggestion: 'Define custom errors (error InvalidAmount()) instead of string messages',
            severity: 'info',
          });
        }
      }
    } catch (error) {
      // If parsing fails, return generic recommendations
      recommendations.push({
        location: 'Contract',
        issue: 'Unable to parse contract for detailed analysis',
        suggestion: 'Ensure contract syntax is valid',
        severity: 'error',
      });
    }

    return recommendations;
  }

  /**
   * Generate frontend integration suggestions for contract functions
   * @param code Solidity source code
   * @returns Array of frontend integration suggestions
   */
  generateFrontendIntegration(code: string): FrontendIntegrationSuggestion[] {
    const suggestions: FrontendIntegrationSuggestion[] = [];

    try {
      const contracts = this.analyzeContract(code);

      for (const contract of contracts) {
        for (const func of contract.functions) {
          // Skip constructors and internal functions
          if (func.isConstructor || func.visibility === 'internal' || func.visibility === 'private') {
            continue;
          }

          // Generate parameter list for code snippet
          const paramList = func.parameters.map(p => p.name || 'value').join(', ');
          const paramArgs = func.parameters.map(p => `${p.name || 'value'}: ${this.mapSolidityTypeToTS(p.type)}`).join(', ');

          // Determine if function is read-only or state-changing
          const isReadOnly = func.stateMutability === 'view' || func.stateMutability === 'pure';
          const isPayable = func.stateMutability === 'payable';

          let codeSnippet = '';
          let web3Pattern = '';
          let description = '';

          if (isReadOnly) {
            // Read-only function
            description = `Call ${func.name} to read data from the contract`;
            web3Pattern = 'contract.methods.functionName().call()';
            codeSnippet = `// Read-only function call
async function ${func.name}(${paramArgs}) {
  try {
    const result = await contract.methods.${func.name}(${paramList}).call();
    return result;
  } catch (error) {
    console.error('Error calling ${func.name}:', error);
    throw error;
  }
}`;
          } else if (isPayable) {
            // Payable function
            description = `Send transaction to ${func.name} with ETH value`;
            web3Pattern = 'contract.methods.functionName().send({ from, value })';
            codeSnippet = `// Payable transaction
async function ${func.name}(${paramArgs}, value: string) {
  try {
    const accounts = await web3.eth.getAccounts();
    const tx = await contract.methods.${func.name}(${paramList}).send({
      from: accounts[0],
      value: web3.utils.toWei(value, 'ether')
    });
    return tx;
  } catch (error) {
    console.error('Error executing ${func.name}:', error);
    throw error;
  }
}`;
          } else {
            // State-changing function
            description = `Send transaction to ${func.name} to modify contract state`;
            web3Pattern = 'contract.methods.functionName().send({ from })';
            codeSnippet = `// State-changing transaction
async function ${func.name}(${paramArgs}) {
  try {
    const accounts = await web3.eth.getAccounts();
    const tx = await contract.methods.${func.name}(${paramList}).send({
      from: accounts[0]
    });
    return tx;
  } catch (error) {
    console.error('Error executing ${func.name}:', error);
    throw error;
  }
}`;
          }

          suggestions.push({
            functionName: func.name,
            description,
            codeSnippet,
            web3Pattern,
          });
        }
      }
    } catch (error) {
      // Return empty array if parsing fails
      console.error('Failed to generate frontend integration:', error);
    }

    return suggestions;
  }

  /**
   * Map Solidity types to TypeScript types for frontend code generation
   * @param solidityType Solidity type string
   * @returns TypeScript type string
   */
  private mapSolidityTypeToTS(solidityType: string): string {
    if (solidityType === 'address') return 'string';
    if (solidityType.startsWith('uint') || solidityType.startsWith('int')) return 'string | number';
    if (solidityType === 'bool') return 'boolean';
    if (solidityType === 'string') return 'string';
    if (solidityType.startsWith('bytes')) return 'string';
    if (solidityType.endsWith('[]')) return `Array<${this.mapSolidityTypeToTS(solidityType.slice(0, -2))}>`;
    return 'any';
  }

  /**
   * Compute SHA-256 hash of contract code for cache key
   * @param code Contract source code
   * @returns Hex string hash
   */
  private hashCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  /**
   * Perform comprehensive contract analysis with caching
   * @param code Solidity source code
   * @returns Complete analysis result with risk scores, gas estimates, UI suggestions, and recommendations
   */
  async analyzeContractWithCache(code: string): Promise<AnalysisResult> {
    // Generate cache key from code hash
    const codeHash = this.hashCode(code);
    const cacheKey = CacheKeys.ANALYSIS(codeHash);

    // Try to get from cache first
    const cached = await cache.get<AnalysisResult>(cacheKey);
    if (cached) {
      console.log(`[AIEngine] Cache hit for analysis: ${codeHash}`);
      return cached;
    }

    console.log(`[AIEngine] Cache miss for analysis: ${codeHash}, performing analysis`);

    // Perform analysis
    const result = this.performFullAnalysis(code);

    // Store in cache with 1-hour TTL
    await cache.set(cacheKey, result, CacheTTL.ANALYSIS);

    return result;
  }

  /**
   * Perform full contract analysis without caching
   * @param code Solidity source code
   * @returns Complete analysis result
   */
  performFullAnalysis(code: string): AnalysisResult {
    const riskScores: Record<string, RiskScore> = {};
    const gasEstimates: Record<string, number> = {};
    const uiSuggestions: Record<string, UIFieldSuggestion> = {};
    const recommendations: Recommendation[] = [];

    try {
      // Parse contract and extract AST
      const ast = this.parseContract(code);
      const contracts = this.extractContracts(ast);

      // Analyze each contract
      for (const contract of contracts) {
        // Analyze each function
        for (const func of contract.functions) {
          const functionKey = `${contract.contractName}.${func.name || 'fallback'}`;

          // Get risk score
          const fullAST = this.parseContract(code);
          const functionAST = this.findFunctionInAST(fullAST, contract.contractName, func.name);
          
          if (functionAST) {
            const riskScore = this.scoreFunction(functionAST);
            riskScores[functionKey] = riskScore;

            // Get gas estimate
            const gasEstimate = this.estimateGas(functionAST);
            gasEstimates[functionKey] = gasEstimate;

            // Add high-risk recommendations
            if (riskScore.level === 'high' || riskScore.level === 'critical') {
              recommendations.push({
                type: 'security',
                severity: riskScore.level === 'critical' ? 'error' : 'warning',
                message: `Function ${functionKey} has ${riskScore.level} risk: ${riskScore.reasons.join(', ')}`,
                location: functionKey,
              });
            }
          }

          // Get UI field suggestions for function parameters
          if (func.parameters.length > 0) {
            const fieldSuggestions = this.inferUIFields(func.parameters);
            for (const [paramName, suggestion] of Object.entries(fieldSuggestions)) {
              uiSuggestions[`${functionKey}.${paramName}`] = suggestion;
            }
          }
        }
      }

      // Get error handling recommendations
      const errorRecommendations = this.suggestErrorHandling(code);
      for (const rec of errorRecommendations) {
        recommendations.push({
          type: rec.severity === 'error' ? 'security' : 'best-practice',
          severity: rec.severity,
          message: `${rec.issue}: ${rec.suggestion}`,
          location: rec.location,
        });
      }

      // Get frontend integration suggestions
      const frontendSuggestions = this.generateFrontendIntegration(code);
      for (const suggestion of frontendSuggestions) {
        recommendations.push({
          type: 'best-practice',
          severity: 'info',
          message: suggestion.description,
          location: suggestion.functionName,
        });
      }

    } catch (error) {
      console.error('[AIEngine] Analysis error:', error);
      recommendations.push({
        type: 'security',
        severity: 'error',
        message: `Failed to analyze contract: ${error instanceof Error ? error.message : String(error)}`,
        location: 'Contract',
      });
    }

    return {
      riskScores,
      gasEstimates,
      uiSuggestions,
      recommendations,
    };
  }

  /**
   * Find a specific function in the AST
   * @param ast Full contract AST
   * @param contractName Name of the contract
   * @param functionName Name of the function
   * @returns Function AST node or null if not found
   */
  private findFunctionInAST(ast: any, contractName: string, functionName: string): any {
    let foundFunction: any = null;

    parser.visit(ast, {
      ContractDefinition: (node: any) => {
        if (node.name === contractName && node.subNodes) {
          for (const subNode of node.subNodes) {
            if (subNode.type === 'FunctionDefinition' && subNode.name === functionName) {
              foundFunction = subNode;
              break;
            }
          }
        }
      },
    });

    return foundFunction;
  }
}

/**
 * Recommendation type for analysis results
 */
export interface Recommendation {
  type: 'security' | 'optimization' | 'best-practice';
  severity: 'info' | 'warning' | 'error';
  message: string;
  location: string;
}

/**
 * Complete analysis result
 */
export interface AnalysisResult {
  riskScores: Record<string, RiskScore>;
  gasEstimates: Record<string, number>;
  uiSuggestions: Record<string, UIFieldSuggestion>;
  recommendations: Recommendation[];
}
