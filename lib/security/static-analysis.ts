

export interface VulnerabilityReport {
  vulnerabilities: Vulnerability[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
}

export interface Vulnerability {
  type: VulnerabilityType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  recommendation: string;
}

export type VulnerabilityType =
  | 'reentrancy'
  | 'unchecked-call'
  | 'integer-overflow'
  | 'integer-underflow'
  | 'unprotected-selfdestruct'
  | 'delegatecall'
  | 'tx-origin'
  | 'uninitialized-storage'
  | 'timestamp-dependence';

export function analyzeSolidityContract(code: string): VulnerabilityReport {
  const vulnerabilities: Vulnerability[] = [];

  
  vulnerabilities.push(...detectReentrancy(code));

  
  vulnerabilities.push(...detectUncheckedCalls(code));

  
  vulnerabilities.push(...detectIntegerIssues(code));

  
  vulnerabilities.push(...detectUnprotectedSelfdestruct(code));

  
  vulnerabilities.push(...detectDelegatecall(code));

  
  vulnerabilities.push(...detectTxOrigin(code));

  
  vulnerabilities.push(...detectUninitializedStorage(code));

  
  vulnerabilities.push(...detectTimestampDependence(code));

  
  const riskLevel = calculateRiskLevel(vulnerabilities);

  
  const summary = generateSummary(vulnerabilities, riskLevel);

  return {
    vulnerabilities,
    riskLevel,
    summary
  };
}

function detectReentrancy(code: string): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];
  const lines = code.split('\n');

  
  const functionRegex = /function\s+(\w+)/g;
  const callRegex = /\.call\{|\.transfer\(|\.send\(/g;
  const stateChangeRegex = /=\s*[^=]/g;

  let currentFunction = '';
  let inFunction = false;
  let braceCount = 0;
  let hasExternalCall = false;
  let externalCallLine = 0;

  lines.forEach((line, index) => {
    const functionMatch = functionRegex.exec(line);
    if (functionMatch) {
      currentFunction = functionMatch[1];
      inFunction = true;
      braceCount = 0;
      hasExternalCall = false;
    }

    if (inFunction) {
      
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;

      
      if (callRegex.test(line)) {
        hasExternalCall = true;
        externalCallLine = index + 1;
      }

      
      if (hasExternalCall && stateChangeRegex.test(line) && !line.includes('//')) {
        vulnerabilities.push({
          type: 'reentrancy',
          severity: 'critical',
          location: `Function ${currentFunction}, line ${index + 1}`,
          description: `Potential reentrancy vulnerability: state change after external call at line ${externalCallLine}`,
          recommendation: 'Use the Checks-Effects-Interactions pattern: perform all state changes before making external calls, or use a reentrancy guard (ReentrancyGuard from OpenZeppelin)'
        });
        hasExternalCall = false; 
      }

      
      if (braceCount === 0 && inFunction) {
        inFunction = false;
        currentFunction = '';
        hasExternalCall = false;
      }
    }
  });

  return vulnerabilities;
}

function detectUncheckedCalls(code: string): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];
  const lines = code.split('\n');

  lines.forEach((line, index) => {
    
    if (/\.call\{|\.send\(/.test(line) && !line.includes('require(') && !line.includes('if (') && !line.includes('bool ')) {
      vulnerabilities.push({
        type: 'unchecked-call',
        severity: 'high',
        location: `Line ${index + 1}`,
        description: 'Unchecked external call: return value is not checked',
        recommendation: 'Always check the return value of external calls using require() or if statements'
      });
    }

    
    if (/\.delegatecall\(/.test(line) && !line.includes('require(') && !line.includes('if (')) {
      vulnerabilities.push({
        type: 'unchecked-call',
        severity: 'critical',
        location: `Line ${index + 1}`,
        description: 'Unchecked delegatecall: return value is not checked',
        recommendation: 'Always check the return value of delegatecall and validate the target address'
      });
    }
  });

  return vulnerabilities;
}

function detectIntegerIssues(code: string): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];
  const lines = code.split('\n');

  
  const versionMatch = code.match(/pragma\s+solidity\s+[\^]?(0\.[0-7]\.\d+)/);
  if (!versionMatch) {
    return vulnerabilities; 
  }

  const version = versionMatch[1];
  const isOldVersion = version.startsWith('0.') && parseInt(version.split('.')[1]) < 8;

  if (!isOldVersion) {
    return vulnerabilities; 
  }

  
  const hasSafeMath = /import.*SafeMath/.test(code) || /using\s+SafeMath/.test(code);

  if (!hasSafeMath) {
    lines.forEach((line, index) => {
      
      if (/[\+\-\*\/]\s*=|=\s*.*[\+\-\*\/]/.test(line) && !line.includes('//')) {
        vulnerabilities.push({
          type: line.includes('+') ? 'integer-overflow' : 'integer-underflow',
          severity: 'high',
          location: `Line ${index + 1}`,
          description: `Potential integer ${line.includes('+') ? 'overflow' : 'underflow'}: arithmetic operation without SafeMath in Solidity ${version}`,
          recommendation: 'Use SafeMath library for arithmetic operations or upgrade to Solidity >= 0.8.0'
        });
      }
    });
  }

  return vulnerabilities;
}

function detectUnprotectedSelfdestruct(code: string): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];
  const lines = code.split('\n');

  let currentFunction = '';
  let inFunction = false;
  let braceCount = 0;
  let hasAccessControl = false;
  let hasSelfDestruct = false;
  let selfDestructLine = 0;

  lines.forEach((line, index) => {
    const functionMatch = /function\s+(\w+)/.exec(line);
    if (functionMatch) {
      currentFunction = functionMatch[1];
      inFunction = true;
      braceCount = 0;
      hasAccessControl = false;
      hasSelfDestruct = false;
    }

    if (inFunction) {
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;

      
      if (/onlyOwner|require\(.*msg\.sender|modifier/.test(line)) {
        hasAccessControl = true;
      }

      
      if (/selfdestruct\(|suicide\(/.test(line)) {
        hasSelfDestruct = true;
        selfDestructLine = index + 1;
      }

      
      if (braceCount === 0 && inFunction) {
        if (hasSelfDestruct && !hasAccessControl) {
          vulnerabilities.push({
            type: 'unprotected-selfdestruct',
            severity: 'critical',
            location: `Function ${currentFunction}, line ${selfDestructLine}`,
            description: 'Unprotected selfdestruct: function can be called by anyone to destroy the contract',
            recommendation: 'Add access control (e.g., onlyOwner modifier) to functions containing selfdestruct'
          });
        }
        inFunction = false;
        currentFunction = '';
      }
    }
  });

  return vulnerabilities;
}

function detectDelegatecall(code: string): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];
  const lines = code.split('\n');

  lines.forEach((line, index) => {
    if (/\.delegatecall\(/.test(line)) {
      vulnerabilities.push({
        type: 'delegatecall',
        severity: 'high',
        location: `Line ${index + 1}`,
        description: 'Delegatecall usage detected: can be dangerous if target address is not trusted',
        recommendation: 'Ensure the target address is trusted and validated. Consider using a whitelist of allowed addresses.'
      });
    }
  });

  return vulnerabilities;
}

function detectTxOrigin(code: string): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];
  const lines = code.split('\n');

  lines.forEach((line, index) => {
    if (/tx\.origin/.test(line) && /require|if/.test(line)) {
      vulnerabilities.push({
        type: 'tx-origin',
        severity: 'medium',
        location: `Line ${index + 1}`,
        description: 'tx.origin used for authentication: vulnerable to phishing attacks',
        recommendation: 'Use msg.sender instead of tx.origin for authentication'
      });
    }
  });

  return vulnerabilities;
}

function detectUninitializedStorage(code: string): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];
  const lines = code.split('\n');

  lines.forEach((line, index) => {
    
    if (/storage\s+\w+;/.test(line) && !line.includes('=')) {
      vulnerabilities.push({
        type: 'uninitialized-storage',
        severity: 'medium',
        location: `Line ${index + 1}`,
        description: 'Uninitialized storage pointer: can lead to unexpected behavior',
        recommendation: 'Always initialize storage pointers or use memory instead'
      });
    }
  });

  return vulnerabilities;
}

function detectTimestampDependence(code: string): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];
  const lines = code.split('\n');

  lines.forEach((line, index) => {
    if (/(block\.timestamp|now)/.test(line) && /require|if/.test(line)) {
      vulnerabilities.push({
        type: 'timestamp-dependence',
        severity: 'low',
        location: `Line ${index + 1}`,
        description: 'Timestamp dependence: block.timestamp can be manipulated by miners within a small range',
        recommendation: 'Avoid using block.timestamp for critical logic. If necessary, allow for a tolerance window.'
      });
    }
  });

  return vulnerabilities;
}

function calculateRiskLevel(vulnerabilities: Vulnerability[]): 'low' | 'medium' | 'high' | 'critical' {
  if (vulnerabilities.length === 0) {
    return 'low';
  }

  const hasCritical = vulnerabilities.some(v => v.severity === 'critical');
  const hasHigh = vulnerabilities.some(v => v.severity === 'high');
  const hasMedium = vulnerabilities.some(v => v.severity === 'medium');

  if (hasCritical) {
    return 'critical';
  } else if (hasHigh) {
    return 'high';
  } else if (hasMedium) {
    return 'medium';
  } else {
    return 'low';
  }
}

function generateSummary(vulnerabilities: Vulnerability[], riskLevel: string): string {
  if (vulnerabilities.length === 0) {
    return 'No vulnerabilities detected. Contract appears to follow security best practices.';
  }

  const counts = {
    critical: vulnerabilities.filter(v => v.severity === 'critical').length,
    high: vulnerabilities.filter(v => v.severity === 'high').length,
    medium: vulnerabilities.filter(v => v.severity === 'medium').length,
    low: vulnerabilities.filter(v => v.severity === 'low').length
  };

  const parts: string[] = [];
  if (counts.critical > 0) parts.push(`${counts.critical} critical`);
  if (counts.high > 0) parts.push(`${counts.high} high`);
  if (counts.medium > 0) parts.push(`${counts.medium} medium`);
  if (counts.low > 0) parts.push(`${counts.low} low`);

  return `Found ${vulnerabilities.length} potential vulnerabilities (${parts.join(', ')}). Overall risk level: ${riskLevel}.`;
}

export function analyzeSorobanContract(code: string): VulnerabilityReport {
  const vulnerabilities: Vulnerability[] = [];

  
  const unsafeMatches = code.match(/unsafe\s*{/g);
  if (unsafeMatches) {
    vulnerabilities.push({
      type: 'unchecked-call',
      severity: 'high',
      location: 'Multiple locations',
      description: `Found ${unsafeMatches.length} unsafe block(s): unsafe code can lead to memory safety issues`,
      recommendation: 'Minimize use of unsafe blocks and ensure they are thoroughly reviewed and tested'
    });
  }

  
  const unwrapMatches = code.match(/\.unwrap\(\)/g);
  if (unwrapMatches) {
    vulnerabilities.push({
      type: 'unchecked-call',
      severity: 'medium',
      location: 'Multiple locations',
      description: `Found ${unwrapMatches.length} unwrap() call(s): can cause panics if value is None/Err`,
      recommendation: 'Use proper error handling with match, if let, or ? operator instead of unwrap()'
    });
  }

  
  const expectMatches = code.match(/\.expect\(/g);
  if (expectMatches) {
    vulnerabilities.push({
      type: 'unchecked-call',
      severity: 'low',
      location: 'Multiple locations',
      description: `Found ${expectMatches.length} expect() call(s): can cause panics if value is None/Err`,
      recommendation: 'Consider using proper error handling instead of expect() for production code'
    });
  }

  const riskLevel = calculateRiskLevel(vulnerabilities);
  const summary = generateSummary(vulnerabilities, riskLevel);

  return {
    vulnerabilities,
    riskLevel,
    summary
  };
}

export function analyzeContract(code: string, type: 'solidity' | 'rust'): VulnerabilityReport {
  if (type === 'solidity') {
    return analyzeSolidityContract(code);
  } else if (type === 'rust') {
    return analyzeSorobanContract(code);
  } else {
    throw new Error(`Unsupported contract type: ${type}`);
  }
}
