# Security Features

This document describes the security features implemented in the Stellar Backend Infrastructure.

## Overview

The backend implements comprehensive security measures to protect against common vulnerabilities and attacks:

1. **Rate Limiting** - Prevents abuse and DDoS attacks
2. **Input Sanitization** - Prevents injection attacks
3. **Static Analysis** - Detects vulnerabilities in smart contracts
4. **CORS Protection** - Controls cross-origin access

## 1. Rate Limiting

**Location**: `lib/middleware/rate-limit.ts`

### Configuration

- **Limit**: 100 requests per minute per IP address
- **Response**: HTTP 429 (Too Many Requests) when limit exceeded
- **Headers**: Includes `RateLimit-*` headers with limit information

### Usage

```typescript
import { checkRateLimit } from '@/lib/middleware/rate-limit';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;
  
  // Continue with normal request handling
  // ...
}
```

### Features

- IP-based rate limiting
- Automatic retry-after header
- Compatible with Next.js API routes
- Supports proxied requests (X-Forwarded-For header)

## 2. Input Sanitization

**Location**: `lib/security/sanitize.ts`

### Functions

#### `sanitizeString(input: string): string`
Removes null bytes, control characters, and trims whitespace.

#### `sanitizeContractCode(code: string, type: 'solidity' | 'rust'): string`
Validates and sanitizes smart contract source code:
- Enforces 1MB maximum size
- Validates basic code structure
- Removes malicious content

#### `sanitizeABI(abi: any, type: 'evm' | 'stellar'): any`
Validates and sanitizes ABI data:
- Validates JSON structure
- Checks required fields
- Sanitizes all string fields
- Validates parameter types

#### `sanitizeFunctionParameters(params: any[]): any[]`
Sanitizes function call parameters:
- Validates parameter types
- Recursively sanitizes nested objects
- Checks for finite numbers

#### `sanitizeAddress(address: string, type: 'evm' | 'stellar'): string`
Validates blockchain addresses:
- EVM: `0x` + 40 hex characters
- Stellar: `G` or `C` + 55 alphanumeric characters

#### `sanitizeNetwork(network: string, allowedNetworks: string[]): string`
Validates network names against whitelist.

#### `sanitizeTransactionHash(hash: string, type: 'evm' | 'stellar'): string`
Validates transaction hash formats.

### Usage Example

```typescript
import { sanitizeContractCode, sanitizeABI } from '@/lib/security/sanitize';

// Sanitize contract code
const cleanCode = sanitizeContractCode(userInput, 'solidity');

// Sanitize ABI
const cleanABI = sanitizeABI(userABI, 'evm');
```

## 3. Static Analysis

**Location**: `lib/security/static-analysis.ts`

### Vulnerability Detection

The static analyzer detects the following vulnerabilities:

#### Solidity Contracts

1. **Reentrancy** (Critical)
   - Detects external calls followed by state changes
   - Recommends Checks-Effects-Interactions pattern

2. **Unchecked External Calls** (High/Critical)
   - Detects `.call()`, `.send()`, `.delegatecall()` without return value checks
   - Recommends using `require()` or `if` statements

3. **Integer Overflow/Underflow** (High)
   - Detects arithmetic operations in Solidity < 0.8.0 without SafeMath
   - Recommends SafeMath or upgrading to Solidity >= 0.8.0

4. **Unprotected Selfdestruct** (Critical)
   - Detects `selfdestruct` without access control
   - Recommends adding `onlyOwner` or similar modifiers

5. **Delegatecall** (High)
   - Detects delegatecall usage
   - Recommends validating target addresses

6. **tx.origin Authentication** (Medium)
   - Detects `tx.origin` used for authentication
   - Recommends using `msg.sender` instead

7. **Uninitialized Storage** (Medium)
   - Detects uninitialized storage pointers
   - Recommends initialization or using memory

8. **Timestamp Dependence** (Low)
   - Detects `block.timestamp` in critical logic
   - Recommends allowing tolerance windows

#### Rust/Soroban Contracts

1. **Unsafe Blocks** (High)
   - Detects `unsafe` blocks
   - Recommends minimizing unsafe code

2. **Unwrap Calls** (Medium)
   - Detects `.unwrap()` calls that can panic
   - Recommends proper error handling

3. **Expect Calls** (Low)
   - Detects `.expect()` calls
   - Recommends proper error handling for production

### Usage Example

```typescript
import { analyzeContract } from '@/lib/security/static-analysis';

const report = analyzeContract(contractCode, 'solidity');

console.log(report.summary);
// "Found 3 potential vulnerabilities (1 critical, 2 high). Overall risk level: critical."

report.vulnerabilities.forEach(vuln => {
  console.log(`${vuln.severity}: ${vuln.description}`);
  console.log(`Location: ${vuln.location}`);
  console.log(`Recommendation: ${vuln.recommendation}`);
});
```

### Response Format

```typescript
interface VulnerabilityReport {
  vulnerabilities: Vulnerability[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
}

interface Vulnerability {
  type: VulnerabilityType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  recommendation: string;
}
```

## 4. CORS Configuration

**Location**: `lib/middleware/cors.ts`

### Configuration

CORS settings are configured via environment variables:

```env
# .env or .env.local
ALLOWED_ORIGINS=https://example.com,https://app.example.com
```

### Default Settings

- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Allowed Headers**: Content-Type, Authorization, X-Requested-With, Accept, Origin, X-API-Key
- **Exposed Headers**: Content-Length, Content-Type, X-Request-Id
- **Credentials**: Enabled
- **Max Age**: 24 hours (86400 seconds)

### Usage

#### Option 1: Wrapper Function

```typescript
import { withCORS } from '@/lib/middleware/cors';

export async function POST(request: NextRequest) {
  return withCORS(request, async () => {
    // Your API logic here
    return NextResponse.json({ success: true });
  });
}
```

#### Option 2: Manual Headers

```typescript
import { createCORSResponse } from '@/lib/middleware/cors';

export async function GET(request: NextRequest) {
  const data = { message: 'Hello' };
  return createCORSResponse(request, data, 200);
}
```

#### Option 3: Apply to Existing Response

```typescript
import { applyCORSHeaders } from '@/lib/middleware/cors';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  return applyCORSHeaders(request, response);
}
```

### Features

- Environment-based origin configuration
- Wildcard subdomain support (`*.example.com`)
- Automatic preflight (OPTIONS) handling
- Origin validation
- Production safety warnings

### Validation

Check CORS configuration:

```typescript
import { getCORSConfig } from '@/lib/middleware/cors';

const config = getCORSConfig();
console.log(config.allowedOrigins);
console.log(config.validation.errors);
console.log(config.validation.warnings);
```

## Integration Guide

### API Route Template

Here's a complete example of a secure API route:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/middleware/rate-limit';
import { withCORS } from '@/lib/middleware/cors';
import { sanitizeContractCode } from '@/lib/security/sanitize';
import { analyzeContract } from '@/lib/security/static-analysis';

export async function POST(request: NextRequest) {
  return withCORS(request, async () => {
    // 1. Apply rate limiting
    const rateLimitResponse = await checkRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    try {
      // 2. Parse and validate input
      const body = await request.json();
      
      if (!body.code || !body.type) {
        return NextResponse.json(
          { error: 'Missing required fields', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }

      // 3. Sanitize input
      const cleanCode = sanitizeContractCode(body.code, body.type);

      // 4. Perform static analysis
      const analysis = analyzeContract(cleanCode, body.type);

      // 5. Return results
      return NextResponse.json({
        success: true,
        analysis
      });

    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  });
}
```

## Security Best Practices

### 1. Always Validate Input
- Use sanitization functions for all user input
- Validate data types and formats
- Check for required fields

### 2. Apply Rate Limiting
- Add rate limiting to all public API endpoints
- Consider different limits for different endpoints
- Monitor rate limit violations

### 3. Use CORS Properly
- Never use `*` wildcard in production
- Specify exact allowed origins
- Review CORS configuration regularly

### 4. Run Static Analysis
- Analyze all contracts before compilation
- Review high and critical vulnerabilities
- Provide feedback to users

### 5. Log Security Events
- Log rate limit violations
- Log validation failures
- Log suspicious patterns

### 6. Keep Dependencies Updated
- Regularly update security packages
- Monitor security advisories
- Run `npm audit` regularly

## Environment Variables

Required environment variables for security features:

```env
# CORS Configuration
ALLOWED_ORIGINS=https://example.com,https://app.example.com

# Optional: Rate Limiting (uses defaults if not set)
# RATE_LIMIT_WINDOW_MS=60000
# RATE_LIMIT_MAX_REQUESTS=100
```

## Testing

Security features should be tested regularly:

```bash
# Run security tests
npm test -- --testPathPattern=security

# Run static analysis tests
npm test -- --testPathPattern=static-analysis

# Run sanitization tests
npm test -- --testPathPattern=sanitize
```

## Monitoring

Monitor these metrics:

1. **Rate Limit Violations**: Track IPs hitting rate limits
2. **Validation Failures**: Monitor sanitization rejections
3. **Vulnerability Detections**: Track contracts with high-risk issues
4. **CORS Rejections**: Monitor blocked origins

## Support

For security issues or questions:
- Review this documentation
- Check the implementation files
- Consult the requirements and design documents

## References

- Requirements: `.kiro/specs/stellar-backend-infrastructure/requirements.md`
- Design: `.kiro/specs/stellar-backend-infrastructure/design.md`
- Tasks: `.kiro/specs/stellar-backend-infrastructure/tasks.md`
