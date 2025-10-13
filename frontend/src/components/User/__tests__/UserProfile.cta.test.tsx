import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../../components/UI/Toast';
import UserProfile from '../UserProfile';

// Mock useAuth to provide a patient user and a successful updateProfile
vi.mock('../../../context/AuthContext', async () => {
  const mockPatient = {
    id: 'user_1',
    email: 'patient@example.com',
    firstName: 'Pat',
    lastName: 'Ient',
    avatarUrl: '',
    role: 'patient' as const,
    specialty: '',
    institution: '',
    licenseNumber: '',
    yearsExperience: 0,
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
      role: 'patient' as const,
      experienceLevel: 'novice' as const,
      specialties: [],
      preferences: { riskTolerance: 'conservative', alertSensitivity: 'high', workflowStyle: 'thorough', decisionSupport: 'guided' },
      customSettings: {}
    },
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
    roles: [],
    permissions: []
  };

  return {
    useAuth: () => ({
      state: { user: mockPatient, isAuthenticated: true, isLoading: false, error: null },
      actions: { updateProfile: vi.fn().mockResolvedValue({}) },
      roleConfig: null
    })
  };
});

describe('UserProfile patient genomics CTA', () => {
  it('shows Analyze My Genomics CTA after saving profile', async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <UserProfile />
        </ToastProvider>
      </MemoryRouter>
    );

    // Enter edit mode
    const editBtn = await screen.findByRole('button', { name: /edit profile/i });
    await userEvent.click(editBtn);

    // Save changes
    const saveBtn = await screen.findByRole('button', { name: /save changes/i });
    await userEvent.click(saveBtn);

    // CTA should appear
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /analyze my genomics/i })).toBeInTheDocument();
    });
  });
});

