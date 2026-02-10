import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProjectManager } from '@/components/project-manager'
import { useBuilderStore } from '@/lib/store'

jest.mock('@/lib/store', () => ({
    useBuilderStore: jest.fn(),
}))

jest.mock('@/components/contract-preview-modal', () => ({
    ContractPreviewModal: ({ contract, onClose }: any) => (
        <div data-testid="preview-modal">
            <div data-testid="preview-content">{contract?.contractName}</div>
            <button onClick={onClose}>Close</button>
        </div>
    ),
}))

jest.mock('@/lib/frontend-generator', () => ({
    generateNextJsFrontend: jest.fn(() => ({ 'index.tsx': 'export default {}' })),
}))

jest.mock('@/lib/github-deploy', () => ({
    deployToGitHub: jest.fn(),
    validateGitHubToken: jest.fn(),
    getGitHubUser: jest.fn(),
}))

describe('ProjectManager', () => {
    const mockDeployedContract = {
        id: '1',
        contractAddress: '0x1234567890123456789012345678901234567890',
        contractName: 'TestToken',
        tokenName: 'Test Token',
        tokenSymbol: 'TST',
        network: 'sepolia' as const,
        networkName: 'Celo Sepolia Testnet',
        chainId: 44787,
        deployer: '0x1111111111111111111111111111111111111111',
        deployedAt: new Date().toISOString(),
        transactionHash: '0xabcd1234',
        contractType: 'erc20' as const,
        abi: [],
        solidityCode: 'contract TestToken {}',
        blocks: [],
        explorerUrl: 'https://celoscan.io',
    }

    const mockStore = {
        deployedContracts: [mockDeployedContract],
        walletAddress: '0x1111111111111111111111111111111111111111',
        deleteDeployedContract: jest.fn(),
        updateDeployedContract: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useBuilderStore as jest.Mock).mockImplementation((selector) =>
                selector ? selector(mockStore) : mockStore
            )
    })

    test('renders when open', () => {
        render(<ProjectManager isOpen={true} onClose={jest.fn()} />)
        expect(screen.getByText(/Deployed Contracts/)).toBeInTheDocument()
    })

    test('does not render when closed', () => {
        const { container } = render(<ProjectManager isOpen={false} onClose={jest.fn()} />)
        expect(container.firstChild).toBeNull()
    })

    test('displays deployed contracts', () => {
        render(<ProjectManager isOpen={true} onClose={jest.fn()} />)
        expect(screen.getByText('TestToken')).toBeInTheDocument()
        expect(screen.getByText(/TST/)).toBeInTheDocument()
    })

    test('opens preview modal when preview button is clicked', async () => {
        render(<ProjectManager isOpen={true} onClose={jest.fn()} />)

        const previewButton = screen.getByText(/Preview & Interact/)
        fireEvent.click(previewButton)

        await waitFor(() => {
            expect(screen.getByTestId('preview-modal')).toBeInTheDocument()
            expect(screen.getByTestId('preview-content')).toHaveTextContent('TestToken')
        })
    })

    test('closes preview modal', async () => {
        render(<ProjectManager isOpen={true} onClose={jest.fn()} />)

        const previewButton = screen.getByText(/Preview & Interact/)
        fireEvent.click(previewButton)

        await waitFor(() => {
            expect(screen.getByTestId('preview-modal')).toBeInTheDocument()
        })

        const closeButton = screen.getByText('Close')
        fireEvent.click(closeButton)

        await waitFor(() => {
            expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument()
        })
    })

    test('displays contract address correctly', () => {
        render(<ProjectManager isOpen={true} onClose={jest.fn()} />)
        expect(screen.getByText(mockDeployedContract.contractAddress)).toBeInTheDocument()
    })

    test('displays network information', () => {
        render(<ProjectManager isOpen={true} onClose={jest.fn()} />)
        expect(screen.getByText('Celo Sepolia Testnet')).toBeInTheDocument()
    })

    test('displays contract type badge', () => {
        render(<ProjectManager isOpen={true} onClose={jest.fn()} />)
        expect(screen.getByText('ERC20')).toBeInTheDocument()
    })

    test('can expand contract details', async () => {
        render(<ProjectManager isOpen={true} onClose={jest.fn()} />)

        const expandButton = screen.getByText(/View Details/)
        fireEvent.click(expandButton)

        await waitFor(() => {
            expect(screen.getByText('Blocks Info')).toBeInTheDocument()
        })
    })

    test('shows empty state when no contracts', () => {
        ; (useBuilderStore as jest.Mock).mockImplementation((selector) =>
            selector
                ? selector({ ...mockStore, deployedContracts: [] })
                : { ...mockStore, deployedContracts: [] }
        )

        render(<ProjectManager isOpen={true} onClose={jest.fn()} />)
        expect(screen.getByText(/No Deployed Contracts Yet/)).toBeInTheDocument()
    })

    test('handles delete contract with confirmation', async () => {
        window.confirm = jest.fn(() => true)

        render(<ProjectManager isOpen={true} onClose={jest.fn()} />)

        const deleteButton = screen.getByTitle('Delete contract')
        fireEvent.click(deleteButton)

        expect(window.confirm).toHaveBeenCalled()
        expect(mockStore.deleteDeployedContract).toHaveBeenCalledWith('1')
    })

    test('cancels delete when user declines confirmation', () => {
        window.confirm = jest.fn(() => false)

        render(<ProjectManager isOpen={true} onClose={jest.fn()} />)

        const deleteButton = screen.getByTitle('Delete contract')
        fireEvent.click(deleteButton)

        expect(mockStore.deleteDeployedContract).not.toHaveBeenCalled()
    })
})
