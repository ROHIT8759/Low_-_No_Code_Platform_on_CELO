
# Implementation Plan: Stellar Backend Infrastructure

## Overview

This implementation plan transforms the existing EVM-only backend into a multi-chain infrastructure supporting both EVM and Stellar/Soroban contracts. The approach follows an incremental strategy:

1. Set up infrastructure (database, queue, cache, storage)
2. Implement EVM compilation refactor with new architecture
3. Add Stellar compilation support
4. Implement deployment services for both chains
5. Add simulation and AI analysis features
6. Implement security and scalability features
7. Add monitoring and observability

Each task builds on previous work, with property-based tests integrated throughout to catch errors early.

## Tasks

- [x] 1. Set up infrastructure and database schema
  - [x] 1.1 Create Supabase database tables
    - Create `contracts` table with columns: id, network, contract_type, abi, bytecode_hash, wasm_hash, artifact_id, deployer, contract_address, tx_hash, created_at
    - Create `projects` table with columns: id, user_id, name, network, contract_id, frontend_version, created_at, updated_at
    - Create `analytics` table with columns: id, project_id, gas_spent, tx_count, user_interactions, timestamp
    - Create `compilation_jobs` table with columns: id, job_id, contract_type, status, source_code_hash, artifact_id, error_message, created_at, completed_at
    - Add indexes on frequently queried fields (deployer, network, tx_hash, artifact_id, user_id, job_id, status)
    - Add foreign key constraints between projects and contracts
    - _Requirements: 6.1, 6.2, 6.3, 6.7, 6.8_
  
  - [x] 1.2 Set up Redis cache configuration
    - Install `ioredis` package
    - Create `lib/cache.ts` with Redis client configuration
    - Implement cache operations: get, set, del, exists with TTL support
    - Add connection error handling and retry logic
    - _Requirements: 8.4, 8.5, 8.6_
  
  - [x] 1.3 Set up BullMQ queue system
    - Install `bullmq` package
    - Create `lib/queue.ts` with queue configuration
    - Configure compilation queue with retry settings (3 attempts, exponential backoff)
    - Set up job options: removeOnComplete: 100, removeOnFail: 500
    - _Requirements: 8.2, 8.8_
  
  - [x] 1.4 Set up S3 artifact storage
    - Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` packages
    - Create `lib/storage.ts` with S3 client configuration
    - Implement storage operations: store, retrieve, generateSignedUrl, delete
    - Create bucket structure: artifacts/evm/, artifacts/stellar/, artifacts/metadata/
    - _Requirements: 8.3, 11.1, 11.4_

- [x] 2. Refactor existing EVM compilation to new architecture
  - [x] 2.1 Create compilation service module
    - Create `lib/services/compilation.ts` with CompilationService class
    - Implement `compileEVM()` method that wraps existing solc logic
    - Add artifact storage integration (compress bytecode, store in S3)
    - Add database integration (insert into contracts table)
    - Compute and store SHA-256 hash of bytecode
    - _Requirements: 1.1, 1.3, 1.8, 11.3_
  
  - [x] 2.2 Write property test for EVM compilation artifact storage
    - **Property 2: Compilation Artifacts Are Stored with Content-Addressed Identifiers**
    - **Validates: Requirements 1.8, 11.1, 11.2**
  
  - [x] 2.3 Create new `/api/compile/evm` endpoint
    - Create `app/api/compile/evm/route.ts`
    - Implement POST handler with input validation
    - Enqueue compilation job in BullMQ
    - Return job ID for status polling
    - _Requirements: 1.1, 8.2_
  
  - [x] 2.4 Write property test for compilation response format
    - **Property 1: Compilation Returns Required Artifacts**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  
  - [x] 2.5 Update legacy `/api/compile` endpoint
    - Modify `app/api/compile/route.ts` to route to new EVM compilation service
    - Maintain backward-compatible response format
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 2.6 Write property test for legacy endpoint routing
    - **Property 27: Legacy Endpoint Routes to New Handler**
    - **Validates: Requirements 9.2, 9.3**

- [x] 3. Checkpoint - Verify EVM refactor
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement Stellar/Soroban compilation
  - [x] 4.1 Set up Rust and Soroban toolchain
    - Create Docker container or build environment with Rust and soroban-cli
    - Create `lib/stellar/compiler.ts` with functions to execute soroban-cli commands
    - Implement temporary directory management for compilation
    - _Requirements: 1.6_
  
  - [x] 4.2 Implement Stellar compilation service
    - Add `compileStellar()` method to CompilationService
    - Create temporary Cargo.toml and src/lib.rs from user code
    - Execute `soroban contract build --release`
    - Extract WASM from target directory
    - Compute SHA-256 hash of WASM
    - Extract ABI using `soroban contract inspect`
    - Store WASM in S3 with hash as key
    - _Requirements: 1.2, 1.6, 1.7, 1.8_
  
  - [x] 4.3 Implement ABI validation
    - Create `lib/validation/abi.ts` with validation functions
    - Implement `validateEVMABI()` for EVM ABI structure validation
    - Implement `validateSorobanABI()` for Soroban ABI structure validation
    - _Requirements: 1.7, 7.7_
  
  - [ ] 4.4 Write property test for ABI validation
    - **Property 4: ABI Validation Occurs for All Compilations**
    - **Validates: Requirements 1.7, 7.7**
  
  - [x] 4.5 Create `/api/compile/stellar` endpoint
    - Create `app/api/compile/stellar/route.ts`
    - Implement POST handler with Rust code validation
    - Enqueue Stellar compilation job
    - Return job ID and compilation status
    - _Requirements: 1.2, 8.2_
  
  - [ ] 4.6 Write property test for compilation error handling
    - **Property 3: Compilation Errors Include Diagnostic Information**
    - **Validates: Requirements 1.4**

- [ ] 5. Implement deployment services
  - [x] 5.1 Create deployment service module
    - Create `lib/services/deployment.ts` with DeploymentService class
    - Implement network configuration management (EVM and Stellar networks)
    - Add helper functions for transaction creation
    - _Requirements: 2.1, 2.2_
  
  - [x] 5.2 Implement EVM deployment
    - Add `deployEVM()` method to DeploymentService
    - Retrieve bytecode from artifact storage
    - Create unsigned deployment transaction with constructor args
    - Estimate gas using ethers.js
    - Return transaction for client-side signing
    - Accept signed transaction and submit to network
    - Poll for transaction receipt
    - Store deployment record in database
    - _Requirements: 2.1, 2.5, 2.7_
  
  - [ ] 5.3 Write property test for EVM deployment transaction creation
    - **Property 5: Deployment Creates Appropriate Transaction Structures**
    - **Validates: Requirements 2.1, 2.2**
  
  - [x] 5.4 Implement Stellar deployment
    - Install `@stellar/stellar-sdk` package
    - Add `deployStellar()` method to DeploymentService
    - Retrieve WASM from artifact storage
    - Create InstallContractCode operation
    - Build transaction envelope with network passphrase
    - Fetch sequence number from Horizon API
    - Return envelope XDR for Freighter signing
    - Accept signed envelope and submit to Horizon
    - Poll transaction status via Horizon API
    - Extract contract ID from result
    - Store deployment record in database
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.7_
  
  - [ ] 5.5 Write property test for deployment database records
    - **Property 7: Successful Deployments Create Database Records**
    - **Validates: Requirements 2.7, 6.4**
  
  - [x] 5.6 Implement Horizon API integration
    - Create `lib/stellar/horizon.ts` with Horizon client
    - Implement transaction submission
    - Implement transaction status polling
    - Implement account query for sequence numbers
    - Add network configuration (testnet and mainnet URLs)
    - _Requirements: 3.1, 3.3_
  
  - [ ] 5.7 Write property test for network endpoint selection
    - **Property 6: Network Configuration Determines API Endpoints**
    - **Validates: Requirements 2.8, 2.9, 3.3**
  
  - [x] 5.8 Create `/api/deploy/evm` endpoint
    - Create `app/api/deploy/evm/route.ts`
    - Implement POST handler for deployment requests
    - Call DeploymentService.deployEVM()
    - Return contract address and transaction hash
    - _Requirements: 2.1, 2.5_
  
  - [x] 5.9 Create `/api/deploy/stellar` endpoint
    - Create `app/api/deploy/stellar/route.ts`
    - Implement POST handler for Stellar deployment
    - Call DeploymentService.deployStellar()
    - Return contract ID and transaction hash
    - _Requirements: 2.2, 2.4, 2.5_
  
  - [ ] 5.10 Write property test for deployment error handling
    - **Property 8: Failed Deployments Return Error Information**
    - **Validates: Requirements 2.6**

- [ ] 6. Checkpoint - Verify compilation and deployment
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement contract simulation
  - [x] 7.1 Create simulation service module
    - Create `lib/services/simulation.ts` with SimulationService class
    - Implement `simulateEVM()` using ethers.js with local fork
    - Implement `simulateStellar()` using Soroban RPC
    - Add result parsing and formatting
    - _Requirements: 4.2, 4.3_
  
  - [ ] 7.2 Implement Soroban RPC integration
    - Create `lib/stellar/soroban-rpc.ts` with RPC client
    - Implement `simulateTransaction()` method
    - Parse simulation results (gas estimates, state changes, logs)
    - Add network configuration (testnet and mainnet RPC URLs)
    - _Requirements: 3.2, 3.4, 4.3_
  
  - [ ] 7.3 Write property test for simulation results
    - **Property 12: Simulation Returns Execution Results and Gas Estimates**
    - **Validates: Requirements 4.4, 4.6**
  
  - [ ] 7.4 Implement simulation caching
    - Add cache integration to SimulationService
    - Cache simulation results with 5-minute TTL
    - Use hash of (contract code + function + args) as cache key
    - _Requirements: 8.4, 8.5_
  
  - [ ] 7.5 Create `/api/simulate` endpoint
    - Create `app/api/simulate/route.ts`
    - Implement POST handler for simulation requests
    - Support both EVM and Stellar contract types
    - Return execution results, gas estimates, and state changes
    - _Requirements: 4.1, 4.4, 4.5, 4.6, 4.7_
  
  - [ ] 7.6 Write property test for simulation error handling
    - **Property 13: Failed Simulations Return Revert Reasons**
    - **Validates: Requirements 4.5**
  
  - [ ] 7.7 Write property test for simulation with variable account states
    - **Property 14: Simulation Supports Variable Account States**
    - **Validates: Requirements 4.7**

- [ ] 8. Implement AI-powered contract analysis
  - [ ] 8.1 Create AI intelligence engine module
    - Create `lib/services/ai-engine.ts` with AIIntelligenceEngine class
    - Implement contract AST parsing (use @solidity-parser/parser for Solidity)
    - Implement function signature extraction
    - _Requirements: 5.1_
  
  - [ ] 8.2 Implement risk scoring algorithm
    - Add `scoreFunction()` method with risk calculation logic
    - Detect risk patterns: external calls (+30), delegatecall (+50), unchecked math (+20), no access control (+25), reentrancy (+40), assembly (+15)
    - Categorize scores: 0-25 (low), 26-50 (medium), 51-75 (high), 76-100 (critical)
    - Return risk score with reasons
    - _Requirements: 5.2_
  
  - [ ] 8.3 Write property test for risk scoring
    - **Property 15: Contract Analysis Assigns Risk Scores to Functions**
    - **Validates: Requirements 5.2**
  
  - [ ] 8.4 Implement gas estimation
    - Add `estimateGas()` method
    - Count operations by type (SLOAD, SSTORE, CALL, etc.)
    - Apply gas cost table for EVM operations
    - Add base transaction cost (21000)
    - _Requirements: 5.3_
  
  - [ ] 8.5 Implement UI field inference
    - Add `inferUIFields()` method
    - Map parameter types to UI components (address → text with pattern, uint256 → number, string → text, bool → checkbox, bytes → textarea)
    - Generate validation rules and placeholders
    - _Requirements: 5.4_
  
  - [ ] 8.6 Implement error handling suggestions
    - Add `suggestErrorHandling()` method
    - Detect missing error handling patterns
    - Suggest try-catch blocks, require statements, and error messages
    - _Requirements: 5.5_
  
  - [ ] 8.7 Implement frontend integration suggestions
    - Add method to generate frontend code snippets
    - Suggest web3 integration patterns
    - Provide example function calls
    - _Requirements: 5.6_
  
  - [ ] 8.8 Write property test for comprehensive analysis output
    - **Property 16: Contract Analysis Provides Comprehensive Output**
    - **Validates: Requirements 5.3, 5.4, 5.5, 5.6, 5.7**
  
  - [ ] 8.9 Implement analysis caching
    - Add cache integration to AIIntelligenceEngine
    - Cache analysis results with 1-hour TTL
    - Use hash of contract code as cache key
    - _Requirements: 8.4, 8.5_
  
  - [ ] 8.10 Create `/api/analyze` endpoint
    - Create `app/api/analyze/route.ts`
    - Implement POST handler for analysis requests
    - Call AIIntelligenceEngine methods
    - Return structured JSON with risk scores, gas estimates, UI suggestions, and recommendations
    - _Requirements: 5.1, 5.7_
  
  - [ ] 8.11 Write property test for high-risk remediation
    - **Property 17: High-Risk Patterns Trigger Remediation Recommendations**
    - **Validates: Requirements 5.8**

- [ ] 9. Checkpoint - Verify simulation and analysis features
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement security features
  - [ ] 10.1 Implement rate limiting middleware
    - Install `express-rate-limit` or implement custom rate limiter
    - Create `lib/middleware/rate-limit.ts`
    - Configure 100 requests per minute per IP address
    - Return HTTP 429 for exceeded limits
    - _Requirements: 7.2_
  
  - [ ] 10.2 Write property test for rate limiting
    - **Property 20: Rate Limiting Enforces Request Limits**
    - **Validates: Requirements 7.2**
  
  - [ ] 10.3 Implement input sanitization
    - Create `lib/security/sanitize.ts` with sanitization functions
    - Implement string sanitization to prevent injection attacks
    - Add validation for contract code, ABI data, and function parameters
    - _Requirements: 7.3, 7.6_
  
  - [ ] 10.4 Write property test for input sanitization
    - **Property 21: Input Sanitization Prevents Injection Attacks**
    - **Validates: Requirements 7.3, 7.6**
  
  - [ ] 10.5 Implement static analysis for vulnerabilities
    - Create `lib/security/static-analysis.ts`
    - Detect reentrancy patterns
    - Detect unchecked external calls
    - Detect integer overflow/underflow (for older Solidity versions)
    - Detect unprotected selfdestruct
    - _Requirements: 7.4_
  
  - [ ] 10.6 Write property test for vulnerability detection
    - **Property 22: Static Analysis Detects Common Vulnerabilities**
    - **Validates: Requirements 7.4**
  
  - [ ] 10.7 Implement CORS configuration
    - Create `lib/middleware/cors.ts`
    - Configure allowed origins from environment variables
    - Add CORS headers to all API responses
    - _Requirements: 7.5, 10.7_
  
  - [ ] 10.8 Write property test for CORS headers
    - **Property 30: CORS Headers Are Included in All Responses**
    - **Validates: Requirements 10.7**
  
  - [ ] 10.9 Implement artifact access authorization
    - Create `lib/security/authorization.ts`
    - Implement permission checking for artifact retrieval
    - Verify user owns or has access to requested artifacts
    - _Requirements: 11.5_
  
  - [ ] 10.10 Write property test for artifact authorization
    - **Property 33: Artifact Access Requires Authorization**
    - **Validates: Requirements 11.5**

- [ ] 11. Implement queue workers and job processing
  - [ ] 11.1 Create compilation queue worker
    - Create `lib/workers/compilation-worker.ts`
    - Implement worker to process compile-evm and compile-stellar jobs
    - Set concurrency to 5
    - Add error handling and job status updates
    - Update compilation_jobs table with status
    - _Requirements: 8.2, 8.8_
  
  - [ ] 11.2 Write property test for queue job processing
    - **Property 23: Compilation Jobs Are Enqueued for Async Processing**
    - **Validates: Requirements 8.2**
  
  - [ ] 11.3 Write property test for queue retry logic
    - **Property 26: Failed Queue Jobs Retry with Exponential Backoff**
    - **Validates: Requirements 8.8**
  
  - [ ] 11.4 Create job status endpoint
    - Create `app/api/jobs/[jobId]/route.ts`
    - Implement GET handler to query job status
    - Return job status, progress, and results
    - _Requirements: 8.2_

- [ ] 12. Implement caching and performance optimizations
  - [ ] 12.1 Add cache integration to API endpoints
    - Update compilation endpoints to cache results
    - Update analysis endpoint to use cache
    - Update simulation endpoint to use cache
    - _Requirements: 8.4, 8.5_
  
  - [ ] 12.2 Write property test for cache-first retrieval
    - **Property 25: Cache-First Retrieval Avoids Database Queries**
    - **Validates: Requirements 8.4, 8.5**
  
  - [ ] 12.3 Implement artifact compression
    - Update EVM compilation to compress bytecode with gzip before S3 storage
    - Add decompression when retrieving artifacts
    - _Requirements: 11.3_
  
  - [ ] 12.4 Write property test for bytecode compression
    - **Property 31: EVM Bytecode Is Compressed Before Storage**
    - **Validates: Requirements 11.3**
  
  - [ ] 12.5 Implement signed URL generation
    - Update artifact storage service to generate signed S3 URLs
    - Set 1-hour expiration on signed URLs
    - _Requirements: 11.4_
  
  - [ ] 12.6 Write property test for signed URL generation
    - **Property 32: Artifact Retrieval Generates Signed URLs**
    - **Validates: Requirements 11.4**

- [ ] 13. Implement monitoring and observability
  - [ ] 13.1 Create logging service
    - Create `lib/services/logger.ts` with structured logging
    - Implement log levels (debug, info, warn, error)
    - Add context fields (requestId, userId, operation)
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [ ] 13.2 Write property test for operation logging
    - **Property 35: Operations Are Logged with Required Metadata**
    - **Validates: Requirements 12.1, 12.2**
  
  - [ ] 13.3 Write property test for error logging
    - **Property 36: Errors Are Logged with Stack Traces**
    - **Validates: Requirements 12.3**
  
  - [ ] 13.4 Create metrics service
    - Create `lib/services/metrics.ts` for emitting metrics
    - Implement timing metrics for compilation, deployment, API requests
    - Implement counter metrics for operations
    - _Requirements: 12.4, 12.5_
  
  - [ ] 13.5 Write property test for performance metrics
    - **Property 37: Performance Metrics Are Emitted for Operations**
    - **Validates: Requirements 12.4**
  
  - [ ] 13.6 Write property test for queue metrics
    - **Property 38: Queue Metrics Track Depth and Processing Time**
    - **Validates: Requirements 12.5**
  
  - [ ] 13.7 Create health check endpoint
    - Create `app/api/health/route.ts`
    - Implement GET handler that checks database, Redis, and queue connectivity
    - Return status for each service
    - _Requirements: 12.6_
  
  - [ ] 13.8 Add logging to all API endpoints
    - Update all API routes to log requests with timestamp, operation, network, status
    - Log errors with stack traces and context
    - _Requirements: 12.1, 12.2, 12.3_

- [ ] 14. Implement API response standardization
  - [ ] 14.1 Create response formatter utility
    - Create `lib/utils/response.ts` with standard response functions
    - Implement `successResponse()` for HTTP 200 with success: true
    - Implement `clientErrorResponse()` for HTTP 400 with error field
    - Implement `serverErrorResponse()` for HTTP 500 with error and details
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 14.2 Write property test for API response format
    - **Property 29: API Responses Follow Consistent Format**
    - **Validates: Requirements 10.1, 10.2, 10.3**
  
  - [ ] 14.3 Update all API endpoints to use response formatter
    - Refactor all API routes to use standard response functions
    - Ensure consistent error handling
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 15. Implement retry logic for external services
  - [ ] 15.1 Create retry utility
    - Create `lib/utils/retry.ts` with exponential backoff retry logic
    - Configure max 3 attempts for network requests
    - Configure initial delay 1000ms, max delay 10000ms, multiplier 2
    - _Requirements: 3.6_
  
  - [ ] 15.2 Write property test for network retry logic
    - **Property 10: Network Requests Retry on Transient Failures**
    - **Validates: Requirements 3.6**
  
  - [ ] 15.3 Add retry logic to external API calls
    - Update Horizon API client with retry logic
    - Update Soroban RPC client with retry logic
    - Update EVM RPC calls with retry logic
    - _Requirements: 3.6_
  
  - [ ] 15.4 Implement API response validation
    - Create `lib/validation/api-responses.ts` with schema validators
    - Implement Horizon API response validation
    - Implement Soroban RPC response validation
    - _Requirements: 3.7_
  
  - [ ] 15.5 Write property test for API response validation
    - **Property 11: API Responses Are Validated Against Schemas**
    - **Validates: Requirements 3.7**

- [ ] 16. Implement project and analytics features
  - [ ] 16.1 Create project management endpoints
    - Create `app/api/projects/route.ts` for creating projects
    - Implement POST handler to insert project records
    - Link projects to deployed contracts via foreign key
    - _Requirements: 6.5_
  
  - [ ] 16.2 Write property test for project creation
    - **Property 18: Project Creation Links to Deployed Contracts**
    - **Validates: Requirements 6.5**
  
  - [ ] 16.3 Create analytics tracking
    - Create `lib/services/analytics.ts` with tracking functions
    - Implement `trackInteraction()` to update analytics table
    - Increment tx_count, user_interactions, and accumulate gas_spent
    - _Requirements: 6.6_
  
  - [ ] 16.4 Write property test for analytics updates
    - **Property 19: Contract Interactions Update Analytics**
    - **Validates: Requirements 6.6**
  
  - [ ] 16.5 Create analytics query endpoints
    - Create `app/api/analytics/[projectId]/route.ts`
    - Implement GET handler to retrieve analytics data
    - Return aggregated metrics for projects
    - _Requirements: 6.6_

- [ ] 17. Implement artifact lifecycle management
  - [ ] 17.1 Create artifact retention service
    - Create `lib/services/artifact-retention.ts`
    - Implement function to identify unused artifacts (>90 days old)
    - Mark old artifacts for deletion
    - _Requirements: 11.6_
  
  - [ ] 17.2 Implement artifact deletion
    - Add `deleteArtifact()` method to storage service
    - Delete artifact from S3
    - Update database to mark artifact as archived
    - _Requirements: 11.7_
  
  - [ ] 17.3 Write property test for artifact deletion
    - **Property 34: Artifact Deletion Updates Database Status**
    - **Validates: Requirements 11.7**
  
  - [ ] 17.4 Create artifact cleanup cron job
    - Create scheduled job to run artifact retention service
    - Configure to run daily
    - _Requirements: 11.6_

- [ ] 18. Final integration and testing
  - [ ] 18.1 Create integration tests for end-to-end flows
    - Test EVM compilation → deployment flow
    - Test Stellar compilation → deployment flow
    - Test simulation → analysis → deployment flow
    - _Requirements: All_
  
  - [ ] 18.2 Write property test for existing project compatibility
    - **Property 28: Existing Project Queries Return Expected Format**
    - **Validates: Requirements 9.4**
  
  - [ ] 18.3 Create API documentation
    - Document all API endpoints with request/response examples
    - Include error codes and handling
    - Add authentication requirements
    - _Requirements: All_
  
  - [ ] 18.4 Update environment configuration
    - Document all required environment variables
    - Add .env.example file with all configuration options
    - Include network URLs, API keys, storage configuration
    - _Requirements: All_

- [ ] 19. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests (not marked with `*`) validate specific examples and integration points
- Checkpoints ensure incremental validation at major milestones
- The implementation follows an incremental approach: infrastructure → EVM refactor → Stellar support → advanced features → security → monitoring
- All property tests should use fast-check library with minimum 100 iterations
- Each property test must include a comment tag: `// Feature: stellar-backend-infrastructure, Property {N}: {property description}`
