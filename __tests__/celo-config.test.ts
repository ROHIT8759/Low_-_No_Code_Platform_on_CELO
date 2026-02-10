import { CELO_NETWORKS } from '@/lib/celo-config'

describe('Celo Configuration', () => {
  test('contains Sepolia testnet configuration', () => {
    expect(CELO_NETWORKS.sepolia).toBeDefined()
    expect(CELO_NETWORKS.sepolia.chainId).toBe(11142220)
    expect(CELO_NETWORKS.sepolia.name).toContain('Sepolia')
  })

  test('contains mainnet configuration', () => {
    expect(CELO_NETWORKS.mainnet).toBeDefined()
    expect(CELO_NETWORKS.mainnet.chainId).toBe(42220)
    expect(CELO_NETWORKS.mainnet.name).toContain('Mainnet')
  })

  test('has RPC URLs for all networks', () => {
    Object.values(CELO_NETWORKS).forEach(network => {
      expect(network.rpcUrl).toBeDefined()
      expect(network.rpcUrl).toMatch(/^https?:\/\//)
    })
  })

  test('has explorer URLs for all networks', () => {
    Object.values(CELO_NETWORKS).forEach(network => {
      expect(network.explorerUrl).toBeDefined()
      expect(network.explorerUrl).toMatch(/^https?:\/\//)
    })
  })

  test('has native currency defined', () => {
    Object.values(CELO_NETWORKS).forEach(network => {
      expect(network.nativeCurrency).toBeDefined()
      expect(network.nativeCurrency.name).toBe('CELO')
      expect(network.nativeCurrency.symbol).toBe('CELO')
      expect(network.nativeCurrency.decimals).toBe(18)
    })
  })

  test('Sepolia is marked as testnet', () => {
    expect(CELO_NETWORKS.sepolia.testnet).toBe(true)
  })

  test('Mainnet is not marked as testnet', () => {
    expect(CELO_NETWORKS.mainnet.testnet).toBe(false)
  })
})
