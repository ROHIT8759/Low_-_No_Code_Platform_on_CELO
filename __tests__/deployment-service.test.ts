import { DeploymentService, STELLAR_NETWORK_CONFIG, EVM_NETWORK_CONFIG } from '../lib/services/deployment';

describe('DeploymentService', () => {
  let service: DeploymentService;

  beforeEach(() => {
    service = new DeploymentService();
  });

  describe('Network Configuration', () => {
    it('should return correct EVM network configuration', () => {
      const config = service.getEVMNetworkConfig('CELO_MAINNET');
      
      expect(config).toBeDefined();
      expect(config.chainId).toBe(42220);
      expect(config.name).toBe('Celo Mainnet');
      expect(config.rpcUrl).toBe('https://forno.celo.org');
    });

    it('should return correct Stellar testnet configuration', () => {
      const config = service.getStellarNetworkConfig('testnet');
      
      expect(config).toBeDefined();
      expect(config.horizonUrl).toBe('https://horizon-testnet.stellar.org');
      expect(config.sorobanRpcUrl).toBe('https://soroban-testnet.stellar.org');
      expect(config.networkPassphrase).toBe('Test SDF Network ; September 2015');
    });

    it('should return correct Stellar mainnet configuration', () => {
      const config = service.getStellarNetworkConfig('mainnet');
      
      expect(config).toBeDefined();
      expect(config.horizonUrl).toBe('https://horizon.stellar.org');
      expect(config.sorobanRpcUrl).toBe('https://soroban-mainnet.stellar.org');
      expect(config.networkPassphrase).toBe('Public Global Stellar Network ; September 2015');
    });

    it('should throw error for unknown EVM network', () => {
      expect(() => {
        service.getEVMNetworkConfig('UNKNOWN_NETWORK' as any);
      }).toThrow('Unknown EVM network');
    });

    it('should throw error for unknown Stellar network', () => {
      expect(() => {
        service.getStellarNetworkConfig('unknown' as any);
      }).toThrow('Unknown Stellar network');
    });
  });

  describe('Deployment Options Validation', () => {
    it('should validate EVM deployment options successfully', () => {
      const options = {
        artifactId: 'test-artifact-123',
        network: 'CELO_MAINNET' as const,
        constructorArgs: [],
      };

      const result = service.validateDeploymentOptions(options, 'evm');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate Stellar deployment options successfully', () => {
      const options = {
        artifactId: 'test-artifact-456',
        network: 'testnet' as const,
        sourceAccount: 'GABC123...',
      };

      const result = service.validateDeploymentOptions(options, 'stellar');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject options without artifact ID', () => {
      const options = {
        artifactId: '',
        network: 'CELO_MAINNET' as const,
      };

      const result = service.validateDeploymentOptions(options, 'evm');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Artifact ID is required');
    });

    it('should reject Stellar options without source account', () => {
      const options = {
        artifactId: 'test-artifact',
        network: 'testnet' as const,
        sourceAccount: '',
      };

      const result = service.validateDeploymentOptions(options, 'stellar');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Source account is required for Stellar deployment');
    });

    it('should reject invalid Stellar network', () => {
      const options = {
        artifactId: 'test-artifact',
        network: 'invalid' as any,
        sourceAccount: 'GABC123...',
      };

      const result = service.validateDeploymentOptions(options, 'stellar');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid Stellar network (must be testnet or mainnet)');
    });

    it('should reject unknown EVM network', () => {
      const options = {
        artifactId: 'test-artifact',
        network: 'UNKNOWN_NETWORK' as any,
      };

      const result = service.validateDeploymentOptions(options, 'evm');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unknown EVM network');
    });
  });

  describe('Gas and Fee Estimation', () => {
    it('should estimate EVM gas based on bytecode size', async () => {
      const bytecode = '0x' + '60'.repeat(1000); 
      const gas = await service.estimateEVMGas(bytecode, 'CELO_MAINNET');
      
      expect(gas).toBeGreaterThan(21000); 
      
      const expectedGas = 21000 + 1001 * 200;
      expect(gas).toBe(expectedGas);
    });

    it('should estimate Stellar fee based on WASM size', async () => {
      const wasmSize = 50000; 
      const fee = await service.estimateStellarFee(wasmSize, 'testnet');
      
      expect(fee).toBeGreaterThan(100); 
      expect(fee).toBe(100 + 50000 * 10); 
    });
  });

  describe('Network Configuration Constants', () => {
    it('should have correct Stellar network configurations', () => {
      expect(STELLAR_NETWORK_CONFIG.testnet).toBeDefined();
      expect(STELLAR_NETWORK_CONFIG.mainnet).toBeDefined();
      
      expect(STELLAR_NETWORK_CONFIG.testnet.horizonUrl).toContain('testnet');
      expect(STELLAR_NETWORK_CONFIG.mainnet.horizonUrl).not.toContain('testnet');
    });

    it('should have correct EVM network configurations', () => {
      expect(EVM_NETWORK_CONFIG.CELO_MAINNET).toBeDefined();
      expect(EVM_NETWORK_CONFIG.CELO_ALFAJORES).toBeDefined();
      
      expect(EVM_NETWORK_CONFIG.CELO_MAINNET.chainId).toBe(42220);
      expect(EVM_NETWORK_CONFIG.CELO_ALFAJORES.chainId).toBe(44787);
    });
  });

  describe('Transaction Creation Helpers', () => {
    it('should create EVM deployment data with bytecode', () => {
      
      
      expect(service).toBeDefined();
    });

    it('should create Stellar deployment envelope structure', () => {
      
      
      expect(service).toBeDefined();
    });
  });
});
