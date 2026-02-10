# Design Document: Stellar Backend Infrastructure

## Overview

This design transforms the existing EVM-only smart contract compilation backend into a multi-chain infrastructure supporting both EVM and Stellar/Soroban contracts. The system maintains backward compatibility while adding:

- **Multi-chain compilation**: EVM (Solidity) and Stellar (Rust/Soroban)
- **Multi-chain deployment**: Support for EVM networks and Stellar testnet/mainnet
- **AI-powered analysis**: Contract risk scoring, gas estimation, and UI suggestions
- **Production scalability**: Queue-based processing, artifact storage, caching layer
- **Enhanced security**: Rate limiting, input validation, static analysis

The architecture follows a service-oriented design with clear boundaries between compilation, deployment, analysis, and storage concerns, enabling future microservice extraction.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    Client[Frontend Client]
    
    subgraph "API Layer (Next.js)"
        CompileEVM[/api/compile/evm]
        CompileStellar[/api/compile/stellar]
        DeployEVM[/api/deploy/evm]
        DeployStellar[/api/deploy/stellar]
        Simulate[/api/simulate]
        Analyze[/api/analyze]
        Legacy[/api/compile - Legacy]
    end
    
    subgraph "Service Layer"
        CompilationService[Compilation Service]
        DeploymentService[Deployment Service]
        SimulationService[Simulation Service]
        AIEngine[AI Intelligence Engine]
    end
    
    subgraph "Infrastructure"
        Queue[BullMQ Queue]
        Cache[Redis Cache]
        Storage[S3 Artifact Storage]
        DB[(Supabase PostgreSQL)]
    end
    
    subgraph "External Services"
        Solc[solc Compiler]
        Soroban[soroban-cli + Rust]
        Horizon[Horizon API]
        SorobanRPC[Soroban RPC]
        Freighter[Freighter Wallet]
    end
    
    Client --> CompileEVM
    Client --> CompileStellar
    Client --> DeployEVM
    Client --> DeployStellar
    Client --> Simulate
    Client --> Analyze
    Client --> Legacy
    
    Legacy -.->|routes to| CompileEVM
    
    CompileEVM --> CompilationService
    CompileStellar --> CompilationService
    DeployEVM --> DeploymentService
    DeployStellar --> DeploymentService
    Simulate --> SimulationService
    Analyze --> AIEngine
    
    CompilationService --> Queue
    CompilationService --> Solc
    CompilationService --> Soroban
    CompilationService --> Storage
    CompilationService --> DB
    
    DeploymentService --> Horizon
    DeploymentService --> SorobanRPC
    DeploymentService --> Freighter
    DeploymentService --> DB
    
    SimulationService --> SorobanRPC
    SimulationService --> Cache
    
    AIEngine --> Cache
    AIEngine --> DB
    
    Queue --> Cache
    Queue --> Storage
```

### Service Boundaries

**API Layer**: Next.js API routes handling HTTP requests, input validation, authentication, and rate limiting.

**Compilation Service**: Orchestrates contract compilation for both EVM and Stellar, manages compiler toolchains, validates outputs, and stores artifacts.

**Deployment Service**: Handles transaction creation, signing coordination, submission to blockchain networks, and confirmation polling.

**Simulation Service**: Provides pre-deployment contract execution simulation for cost estimation and behavior verification.

**AI Intelligence Engine**: Analyzes contract code for security risks, gas optimization opportunities, and generates UI integration suggestions.

**Infrastructure Layer**: Provides queue-based async processing, caching, artifact storage, and persistent data storage.

## Components and Interfaces

### 1. API Route Handlers

#### `/api/compile/evm` (POST)

**Purpose**: Compile Solidity contracts to EVM bytecode

**Request**:
```typescript
{
  solidityCode: string
  contractName: string
  optimizerRuns?: number  // default: 200
}
```

**Response**:
```typescript
{
  success: true
  abi: Array<ABIElement>
  bytecode: string
  warnings: Array<string>
  artifactId: string
}
```

**Implementation**:
- Validate input (non-empty code, valid contract name)
- Enqueue compilation job in BullMQ
- Poll job status or use webhook for completion
- Return compiled artifacts

#### `/api/compile/stellar` (POST)

**Purpose**: Compile Rust/Soroban contracts to WASM

**Request**:
```typescript
{
  rustCode: string
  contractName: string
  network: 'testnet' | 'mainnet'
}
```

**Response**:
```typescript
{
  success: true
  abi: SorobanABI
  wasmHash: string
  artifactId: string
  warnings: Array<string>
}
```

**Implementation**:
- Validate Rust syntax
- Create temporary build environment
- Execute `soroban contract build`
- Compute WASM hash (SHA-256)
- Store WASM in S3
- Validate ABI structure
- Return metadata

#### `/api/deploy/evm` (POST)

**Purpose**: Deploy compiled EVM contracts

**Request**:
```typescript
{
  artifactId: string
  network: 'celo' | 'ethereum' | 'polygon' | string
  constructorArgs?: Array<any>
  gasLimit?: number
}
```

**Response**:
```typescript
{
  success: true
  contractAddress: string
  txHash: string
  network: string
  gasUsed: number
}
```

**Implementation**:
- Retrieve artifact from storage
- Create unsigned transaction
- Return transaction for wallet signing (client-side)
- Accept signed transaction
- Submit to network
- Poll for confirmation
- Store deployment record

#### `/api/deploy/stellar` (POST)

**Purpose**: Deploy Soroban contracts to Stellar

**Request**:
```typescript
{
  artifactId: string
  network: 'testnet' | 'mainnet'
  sourceAccount: string
}
```

**Response**:
```typescript
{
  success: true
  contractId: string
  txHash: string
  network: string
}
```

**Implementation**:
- Retrieve WASM from storage
- Create install contract transaction envelope
- Return envelope for Freighter signing
- Accept signed envelope
- Submit to Horizon API
- Poll for confirmation
- Store deployment record

#### `/api/simulate` (POST)

**Purpose**: Simulate contract execution

**Request**:
```typescript
{
  contractType: 'evm' | 'stellar'
  contractAddress?: string
  contractCode?: string
  functionName: string
  args: Array<any>
  network: string
}
```

**Response**:
```typescript
{
  success: true
  result: any
  gasEstimate: number
  stateChanges: Array<StateChange>
  logs: Array<Log>
}
```

**Implementation**:
- For EVM: Use ethers.js with local fork
- For Stellar: Use Soroban RPC `simulateTransaction`
- Parse and format results
- Cache simulation results (5 min TTL)

#### `/api/analyze` (POST)

**Purpose**: AI-powered contract analysis

**Request**:
```typescript
{
  contractCode: string
  contractType: 'evm' | 'stellar'
}
```

**Response**:
```typescript
{
  success: true
  riskScores: {
    [functionName: string]: {
      score: number  // 0-100
      level: 'low' | 'medium' | 'high' | 'critical'
      reasons: Array<string>
    }
  }
  gasEstimates: {
    [functionName: string]: number
  }
  uiSuggestions: {
    [parameter: string]: {
      fieldType: string
      validation: string
      placeholder: string
    }
  }
  recommendations: Array<{
    type: 'security' | 'optimization' | 'best-practice'
    severity: string
    message: string
    location: string
  }>
}
```

**Implementation**:
- Parse contract AST
- Analyze function signatures
- Detect risk patterns (reentrancy, unchecked calls, etc.)
- Use AI model for gas estimation
- Generate UI field mappings
- Cache analysis results (1 hour TTL)

### 2. Compilation Service

**Interface**:
```typescript
interface CompilationService {
  compileEVM(code: string, contractName: string, options: CompileOptions): Promise<EVMCompilationResult>
  compileStellar(code: string, contractName: string, network: Network): Promise<StellarCompilationResult>
  validateABI(abi: any, type: 'evm' | 'stellar'): boolean
  storeArtifact(artifact: Artifact): Promise<string>
}
```

**EVM Compilation Flow**:
1. Receive Solidity source code
2. Prepare solc input JSON with optimizer settings
3. Execute `solc.compile()`
4. Parse output for errors/warnings
5. Extract ABI and bytecode
6. Compress bytecode (gzip)
7. Store in S3 with content-addressed key
8. Insert metadata into `contracts` table
9. Return artifact ID and compilation results

**Stellar Compilation Flow**:
1. Receive Rust source code
2. Create temporary directory with Cargo.toml
3. Write source to `src/lib.rs`
4. Execute `soroban contract build --release`
5. Read WASM from `target/wasm32-unknown-unknown/release/`
6. Compute SHA-256 hash of WASM
7. Extract ABI using `soroban contract inspect`
8. Validate ABI structure
9. Store WASM in S3 with hash as key
10. Insert metadata into `contracts` table
11. Return artifact ID, WASM hash, and ABI

**Error Handling**:
- Compilation errors: Return formatted error messages with line numbers
- Timeout: Kill process after 60 seconds
- Resource limits: Enforce max file size (1MB source code)

### 3. Deployment Service

**Interface**:
```typescript
interface DeploymentService {
  deployEVM(artifactId: string, network: string, args: any[]): Promise<EVMDeploymentResult>
  deployStellar(artifactId: string, network: Network, sourceAccount: string): Promise<StellarDeploymentResult>
  confirmTransaction(txHash: string, network: string): Promise<TransactionReceipt>
}
```

**EVM Deployment Flow**:
1. Retrieve bytecode from artifact storage
2. Create deployment transaction with constructor args
3. Estimate gas using `eth_estimateGas`
4. Return unsigned transaction to client
5. Receive signed transaction from client
6. Submit via `eth_sendRawTransaction`
7. Poll for receipt using `eth_getTransactionReceipt`
8. Parse contract address from receipt
9. Store deployment record in database
10. Return contract address and transaction hash

**Stellar Deployment Flow**:
1. Retrieve WASM from artifact storage
2. Create `InstallContractCode` operation
3. Build transaction envelope with:
   - Source account
   - Network passphrase
   - Base fee
   - Sequence number (fetch from Horizon)
4. Return envelope XDR to client for Freighter signing
5. Receive signed envelope from client
6. Submit to Horizon API `/transactions`
7. Poll transaction status via Horizon
8. Extract contract ID from transaction result
9. Store deployment record in database
10. Return contract ID and transaction hash

**Network Configuration**:
```typescript
const NETWORKS = {
  stellar: {
    testnet: {
      horizonUrl: 'https://horizon-testnet.stellar.org',
      sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
      networkPassphrase: 'Test SDF Network ; September 2015'
    },
    mainnet: {
      horizonUrl: 'https://horizon.stellar.org',
      sorobanRpcUrl: 'https://soroban-mainnet.stellar.org',
      networkPassphrase: 'Public Global Stellar Network ; September 2015'
    }
  },
  evm: {
    celo: {
      rpcUrl: process.env.CELO_RPC_URL,
      chainId: 42220
    },
    // ... other EVM networks
  }
}
```

### 4. AI Intelligence Engine

**Interface**:
```typescript
interface AIIntelligenceEngine {
  analyzeContract(code: string, type: ContractType): Promise<AnalysisResult>
  scoreFunction(functionAST: ASTNode): RiskScore
  estimateGas(functionAST: ASTNode): number
  inferUIFields(parameters: Parameter[]): UIFieldSuggestion[]
  suggestErrorHandling(code: string): Recommendation[]
}
```

**Risk Scoring Algorithm**:
```
Risk Score = Base Score + Modifiers

Base Score:
- Read-only function: 0
- State-modifying function: 20
- Payable function: 40

Modifiers:
- External call: +30
- Delegatecall: +50
- Unchecked math: +20
- No access control: +25
- Reentrancy pattern: +40
- Assembly usage: +15

Risk Levels:
- 0-25: Low
- 26-50: Medium
- 51-75: High
- 76-100: Critical
```

**Gas Estimation**:
- Parse function body AST
- Count operations by type (SLOAD, SSTORE, CALL, etc.)
- Apply gas cost table
- Add base transaction cost (21000 for EVM)
- Return estimated gas units

**UI Field Inference**:
```typescript
// Mapping parameter types to UI components
const UI_FIELD_MAP = {
  'address': { type: 'text', pattern: '^0x[a-fA-F0-9]{40}$', placeholder: '0x...' },
  'uint256': { type: 'number', min: 0, placeholder: 'Enter amount' },
  'string': { type: 'text', placeholder: 'Enter text' },
  'bool': { type: 'checkbox' },
  'bytes': { type: 'textarea', placeholder: 'Enter hex data' }
}
```

### 5. Queue System (BullMQ)

**Purpose**: Handle long-running compilation jobs asynchronously

**Queue Configuration**:
```typescript
const compilationQueue = new Queue('compilation', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 500
  }
})
```

**Job Types**:
- `compile-evm`: EVM contract compilation
- `compile-stellar`: Stellar contract compilation
- `analyze-contract`: AI analysis job

**Worker Implementation**:
```typescript
const worker = new Worker('compilation', async (job) => {
  const { type, code, contractName, options } = job.data
  
  if (type === 'compile-evm') {
    return await compileEVM(code, contractName, options)
  } else if (type === 'compile-stellar') {
    return await compileStellar(code, contractName, options)
  }
}, {
  connection: redisConnection,
  concurrency: 5
})
```

### 6. Caching Layer (Redis)

**Cache Keys**:
- `contract:abi:{contractAddress}` - Contract ABI (TTL: 1 hour)
- `simulation:{hash}` - Simulation results (TTL: 5 minutes)
- `analysis:{codeHash}` - AI analysis results (TTL: 1 hour)
- `artifact:{artifactId}` - Artifact metadata (TTL: 24 hours)

**Cache Strategy**:
- Cache-aside pattern for reads
- Write-through for critical data
- Lazy expiration with TTL

### 7. Artifact Storage (S3)

**Bucket Structure**:
```
artifacts/
  evm/
    {sha256-hash}.bytecode.gz
  stellar/
    {sha256-hash}.wasm
  metadata/
    {artifactId}.json
```

**Storage Operations**:
```typescript
interface ArtifactStorage {
  store(artifact: Buffer, type: 'evm' | 'stellar'): Promise<string>
  retrieve(artifactId: string): Promise<Buffer>
  generateSignedUrl(artifactId: string, expiresIn: number): Promise<string>
  delete(artifactId: string): Promise<void>
}
```

## Data Models

### Database Schema (Supabase PostgreSQL)

#### `contracts` Table
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network VARCHAR(50) NOT NULL,  -- 'celo', 'stellar-testnet', 'stellar-mainnet', etc.
  contract_type VARCHAR(20) NOT NULL,  -- 'evm' or 'stellar'
  abi JSONB NOT NULL,
  bytecode_hash VARCHAR(64),  -- For EVM contracts
  wasm_hash VARCHAR(64),  -- For Stellar contracts
  artifact_id VARCHAR(64) NOT NULL UNIQUE,
  deployer VARCHAR(100) NOT NULL,
  contract_address VARCHAR(100),  -- EVM address or Stellar contract ID
  tx_hash VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_deployer (deployer),
  INDEX idx_network (network),
  INDEX idx_tx_hash (tx_hash),
  INDEX idx_artifact_id (artifact_id)
);
```

#### `projects` Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  network VARCHAR(50) NOT NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  frontend_version VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (user_id),
  INDEX idx_contract_id (contract_id)
);
```

#### `analytics` Table
```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  gas_spent BIGINT DEFAULT 0,
  tx_count INTEGER DEFAULT 0,
  user_interactions INTEGER DEFAULT 0,
  timestamp TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_project_id (project_id),
  INDEX idx_timestamp (timestamp)
);
```

#### `compilation_jobs` Table
```sql
CREATE TABLE compilation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id VARCHAR(100) NOT NULL UNIQUE,  -- BullMQ job ID
  contract_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,  -- 'pending', 'processing', 'completed', 'failed'
  source_code_hash VARCHAR(64) NOT NULL,
  artifact_id VARCHAR(64),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  INDEX idx_job_id (job_id),
  INDEX idx_status (status)
);
```

### TypeScript Interfaces

```typescript
interface EVMCompilationResult {
  success: boolean
  abi: Array<ABIElement>
  bytecode: string
  warnings: string[]
  artifactId: string
}

interface StellarCompilationResult {
  success: boolean
  abi: SorobanABI
  wasmHash: string
  artifactId: string
  warnings: string[]
}

interface DeploymentResult {
  success: boolean
  contractAddress?: string  // EVM
  contractId?: string  // Stellar
  txHash: string
  network: string
  gasUsed?: number
}

interface AnalysisResult {
  riskScores: Record<string, RiskScore>
  gasEstimates: Record<string, number>
  uiSuggestions: Record<string, UIFieldSuggestion>
  recommendations: Recommendation[]
}

interface RiskScore {
  score: number
  level: 'low' | 'medium' | 'high' | 'critical'
  reasons: string[]
}

interface UIFieldSuggestion {
  fieldType: string
  validation: string
  placeholder: string
}

interface Recommendation {
  type: 'security' | 'optimization' | 'best-practice'
  severity: 'info' | 'warning' | 'error'
  message: string
  location: string
}
```

## Error Handling

### Error Categories

**1. Validation Errors (HTTP 400)**
- Missing required fields
- Invalid contract code syntax
- Invalid network specification
- Invalid artifact ID

**2. Compilation Errors (HTTP 400)**
- Solidity compilation failures
- Rust compilation failures
- ABI validation failures
- Timeout errors (>60s)

**3. Deployment Errors (HTTP 400/500)**
- Insufficient gas
- Transaction revert
- Network connectivity issues
- Invalid transaction signature

**4. Infrastructure Errors (HTTP 500)**
- Database connection failures
- Redis connection failures
- S3 storage failures
- Queue system failures

**5. External Service Errors (HTTP 502/503)**
- Horizon API unavailable
- Soroban RPC unavailable
- RPC node unavailable

### Error Response Format

```typescript
interface ErrorResponse {
  error: string  // Human-readable error message
  code: string  // Machine-readable error code
  details?: string  // Additional context
  timestamp: string
  requestId: string
}
```

### Retry Strategy

**Transient Errors**: Retry with exponential backoff
- Network timeouts
- Rate limit errors (429)
- Service unavailable (503)

**Configuration**:
```typescript
const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelay: 1000,  // ms
  maxDelay: 10000,  // ms
  backoffMultiplier: 2
}
```

**Non-Retryable Errors**:
- Validation errors (400)
- Authentication errors (401)
- Not found errors (404)
- Compilation errors

### Logging

All errors logged with:
- Timestamp
- Request ID
- User ID (if authenticated)
- Error type and message
- Stack trace
- Request payload (sanitized)

## Testing Strategy

### Unit Testing

**Framework**: Jest with TypeScript

**Coverage Requirements**:
- Minimum 80% code coverage
- 100% coverage for critical paths (compilation, deployment)

**Test Categories**:

1. **API Route Tests**
   - Valid request handling
   - Invalid input rejection
   - Error response formatting
   - Rate limiting behavior

2. **Compilation Service Tests**
   - EVM compilation with valid Solidity
   - Stellar compilation with valid Rust
   - Error handling for invalid code
   - Artifact storage and retrieval
   - ABI validation

3. **Deployment Service Tests**
   - Transaction creation
   - Network configuration selection
   - Confirmation polling
   - Database record creation

4. **AI Engine Tests**
   - Risk scoring accuracy
   - Gas estimation
   - UI field inference
   - Recommendation generation

5. **Integration Tests**
   - End-to-end compilation flow
   - End-to-end deployment flow
   - Queue job processing
   - Cache behavior

### Property-Based Testing

**Framework**: fast-check (TypeScript property testing library)

**Configuration**: Minimum 100 iterations per property test

**Test Tagging**: Each property test must include a comment:
```typescript
// Feature: stellar-backend-infrastructure, Property {N}: {property description}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Compilation Returns Required Artifacts

*For any* valid contract code (Solidity or Rust), when compiled through the appropriate endpoint (`/api/compile/evm` or `/api/compile/stellar`), the response should contain ABI and either bytecode (for EVM) or WASM hash (for Stellar), along with a unique artifact ID.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Compilation Artifacts Are Stored with Content-Addressed Identifiers

*For any* successful compilation, the generated artifact should be stored in Artifact_Storage with a cryptographic hash (SHA-256) computed from the artifact content and used as the storage key.

**Validates: Requirements 1.8, 11.1, 11.2**

### Property 3: Compilation Errors Include Diagnostic Information

*For any* invalid contract code that fails compilation, the error response should contain descriptive error messages with line numbers and error types.

**Validates: Requirements 1.4**

### Property 4: ABI Validation Occurs for All Compilations

*For any* compiled contract, the generated ABI should be validated against the appropriate blockchain-specific schema (EVM or Soroban) before being returned or stored.

**Validates: Requirements 1.7, 7.7**

### Property 5: Deployment Creates Appropriate Transaction Structures

*For any* deployment request with a valid artifact ID, the Deployment_Service should create the appropriate transaction structure (unsigned transaction for EVM, Transaction_Envelope for Stellar) based on the contract type and network.

**Validates: Requirements 2.1, 2.2**

### Property 6: Network Configuration Determines API Endpoints

*For any* operation targeting a specific network (testnet or mainnet), the Backend_System should use the correct API endpoints (Horizon URL, Soroban RPC URL, or EVM RPC URL) corresponding to that network configuration.

**Validates: Requirements 2.8, 2.9, 3.3**

### Property 7: Successful Deployments Create Database Records

*For any* successful contract deployment, a record should be inserted into the `contracts` table containing network, deployer address, contract address/ID, transaction hash, and timestamp.

**Validates: Requirements 2.7, 6.4**

### Property 8: Failed Deployments Return Error Information

*For any* deployment that fails, the error response should contain the failure reason and transaction hash (if the transaction was submitted but reverted).

**Validates: Requirements 2.6**

### Property 9: Transaction Confirmation Polling Returns Final Status

*For any* submitted deployment transaction, the Backend_System should poll the blockchain until confirmation is received and return the final contract address/ID.

**Validates: Requirements 2.5**

### Property 10: Network Requests Retry on Transient Failures

*For any* network request to external services (Horizon API, Soroban RPC, EVM RPC) that fails with a transient error, the Backend_System should retry with exponential backoff up to 3 attempts before returning an error.

**Validates: Requirements 3.6**

### Property 11: API Responses Are Validated Against Schemas

*For any* response received from external blockchain APIs (Horizon, Soroban RPC), the Backend_System should validate the response structure against expected schemas before processing.

**Validates: Requirements 3.7**

### Property 12: Simulation Returns Execution Results and Gas Estimates

*For any* valid simulation request, the Backend_System should return execution results, gas estimates (in appropriate units: gas for EVM, Stroops for Stellar), and state changes.

**Validates: Requirements 4.4, 4.6**

### Property 13: Failed Simulations Return Revert Reasons

*For any* simulation that fails or reverts, the Backend_System should return the revert reason or error message explaining why the execution failed.

**Validates: Requirements 4.5**

### Property 14: Simulation Supports Variable Account States

*For any* simulation request with specified account states and balances, the Backend_System should execute the simulation using those states rather than current blockchain state.

**Validates: Requirements 4.7**

### Property 15: Contract Analysis Assigns Risk Scores to Functions

*For any* contract submitted for analysis, the AI_Intelligence_Engine should assign risk scores (0-100) to each function based on state modifications, external calls, and value transfers, categorized as low, medium, high, or critical.

**Validates: Requirements 5.2**

### Property 16: Contract Analysis Provides Comprehensive Output

*For any* contract analysis, the response should include risk scores, gas estimates, UI field suggestions, error handling recommendations, and frontend integration suggestions in structured JSON format.

**Validates: Requirements 5.3, 5.4, 5.5, 5.6, 5.7**

### Property 17: High-Risk Patterns Trigger Remediation Recommendations

*For any* contract analysis that detects functions with high or critical risk scores, the AI_Intelligence_Engine should provide specific remediation recommendations for those functions.

**Validates: Requirements 5.8**

### Property 18: Project Creation Links to Deployed Contracts

*For any* project created in the system, a record should be inserted into the `projects` table with a valid foreign key reference to an existing contract in the `contracts` table.

**Validates: Requirements 6.5**

### Property 19: Contract Interactions Update Analytics

*For any* contract interaction event, the Backend_System should update the corresponding record in the `analytics` table with incremented counters (tx_count, user_interactions) and accumulated gas costs.

**Validates: Requirements 6.6**

### Property 20: Rate Limiting Enforces Request Limits

*For any* IP address making API requests, the Backend_System should enforce a rate limit of 100 requests per minute, returning HTTP 429 (Too Many Requests) for requests exceeding this limit.

**Validates: Requirements 7.2**

### Property 21: Input Sanitization Prevents Injection Attacks

*For any* user input (contract code, ABI data, function parameters), the Backend_System should sanitize strings to remove or escape potentially malicious content before processing or storage.

**Validates: Requirements 7.3, 7.6**

### Property 22: Static Analysis Detects Common Vulnerabilities

*For any* contract compilation, the Backend_System should perform static analysis and detect common vulnerability patterns (reentrancy, unchecked calls, integer overflow, etc.).

**Validates: Requirements 7.4**

### Property 23: Compilation Jobs Are Enqueued for Async Processing

*For any* compilation or deployment request received by the Backend_System, a job should be created in the Queue_System with appropriate metadata and status tracking.

**Validates: Requirements 8.2**

### Property 24: Artifacts Are Stored in S3, Not Database

*For any* compiled contract artifact (bytecode or WASM), the artifact content should be stored in Artifact_Storage (S3) and only the artifact ID and metadata should be stored in the Database.

**Validates: Requirements 8.3**

### Property 25: Cache-First Retrieval Avoids Database Queries

*For any* request for frequently accessed data (contract ABIs, metadata), if the data exists in the Cache_Layer, it should be returned from cache without querying the Database.

**Validates: Requirements 8.4, 8.5**

### Property 26: Failed Queue Jobs Retry with Exponential Backoff

*For any* queue job that fails during processing, the Queue_System should retry the job with exponential backoff up to 5 attempts before marking it as permanently failed.

**Validates: Requirements 8.8**

### Property 27: Legacy Endpoint Routes to New Handler

*For any* request to the legacy `/api/compile` endpoint, the Backend_System should route it to the new `/api/compile/evm` handler and return a response in the original format.

**Validates: Requirements 9.2, 9.3**

### Property 28: Existing Project Queries Return Expected Format

*For any* query for existing project data, the Backend_System should return data in the format expected by existing clients (maintaining field names, types, and structure).

**Validates: Requirements 9.4**

### Property 29: API Responses Follow Consistent Format

*For any* API request, the response should follow a consistent format: HTTP 200 with `success: true` for successful requests, HTTP 400 with `error` field for client errors, and HTTP 500 with `error` and optional `details` for server errors.

**Validates: Requirements 10.1, 10.2, 10.3**

### Property 30: CORS Headers Are Included in All Responses

*For any* API response, appropriate CORS headers (Access-Control-Allow-Origin, Access-Control-Allow-Methods, etc.) should be included based on the configured allowed origins.

**Validates: Requirements 10.7**

### Property 31: EVM Bytecode Is Compressed Before Storage

*For any* EVM contract compilation, the bytecode should be compressed (using gzip) before being stored in Artifact_Storage to reduce storage costs.

**Validates: Requirements 11.3**

### Property 32: Artifact Retrieval Generates Signed URLs

*For any* artifact retrieval request, the Backend_System should generate a signed URL with 1-hour expiration that grants temporary access to the artifact in S3.

**Validates: Requirements 11.4**

### Property 33: Artifact Access Requires Authorization

*For any* artifact retrieval request, the Backend_System should verify that the requesting user has permission to access the artifact before generating a signed URL.

**Validates: Requirements 11.5**

### Property 34: Artifact Deletion Updates Database Status

*For any* artifact deleted from Artifact_Storage, the corresponding record in the Database should be updated to mark the artifact as archived.

**Validates: Requirements 11.7**

### Property 35: Operations Are Logged with Required Metadata

*For any* compilation or deployment operation, the Backend_System should create a log entry containing timestamp, operation type, network, success/failure status, and relevant identifiers (artifact ID, contract address, transaction hash).

**Validates: Requirements 12.1, 12.2**

### Property 36: Errors Are Logged with Stack Traces

*For any* error that occurs during request processing, the Backend_System should log the error with stack trace, context information (request ID, user ID, operation type), and the error message.

**Validates: Requirements 12.3**

### Property 37: Performance Metrics Are Emitted for Operations

*For any* compilation, deployment, or API request, the Backend_System should emit timing metrics (duration in milliseconds) for monitoring and performance analysis.

**Validates: Requirements 12.4**

### Property 38: Queue Metrics Track Depth and Processing Time

*For any* job processed through the Queue_System, metrics should be emitted tracking queue depth (number of pending jobs) and processing time (time from enqueue to completion).

**Validates: Requirements 12.5**

