import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Canvas } from '@/components/canvas'
import { useBuilderStore } from '@/lib/store'

jest.mock('@/lib/store', () => ({
    useBuilderStore: jest.fn(),
}))

describe('Canvas Component', () => {
    const mockStore = {
        blocks: [],
        addBlock: jest.fn(),
        removeBlock: jest.fn(),
        updateBlock: jest.fn(),
        setSelectedBlock: jest.fn(),
        selectedBlock: null,
    }

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useBuilderStore as jest.Mock).mockImplementation((selector) =>
                selector ? selector(mockStore) : mockStore
            )
    })

    test('renders canvas container', () => {
        render(<Canvas />)
        const canvas = screen.getByText(/Drop blocks here/i).closest('div')
        expect(canvas).toBeInTheDocument()
    })

    test('displays empty state when no blocks', () => {
        render(<Canvas />)
        expect(screen.getByText(/Drop blocks here/i)).toBeInTheDocument()
    })

    test('renders blocks when present', () => {
        const storeWithBlocks = {
            ...mockStore,
            blocks: [
                { id: '1', type: 'mint', name: 'Mint', enabled: true },
                { id: '2', type: 'burn', name: 'Burn', enabled: true },
            ],
        }
            ; (useBuilderStore as jest.Mock).mockImplementation((selector) =>
                selector ? selector(storeWithBlocks) : storeWithBlocks
            )

        render(<Canvas />)
        expect(screen.getByText('Mint')).toBeInTheDocument()
        expect(screen.getByText('Burn')).toBeInTheDocument()
    })

    test('allows removing blocks', () => {
        const storeWithBlocks = {
            ...mockStore,
            blocks: [{ id: '1', type: 'mint', name: 'Mint', enabled: true }],
        }
            ; (useBuilderStore as jest.Mock).mockImplementation((selector) =>
                selector ? selector(storeWithBlocks) : storeWithBlocks
            )

        render(<Canvas />)
        const removeButtons = screen.getAllByRole('button')
        const removeButton = removeButtons.find(btn =>
            btn.querySelector('svg') !== null
        )

        if (removeButton) {
            fireEvent.click(removeButton)
            expect(mockStore.removeBlock).toHaveBeenCalledWith('1')
        }
    })
})
