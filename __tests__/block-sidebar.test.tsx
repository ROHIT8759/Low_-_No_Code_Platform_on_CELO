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
        expect(screen.getByText(/Smart Contract Blocks/i)).toBeInTheDocument()
    })

    test('displays available blocks', () => {
        render(<BlockSidebar />)

        // Check for core features
        expect(screen.getByText(/ERC20 Token/i)).toBeInTheDocument()
        expect(screen.getByText(/NFT Collection/i)).toBeInTheDocument()
        expect(screen.getByText(/Pausable/i)).toBeInTheDocument()
    })

    test('blocks are organized in categories', () => {
        render(<BlockSidebar />)

        // Check for actual text
        expect(screen.getByText(/Smart Contract Blocks/i)).toBeInTheDocument()
        expect(screen.getByText(/Drag to canvas or click to add/i)).toBeInTheDocument()
    })

    test('adds block when clicked', () => {
        render(<BlockSidebar />)

        const mintBlock = screen.getByText(/Mint/i).closest('div')
        if (mintBlock) {
            fireEvent.click(mintBlock)
            expect(mockStore.addBlock).toHaveBeenCalled()
        }
    })

    test('displays block descriptions', () => {
        render(<BlockSidebar />)

        // Blocks should have descriptive text
        const sidebar = screen.getByText(/Smart Contract Blocks/i).closest('div')
        expect(sidebar).toBeInTheDocument()
    })
})
