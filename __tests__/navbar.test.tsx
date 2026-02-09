import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/navbar'
import { useBuilderStore } from '@/lib/store'

// Mock zustand store
jest.mock('@/lib/store', () => ({
    useBuilderStore: jest.fn(),
}))

describe('Navbar Component', () => {
    const mockStore = {
        walletAddress: null,
        walletChainId: null,
        setWalletAddress: jest.fn(),
        setWalletChainId: jest.fn(),
        deployedContracts: [],
    }

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useBuilderStore as jest.Mock).mockImplementation((selector) =>
                selector ? selector(mockStore) : mockStore
            )
    })

    test('renders navbar with title', () => {
        render(<Navbar />)
        expect(screen.getByText('Block Builder')).toBeInTheDocument()
    })

    test('shows connect wallet button when wallet not connected', () => {
        render(<Navbar />)
        expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument()
    })

    test('shows wallet address when connected', () => {
        const connectedStore = {
            ...mockStore,
            walletAddress: '0x1234567890123456789012345678901234567890',
        }
            ; (useBuilderStore as jest.Mock).mockImplementation((selector) =>
                selector ? selector(connectedStore) : connectedStore
            )

        render(<Navbar />)
        expect(screen.getByText(/0x1234/)).toBeInTheDocument()
    })

    test('renders navigation items', () => {
        render(<Navbar />)
        expect(screen.getByText('Builder')).toBeInTheDocument()
        expect(screen.getByText('Docs')).toBeInTheDocument()
    })
})
