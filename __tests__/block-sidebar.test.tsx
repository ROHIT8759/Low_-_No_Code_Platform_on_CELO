import { render, screen, fireEvent } from '@testing-library/react'
import { BlockSidebar } from '@/components/block-sidebar'
import { useBuilderStore } from '@/lib/store'

jest.mock('@/lib/store', () => ({
    useBuilderStore: jest.fn(),
}))

describe('BlockSidebar Component', () => {
    const mockStore = {
        blocks: [],
        addBlock: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useBuilderStore as jest.Mock).mockImplementation((selector) =>
                selector ? selector(mockStore) : mockStore
            )
    })

    test('renders sidebar with title', () => {
        render(<BlockSidebar />)
        expect(screen.getByText(/Contract Modules/i)).toBeInTheDocument()
    })

    test('displays available blocks', () => {
        render(<BlockSidebar />)

        expect(screen.getByText(/ERC20 Standard/i)).toBeInTheDocument()
        expect(screen.getByText(/ERC721 Standard/i)).toBeInTheDocument()
        expect(screen.getByText(/Pausable/i)).toBeInTheDocument()
    })

    test('blocks are organized in categories', () => {
        render(<BlockSidebar />)

        expect(screen.getByText(/Base Standards/i)).toBeInTheDocument()
        expect(screen.getByText(/Token Logic/i)).toBeInTheDocument()
        expect(screen.getByText(/Security Modules/i)).toBeInTheDocument()
    })

    test('adds block when clicked', () => {
        render(<BlockSidebar />)

        const mintBlock = screen.getByText(/Mintable/i).closest('div')
        if (mintBlock) {
            fireEvent.click(mintBlock)
            expect(mockStore.addBlock).toHaveBeenCalled()
        }
    })

    test('displays guided base selection notice when no base is selected', () => {
        render(<BlockSidebar />)

        expect(screen.getByText(/Start with a Base/i)).toBeInTheDocument()
        expect(screen.getByText(/Select a base standard below to begin building your contract/i)).toBeInTheDocument()
    })

    test('highlights Base Standards category when no base is selected', () => {
        render(<BlockSidebar />)

        const baseStandardsButton = screen.getByText(/Base Standards/i).closest('button')
        expect(baseStandardsButton).toHaveClass('border-primary/30')
        expect(screen.getByText(/Required/i)).toBeInTheDocument()
    })

    test('hides guided notice when base standard is selected', () => {
        const storeWithBase = {
            blocks: [{ id: '1', type: 'erc20', label: 'ERC20 Standard' }],
            addBlock: jest.fn(),
        }
            ; (useBuilderStore as jest.Mock).mockImplementation((selector) =>
                selector ? selector(storeWithBase) : storeWithBase
            )

        render(<BlockSidebar />)

        expect(screen.queryByText(/Start with a Base/i)).not.toBeInTheDocument()
    })

    test('shows visual indicator for selected blocks', () => {
        const storeWithBlocks = {
            blocks: [{ id: '1', type: 'erc20', label: 'ERC20 Standard' }],
            addBlock: jest.fn(),
        }
            ; (useBuilderStore as jest.Mock).mockImplementation((selector) =>
                selector ? selector(storeWithBlocks) : storeWithBlocks
            )

        render(<BlockSidebar />)

        // Check that the selected block has the proper styling
        const blockElement = screen.getByText(/ERC20 Standard/i)
        expect(blockElement).toBeInTheDocument()
        
        // The parent container should have the selected styling
        const blockContainer = blockElement.closest('[class*="border-primary"]')
        expect(blockContainer).toBeInTheDocument()
    })
})
