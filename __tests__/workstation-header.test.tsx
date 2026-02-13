import { render, screen } from '@testing-library/react';
import { WorkstationHeader } from '@/components/infrastructure/workstation-header';

describe('WorkstationHeader Component', () => {
  it('renders with default props', () => {
    render(<WorkstationHeader />);
    
    expect(screen.getByText('Untitled Contract')).toBeInTheDocument();
    expect(screen.getByText('Stellar Testnet')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('displays all pipeline stages', () => {
    render(<WorkstationHeader />);
    
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Generate')).toBeInTheDocument();
    expect(screen.getByText('Compile')).toBeInTheDocument();
    expect(screen.getByText('Deploy')).toBeInTheDocument();
  });

  it('highlights the current stage correctly', () => {
    const { rerender } = render(<WorkstationHeader currentStage="compile" />);
    
    const compileStage = screen.getByText('Compile').closest('div');
    expect(compileStage).toHaveClass('bg-primary/10');
    
    rerender(<WorkstationHeader currentStage="deploy" />);
    const deployStage = screen.getByText('Deploy').closest('div');
    expect(deployStage).toHaveClass('bg-primary/10');
  });

  it('displays contract overview information', () => {
    render(
      <WorkstationHeader
        contractName="MyToken"
        network="Stellar Mainnet"
        status="Compiled"
      />
    );
    
    expect(screen.getByText('MyToken')).toBeInTheDocument();
    expect(screen.getByText('Stellar Mainnet')).toBeInTheDocument();
    expect(screen.getByText('Compiled')).toBeInTheDocument();
  });

  it('displays compile metadata', () => {
    render(
      <WorkstationHeader
        compileSize="14kb"
        gasEstimate="2.5M"
        lastCompiled="2 mins ago"
      />
    );
    
    expect(screen.getByText('14kb')).toBeInTheDocument();
    expect(screen.getByText('2.5M')).toBeInTheDocument();
    expect(screen.getByText('2 mins ago')).toBeInTheDocument();
  });

  it('shows placeholder values when compile data is unavailable', () => {
    render(<WorkstationHeader />);
    
    const placeholders = screen.getAllByText('—');
    expect(placeholders.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Never')).toBeInTheDocument();
  });

  it('marks completed stages with emerald styling', () => {
    render(<WorkstationHeader currentStage="compile" />);
    
    const designStage = screen.getByText('Design').closest('div');
    const generateStage = screen.getByText('Generate').closest('div');
    
    expect(designStage).toHaveClass('bg-emerald-500/5');
    expect(generateStage).toHaveClass('bg-emerald-500/5');
  });

  it('shows status indicator dot with correct color', () => {
    const { rerender } = render(<WorkstationHeader status="Draft" />);
    let statusDot = screen.getByText('Draft').previousSibling;
    expect(statusDot).toHaveClass('bg-zinc-600');
    
    rerender(<WorkstationHeader status="Compiled" />);
    statusDot = screen.getByText('Compiled').previousSibling;
    expect(statusDot).toHaveClass('bg-emerald-500');
    
    rerender(<WorkstationHeader status="Deployed" />);
    statusDot = screen.getByText('Deployed').previousSibling;
    expect(statusDot).toHaveClass('bg-blue-500');
  });

  it('applies design system styling', () => {
    const { container } = render(<WorkstationHeader />);
    
    const header = container.firstChild;
    expect(header).toHaveClass('border-white/[0.08]');
    expect(header).toHaveClass('bg-[var(--surface-0)]');
  });

  it('uses monospace fonts for technical labels', () => {
    render(<WorkstationHeader />);
    
    const contractLabel = screen.getByText('Contract:');
    expect(contractLabel).toHaveClass('font-mono');
    
    const networkLabel = screen.getByText('Network:');
    expect(networkLabel).toHaveClass('font-mono');
  });
});
