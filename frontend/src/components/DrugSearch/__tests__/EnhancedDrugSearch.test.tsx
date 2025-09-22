import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import EnhancedDrugSearch from '../EnhancedDrugSearch';

// Mock the SelectionContext
const mockContext = {
  selectedDrugs: [],
  selectedPatient: null,
  addDrug: vi.fn(),
  removeDrug: vi.fn(),
  setPatient: vi.fn(),
  clearAll: vi.fn(),
};

vi.mock('../../../context/SelectionContext', () => ({
  useSelection: () => mockContext,
}));

// Wrapper component for routing and context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('EnhancedDrugSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search interface correctly', () => {
    render(
      <TestWrapper>
        <EnhancedDrugSearch />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText(/search for drugs/i)).toBeInTheDocument();
    expect(screen.getByText(/ai-powered drug search/i)).toBeInTheDocument();
    expect(screen.getByText(/advanced filters/i)).toBeInTheDocument();
  });

  it('displays search suggestions when typing', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EnhancedDrugSearch />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search for drugs/i);
    await user.type(searchInput, 'tamox');

    await waitFor(() => {
      expect(screen.getByText(/tamoxifen/i)).toBeInTheDocument();
    });
  });

  it('filters results by cancer type', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EnhancedDrugSearch />
      </TestWrapper>
    );

    // Open filters
    const filtersButton = screen.getByText(/advanced filters/i);
    await user.click(filtersButton);

    // Select cancer type
    const cancerTypeSelect = screen.getByLabelText(/cancer type/i);
    await user.selectOptions(cancerTypeSelect, 'Breast Cancer');

    await waitFor(() => {
      expect(screen.queryByText(/bevacizumab/i)).not.toBeInTheDocument();
    });
  });

  it('displays AI-powered insights', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EnhancedDrugSearch />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search for drugs/i);
    await user.type(searchInput, 'erlotinib');

    await waitFor(() => {
      expect(screen.getByText(/ai insight/i)).toBeInTheDocument();
      expect(screen.getByText(/egfr mutation/i)).toBeInTheDocument();
    });
  });

  it('shows drug details in modal when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EnhancedDrugSearch />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search for drugs/i);
    await user.type(searchInput, 'tamoxifen');

    await waitFor(() => {
      const drugCard = screen.getByText(/tamoxifen/i).closest('.bg-white');
      expect(drugCard).toBeInTheDocument();
    });

    const drugCard = screen.getByText(/tamoxifen/i).closest('.bg-white');
    await user.click(drugCard!);

    await waitFor(() => {
      expect(screen.getByText(/drug details/i)).toBeInTheDocument();
      expect(screen.getByText(/mechanism of action/i)).toBeInTheDocument();
    });
  });

  it('adds drug to selection when clicking add button', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EnhancedDrugSearch />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search for drugs/i);
    await user.type(searchInput, 'tamoxifen');

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add to analysis/i });
      expect(addButton).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add to analysis/i });
    await user.click(addButton);

    expect(mockContext.addDrug).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Tamoxifen'
      })
    );
  });

  it('displays smart recommendations', () => {
    render(
      <TestWrapper>
        <EnhancedDrugSearch />
      </TestWrapper>
    );

    expect(screen.getByText(/smart recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/trending in oncology/i)).toBeInTheDocument();
    expect(screen.getByText(/pembrolizumab/i)).toBeInTheDocument();
  });

  it('filters by mechanism of action', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EnhancedDrugSearch />
      </TestWrapper>
    );

    // Open filters
    const filtersButton = screen.getByText(/advanced filters/i);
    await user.click(filtersButton);

    // Select mechanism
    const mechanismSelect = screen.getByLabelText(/mechanism/i);
    await user.selectOptions(mechanismSelect, 'Tyrosine Kinase Inhibitor');

    await waitFor(() => {
      expect(screen.getByText(/erlotinib/i)).toBeInTheDocument();
      expect(screen.queryByText(/tamoxifen/i)).not.toBeInTheDocument();
    });
  });

  it('handles search errors gracefully', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EnhancedDrugSearch />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search for drugs/i);
    await user.type(searchInput, 'nonexistentdrug123');

    await waitFor(() => {
      expect(screen.getByText(/no drugs found/i)).toBeInTheDocument();
    });
  });

  it('displays FDA approval status correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EnhancedDrugSearch />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search for drugs/i);
    await user.type(searchInput, 'tamoxifen');

    await waitFor(() => {
      expect(screen.getByText(/fda approved/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during search', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EnhancedDrugSearch />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search for drugs/i);
    await user.type(searchInput, 'test');

    // Loading state should appear briefly
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });

  it('clears search results when input is cleared', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EnhancedDrugSearch />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search for drugs/i);
    await user.type(searchInput, 'tamoxifen');

    await waitFor(() => {
      expect(screen.getByText(/tamoxifen/i)).toBeInTheDocument();
    });

    await user.clear(searchInput);

    await waitFor(() => {
      expect(screen.queryByText(/tamoxifen/i)).not.toBeInTheDocument();
    });
  });

  it('keyboard navigation works correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EnhancedDrugSearch />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search for drugs/i);
    await user.type(searchInput, 'tam');

    await waitFor(() => {
      expect(screen.getByText(/tamoxifen/i)).toBeInTheDocument();
    });

    // Arrow down to highlight first result
    await user.keyboard('[ArrowDown]');
    
    // Enter to select
    await user.keyboard('[Enter]');

    expect(mockContext.addDrug).toHaveBeenCalled();
  });
});