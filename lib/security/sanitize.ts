

export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  
  let sanitized = input.replace(/\0/g, '');

  
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  
  sanitized = sanitized.trim();

  return sanitized;
}

export function sanitizeContractCode(code: string, type: 'solidity' | 'rust'): string {
  if (!code || typeof code !== 'string') {
    throw new Error('Contract code must be a non-empty string');
  }

  
  const maxSize = 1024 * 1024;
  if (code.length > maxSize) {
    throw new Error(`Contract code exceeds maximum size of ${maxSize} bytes`);
  }

  
  let sanitized = sanitizeString(code);

  
  if (type === 'solidity') {
    
    if (!sanitized.includes('contract') && !sanitized.includes('interface') && !sanitized.includes('library')) {
      throw new Error('Invalid Solidity code: must contain contract, interface, or library declaration');
    }
  } else if (type === 'rust') {
    
    if (!sanitized.includes('pub') && !sanitized.includes('fn')) {
      throw new Error('Invalid Rust code: must contain function declarations');
    }
  }

  return sanitized;
}

export function sanitizeABI(abi: any, type: 'evm' | 'stellar'): any {
  if (!abi) {
    throw new Error('ABI data is required');
  }

  
  let parsedABI = abi;
  if (typeof abi === 'string') {
    try {
      parsedABI = JSON.parse(abi);
    } catch (error) {
      throw new Error('Invalid ABI: must be valid JSON');
    }
  }

  
  if (typeof parsedABI !== 'object') {
    throw new Error('Invalid ABI: must be an object or array');
  }

  if (type === 'evm') {
    return sanitizeEVMABI(parsedABI);
  } else if (type === 'stellar') {
    return sanitizeStellarABI(parsedABI);
  }

  throw new Error(`Unknown ABI type: ${type}`);
}

function sanitizeEVMABI(abi: any[]): any[] {
  if (!Array.isArray(abi)) {
    throw new Error('EVM ABI must be an array');
  }

  
  return abi.map((element, index) => {
    if (typeof element !== 'object' || element === null) {
      throw new Error(`Invalid ABI element at index ${index}: must be an object`);
    }

    
    if (!element.type) {
      throw new Error(`Invalid ABI element at index ${index}: missing type field`);
    }

    
    const sanitized: any = {
      type: sanitizeString(element.type)
    };

    if (element.name) {
      sanitized.name = sanitizeString(element.name);
    }

    if (element.inputs) {
      if (!Array.isArray(element.inputs)) {
        throw new Error(`Invalid ABI element at index ${index}: inputs must be an array`);
      }
      sanitized.inputs = element.inputs.map((input: any) => sanitizeABIParameter(input));
    }

    if (element.outputs) {
      if (!Array.isArray(element.outputs)) {
        throw new Error(`Invalid ABI element at index ${index}: outputs must be an array`);
      }
      sanitized.outputs = element.outputs.map((output: any) => sanitizeABIParameter(output));
    }

    if (element.stateMutability) {
      sanitized.stateMutability = sanitizeString(element.stateMutability);
    }

    if (element.constant !== undefined) {
      sanitized.constant = Boolean(element.constant);
    }

    if (element.payable !== undefined) {
      sanitized.payable = Boolean(element.payable);
    }

    return sanitized;
  });
}

function sanitizeStellarABI(abi: any): any {
  if (typeof abi !== 'object' || abi === null) {
    throw new Error('Stellar ABI must be an object');
  }

  const sanitized: any = {};

  
  if (abi.functions) {
    if (!Array.isArray(abi.functions)) {
      throw new Error('Stellar ABI functions must be an array');
    }
    sanitized.functions = abi.functions.map((fn: any) => {
      if (typeof fn !== 'object' || fn === null) {
        throw new Error('Invalid function in Stellar ABI');
      }
      return {
        name: sanitizeString(fn.name),
        inputs: Array.isArray(fn.inputs) ? fn.inputs.map((input: any) => sanitizeABIParameter(input)) : [],
        outputs: Array.isArray(fn.outputs) ? fn.outputs.map((output: any) => sanitizeABIParameter(output)) : []
      };
    });
  }

  
  if (abi.types) {
    if (!Array.isArray(abi.types)) {
      throw new Error('Stellar ABI types must be an array');
    }
    sanitized.types = abi.types.map((type: any) => {
      if (typeof type !== 'object' || type === null) {
        throw new Error('Invalid type in Stellar ABI');
      }
      return {
        name: sanitizeString(type.name),
        type: sanitizeString(type.type)
      };
    });
  }

  return sanitized;
}

function sanitizeABIParameter(param: any): any {
  if (typeof param !== 'object' || param === null) {
    throw new Error('ABI parameter must be an object');
  }

  const sanitized: any = {
    type: sanitizeString(param.type)
  };

  if (param.name) {
    sanitized.name = sanitizeString(param.name);
  }

  if (param.internalType) {
    sanitized.internalType = sanitizeString(param.internalType);
  }

  if (param.components) {
    if (!Array.isArray(param.components)) {
      throw new Error('ABI parameter components must be an array');
    }
    sanitized.components = param.components.map((comp: any) => sanitizeABIParameter(comp));
  }

  return sanitized;
}

export function sanitizeFunctionParameters(params: any[]): any[] {
  if (!Array.isArray(params)) {
    throw new Error('Function parameters must be an array');
  }

  return params.map((param, index) => {
    
    if (typeof param === 'string') {
      return sanitizeString(param);
    } else if (typeof param === 'number') {
      if (!Number.isFinite(param)) {
        throw new Error(`Invalid parameter at index ${index}: must be a finite number`);
      }
      return param;
    } else if (typeof param === 'boolean') {
      return param;
    } else if (typeof param === 'object' && param !== null) {
      
      if (Array.isArray(param)) {
        return sanitizeFunctionParameters(param);
      } else {
        const sanitized: any = {};
        for (const key in param) {
          sanitized[sanitizeString(key)] = sanitizeFunctionParameters([param[key]])[0];
        }
        return sanitized;
      }
    } else if (param === null || param === undefined) {
      return param;
    } else {
      throw new Error(`Invalid parameter at index ${index}: unsupported type ${typeof param}`);
    }
  });
}

export function sanitizeAddress(address: string, type: 'evm' | 'stellar'): string {
  if (!address || typeof address !== 'string') {
    throw new Error('Address must be a non-empty string');
  }

  const sanitized = sanitizeString(address);

  if (type === 'evm') {
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(sanitized)) {
      throw new Error('Invalid EVM address format');
    }
  } else if (type === 'stellar') {
    
    if (!/^[GC][A-Z0-9]{55}$/.test(sanitized)) {
      throw new Error('Invalid Stellar address format');
    }
  }

  return sanitized;
}

export function sanitizeNetwork(network: string, allowedNetworks: string[]): string {
  if (!network || typeof network !== 'string') {
    throw new Error('Network must be a non-empty string');
  }

  const sanitized = sanitizeString(network).toLowerCase();

  if (!allowedNetworks.includes(sanitized)) {
    throw new Error(`Invalid network: ${sanitized}. Allowed networks: ${allowedNetworks.join(', ')}`);
  }

  return sanitized;
}

export function sanitizeTransactionHash(hash: string, type: 'evm' | 'stellar'): string {
  if (!hash || typeof hash !== 'string') {
    throw new Error('Transaction hash must be a non-empty string');
  }

  const sanitized = sanitizeString(hash);

  if (type === 'evm') {
    
    if (!/^0x[a-fA-F0-9]{64}$/.test(sanitized)) {
      throw new Error('Invalid EVM transaction hash format');
    }
  } else if (type === 'stellar') {
    
    if (!/^[a-fA-F0-9]{64}$/.test(sanitized)) {
      throw new Error('Invalid Stellar transaction hash format');
    }
  }

  return sanitized;
}
