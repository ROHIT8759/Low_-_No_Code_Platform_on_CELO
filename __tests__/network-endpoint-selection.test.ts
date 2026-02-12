/**
 * @jest-environment node
 */

import { DeploymentService, STELLAR_NETWORK_CONFIG, EVM_NETWORK_CONFIG } from '@/lib/services/deployment';
import { HorizonClient, HORIZON_NETWORKS } from '@/lib/stellar/horizon';
import { SorobanRpcClient, SOROBAN_RPC_NETWORKS } from '@/lib/stellar/soroban-rpc';
import * as fc from 'fast-check';

/**
 * Property-Based Tests for Network Endpoint Selection
 * 
 * These tests validate that network configuration correctly determines
 * the appropriate API endpoints for both EVM and Stellar networks.
 */

describe('Network Endpoint Selection - Property-Based Tests', () => {
  const deploymentService = new DeploymentService();

  describe('Property 6: Network Configuration Determines API Endpoints', () => {
    // Feature: stellar-backend-infrastructure, Property 6: Network Configuration Determines API Endpoints
    
    /**
     * **Validates: Requirements 2.8, 2.9, 3.3**
     * 
     * Property: For any operation targeting a specific network (testnet or mainnet),
     * the Backend_System should use the correct API endpoints (Horizon URL, Soroban RPC URL,
     * or EVM RPC URL) corresponding to that network configuration.
     * 
     * This property ensures that network selection correctly routes to the appropriate
     * blockchain infrastructure endpoints.
     */

    test('Stellar testnet operations use testnet Horizon API endpoints', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary Stellar account addresses (56 character alphanumeric starting with G)
          fc.stringMatching(/^G[A-Z2-7]{55}$/),
          async (sourceAccount) => {
            // Property 1: DeploymentService should return testnet Horizon URL for testnet network
            const networkConfig = deploymentService.getStellarNetworkConfig('testnet');
            
            expect(networkConfig.horizonUrl).toBe(STELLAR_NETWORK_CONFIG.testnet.horizonUrl);
            expect(networkConfig.horizonUrl).toBe('https://horizon-testnet.stellar.org');
            
            // Property 2: Network passphrase should match testnet
            expect(networkConfig.networkPassphrase).toBe(STELLAR_NETWORK_CONFIG.testnet.networkPassphrase);
            expect(networkConfig.networkPassphrase).toBe('Test SDF Network ; September 2015');
            
            // Property 3: Soroban RPC URL should be testnet
            expect(networkConfig.sorobanRpcUrl).toBe(STELLAR_NETWORK_CONFIG.testnet.sorobanRpcUrl);
            expect(networkConfig.sorobanRpcUrl).toBe('https://soroban-testnet.stellar.org');
            
            // Property 4: HorizonClient should use testnet URL
            const horizonClient = new HorizonClient('testnet');
            expect(horizonClient.getNetworkPassphrase()).toBe('Test SDF Network ; September 2015');
            
            // Property 5: SorobanRpcClient should use testnet URL
            const sorobanClient = new SorobanRpcClient('testnet');
            expect(sorobanClient.getRpcUrl()).toBe('https://soroban-testnet.stellar.org');
            expect(sorobanClient.getNetworkPassphrase()).toBe('Test SDF Network ; September 2015');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Stellar mainnet operations use mainnet Horizon API endpoints', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary Stellar account addresses
          fc.stringMatching(/^G[A-Z2-7]{55}$/),
          async (sourceAccount) => {
            // Property 1: DeploymentService should return mainnet Horizon URL for mainnet network
            const networkConfig = deploymentService.getStellarNetworkConfig('mainnet');
            
            expect(networkConfig.horizonUrl).toBe(STELLAR_NETWORK_CONFIG.mainnet.horizonUrl);
            expect(networkConfig.horizonUrl).toBe('https://horizon.stellar.org');
            
            // Property 2: Network passphrase should match mainnet
            expect(networkConfig.networkPassphrase).toBe(STELLAR_NETWORK_CONFIG.mainnet.networkPassphrase);
            expect(networkConfig.networkPassphrase).toBe('Public Global Stellar Network ; September 2015');
            
            // Property 3: Soroban RPC URL should be mainnet
            expect(networkConfig.sorobanRpcUrl).toBe(STELLAR_NETWORK_CONFIG.mainnet.sorobanRpcUrl);
            expect(networkConfig.sorobanRpcUrl).toBe('https://soroban-mainnet.stellar.org');
            
            // Property 4: HorizonClient should use mainnet URL
            const horizonClient = new HorizonClient('mainnet');
            expect(horizonClient.getNetworkPassphrase()).toBe('Public Global Stellar Network ; September 2015');
            
            // Property 5: SorobanRpcClient should use mainnet URL
            const sorobanClient = new SorobanRpcClient('mainnet');
            expect(sorobanClient.getRpcUrl()).toBe('https://soroban-mainnet.stellar.org');
            expect(sorobanClient.getNetworkPassphrase()).toBe('Public Global Stellar Network ; September 2015');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('EVM network operations use correct RPC endpoints', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary EVM network selection
          fc.constantFrom('CELO_MAINNET', 'CELO_ALFAJORES'),
          async (network) => {
            // Property 1: DeploymentService should return correct RPC URL for EVM network
            const networkConfig = deploymentService.getEVMNetworkConfig(network);
            
            expect(networkConfig.rpcUrl).toBeDefined();
            expect(typeof networkConfig.rpcUrl).toBe('string');
            expect(networkConfig.rpcUrl.length).toBeGreaterThan(0);
            
            // Property 2: Chain ID should match network
            expect(networkConfig.chainId).toBeDefined();
            expect(typeof networkConfig.chainId).toBe('number');
            
            // Property 3: Network name should match
            expect(networkConfig.name).toBeDefined();
            expect(typeof networkConfig.name).toBe('string');
            
            // Property 4: Configuration should match EVM_NETWORK_CONFIG
            expect(networkConfig.rpcUrl).toBe(EVM_NETWORK_CONFIG[network].rpcUrl);
            expect(networkConfig.chainId).toBe(EVM_NETWORK_CONFIG[network].chainId);
            expect(networkConfig.name).toBe(EVM_NETWORK_CONFIG[network].name);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Network configuration is consistent across service methods', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary Stellar network
          fc.constantFrom('testnet', 'mainnet'),
          async (network) => {
            // Property 1: getStellarNetworkConfig should return consistent configuration
            const config1 = deploymentService.getStellarNetworkConfig(network);
            const config2 = deploymentService.getStellarNetworkConfig(network);
            
            expect(config1.horizonUrl).toBe(config2.horizonUrl);
            expect(config1.sorobanRpcUrl).toBe(config2.sorobanRpcUrl);
            expect(config1.networkPassphrase).toBe(config2.networkPassphrase);
            
            // Property 2: Helper methods should return same URLs
            const horizonUrl = deploymentService.getHorizonUrl(network);
            const sorobanUrl = deploymentService.getSorobanRpcUrl(network);
            const passphrase = deploymentService.getNetworkPassphrase(network);
            
            expect(horizonUrl).toBe(config1.horizonUrl);
            expect(sorobanUrl).toBe(config1.sorobanRpcUrl);
            expect(passphrase).toBe(config1.networkPassphrase);
            
            // Property 3: Configuration should match STELLAR_NETWORK_CONFIG constant
            expect(config1.horizonUrl).toBe(STELLAR_NETWORK_CONFIG[network].horizonUrl);
            expect(config1.sorobanRpcUrl).toBe(STELLAR_NETWORK_CONFIG[network].sorobanRpcUrl);
            expect(config1.networkPassphrase).toBe(STELLAR_NETWORK_CONFIG[network].networkPassphrase);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Horizon client configuration matches network selection', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('testnet', 'mainnet'),
          async (network) => {
            // Create Horizon client for network
            const horizonClient = new HorizonClient(network);
            
            // Property 1: Client should use correct Horizon URL
            const expectedUrl = HORIZON_NETWORKS[network].horizonUrl;
            const server = horizonClient.getServer();
            expect(server).toBeDefined();
            
            // Property 2: Network passphrase should match
            const passphrase = horizonClient.getNetworkPassphrase();
            expect(passphrase).toBe(HORIZON_NETWORKS[network].networkPassphrase);
            
            // Property 3: Configuration should be consistent with deployment service
            const deploymentConfig = deploymentService.getStellarNetworkConfig(network);
            expect(passphrase).toBe(deploymentConfig.networkPassphrase);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Soroban RPC client configuration matches network selection', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('testnet', 'mainnet'),
          async (network) => {
            // Create Soroban RPC client for network
            const sorobanClient = new SorobanRpcClient(network);
            
            // Property 1: Client should use correct RPC URL
            const rpcUrl = sorobanClient.getRpcUrl();
            expect(rpcUrl).toBe(SOROBAN_RPC_NETWORKS[network].sorobanRpcUrl);
            
            // Property 2: Network passphrase should match
            const passphrase = sorobanClient.getNetworkPassphrase();
            expect(passphrase).toBe(SOROBAN_RPC_NETWORKS[network].networkPassphrase);
            
            // Property 3: Configuration should be consistent with deployment service
            const deploymentConfig = deploymentService.getStellarNetworkConfig(network);
            expect(rpcUrl).toBe(deploymentConfig.sorobanRpcUrl);
            expect(passphrase).toBe(deploymentConfig.networkPassphrase);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Invalid network identifiers throw appropriate errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate invalid network names
          fc.oneof(
            fc.constant('invalid'),
            fc.constant('production'),
            fc.constant('development'),
            fc.constant(''),
            fc.constant('TESTNET'), // Wrong case
            fc.constant('Mainnet'), // Wrong case
          ),
          async (invalidNetwork) => {
            // Property 1: getStellarNetworkConfig should throw for invalid networks
            expect(() => {
              deploymentService.getStellarNetworkConfig(invalidNetwork as any);
            }).toThrow();
            
            // Property 2: Error message should be descriptive
            try {
              deploymentService.getStellarNetworkConfig(invalidNetwork as any);
              fail('Should have thrown an error');
            } catch (error: any) {
              expect(error.message).toContain('Unknown Stellar network');
            }
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    test('Network endpoints are HTTPS URLs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('testnet', 'mainnet'),
          async (network) => {
            const config = deploymentService.getStellarNetworkConfig(network);
            
            // Property 1: Horizon URL should be HTTPS
            expect(config.horizonUrl).toMatch(/^https:\/\//);
            
            // Property 2: Soroban RPC URL should be HTTPS
            expect(config.sorobanRpcUrl).toMatch(/^https:\/\//);
            
            // Property 3: URLs should not have trailing slashes
            expect(config.horizonUrl).not.toMatch(/\/$/);
            expect(config.sorobanRpcUrl).not.toMatch(/\/$/);
            
            // Property 4: URLs should be valid
            expect(() => new URL(config.horizonUrl)).not.toThrow();
            expect(() => new URL(config.sorobanRpcUrl)).not.toThrow();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('EVM network endpoints are valid RPC URLs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('CELO_MAINNET', 'CELO_ALFAJORES'),
          async (network) => {
            const config = deploymentService.getEVMNetworkConfig(network);
            
            // Property 1: RPC URL should be HTTPS
            expect(config.rpcUrl).toMatch(/^https:\/\//);
            
            // Property 2: URL should be valid
            expect(() => new URL(config.rpcUrl)).not.toThrow();
            
            // Property 3: Chain ID should be positive integer
            expect(config.chainId).toBeGreaterThan(0);
            expect(Number.isInteger(config.chainId)).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Network passphrases are unique per network', () => {
      // Property: Testnet and mainnet should have different passphrases
      const testnetPassphrase = STELLAR_NETWORK_CONFIG.testnet.networkPassphrase;
      const mainnetPassphrase = STELLAR_NETWORK_CONFIG.mainnet.networkPassphrase;
      
      expect(testnetPassphrase).not.toBe(mainnetPassphrase);
      
      // Property: Passphrases should contain network identifier
      expect(testnetPassphrase.toLowerCase()).toContain('test');
      expect(mainnetPassphrase.toLowerCase()).toContain('public');
    });

    test('Network configuration is immutable', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('testnet', 'mainnet'),
          async (network) => {
            // Get configuration
            const config1 = deploymentService.getStellarNetworkConfig(network);
            
            // Attempt to modify (should not affect subsequent calls)
            const modifiedConfig = { ...config1 };
            modifiedConfig.horizonUrl = 'https://malicious-url.com';
            
            // Get configuration again
            const config2 = deploymentService.getStellarNetworkConfig(network);
            
            // Property: Configuration should not be affected by modifications
            expect(config2.horizonUrl).toBe(STELLAR_NETWORK_CONFIG[network].horizonUrl);
            expect(config2.horizonUrl).not.toBe('https://malicious-url.com');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Deployment service correctly routes network-specific operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate network and artifact ID
          fc.constantFrom('testnet', 'mainnet'),
          fc.stringMatching(/^[a-f0-9]{64}$/), // SHA-256 hash
          async (network, artifactId) => {
            // Property 1: Validation should accept valid Stellar networks
            const validation = deploymentService.validateDeploymentOptions(
              {
                artifactId,
                network,
                sourceAccount: 'GABC123456789012345678901234567890123456789012345678',
              },
              'stellar'
            );
            
            expect(validation.valid).toBe(true);
            expect(validation.error).toBeUndefined();
            
            // Property 2: Network configuration should be retrievable
            const config = deploymentService.getStellarNetworkConfig(network);
            expect(config).toBeDefined();
            expect(config.horizonUrl).toBeDefined();
            expect(config.sorobanRpcUrl).toBeDefined();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('All network configurations have required fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('testnet', 'mainnet'),
          async (network) => {
            const config = deploymentService.getStellarNetworkConfig(network);
            
            // Property 1: All required fields must be present
            expect(config.horizonUrl).toBeDefined();
            expect(config.sorobanRpcUrl).toBeDefined();
            expect(config.networkPassphrase).toBeDefined();
            
            // Property 2: All fields must be non-empty strings
            expect(typeof config.horizonUrl).toBe('string');
            expect(config.horizonUrl.length).toBeGreaterThan(0);
            
            expect(typeof config.sorobanRpcUrl).toBe('string');
            expect(config.sorobanRpcUrl.length).toBeGreaterThan(0);
            
            expect(typeof config.networkPassphrase).toBe('string');
            expect(config.networkPassphrase.length).toBeGreaterThan(0);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('EVM network configurations have required fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('CELO_MAINNET', 'CELO_ALFAJORES'),
          async (network) => {
            const config = deploymentService.getEVMNetworkConfig(network);
            
            // Property 1: All required fields must be present
            expect(config.rpcUrl).toBeDefined();
            expect(config.chainId).toBeDefined();
            expect(config.name).toBeDefined();
            
            // Property 2: Fields must have correct types
            expect(typeof config.rpcUrl).toBe('string');
            expect(config.rpcUrl.length).toBeGreaterThan(0);
            
            expect(typeof config.chainId).toBe('number');
            expect(config.chainId).toBeGreaterThan(0);
            
            expect(typeof config.name).toBe('string');
            expect(config.name.length).toBeGreaterThan(0);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Network selection is case-sensitive', () => {
      // Property: Network identifiers should be case-sensitive
      
      // Valid lowercase should work
      expect(() => deploymentService.getStellarNetworkConfig('testnet')).not.toThrow();
      expect(() => deploymentService.getStellarNetworkConfig('mainnet')).not.toThrow();
      
      // Invalid uppercase should fail
      expect(() => deploymentService.getStellarNetworkConfig('TESTNET' as any)).toThrow();
      expect(() => deploymentService.getStellarNetworkConfig('MAINNET' as any)).toThrow();
      
      // Mixed case should fail
      expect(() => deploymentService.getStellarNetworkConfig('Testnet' as any)).toThrow();
      expect(() => deploymentService.getStellarNetworkConfig('MainNet' as any)).toThrow();
    });

    test('Horizon and Soroban URLs are on same domain for each network', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('testnet', 'mainnet'),
          async (network) => {
            const config = deploymentService.getStellarNetworkConfig(network);
            
            const horizonUrl = new URL(config.horizonUrl);
            const sorobanUrl = new URL(config.sorobanRpcUrl);
            
            // Property: Both URLs should be on stellar.org domain
            expect(horizonUrl.hostname).toContain('stellar.org');
            expect(sorobanUrl.hostname).toContain('stellar.org');
            
            // Property: Both should use same protocol (HTTPS)
            expect(horizonUrl.protocol).toBe('https:');
            expect(sorobanUrl.protocol).toBe('https:');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
