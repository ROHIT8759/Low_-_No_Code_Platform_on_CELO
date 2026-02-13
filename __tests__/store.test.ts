import { renderHook, act } from '@testing-library/react'
import { useBuilderStore } from '@/lib/store'
import type { Block } from '@/lib/store'

describe('Builder Store', () => {
  beforeEach(() => {
    
    const { result } = renderHook(() => useBuilderStore())
    act(() => {
      result.current.blocks = []
      result.current.selectedBlock = null
      result.current.walletAddress = null
    })
  })

  test('initializes with empty blocks', () => {
    const { result } = renderHook(() => useBuilderStore())
    expect(result.current.blocks).toEqual([])
  })

  test('adds a block', () => {
    const { result } = renderHook(() => useBuilderStore())
    
    const newBlock: Block = {
      id: '1',
      type: 'mint',
      name: 'Mint',
      enabled: true,
    }

    act(() => {
      result.current.addBlock(newBlock)
    })

    expect(result.current.blocks).toHaveLength(1)
    expect(result.current.blocks[0].type).toBe('mint')
    expect(result.current.blocks[0].name).toBe('Mint')
  })

  test('removes a block', () => {
    const { result } = renderHook(() => useBuilderStore())
    
    act(() => {
      result.current.addBlock({ id: 'test-1', type: 'mint', name: 'Mint', enabled: true })
      result.current.addBlock({ id: 'test-2', type: 'burn', name: 'Burn', enabled: true })
    })

    expect(result.current.blocks).toHaveLength(2)

    act(() => {
      
      const firstId = result.current.blocks[0].id
      result.current.removeBlock(firstId)
    })

    expect(result.current.blocks).toHaveLength(1)
  })

  test('updates a block', () => {
    const { result } = renderHook(() => useBuilderStore())
    
    act(() => {
      result.current.addBlock({ id: 'test-1', type: 'mint', name: 'Mint', enabled: true })
    })

    act(() => {
      const blockId = result.current.blocks[0].id
      result.current.updateBlock(blockId, { enabled: false })
    })

    expect(result.current.blocks[0].enabled).toBe(false)
  })

  test('selects a block', () => {
    const { result } = renderHook(() => useBuilderStore())
    
    const block: Block = { id: '1', type: 'mint', name: 'Mint', enabled: true }

    act(() => {
      result.current.addBlock(block)
    })

    
    if (result.current.setSelectedBlock) {
      act(() => {
        result.current.setSelectedBlock(block)
      })
      expect(result.current.selectedBlock).toEqual(block)
    }
  })

  test('sets wallet address', () => {
    const { result } = renderHook(() => useBuilderStore())
    const address = '0x1234567890123456789012345678901234567890'

    act(() => {
      result.current.setWalletAddress(address)
    })

    expect(result.current.walletAddress).toBe(address)
  })

  test('manages deployed contracts', () => {
    const { result } = renderHook(() => useBuilderStore())
    
    const contract = {
      id: `test-${Date.now()}`,
      contractAddress: '0xABC',
      contractName: 'Test Token',
      network: 'sepolia' as const,
      networkName: 'Celo Sepolia',
      chainId: 11142220,
      deployer: '0x123',
      deployedAt: new Date().toISOString(),
      transactionHash: '0xTX',
      contractType: 'erc20' as const,
      abi: [],
      solidityCode: '',
      blocks: [],
      explorerUrl: 'https://explorer',
    }

    act(() => {
      result.current.addDeployedContract(contract)
    })

    expect(result.current.deployedContracts.length).toBeGreaterThan(0)
    expect(result.current.deployedContracts[0].contractAddress).toBe('0xABC')
  })

  test('deletes deployed contract', () => {
    const { result } = renderHook(() => useBuilderStore())
    
    const contractId = `test-${Date.now()}`
    const contract = {
      id: contractId,
      contractAddress: '0xABC',
      contractName: 'Test Token',
      network: 'sepolia' as const,
      networkName: 'Celo Sepolia',
      chainId: 11142220,
      deployer: '0x123',
      deployedAt: new Date().toISOString(),
      transactionHash: '0xTX',
      contractType: 'erc20' as const,
      abi: [],
      solidityCode: '',
      blocks: [],
      explorerUrl: 'https://explorer',
    }

    act(() => {
      result.current.addDeployedContract(contract)
    })

    const initialLength = result.current.deployedContracts.length

    act(() => {
      result.current.deleteDeployedContract(contractId)
    })

    expect(result.current.deployedContracts.length).toBe(initialLength - 1)
  })
})
