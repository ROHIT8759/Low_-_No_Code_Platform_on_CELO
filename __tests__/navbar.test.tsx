import { render, screen, fireEvent } from '@testing-library/react'
import { Navbar } from '@/components/navbar'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    ...jest.requireActual('framer-motion'),
    useScroll: () => ({ scrollY: { get: () => 0 } }),
    useMotionValueEvent: jest.fn(),
}))

describe('Navbar Component', () => {
    test('renders navbar with title', () => {
        render(<Navbar />)
        expect(screen.getByText('Block Builder')).toBeInTheDocument()
    })

    test('renders navigation links', () => {
        render(<Navbar />)
        expect(screen.getByText('Features')).toBeInTheDocument()
        expect(screen.getByText('Templates')).toBeInTheDocument()
        expect(screen.getByText('Enterprise')).toBeInTheDocument()
    })

    test('renders Launch App button', () => {
        render(<Navbar />)
        expect(screen.getByText('Launch App')).toBeInTheDocument()
    })

    test('renders infrastructure subtitle when not scrolled', () => {
        render(<Navbar />)
        expect(screen.getByText('Infrastructure')).toBeInTheDocument()
    })
})
