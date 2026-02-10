/**
 * ABI Validation Module
 * 
 * Provides validation functions for EVM and Soroban ABI structures.
 * Ensures ABIs conform to blockchain-specific schemas before storage.
 */

/**
 * EVM ABI element types
 */
type EVMABIType = 'function' | 'constructor' | 'event' | 'fallback' | 'receive';

/**
 * EVM ABI element interface
 */
interface EVMABIElement {
  type: EVMABIType;
  name?: string;
  inputs?: Array<{ name: string; type: string; indexed?: boolean }>;
  outputs?: Array<{ name: string; type: string }>;
  stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
  anonymous?: boolean;
}

/**
 * Soroban ABI interface
 */
interface SorobanABI {
  functions?: Array<{
    name: string;
    inputs?: Array<{ name: string; type: any }>;
    outputs?: Array<{ type: any }>;
  }>;
  types?: Array<any>;
  [key: string]: any;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate EVM ABI structure
 * 
 * Checks that the ABI conforms to the Ethereum ABI specification:
 * - Must be an array
 * - Each element must have a valid type
 * - Functions must have name, inputs, outputs
 * - Events must have name and inputs
 * 
 * @param abi ABI to validate
 * @returns Validation result
 */
export function validateEVMABI(abi: any): ValidationResult {
  const errors: string[] = [];

  // Check if ABI is an array
  if (!Array.isArray(abi)) {
    errors.push('ABI must be an array');
    return { valid: false, errors };
  }

  // Validate each ABI element
  abi.forEach((element, index) => {
    // Check if element is an object
    if (typeof element !== 'object' || element === null) {
      errors.push(`Element at index ${index} must be an object`);
      return;
    }

    // Check if type field exists
    if (!element.type) {
      errors.push(`Element at index ${index} missing required 'type' field`);
      return;
    }

    // Validate type
    const validTypes: EVMABIType[] = ['function', 'constructor', 'event', 'fallback', 'receive'];
    if (!validTypes.includes(element.type)) {
      errors.push(`Element at index ${index} has invalid type '${element.type}'`);
    }

    // Validate function elements
    if (element.type === 'function') {
      if (!element.name || typeof element.name !== 'string') {
        errors.push(`Function at index ${index} missing or invalid 'name' field`);
      }

      if (!Array.isArray(element.inputs)) {
        errors.push(`Function at index ${index} missing or invalid 'inputs' array`);
      }

      if (!Array.isArray(element.outputs)) {
        errors.push(`Function at index ${index} missing or invalid 'outputs' array`);
      }

      // Validate stateMutability
      if (element.stateMutability) {
        const validMutability = ['pure', 'view', 'nonpayable', 'payable'];
        if (!validMutability.includes(element.stateMutability)) {
          errors.push(`Function at index ${index} has invalid stateMutability '${element.stateMutability}'`);
        }
      }
    }

    // Validate event elements
    if (element.type === 'event') {
      if (!element.name || typeof element.name !== 'string') {
        errors.push(`Event at index ${index} missing or invalid 'name' field`);
      }

      if (!Array.isArray(element.inputs)) {
        errors.push(`Event at index ${index} missing or invalid 'inputs' array`);
      }
    }

    // Validate constructor elements
    if (element.type === 'constructor') {
      if (!Array.isArray(element.inputs)) {
        errors.push(`Constructor at index ${index} missing or invalid 'inputs' array`);
      }
    }

    // Validate inputs/outputs structure
    if (element.inputs && Array.isArray(element.inputs)) {
      element.inputs.forEach((input: any, inputIndex: number) => {
        if (typeof input !== 'object' || input === null) {
          errors.push(`Input at index ${inputIndex} of element ${index} must be an object`);
          return;
        }

        if (!input.type || typeof input.type !== 'string') {
          errors.push(`Input at index ${inputIndex} of element ${index} missing or invalid 'type' field`);
        }

        if (input.name !== undefined && typeof input.name !== 'string') {
          errors.push(`Input at index ${inputIndex} of element ${index} has invalid 'name' field`);
        }
      });
    }

    if (element.outputs && Array.isArray(element.outputs)) {
      element.outputs.forEach((output: any, outputIndex: number) => {
        if (typeof output !== 'object' || output === null) {
          errors.push(`Output at index ${outputIndex} of element ${index} must be an object`);
          return;
        }

        if (!output.type || typeof output.type !== 'string') {
          errors.push(`Output at index ${outputIndex} of element ${index} missing or invalid 'type' field`);
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Soroban ABI structure
 * 
 * Checks that the ABI conforms to the Soroban ABI specification:
 * - Must be an object
 * - Should have functions array (optional)
 * - Should have types array (optional)
 * - Functions must have name and valid structure
 * 
 * @param abi ABI to validate
 * @returns Validation result
 */
export function validateSorobanABI(abi: any): ValidationResult {
  const errors: string[] = [];

  // Check if ABI is an object (but not an array)
  if (typeof abi !== 'object' || abi === null || Array.isArray(abi)) {
    errors.push('Soroban ABI must be an object');
    return { valid: false, errors };
  }

  // Validate functions array if present
  if (abi.functions !== undefined) {
    if (!Array.isArray(abi.functions)) {
      errors.push('Soroban ABI functions field must be an array');
    } else {
      abi.functions.forEach((func: any, index: number) => {
        // Check if function is an object
        if (typeof func !== 'object' || func === null) {
          errors.push(`Function at index ${index} must be an object`);
          return;
        }

        // Check if function has name
        if (!func.name || typeof func.name !== 'string') {
          errors.push(`Function at index ${index} missing or invalid 'name' field`);
        }

        // Validate inputs if present
        if (func.inputs !== undefined) {
          if (!Array.isArray(func.inputs)) {
            errors.push(`Function '${func.name}' at index ${index} has invalid 'inputs' field (must be array)`);
          } else {
            func.inputs.forEach((input: any, inputIndex: number) => {
              if (typeof input !== 'object' || input === null) {
                errors.push(`Input at index ${inputIndex} of function '${func.name}' must be an object`);
                return;
              }

              if (!input.name || typeof input.name !== 'string') {
                errors.push(`Input at index ${inputIndex} of function '${func.name}' missing or invalid 'name' field`);
              }

              if (input.type === undefined) {
                errors.push(`Input at index ${inputIndex} of function '${func.name}' missing 'type' field`);
              }
            });
          }
        }

        // Validate outputs if present
        if (func.outputs !== undefined) {
          if (!Array.isArray(func.outputs)) {
            errors.push(`Function '${func.name}' at index ${index} has invalid 'outputs' field (must be array)`);
          } else {
            func.outputs.forEach((output: any, outputIndex: number) => {
              if (typeof output !== 'object' || output === null) {
                errors.push(`Output at index ${outputIndex} of function '${func.name}' must be an object`);
                return;
              }

              if (output.type === undefined) {
                errors.push(`Output at index ${outputIndex} of function '${func.name}' missing 'type' field`);
              }
            });
          }
        }
      });
    }
  }

  // Validate types array if present
  if (abi.types !== undefined) {
    if (!Array.isArray(abi.types)) {
      errors.push('Soroban ABI types field must be an array');
    }
    // Note: We don't validate individual type structures as they can vary
    // The soroban-cli tool ensures they are valid
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate ABI based on contract type
 * 
 * @param abi ABI to validate
 * @param type Contract type ('evm' or 'stellar')
 * @returns Validation result
 */
export function validateABI(abi: any, type: 'evm' | 'stellar'): ValidationResult {
  if (type === 'evm') {
    return validateEVMABI(abi);
  } else if (type === 'stellar') {
    return validateSorobanABI(abi);
  } else {
    return {
      valid: false,
      errors: [`Unknown contract type: ${type}`],
    };
  }
}

