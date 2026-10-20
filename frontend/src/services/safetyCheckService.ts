import { apiBaseUrl } from '../utils/env';
import { authedFetch } from '../utils/authedFetch';

export interface Regimen { id: string; name: string; indication: string }

export interface SmartContext {
  authenticated: boolean;
  iss?: string; patient?: string | null; encounter?: string | null; fhirUser?: string | null; scope?: string;
}

export interface Provenance { date: string; ageDays: number; stale: boolean; unit: string }

export interface DosingInputs {
  patient: { sex?: string; ageYears?: number; weightKg?: number; heightCm?: number; serumCreatinineMgDl?: number };
  labs: { ANC?: number; platelets?: number; LVEF?: number; QTc?: number; potassium?: number; magnesium?: number };
  medications: string[];
}

export interface SmartPatient {
  patientId: string;
  dosingInputs: DosingInputs;
  provenance: Record<string, Provenance>;
  staleFields: string[];
  staleValues: Record<string, number>;
  unconverted: { field: string; reason: string; value?: unknown; unit?: string }[];
  medicationsUnresolved: number;
  notes: string[];
}

export type Severity = 'critical' | 'high' | 'moderate' | 'low';

export interface Finding {
  ruleId: string;
  ruleVersion?: string;
  ruleStatus?: string;
  kind: 'finding' | 'data_gap';
  action: string;
  severity: Severity;
  message: string;
  drugs: string[];
  source?: { label: string; url?: string };
}

export interface ScreenedDrug { name: string; tier: string; origin: string }

export interface AdjustResponse {
  regimen: { id: string; name: string };
  calculators: { BSA: number | null; CrCl: number | null };
  findings: Finding[];
  calculatedDoses: { component: string; dose: string; calculatedMg?: number; roundedMg?: number; cappedMg?: number; note?: string }[];
  interactionScreens?: { qtDrugs: ScreenedDrug[]; qtRiskFactors: string[]; serotonergicDrugs: ScreenedDrug[] };
  regimenAdjustments?: { criterion: string; action: string }[];
  disclaimer: string;
}

export interface AdjustRequest {
  regimenId: string;
  patient: Record<string, number | string>;
  labs: Record<string, number>;
  phenotypes: Record<string, string>;
  medications: string[];
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const api = () => apiBaseUrl();

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { const b = await res.json(); if (b?.error) msg = String(b.error); } catch { /* keep default */ }
    throw new ApiError(res.status, msg);
  }
  return res.json() as Promise<T>;
}

// SMART session cookies belong to the API origin; send them with every call.
const sameSite: RequestInit = { credentials: 'include' };

export async function listRegimens(): Promise<Regimen[]> {
  const b = await json<{ regimens: Regimen[] }>(await fetch(`${api()}/regimens`));
  return b.regimens || [];
}

export async function getSmartContext(): Promise<SmartContext> {
  return json<SmartContext>(await fetch(`${api()}/smart/context`, sameSite));
}

export async function getSmartPatient(): Promise<SmartPatient> {
  return json<SmartPatient>(await fetch(`${api()}/smart/patient`, sameSite));
}

export async function endSmartSession(): Promise<void> {
  await fetch(`${api()}/smart/logout`, { method: 'POST', ...sameSite });
}

export async function runSafetyCheck(body: AdjustRequest): Promise<AdjustResponse> {
  return json<AdjustResponse>(await fetch(`${api()}/dosing/adjust`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  }));
}

export interface OverrideBody {
  action: 'accept' | 'override';
  source: 'dosing';
  ruleId: string;
  ruleVersion?: string;
  reasonCode?: string;
  reasonText?: string;
  context: Record<string, string>;
}

export async function recordOverride(body: OverrideBody): Promise<void> {
  await json<unknown>(await authedFetch(`${api()}/overrides`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  }));
}
