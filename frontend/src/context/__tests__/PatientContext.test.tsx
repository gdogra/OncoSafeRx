import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatientProvider, usePatient } from '../PatientContext';
import type { ClinicalAlert } from '../../types';

// Mock the AuthContext
const mockAuthState = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,
};

const mockAuthActions = {
  login: vi.fn(),
  logout: vi.fn(),
  signup: vi.fn(),
  updateProfile: vi.fn(),
  switchPersona: vi.fn(),
  setError: vi.fn(),
};

vi.mock('../AuthContext', () => ({
  useAuth: () => ({
    state: mockAuthState,
    actions: mockAuthActions,
    roleConfig: null,
  }),
}));

// Test component that uses PatientContext
const TestComponent: React.FC = () => {
  const { state, actions } = usePatient();

  const handleAcknowledgeAlert = () => {
    if (state.alerts.length > 0) {
      actions.acknowledgeAlert(state.alerts[0].id);
    }
  };

  return (
    <div>
      <div data-testid="alert-count">{state.alerts.length}</div>
      <div data-testid="current-patient">
        {state.currentPatient?.demographics.firstName || 'None'}
      </div>
      <button onClick={handleAcknowledgeAlert} data-testid="acknowledge-btn">
        Acknowledge Alert
      </button>
      <div data-testid="loading">{state.isLoading ? 'Loading' : 'Ready'}</div>
      <div data-testid="error">{state.error || 'No error'}</div>
    </div>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PatientProvider>{children}</PatientProvider>
);

describe('PatientContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides initial state correctly', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('alert-count')).toHaveTextContent('0');
    expect(screen.getByTestId('current-patient')).toHaveTextContent('None');
    expect(screen.getByTestId('loading')).toHaveTextContent('Ready');
    expect(screen.getByTestId('error')).toHaveTextContent('No error');
  });

  it('loads sample patients from localStorage', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Should load sample patients since no localStorage data
    expect(screen.getByTestId('current-patient')).toHaveTextContent('None');
  });

  it('acknowledges alerts with correct user ID from auth context', async () => {
    const TestAcknowledgeComponent: React.FC = () => {
      const { state, actions } = usePatient();

      React.useEffect(() => {
        // Add a test alert
        const testAlert: ClinicalAlert = {
          id: 'alert-1',
          type: 'interaction',
          severity: 'high',
          title: 'Drug Interaction',
          message: 'Potential interaction detected',
          timestamp: new Date().toISOString(),
          isAcknowledged: false,
          source: 'system',
          patientId: 'patient-1',
          relatedData: {},
        };
        actions.addAlert(testAlert);
      }, [actions]);

      const handleAcknowledge = () => {
        if (state.alerts.length > 0) {
          actions.acknowledgeAlert(state.alerts[0].id);
        }
      };

      return (
        <div>
          <div data-testid="alerts">
            {state.alerts.map(alert => (
              <div key={alert.id} data-testid={`alert-${alert.id}`}>
                <span>Acknowledged: {alert.isAcknowledged ? 'Yes' : 'No'}</span>
                <span data-testid={`acknowledged-by-${alert.id}`}>
                  By: {alert.acknowledgedBy || 'None'}
                </span>
              </div>
            ))}
          </div>
          <button onClick={handleAcknowledge} data-testid="acknowledge">
            Acknowledge
          </button>
        </div>
      );
    };

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <TestAcknowledgeComponent />
      </TestWrapper>
    );

    // Wait for alert to be added
    await screen.findByTestId('alert-alert-1');

    // Check initial state
    expect(screen.getByTestId('alert-alert-1')).toHaveTextContent('Acknowledged: No');
    expect(screen.getByTestId('acknowledged-by-alert-1')).toHaveTextContent('By: None');

    // Acknowledge the alert
    const acknowledgeBtn = screen.getByTestId('acknowledge');
    await user.click(acknowledgeBtn);

    // Check that alert is acknowledged with correct user ID
    expect(screen.getByTestId('alert-alert-1')).toHaveTextContent('Acknowledged: Yes');
    expect(screen.getByTestId('acknowledged-by-alert-1')).toHaveTextContent('By: user-123');
  });

  it('handles unauthenticated user gracefully', async () => {
    // Mock unauthenticated state
    vi.mocked(vi.importActual('../AuthContext')).useAuth = vi.fn().mockReturnValue({
      state: { ...mockAuthState, user: null, isAuthenticated: false },
      actions: mockAuthActions,
      roleConfig: null,
    });

    const TestUnauthComponent: React.FC = () => {
      const { state, actions } = usePatient();

      React.useEffect(() => {
        const testAlert: ClinicalAlert = {
          id: 'alert-2',
          type: 'interaction',
          severity: 'high',
          title: 'Drug Interaction',
          message: 'Potential interaction detected',
          timestamp: new Date().toISOString(),
          isAcknowledged: false,
          source: 'system',
          patientId: 'patient-1',
          relatedData: {},
        };
        actions.addAlert(testAlert);
      }, [actions]);

      const handleAcknowledge = () => {
        if (state.alerts.length > 0) {
          actions.acknowledgeAlert(state.alerts[0].id);
        }
      };

      return (
        <div>
          <div data-testid="alerts">
            {state.alerts.map(alert => (
              <div key={alert.id} data-testid={`alert-${alert.id}`}>
                <span data-testid={`acknowledged-by-${alert.id}`}>
                  By: {alert.acknowledgedBy || 'None'}
                </span>
              </div>
            ))}
          </div>
          <button onClick={handleAcknowledge} data-testid="acknowledge">
            Acknowledge
          </button>
        </div>
      );
    };

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <TestUnauthComponent />
      </TestWrapper>
    );

    // Wait for alert to be added
    await screen.findByTestId('alert-alert-2');

    // Acknowledge the alert
    const acknowledgeBtn = screen.getByTestId('acknowledge');
    await user.click(acknowledgeBtn);

    // Should use fallback user ID
    expect(screen.getByTestId('acknowledged-by-alert-2')).toHaveTextContent('By: unknown-user');
  });

  it('persists data to localStorage', async () => {
    const TestPersistenceComponent: React.FC = () => {
      const { actions } = usePatient();

      const addPatient = () => {
        const patient = {
          id: 'patient-test',
          demographics: {
            firstName: 'Test',
            lastName: 'Patient',
            dateOfBirth: '1980-01-01',
            sex: 'male' as const,
            mrn: 'TEST-001',
            heightCm: 180,
            weightKg: 75,
          },
          allergies: [],
          medications: [],
          conditions: [],
          labValues: [],
          genetics: [],
          vitals: [],
          treatmentHistory: [],
          notes: [],
          preferences: {},
          lastUpdated: new Date().toISOString(),
          createdBy: 'test-user',
          isActive: true,
        };
        actions.setCurrentPatient(patient);
      };

      return (
        <button onClick={addPatient} data-testid="add-patient">
          Add Patient
        </button>
      );
    };

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <TestPersistenceComponent />
      </TestWrapper>
    );

    const addBtn = screen.getByTestId('add-patient');
    await user.click(addBtn);

    // Check localStorage
    const stored = localStorage.getItem('oncosaferx_current_patient');
    expect(stored).toBeTruthy();
    const patient = JSON.parse(stored!);
    expect(patient.demographics.firstName).toBe('Test');
  });

  it('handles loading and error states', () => {
    const TestStateComponent: React.FC = () => {
      const { state, dispatch } = usePatient();

      return (
        <div>
          <button
            onClick={() => dispatch({ type: 'SET_LOADING', payload: true })}
            data-testid="set-loading"
          >
            Set Loading
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_ERROR', payload: 'Test error' })}
            data-testid="set-error"
          >
            Set Error
          </button>
          <button
            onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
            data-testid="clear-error"
          >
            Clear Error
          </button>
          <div data-testid="loading-state">{state.isLoading ? 'Loading' : 'Not Loading'}</div>
          <div data-testid="error-state">{state.error || 'No Error'}</div>
        </div>
      );
    };

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <TestStateComponent />
      </TestWrapper>
    );

    // Test loading state
    act(() => {
      user.click(screen.getByTestId('set-loading'));
    });
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');

    // Test error state
    act(() => {
      user.click(screen.getByTestId('set-error'));
    });
    expect(screen.getByTestId('error-state')).toHaveTextContent('Test error');

    // Test clear error
    act(() => {
      user.click(screen.getByTestId('clear-error'));
    });
    expect(screen.getByTestId('error-state')).toHaveTextContent('No Error');
  });
});