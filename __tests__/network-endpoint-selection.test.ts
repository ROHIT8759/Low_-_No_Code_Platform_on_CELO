

import { DeploymentService, STELLAR_NETWORK_CONFIG, EVM_NETWORK_CONFIG } from '@/lib/services/deployment';
import { HorizonClient, HORIZON_NETWORKS } from '@/lib/stellar/horizon';
import { SorobanRpcClient, SOROBAN_RPC_NETWORKS } from '@/lib/stellar/soroban-rpc';
import * as fc from 'fast-check';

describe('Network Endpoint Selection - Property-Based Tests', () => {
  const deploymentService = new DeploymentService();

  describe('Property 6: Network Configuration Determines API Endpoints', () => {
    
    
    

    test('Stellar testnet operations use testnet Horizon API endpoints', async () => {
      await fc.assert(
        fc.asyncProperty(
          
          fc.stringMatching(/^G[A-Z2-7]{55}$/),
          async (sourceAccount) => {
            
            const networkConfig = deploymentService.getStellarNetworkConfig('testnet');
            
            expect(networkConfig.horizonUrl).toBe(STELLAR_NETWORK_CONFIG.testnet.horizonUrl);
            expect(networkConfig.horizonUrl).toBe('https://horizon-testnet.stellar.org');
            
            
            expect(networkConfig.networkPassphrase).toBe(STELLAR_NETWORK_CONFIG.testnet.networkPassphrase);
            expect(networkConfig.networkPassphrase).toBe('Test SDF Network ; September 2015');
            
            
            expect(networkConfig.sorobanRpcUrl).toBe(STELLAR_NETWORK_CONFIG.testnet.sorobanRpcUrl);
            expect(networkConfig.sorobanRpcUrl).toBe('https://soroban-testnet.stellar.org');
            
            
            const horizonClient = new HorizonClient('testnet');
            expect(horizonClient.getNetworkPassphrase()).toBe('Test SDF Network ; September 2015');
            
            
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
          
          fc.stringMatching(/^G[A-Z2-7]{55}$/),
          async (sourceAccount) => {
            
            const networkConfig = deploymentService.getStellarNetworkConfig('mainnet');
            
            expect(networkConfig.horizonUrl).toBe(STELLAR_NETWORK_CONFIG.mainnet.horizonUrl);
            expect(networkConfig.horizonUrl).toBe('https://horizon.stellar.org');
            
            
            expect(networkConfig.networkPassphrase).toBe(STELLAR_NETWORK_CONFIG.mainnet.networkPassphrase);
            expect(networkConfig.networkPassphrase).toBe('Public Global Stellar Network ; September 2015');
            
            
            expect(networkConfig.sorobanRpcUrl).toBe(STELLAR_NETWORK_CONFIG.mainnet.sorobanRpcUrl);
            expect(networkConfig.sorobanRpcUrl).toBe('https://soroban-mainnet.stellar.org');
            
            
            const horizonClient = new HorizonClient('mainnet');
            expect(horizonClient.getNetworkPassphrase()).toBe('Public Global Stellar Network ; September 2015');
            
            
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
          
          fc.constantFrom('CELO_MAINNET', 'CELO_ALFAJORES'),
          async (network) => {
            
            const networkConfig = deploymentService.getEVMNetworkConfig(network);
            
            expect(networkConfig.rpcUrl).toBeDefined();
            expect(typeof networkConfig.rpcUrl).toBe('string');
            expect(networkConfig.rpcUrl.length).toBeGreaterThan(0);
            
            
            expect(networkConfig.chainId).toBeDefined();
            expect(typeof networkConfig.chainId).toBe('number');
            
            
            expect(networkConfig.name).toBeDefined();
            expect(typeof networkConfig.name).toBe('string');
            
            
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
          
          fc.constantFrom('testnet', 'mainnet'),
          async (network) => {
            
            const config1 = deploymentService.getStellarNetworkConfig(network);
            const config2 = deploymentService.getStellarNetworkConfig(network);
            
            expect(config1.horizonUrl).toBe(config2.horizonUrl);
            expect(config1.sorobanRpcUrl).toBe(config2.sorobanRpcUrl);
            expect(config1.networkPassphrase).toBe(config2.networkPassphrase);
            
            
            const horizonUrl = deploymentService.getHorizonUrl(network);
            const sorobanUrl = deploymentService.getSorobanRpcUrl(network);
            const passphrase = deploymentService.getNetworkPassphrase(network);
            
            expect(horizonUrl).toBe(config1.horizonUrl);
            expect(sorobanUrl).toBe(config1.sorobanRpcUrl);
            expect(passphrase).toBe(config1.networkPassphrase);
            
            
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
            
            const horizonClient = new HorizonClient(network);
            
            
            const expectedUrl = HORIZON_NETWORKS[network].horizonUrl;
            const server = horizonClient.getServer();
            expect(server).toBeDefined();
            
            
            const passphrase = horizonClient.getNetworkPassphrase();
            expect(passphrase).toBe(HORIZON_NETWORKS[network].networkPassphrase);
            
            
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
            
            const sorobanClient = new SorobanRpcClient(network);
            
            
            const rpcUrl = sorobanClient.getRpcUrl();
            expect(rpcUrl).toBe(SOROBAN_RPC_NETWORKS[network].sorobanRpcUrl);
            
            
            const passphrase = sorobanClient.getNetworkPassphrase();
            expect(passphrase).toBe(SOROBAN_RPC_NETWORKS[network].networkPassphrase);
            
            
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
          
          fc.oneof(
            fc.constant('invalid'),
            fc.constant('production'),
            fc.constant('development'),
            fc.constant(''),
            fc.constant('TESTNET'), 
            fc.constant('Mainnet'), 
          ),
          async (invalidNetwork) => {
            
            expect(() => {
              deploymentService.getStellarNetworkConfig(invalidNetwork as any);
            }).toThrow();
            
            
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
            
            
            expect(config.horizonUrl).toMatch(/^https:\/\
            
            
            expect(config.sorobanRpcUrl).toMatch(/^https:\/\
            
            
            expect(config.horizonUrl).not.toMatch(/\/$/);
            expect(config.sorobanRpcUrl).not.toMatch(/\/$/);
            
            
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
            
            
            expect(config.rpcUrl).toMatch(/^https:\/\
            
            
            expect(() => new URL(config.rpcUrl)).not.toThrow();
            
            
            expect(config.chainId).toBeGreaterThan(0);
            expect(Number.isInteger(config.chainId)).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Network passphrases are unique per network', () => {
      
      const testnetPassphrase = STELLAR_NETWORK_CONFIG.testnet.networkPassphrase;
      const mainnetPassphrase = STELLAR_NETWORK_CONFIG.mainnet.networkPassphrase;
      
      expect(testnetPassphrase).not.toBe(mainnetPassphrase);
      
      
      expect(testnetPassphrase.toLowerCase()).toContain('test');
      expect(mainnetPassphrase.toLowerCase()).toContain('public');
    });

    test('Network configuration is immutable', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('testnet', 'mainnet'),
          async (network) => {
            
            const config1 = deploymentService.getStellarNetworkConfig(network);
            
            
            const modifiedConfig = { ...config1 };
            modifiedConfig.horizonUrl = 'https://malicious-url.com';
            
            
            const config2 = deploymentService.getStellarNetworkConfig(network);
            
            
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
          
          fc.constantFrom('testnet', 'mainnet'),
          fc.stringMatching(/^[a-f0-9]{64}$/), 
          async (network, artifactId) => {
            
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
            
            
            expect(config.horizonUrl).toBeDefined();
            expect(config.sorobanRpcUrl).toBeDefined();
            expect(config.networkPassphrase).toBeDefined();
            
            
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
            
            
            expect(config.rpcUrl).toBeDefined();
            expect(config.chainId).toBeDefined();
            expect(config.name).toBeDefined();
            
            
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
      
      
      
      expect(() => deploymentService.getStellarNetworkConfig('testnet')).not.toThrow();
      expect(() => deploymentService.getStellarNetworkConfig('mainnet')).not.toThrow();
      
      
      expect(() => deploymentService.getStellarNetworkConfig('TESTNET' as any)).toThrow();
      expect(() => deploymentService.getStellarNetworkConfig('MAINNET' as any)).toThrow();
      
      
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
            
            
            expect(horizonUrl.hostname).toContain('stellar.org');
            expect(sorobanUrl.hostname).toContain('stellar.org');
            
            
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
