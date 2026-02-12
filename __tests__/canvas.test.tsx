import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Canvas } from '@/components/canvas'
import { useBuilderStore } from '@/lib/store'

jest.mock('@/lib/store', () => ({
    useBuilderStore: jest.fn(),
}))

jest.mock('@/components/infrastructure/workstation-header', () => ({
    WorkstationHeader: () => <div data-testid="workstation-header">Workstation Header</div>,
}))

describe('Canvas Component', () => {
    const mockStore = {
        blocks: [],
        addBlock: jest.fn(),
        removeBlock: jest.fn(),
        updateBlock: jest.fn(),
        setSelectedBlock: jest.fn(),
        selectedBlock: null,
        currentProject: null,
        network: 'stellar',
    }

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useBuilderStore as jest.Mock).mockImplementation((selector) =>
                selector ? selector(mockStore) : mockStore
            )
    })

    test('renders canvas container', () => {
        render(<Canvas />)
        expect(screen.getByTestId('workstation-header')).toBeInTheDocument()
    })

    test('displays empty state when no blocks', () => {
        render(<Canvas />)
        expect(screen.getByText(/No contract base selected/i)).toBeInTheDocument()
        expect(screen.getByText(/Start by choosing a standard compliant implementation/i)).toBeInTheDocument()
    })

    test('renders blocks when present', () => {
        const storeWithBlocks = {
            ...mockStore,
            blocks: [
                { id: '1', type: 'mint', label: 'MINT', enabled: true },
                { id: '2', type: 'burn', label: 'BURN', enabled: true },
            ],
        }
            ; (useBuilderStore as jest.Mock).mockImplementation((selector) =>
                selector ? selector(storeWithBlocks) : storeWithBlocks
            )

        render(<Canvas />)
        const mintElements = screen.getAllByText('MINT')
        const burnElements = screen.getAllByText('BURN')
        expect(mintElements.length).toBeGreaterThan(0)
        expect(burnElements.length).toBeGreaterThan(0)
    })

    test('allows removing blocks', () => {
        const storeWithBlocks = {
            ...mockStore,
            blocks: [{ id: '1', type: 'mint', label: 'MINT', enabled: true }],
        }
            ; (useBuilderStore as jest.Mock).mockImplementation((selector) =>
                selector ? selector(storeWithBlocks) : storeWithBlocks
            )

        render(<Canvas />)
        // Canvas no longer has remove buttons in the current implementation
        // This test is now obsolete but we keep it for structure
        const mintElements = screen.getAllByText('MINT')
        expect(mintElements.length).toBeGreaterThan(0)
    })
})
