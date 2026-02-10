import { generateSolidityCode } from '@/lib/code-generator'
import type { Block } from '@/lib/store'

describe('Code Generator - Solidity', () => {
  test('generates basic ERC20 contract', () => {
    const blocks: Block[] = [
      { 
        id: '1', 
        type: 'erc20', 
        name: 'ERC20 Token', 
        enabled: true,
        config: {
          name: 'TestToken',
          symbol: 'TST',
        }
      }
    ]

    const code = generateSolidityCode(blocks)

    expect(code).toContain('contract TestToken')
    expect(code).toContain('string public name')
    expect(code).toContain('string public symbol')
  })

  test('generates NFT contract', () => {
    const blocks: Block[] = [
      { 
        id: '1', 
        type: 'nft', 
        name: 'NFT Collection', 
        enabled: true,
        config: {
          name: 'TestNFT',
          symbol: 'TNFT',
        }
      }
    ]

    const code = generateSolidityCode(blocks)

    expect(code).toContain('contract TestNFT')
    expect(code).toContain('ownerOf')
  })

  test('includes mint function when mint block is added', () => {
    const blocks: Block[] = [
      { 
        id: '1', 
        type: 'erc20', 
        name: 'ERC20 Token', 
        enabled: true,
        config: { name: 'TestToken', symbol: 'TST' }
      },
      { id: '2', type: 'mint', name: 'Mint', enabled: true },
    ]

    const code = generateSolidityCode(blocks)

    expect(code).toContain('function mint')
  })

  test('includes burn function when burn block is added', () => {
    const blocks: Block[] = [
      { 
        id: '1', 
        type: 'erc20', 
        name: 'ERC20 Token', 
        enabled: true,
        config: { name: 'TestToken', symbol: 'TST' }
      },
      { id: '2', type: 'burn', name: 'Burn', enabled: true },
    ]

    const code = generateSolidityCode(blocks)

    expect(code).toContain('function burn')
  })

  test('includes Pausable when pausable block is added', () => {
    const blocks: Block[] = [
      { 
        id: '1', 
        type: 'erc20', 
        name: 'ERC20 Token', 
        enabled: true,
        config: { name: 'TestToken', symbol: 'TST' }
      },
      { id: '2', type: 'pausable', name: 'Pausable', enabled: true },
    ]

    const code = generateSolidityCode(blocks)

    expect(code).toContain('bool public paused')
    expect(code).toContain('function pause()')
    expect(code).toContain('function unpause()')
  })

  test('includes multiple features', () => {
    const blocks: Block[] = [
      { 
        id: '1', 
        type: 'erc20', 
        name: 'ERC20 Token', 
        enabled: true,
        config: { name: 'AdvancedToken', symbol: 'ADV' }
      },
      { id: '2', type: 'mint', name: 'Mint', enabled: true },
      { id: '3', type: 'burn', name: 'Burn', enabled: true },
      { id: '4', type: 'pausable', name: 'Pausable', enabled: true },
    ]

    const code = generateSolidityCode(blocks)

    expect(code).toContain('function mint')
    expect(code).toContain('function burn')
    expect(code).toContain('paused')
  })

  test('uses correct Solidity version', () => {
    const blocks: Block[] = [
      { 
        id: '1', 
        type: 'erc20', 
        name: 'ERC20 Token', 
        enabled: true,
        config: { name: 'TestToken', symbol: 'TST' }
      }
    ]

    const code = generateSolidityCode(blocks)

    expect(code).toContain('pragma solidity')
    expect(code).toMatch(/pragma solidity \^0\.8\.\d+/)
  })

  test('includes SPDX license', () => {
    const blocks: Block[] = [
      { 
        id: '1', 
        type: 'erc20', 
        name: 'ERC20 Token', 
        enabled: true,
        config: { name: 'TestToken', symbol: 'TST' }
      }
    ]

    const code = generateSolidityCode(blocks)

    expect(code).toContain('SPDX-License-Identifier')
  })

  test('returns message when no blocks', () => {
    const blocks: Block[] = []
    const code = generateSolidityCode(blocks)
    expect(code).toBe('// Add blocks to generate code')
  })

  test('returns message when no base contract', () => {
    const blocks: Block[] = [
      { id: '1', type: 'mint', name: 'Mint', enabled: true },
    ]
    const code = generateSolidityCode(blocks)
    expect(code).toBe('// Start by adding an ERC20 Token or NFT Contract block')
  })
})
