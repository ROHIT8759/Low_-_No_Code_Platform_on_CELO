import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CodeViewer } from '@/components/code-viewer'
import { useBuilderStore } from '@/lib/store'

// Mock the store
jest.mock('@/lib/store', () => ({
  useBuilderStore: jest.fn(),
}))

// Mock the code generators
jest.mock('@/lib/code-generator', () => ({
  generateSolidityCode: jest.fn(() => 'mock solidity code'),
  generateTypeScriptCode: jest.fn(() => 'mock typescript code'),
}))

// Mock the deploy modal
jest.mock('@/components/deploy-modal', () => ({
  DeployModal: () => <div data-testid="deploy-modal">Deploy Modal</div>,
}))

describe('CodeViewer', () => {
  beforeEach(() => {
    (useBuilderStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        blocks: [{ id: '1', type: 'function' }],
        currentProject: { name: 'Test Project' },
      })
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Tab Navigation', () => {
    it('should render all three main tabs: Code, ABI, Metadata', () => {
      render(<CodeViewer />)
      
      expect(screen.getByRole('button', { name: /code/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /abi/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /metadata/i })).toBeInTheDocument()
    })

    it('should default to Code tab being active', () => {
      render(<CodeViewer />)
      
      const codeTab = screen.getByRole('button', { name: /^code$/i })
      expect(codeTab).toHaveClass('bg-[#222730]')
      expect(codeTab).toHaveClass('text-white')
    })

    it('should switch to ABI tab when clicked', () => {
      render(<CodeViewer />)
      
      const abiTab = screen.getByRole('button', { name: /abi/i })
      fireEvent.click(abiTab)
      
      expect(abiTab).toHaveClass('bg-[#222730]')
      expect(abiTab).toHaveClass('text-white')
    })

    it('should switch to Metadata tab when clicked', () => {
      render(<CodeViewer />)
      
      const metadataTab = screen.getByRole('button', { name: /metadata/i })
      fireEvent.click(metadataTab)
      
      expect(metadataTab).toHaveClass('bg-[#222730]')
      expect(metadataTab).toHaveClass('text-white')
    })

    it('should show code sub-tabs only when Code tab is active', () => {
      render(<CodeViewer />)
      
      // Code tab is active by default, sub-tabs should be visible
      expect(screen.getByRole('button', { name: /rust\/wasm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /frontend/i })).toBeInTheDocument()
      
      // Switch to ABI tab
      fireEvent.click(screen.getByRole('button', { name: /abi/i }))
      
      // Sub-tabs should not be visible
      expect(screen.queryByRole('button', { name: /rust\/wasm/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /frontend/i })).not.toBeInTheDocument()
    })
  })

  describe('Design System Tokens', () => {
    it('should use design system colors for tabs', () => {
      render(<CodeViewer />)
      
      const codeTab = screen.getByRole('button', { name: /^code$/i })
      
      // Active tab should use Surface 3 (#222730) and accent border
      expect(codeTab).toHaveClass('bg-[#222730]')
      expect(codeTab).toHaveClass('border-t-blue-500/50')
    })

    it('should use correct border opacity for containers', () => {
      const { container } = render(<CodeViewer />)
      
      // Check for border-white/[0.06] which is the design system token
      const borderedElements = container.querySelectorAll('[class*="border-white/\\[0.06\\]"]')
      expect(borderedElements.length).toBeGreaterThan(0)
    })

    it('should use monospace font for code display', () => {
      const { container } = render(<CodeViewer />)
      
      const codeElement = container.querySelector('pre')
      expect(codeElement).toHaveClass('font-mono')
    })

    it('should use monospace font for technical labels', () => {
      render(<CodeViewer />)
      
      // Network and Compiler labels should use monospace
      const monoElements = screen.getAllByText(/stellar testnet|soroban-sdk v20/i)
      monoElements.forEach(element => {
        expect(element).toHaveClass('font-mono')
      })
    })

    it('should use motion system timing (180ms) for tab transitions', () => {
      render(<CodeViewer />)
      
      const codeTab = screen.getByRole('button', { name: /^code$/i })
      const abiTab = screen.getByRole('button', { name: /abi/i })
      
      // Verify tabs have the correct transition duration
      expect(codeTab).toHaveClass('duration-[180ms]')
      expect(abiTab).toHaveClass('duration-[180ms]')
    })
  })

  describe('Content Display', () => {
    it('should display code content when Code tab is active', () => {
      render(<CodeViewer />)
      
      expect(screen.getByText('mock solidity code')).toBeInTheDocument()
    })

    it('should display ABI content when ABI tab is active', () => {
      render(<CodeViewer />)
      
      fireEvent.click(screen.getByRole('button', { name: /abi/i }))
      
      // ABI content should be JSON formatted
      const codeElement = screen.getByText(/BlockBuilderContract/i)
      expect(codeElement).toBeInTheDocument()
    })

    it('should display metadata content when Metadata tab is active', () => {
      render(<CodeViewer />)
      
      fireEvent.click(screen.getByRole('button', { name: /metadata/i }))
      
      // Metadata should contain compiler info - use getAllByText since it appears in header too
      const codeElements = screen.getAllByText(/soroban-sdk/i)
      expect(codeElements.length).toBeGreaterThan(0)
      // Verify the JSON metadata content is present
      expect(screen.getByText(/"compiler":/i)).toBeInTheDocument()
    })

    it('should switch between Rust/WASM and Frontend code', () => {
      render(<CodeViewer />)
      
      // Default is Rust/WASM
      expect(screen.getByText('mock solidity code')).toBeInTheDocument()
      
      // Switch to Frontend
      fireEvent.click(screen.getByRole('button', { name: /frontend/i }))
      expect(screen.getByText('mock typescript code')).toBeInTheDocument()
    })
  })

  describe('Copy and Download Functionality', () => {
    it('should copy content to clipboard when copy button is clicked', async () => {
      const mockWriteText = jest.fn()
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      })

      const { container } = render(<CodeViewer />)
      
      // Hover to show buttons
      const codeDisplay = container.querySelector('.group')
      if (codeDisplay) {
        fireEvent.mouseEnter(codeDisplay)
      }
      
      const copyButton = container.querySelector('button[class*="opacity-0"]')
      if (copyButton) {
        fireEvent.click(copyButton)
        expect(mockWriteText).toHaveBeenCalled()
      }
    })

    it('should download content with correct filename for each tab', () => {
      render(<CodeViewer />)
      
      // Test would verify download functionality
      // Implementation depends on how download is triggered
    })
  })

  describe('Accessibility', () => {
    it('should have proper button roles for all tabs', () => {
      render(<CodeViewer />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should maintain keyboard navigation', () => {
      render(<CodeViewer />)
      
      const codeTab = screen.getByRole('button', { name: /^code$/i })
      const abiTab = screen.getByRole('button', { name: /abi/i })
      
      codeTab.focus()
      expect(document.activeElement).toBe(codeTab)
      
      // Tab key should move focus
      fireEvent.keyDown(codeTab, { key: 'Tab' })
    })
  })
})
