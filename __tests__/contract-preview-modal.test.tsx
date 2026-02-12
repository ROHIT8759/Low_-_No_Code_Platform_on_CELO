import { render, screen } from '@testing-library/react'
import { ContractPreviewModal } from '@/components/contract-preview-modal'

jest.mock('@/lib/celo-config', () => ({
    CELO_NETWORKS: {
        sepolia: {
            chainId: 11142220,
            name: 'Celo Sepolia Testnet',
            rpcUrl: 'https://alfajores-forno.celo-testnet.org',
            explorerUrl: 'https://celo-sepolia.blockscout.com',
            testnet: true,
            nativeCurrency: {
                name: 'CELO',
                symbol: 'CELO',
                decimals: 18,
            },
        },
    },
}))

describe('ContractPreviewModal', () => {
    const mockContract = {
        contractAddress: '0x1234567890123456789012345678901234567890',
        contractName: 'TestToken',
        tokenName: 'Test Token',
        tokenSymbol: 'TST',
        network: 'sepolia' as const,
        networkName: 'Celo Sepolia Testnet',
        contractType: 'erc20' as const,
        abi: [],
        solidityCode: 'contract TestToken {}',
        blocks: [
            { id: '1', type: 'mint', name: 'Mint', enabled: true },
            { id: '2', type: 'burn', name: 'Burn', enabled: true },
        ],
    }

    test('renders when open', () => {
        render(
            <ContractPreviewModal
                isOpen={true}
                onClose={jest.fn()}
                contract={mockContract}
                walletAddress="0xABC"
            />
        )

        expect(screen.getByText('TestToken Preview')).toBeInTheDocument()
    })

    test('does not render when closed', () => {
        const { container } = render(
            <ContractPreviewModal
                isOpen={false}
                onClose={jest.fn()}
                contract={mockContract}
                walletAddress="0xABC"
            />
        )

        expect(container).toBeEmptyDOMElement()
    })

    test('displays contract information', () => {
        render(
            <ContractPreviewModal
                isOpen={true}
                onClose={jest.fn()}
                contract={mockContract}
                walletAddress="0xABC"
            />
        )

        expect(screen.getByText('Celo Sepolia Testnet')).toBeInTheDocument()
        expect(screen.getByText('ERC20')).toBeInTheDocument()
    })

    test('has preview and code view modes', () => {
        render(
            <ContractPreviewModal
                isOpen={true}
                onClose={jest.fn()}
                contract={mockContract}
                walletAddress="0xABC"
            />
        )

        expect(screen.getByText('Preview')).toBeInTheDocument()
        expect(screen.getByText('Code')).toBeInTheDocument()
    })

    test('displays features from blocks', () => {
        render(
            <ContractPreviewModal
                isOpen={true}
                onClose={jest.fn()}
                contract={mockContract}
                walletAddress="0xABC"
            />
        )

        
        const iframe = screen.getByTitle('Contract dApp Preview')
        expect(iframe).toBeInTheDocument()
    })
})
