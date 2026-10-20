import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('../../services/safetyCheckService', async () => {
  const actual = await vi.importActual<typeof import('../../services/safetyCheckService')>('../../services/safetyCheckService');
  return {
    ...actual,
    listRegimens: vi.fn(), getSmartContext: vi.fn(), getSmartPatient: vi.fn(), runSafetyCheck: vi.fn(), recordOverride: vi.fn(), endSmartSession: vi.fn(),
  };
});
import * as svc from '../../services/safetyCheckService';
import SafetyCheck from '../SafetyCheck';

const m = svc as unknown as Record<string, ReturnType<typeof vi.fn>>;

const finding = { ruleId: 'DPYD-POOR-FLUOROPYRIMIDINE', ruleVersion: 'a1b2c3d4e5f6', ruleStatus: 'draft', kind: 'finding', action: 'avoid', severity: 'critical', drugs: ['5-FU (bolus)', 'Capecitabine'], message: 'DPYD poor metabolizer: avoid fluoropyrimidines.', source: { label: 'CPIC guideline', url: 'https://cpicpgx.org/x' } };
const gap = { ruleId: 'ANC-MISSING', kind: 'data_gap', action: 'info', severity: 'moderate', drugs: [], message: 'ANC not provided. No hematologic check was performed.' };
const response = { regimen: { id: 'FOLFOX-6', name: 'FOLFOX-6' }, calculators: { BSA: 1.82, CrCl: null }, findings: [finding, gap], calculatedDoses: [{ component: 'Oxaliplatin', dose: '85 mg/m² IV day 1', roundedMg: 155, note: 'Standard dose, unadjusted.' }], disclaimer: 'x' };

beforeEach(() => {
  m.listRegimens.mockResolvedValue([{ id: 'FOLFOX-6', name: 'FOLFOX-6', indication: 'Colorectal cancer' }]);
  m.getSmartContext.mockResolvedValue({ authenticated: false });
  m.runSafetyCheck.mockResolvedValue(response);
  m.recordOverride.mockResolvedValue(undefined);
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

async function runCheck() {
  render(<SafetyCheck />);
  await screen.findByText(/Not launched from an EHR/);
  fireEvent.change(screen.getByLabelText('Regimen'), { target: { value: 'FOLFOX-6' } });
  fireEvent.click(screen.getByRole('button', { name: 'Run safety check' }));
  await screen.findByTestId('summary');
}

describe('SafetyCheck page', () => {
  it('manual flow: sends only the entered values and shows findings, data gaps and the draft-rule warning', async () => {
    render(<SafetyCheck />);
    await screen.findByText(/Not launched from an EHR/);
    expect(screen.getAllByText(/drafts pending pharmacist\/oncologist review/i).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('Regimen'), { target: { value: 'FOLFOX-6' } });
    fireEvent.change(screen.getByLabelText(/^Weight/), { target: { value: '70' } });
    fireEvent.change(screen.getByLabelText('DPYD phenotype'), { target: { value: 'Poor metabolizer' } });
    fireEvent.click(screen.getByRole('button', { name: 'Run safety check' }));
    await screen.findByTestId('summary');
    expect(m.runSafetyCheck).toHaveBeenCalledWith({ regimenId: 'FOLFOX-6', patient: { weightKg: 70 }, labs: {}, phenotypes: { DPYD: 'Poor metabolizer' }, medications: [] });
    expect(screen.getByText('1 finding')).toBeInTheDocument();
    expect(screen.getByText(/avoid fluoropyrimidines/)).toBeInTheDocument();
    expect(screen.getByText('Draft rule')).toBeInTheDocument();
    expect(screen.getByText(/Checks not performed/)).toBeInTheDocument();
    expect(screen.getByText(/ANC not provided/)).toBeInTheDocument();
    expect(screen.getByText(/Standard doses \(not adjusted/)).toBeInTheDocument();
  });

  it('blocks a run without a regimen and shows field errors for bad numbers', async () => {
    render(<SafetyCheck />);
    await screen.findByText(/Not launched from an EHR/);
    fireEvent.click(screen.getByRole('button', { name: 'Run safety check' }));
    expect(await screen.findByText('Choose a regimen first.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Regimen'), { target: { value: 'FOLFOX-6' } });
    fireEvent.change(screen.getByLabelText(/^QTc/), { target: { value: '9999' } });
    fireEvent.click(screen.getByRole('button', { name: 'Run safety check' }));
    expect(await screen.findByText(/QTc must be between/)).toBeInTheDocument();
    expect(m.runSafetyCheck).not.toHaveBeenCalled();
  });

  it('acknowledging records an accept against the rule id and version', async () => {
    await runCheck();
    fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }));
    await screen.findByText('Acknowledged');
    expect(m.recordOverride).toHaveBeenCalledWith({ action: 'accept', source: 'dosing', ruleId: 'DPYD-POOR-FLUOROPYRIMIDINE', ruleVersion: 'a1b2c3d4e5f6', context: { regimenId: 'FOLFOX-6', surface: 'safety-check' } });
  });

  it('override needs a reason; "other" needs a comment', async () => {
    await runCheck();
    fireEvent.click(screen.getByRole('button', { name: /Override…/ }));
    const submit = screen.getByRole('button', { name: 'Record override' });
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Reason for overriding'), { target: { value: 'other' } });
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/^Comment/), { target: { value: 'palliative intent' } });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    await screen.findByText(/Overridden: Other/);
    expect(m.recordOverride).toHaveBeenCalledWith(expect.objectContaining({ action: 'override', reasonCode: 'other', reasonText: 'palliative intent' }));
  });

  it('a failed save is shown, not hidden', async () => {
    m.recordOverride.mockRejectedValue(new svc.ApiError(503, 'x'));
    await runCheck();
    fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }));
    expect(await screen.findByText(/nothing was recorded/)).toBeInTheDocument();
  });

  it('EHR launch pre-fills values with provenance chips and the medication list; editing drops the chip', async () => {
    m.getSmartContext.mockResolvedValue({ authenticated: true, patient: 'p1' });
    m.getSmartPatient.mockResolvedValue({
      patientId: 'p1', staleFields: ['platelets'], staleValues: { platelets: 90000 }, unconverted: [{ field: 'magnesium', reason: 'unrecognised unit "furlongs"' }], medicationsUnresolved: 1, notes: ['Excluded as too old: platelets.'],
      provenance: { ANC: { date: '2026-10-19', ageDays: 1, stale: false, unit: '/uL' } },
      dosingInputs: { patient: { sex: 'female', ageYears: 62 }, labs: { ANC: 1200 }, medications: ['Ondansetron 8 mg'] },
    });
    render(<SafetyCheck />);
    await screen.findByText('Launched from your EHR');
    expect(screen.getByLabelText(/^ANC/)).toHaveValue(1200);
    expect(screen.getByText('EHR · 1 day ago')).toBeInTheDocument();
    expect(screen.getByText('Ondansetron 8 mg')).toBeInTheDocument();
    expect(screen.getByText(/magnesium: not used/)).toBeInTheDocument();
    expect(screen.getByText(/EHR value too old to use/)).toBeInTheDocument();
    expect(screen.getByText(/reference a separate medication record/)).toBeInTheDocument();
    expect((screen.getByLabelText(/^Platelets/) as HTMLInputElement).value).toBe('');
    fireEvent.change(screen.getByLabelText(/^ANC/), { target: { value: '900' } });
    await waitFor(() => expect(screen.queryByText('EHR · 1 day ago')).not.toBeInTheDocument());
  });
});
