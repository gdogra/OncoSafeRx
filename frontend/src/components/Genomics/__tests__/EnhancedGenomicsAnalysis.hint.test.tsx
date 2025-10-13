import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EnhancedGenomicsAnalysis from '../EnhancedGenomicsAnalysis';

// Mock patientService to return no patients
vi.mock('../../../services/patientService', () => ({
  patientService: {
    getPatients: vi.fn().mockResolvedValue([])
  }
}));

// Mock useAuth with patient user role
vi.mock('../../../context/AuthContext', async () => ({
  useAuth: () => ({
    state: {
      user: {
        id: 'u1',
        email: 'patient@example.com',
        firstName: 'Pat',
        lastName: 'Ient',
        role: 'patient',
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: { email: true, push: false, criticalAlerts: true, weeklyReports: false },
          dashboard: { defaultView: 'overview', refreshInterval: 60, compactMode: false },
          clinical: { showGenomicsByDefault: true, autoCalculateDosing: true, requireInteractionAck: true, showPatientPhotos: false }
        },
        persona: {
          id: 'persona_patient',
          name: 'Patient',
          description: 'Patient persona',
          role: 'patient',
          experienceLevel: 'novice',
          specialties: [],
          preferences: { riskTolerance: 'conservative', alertSensitivity: 'high', workflowStyle: 'thorough', decisionSupport: 'guided' },
          customSettings: {}
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
        roles: [],
        permissions: []
      },
      isAuthenticated: true,
      isLoading: false,
      error: null
    }
  })
}));

describe('EnhancedGenomicsAnalysis patient hint', () => {
  it('shows create profile hint when no patient record', async () => {
    render(
      <MemoryRouter>
        <EnhancedGenomicsAnalysis />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/We couldn’t find your record yet/i)).toBeInTheDocument();
    });

    const link = screen.getByRole('link', { name: /create my profile/i });
    expect(link).toHaveAttribute('href', '/my-profile');
  });
});

