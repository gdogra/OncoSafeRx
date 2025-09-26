import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiBaseUrl } from '../utils/env';
import { Pill, AlertTriangle, Plus, Trash2, Stethoscope, ExternalLink } from 'lucide-react';
import Tooltip from '../components/UI/Tooltip';

type MedInput = {
  name: string;
  rxcui?: string;
  route?: 'oral' | 'transdermal' | 'sublingual' | 'buccal' | 'iv' | 'im';
  doseMgPerDose?: number;
  dosesPerDay?: number;
  strengthMcgPerHr?: number; // for fentanyl patch
};

type PatientCtx = {
  age?: number;
  renal_clearance?: number;
  respiratory?: boolean;
  sleep_apnea?: boolean;
  pregnancy?: boolean;
};

const opioidExamples = [
  'morphine', 'hydrocodone', 'oxycodone', 'hydromorphone', 'oxymorphone', 'codeine', 'tramadol', 'tapentadol', 'fentanyl', 'methadone', 'buprenorphine'
];

export default function Pain() {
  const apiBase = useMemo(() => apiBaseUrl(), []);

  const [medications, setMedications] = useState<MedInput[]>([
    { name: 'oxycodone', route: 'oral', doseMgPerDose: 5, dosesPerDay: 4 }
  ]);
  const [patient, setPatient] = useState<PatientCtx>({ age: 70, renal_clearance: 60 });
  const [phenotypes, setPhenotypes] = useState<{ CYP2D6?: string }>({});

  const [mmeResult, setMmeResult] = useState<any | null>(null);
  const [safetyResult, setSafetyResult] = useState<any | null>(null);
  const [liveSafety, setLiveSafety] = useState<{ findings: any[]; recommendations: string[] } | null>(null);
  const liveSafetyTimer = useRef<any>(null);
  const [autoMme, setAutoMme] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connStatus, setConnStatus] = useState<'unknown'|'online'|'offline'|'error'>('unknown');
  const [connTesting, setConnTesting] = useState<boolean>(false);
  const [connCheckedAt, setConnCheckedAt] = useState<string | null>(null);

  const addMedication = () => setMedications(prev => [...prev, { name: '', route: 'oral', doseMgPerDose: undefined, dosesPerDay: undefined }]);
  const removeMedication = (idx: number) => setMedications(prev => prev.filter((_, i) => i !== idx));

  const updateMedication = (idx: number, patch: Partial<MedInput>) => {
    setMedications(prev => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  };

  // Helper function to extract dose information from drug name
  const extractDoseFromName = (drugName: string) => {
    // Look for opioid names and their associated doses
    const opioids = ['oxycodone', 'morphine', 'fentanyl', 'hydrocodone', 'hydromorphone', 'oxymorphone', 'codeine', 'tramadol'];
    const lowerName = drugName.toLowerCase();
    
    for (const opioid of opioids) {
      if (lowerName.includes(opioid)) {
        // Look for dose pattern like "oxycodone 7.5 MG" or "oxycodone hydrochloride 10 MG"
        const regex = new RegExp(`${opioid}[^\\d]*(\\d+(?:\\.\\d+)?)\\s*mg`, 'i');
        const match = drugName.match(regex);
        if (match) {
          const dose = parseFloat(match[1]);
          return {
            doseMgPerDose: dose,
            dosesPerDay: dose <= 5 ? 6 : dose <= 15 ? 4 : 3  // Reasonable defaults based on strength
          };
        }
      }
    }
    return {};
  };

  async function calcMME() {
    setLoading(true); setError(null);
    try {
      const resp = await fetch(`${apiBase}/pain/opiates/mme`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications, patient_context: patient })
      });
      if (!resp.ok) throw new Error(`MME error: ${resp.status}`);
      const data = await resp.json();
      setMmeResult(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to calculate MME');
    } finally {
      setLoading(false);
    }
  }

  async function safetyCheck() {
    setLoading(true); setError(null);
    try {
      const resp = await fetch(`${apiBase}/pain/opiates/safety-check`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications, phenotypes, patient_context: patient })
      });
      if (!resp.ok) throw new Error(`Safety error: ${resp.status}`);
      const data = await resp.json();
      setSafetyResult(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to run safety check');
    } finally {
      setLoading(false);
    }
  }

  // Debounced live safety preview while editing
  useEffect(() => {
    if (liveSafetyTimer.current) clearTimeout(liveSafetyTimer.current);
    liveSafetyTimer.current = setTimeout(async () => {
      try {
        if (!medications.length) { setLiveSafety(null); return; }
        const resp = await fetch(`${apiBase}/pain/opiates/safety-check`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ medications, phenotypes, patient_context: patient })
        });
        if (!resp.ok) throw new Error('');
        const data = await resp.json();
        setLiveSafety({ findings: data.findings || [], recommendations: data.recommendations || [] });
      } catch {
        setLiveSafety(null);
      }
    }, 600);
    return () => clearTimeout(liveSafetyTimer.current);
  }, [apiBase, medications, patient, phenotypes]);

  async function testConnectivity() {
    try {
      setConnTesting(true);
      const resp = await fetch(`${apiBase}/drugs/suggestions?q=asp&limit=1`, { method: 'GET' });
      if (!resp.ok) {
        setConnStatus('error');
      } else {
        const data = await resp.json();
        setConnStatus(data?.offline ? 'offline' : 'online');
      }
      setConnCheckedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setConnStatus('error');
      setConnCheckedAt(new Date().toLocaleTimeString());
    } finally {
      setConnTesting(false);
    }
  }

  // Debounced live MME calculation while editing
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!autoMme) return;
      try {
        const resp = await fetch(`${apiBase}/pain/opiates/mme`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ medications, patient_context: patient })
        });
        if (!resp.ok) return;
        const data = await resp.json();
        setMmeResult(data);
      } catch {
        // ignore live mme errors
      }
    }, 400);
    return () => clearTimeout(t);
  }, [apiBase, medications, patient, autoMme]);

  // Determine per-row severity and reasons for inline highlighting
  function rowHighlight(name: string): { severity: 'major' | 'moderate' | null, reasons: string[] } {
    const n = (name || '').toLowerCase();
    const names = medications.map(m => (m.name || '').toLowerCase());
    const isOpioid = /(morphine|hydrocodone|oxycodone|hydromorphone|oxymorphone|codeine|tramadol|tapentadol|fentanyl|methadone|buprenorphine)/.test(n);
    const isBenzo = /(diazepam|lorazepam|clonazepam|alprazolam|temazepam|midazolam)/.test(n);
    const isZHyp = /(zolpidem|zopiclone|eszopiclone|zaleplon)/.test(n);
    const isGaba = /(gabapentin|pregabalin)/.test(n);
    const cyp3a4Inhibitors = /(ketoconazole|itraconazole|voriconazole|clarithromycin|erythromycin|ritonavir|cobicistat|diltiazem|verapamil|grapefruit)/;
    const cyp3a4Inducers = /(rifampin|rifampicin|carbamazepine|phenytoin|phenobarbital|st\.?\s*john|nevirapine|efavirenz)/;
    const qtAgents = /(amiodarone|sotalol|quinolone|ciprofloxacin|levofloxacin|ondansetron|haloperidol|ziprasidone|citalopram)/;
    const reasons: string[] = [];
    let severity: 'major' | 'moderate' | null = null;

    // Opioid + benzo/Z-drug
    if ((isOpioid && (names.some(x => /(diazepam|lorazepam|clonazepam|alprazolam|temazepam|midazolam|zolpidem|zopiclone|eszopiclone|zaleplon)/.test(x)))) ||
        ((isBenzo || isZHyp) && names.some(x => /(morphine|hydrocodone|oxycodone|hydromorphone|oxymorphone|codeine|tramadol|tapentadol|fentanyl|methadone|buprenorphine)/.test(x)))) {
      severity = 'major';
      reasons.push('Opioid + benzo/Z-drug');
    }

    // Opioid + gabapentinoid
    if ((isOpioid && names.some(x => /(gabapentin|pregabalin)/.test(x))) || (isGaba && names.some(x => /(morphine|hydrocodone|oxycodone|hydromorphone|oxymorphone|codeine|tramadol|tapentadol|fentanyl|methadone|buprenorphine)/.test(x)))) {
      severity = severity || 'moderate';
      reasons.push('Opioid + gabapentinoid');
    }

    // CYP3A4 inhibitor/inducer with substrate opioid
    const is3a4SubOpioid = /(oxycodone|fentanyl|methadone|hydrocodone)/.test(n);
    if ((is3a4SubOpioid && names.some(x => cyp3a4Inhibitors.test(x))) || (cyp3a4Inhibitors.test(n) && names.some(x => /(oxycodone|fentanyl|methadone|hydrocodone)/.test(x)))) {
      severity = 'major';
      reasons.push('CYP3A4 inhibitor present');
    }
    if ((is3a4SubOpioid && names.some(x => cyp3a4Inducers.test(x))) || (cyp3a4Inducers.test(n) && names.some(x => /(oxycodone|fentanyl|methadone|hydrocodone)/.test(x)))) {
      severity = severity || 'moderate';
      reasons.push('CYP3A4 inducer present');
    }

    // Methadone + QT drugs
    if ((/methadone/.test(n) && names.some(x => qtAgents.test(x))) || (qtAgents.test(n) && names.some(x => /methadone/.test(x)))) {
      severity = 'major';
      reasons.push('QT-prolonging agents with methadone');
    }

    // Renal impairment with morphine/codeine
    if (typeof patient.renal_clearance === 'number' && patient.renal_clearance < 30 && /(morphine|codeine)/.test(n)) {
      severity = severity || 'moderate';
      reasons.push('CrCl < 30 with morphine/codeine');
    }

    // CYP2D6 PM/IM with codeine or tramadol
    const cyp2d6 = String(phenotypes.CYP2D6 || '').toLowerCase();
    if ((/codeine|tramadol/.test(n)) && (cyp2d6.includes('poor') || cyp2d6.includes('intermediate'))) {
      severity = severity || 'major';
      reasons.push('CYP2D6 PM/IM reduces activation');
    }
    return { severity, reasons };
  }

  // Detailed info and references for badges
  const reasonDetails: Record<string, { text: string; url?: string }> = {
    'Opioid + benzo/Z-drug': {
      text: 'Additive CNS/respiratory depression; avoid co-prescribing or use lowest doses and consider naloxone.',
      url: 'https://www.cdc.gov/mmwr/volumes/71/rr/rr7103a1.htm'
    },
    'Opioid + gabapentinoid': {
      text: 'Increased sedation/respiratory depression; FDA warns of serious breathing problems with co-use.',
      url: 'https://www.fda.gov/drugs/drug-safety-and-availability/fda-warns-about-serious-breathing-problems-seizure-and-nerve-pain-medicines-gabapentin-neurontin'
    },
    'CYP3A4 inhibitor present': {
      text: 'CYP3A4 inhibitors can raise levels of oxycodone/fentanyl/methadone → overdose risk; reduce dose/avoid and monitor.',
      url: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2013/019516s074lbl.pdf'
    },
    'CYP3A4 inducer present': {
      text: 'Inducers may lower opioid exposure → loss of analgesia or withdrawal; avoid or monitor closely.',
      url: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2013/019516s074lbl.pdf'
    },
    'QT-prolonging agents with methadone': {
      text: 'Additive QT prolongation → torsades risk; baseline/follow-up ECG and electrolytes; avoid if possible.',
      url: 'https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/methadone-information'
    },
    'CrCl < 30 with morphine/codeine': {
      text: 'Active metabolites accumulate in renal impairment; prefer alternatives (e.g., hydromorphone/fentanyl).'
    },
    'CYP2D6 PM/IM reduces activation': {
      text: 'Codeine/tramadol require CYP2D6 for activation; poor/intermediate metabolizers have reduced analgesia (CPIC).',
      url: 'https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/'
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
          <Pill className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pain Management</h1>
          <p className="text-sm text-gray-500">Opioid MME calculator and safety screening</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 border border-red-200 bg-red-50 text-red-700 rounded">
          <div className="flex items-center space-x-2"><AlertTriangle className="w-4 h-4" /><span>{error}</span></div>
        </div>
      )}

      {/* Connectivity status + test */}
      <div className="flex items-center justify-start mb-3">
        <div className="inline-flex items-center gap-3 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2">
          <div className="inline-flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${
              connStatus === 'online' ? 'bg-green-500' : connStatus === 'offline' ? 'bg-amber-500' : connStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
            }`} />
            <span>
              {connStatus === 'online' && 'RxNorm connectivity: Online'}
              {connStatus === 'offline' && 'RxNorm connectivity: Offline (fallback)'}
              {connStatus === 'error' && 'RxNorm connectivity: Error'}
              {connStatus === 'unknown' && 'RxNorm connectivity: Unknown'}
              {connCheckedAt ? ` • Checked ${connCheckedAt}` : ''}
            </span>
          </div>
          <button
            onClick={testConnectivity}
            disabled={connTesting}
            className="text-blue-700 hover:text-blue-800 underline disabled:opacity-60"
          >
            {connTesting ? 'Testing…' : 'Test connectivity'}
          </button>
        </div>
      </div>

      {/* Medications input */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium text-gray-900">Opioid Regimen</h2>
          <button onClick={addMedication} className="inline-flex items-center px-2 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
            <Plus className="w-4 h-4 mr-1" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {medications.map((m, idx) => {
            const { severity: sev, reasons } = rowHighlight(m.name);
            const sevClass = sev === 'major' ? 'bg-red-50 border-red-200' : sev === 'moderate' ? 'bg-amber-50 border-amber-200' : '';
            return (
            <div key={idx} className={`grid grid-cols-12 gap-2 items-end border rounded-md p-2 ${sevClass}`}>
              <div className="col-span-3">
                <label className="text-xs text-gray-600">Medication</label>
                <DrugAutocomplete
                  apiBase={apiBase}
                  value={m.name}
                  onChange={(name) => updateMedication(idx, { name, rxcui: undefined })}
                  onSelect={(drug) => {
                    const doseInfo = extractDoseFromName(drug.name);
                    updateMedication(idx, { name: drug.name, rxcui: drug.rxcui, ...doseInfo });
                  }}
                />
                {m.rxcui && <div className="text-[11px] text-gray-500 mt-1">RXCUI: {m.rxcui}</div>}
                {sev && reasons.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1 items-center">
                    {reasons.slice(0, 3).map((r, i) => {
                      const info = reasonDetails[r];
                      const badge = (
                        <span className={`text-[10px] px-2 py-0.5 rounded ${sev === 'major' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{r}</span>
                      );
                      return (
                        <span key={i} className="inline-flex items-center gap-1">
                          {info ? (
                            <Tooltip content={`${r}: ${info.text}`} position="top">{badge}</Tooltip>
                          ) : badge}
                          {info?.url && (
                            <a href={info.url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-700" aria-label="Learn more">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-600">Route</label>
                <select value={m.route || 'oral'} onChange={e => updateMedication(idx, { route: e.target.value as any })}
                  className="w-full border rounded px-2 py-1 text-sm">
                  <option value="oral">Oral</option>
                  <option value="transdermal">Transdermal</option>
                  <option value="sublingual">Sublingual</option>
                  <option value="buccal">Buccal</option>
                  <option value="iv">IV</option>
                  <option value="im">IM</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-600">Dose mg per dose</label>
                <input type="number" value={m.doseMgPerDose ?? ''} onChange={e => updateMedication(idx, { doseMgPerDose: e.target.value === '' ? undefined : Number(e.target.value) })}
                  className="w-full border rounded px-2 py-1 text-sm" placeholder="e.g., 10" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-600">Doses per day</label>
                <input type="number" value={m.dosesPerDay ?? ''} onChange={e => updateMedication(idx, { dosesPerDay: e.target.value === '' ? undefined : Number(e.target.value) })}
                  className="w-full border rounded px-2 py-1 text-sm" placeholder="e.g., 3" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-600">Fentanyl mcg/hr</label>
                <input type="number" value={m.strengthMcgPerHr ?? ''} onChange={e => updateMedication(idx, { strengthMcgPerHr: e.target.value === '' ? undefined : Number(e.target.value) })}
                  className="w-full border rounded px-2 py-1 text-sm" placeholder="e.g., 25" />
              </div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => removeMedication(idx)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );})}
        </div>

        {/* Live safety preview */}
        {liveSafety && (liveSafety.findings?.length > 0 || liveSafety.recommendations?.length > 0) && (
          <div className="mt-4 border border-amber-200 bg-amber-50 rounded p-3">
            <div className="text-sm font-medium text-amber-800">Live safety preview</div>
            <ul className="mt-1 text-sm text-amber-800 list-disc pl-5">
              {liveSafety.findings?.slice(0, 4).map((f, i) => (
                <li key={i}>{f.issue} ({f.severity})</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Patient context */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h2 className="text-base font-medium text-gray-900 mb-3">Patient Context</h2>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-gray-600">Age</label>
            <input type="number" value={patient.age ?? ''} onChange={e => setPatient({ ...patient, age: e.target.value === '' ? undefined : Number(e.target.value) })}
              className="w-full border rounded px-2 py-1 text-sm" />
          </div>
          <div className="col-span-3">
            <label className="text-xs text-gray-600">Renal clearance (CrCl mL/min)</label>
            <input type="number" value={patient.renal_clearance ?? ''} onChange={e => setPatient({ ...patient, renal_clearance: e.target.value === '' ? undefined : Number(e.target.value) })}
              className="w-full border rounded px-2 py-1 text-sm" />
          </div>
          <div className="col-span-2 flex items-center space-x-2 mt-5">
            <input id="resp" type="checkbox" checked={!!patient.respiratory} onChange={e => setPatient({ ...patient, respiratory: e.target.checked })} />
            <label htmlFor="resp" className="text-sm text-gray-700">Respiratory disease</label>
          </div>
          <div className="col-span-2 flex items-center space-x-2 mt-5">
            <input id="osa" type="checkbox" checked={!!patient.sleep_apnea} onChange={e => setPatient({ ...patient, sleep_apnea: e.target.checked })} />
            <label htmlFor="osa" className="text-sm text-gray-700">OSA</label>
          </div>
          <div className="col-span-2 flex items-center space-x-2 mt-5">
            <input id="preg" type="checkbox" checked={!!patient.pregnancy} onChange={e => setPatient({ ...patient, pregnancy: e.target.checked })} />
            <label htmlFor="preg" className="text-sm text-gray-700">Pregnancy</label>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-12 gap-3">
          <div className="col-span-4">
            <label className="text-xs text-gray-600">Phenotype: CYP2D6</label>
            <select value={phenotypes.CYP2D6 || ''} onChange={e => setPhenotypes({ ...phenotypes, CYP2D6: e.target.value })}
              className="w-full border rounded px-2 py-1 text-sm">
              <option value="">Unknown</option>
              <option value="ultrarapid_metabolizer">Ultrarapid metabolizer</option>
              <option value="normal_metabolizer">Normal metabolizer</option>
              <option value="intermediate_metabolizer">Intermediate metabolizer</option>
              <option value="poor_metabolizer">Poor metabolizer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center flex-wrap gap-2 mb-4">
        <button onClick={calcMME} disabled={loading} className="inline-flex items-center px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">
          <Pill className="w-4 h-4 mr-2" /> Calculate MME
        </button>
        <button onClick={safetyCheck} disabled={loading} className="inline-flex items-center px-3 py-2 rounded bg-gray-800 text-white hover:bg-gray-900">
          <Stethoscope className="w-4 h-4 mr-2" /> Safety Check
        </button>
        <label className="inline-flex items-center text-sm text-gray-700 ml-2">
          <input type="checkbox" className="mr-2" checked={autoMme} onChange={e => setAutoMme(e.target.checked)} />
          Auto-calc MME
        </label>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">MME Result</h3>
          {mmeResult ? (
            <div>
              <div className="text-2xl font-bold text-gray-900">{mmeResult.totalMME} MME/day</div>
              {/* Buprenorphine note */}
              {medications.some(m => /buprenorphine/i.test(m.name)) && (
                <div className="mt-1 text-[12px] text-gray-600">Note: Buprenorphine is excluded from MME.</div>
              )}
              {mmeResult.riskFlags?.length > 0 && (
                <ul className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                  {mmeResult.riskFlags.map((r: string, i: number) => (<li key={i}>• {r}</li>))}
                </ul>
              )}
              {mmeResult.recommendations?.length > 0 && (
                <ul className="mt-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">
                  {mmeResult.recommendations.map((r: string, i: number) => (<li key={i}>• {r}</li>))}
                </ul>
              )}
              <div className="mt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-1">Medication</th>
                      <th className="py-1">Route</th>
                      <th className="py-1 text-right">MME/day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mmeResult.perMedication?.map((d: any, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="py-1">{d.name}</td>
                        <td className="py-1">{d.route}</td>
                        <td className="py-1 text-right">{d.mmePerDay}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No calculation yet.</div>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Safety Findings</h3>
          {/* Legend */}
          <div className="mb-2 flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-red-200 border border-red-300 rounded"></span> Major risk</div>
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-amber-200 border border-amber-300 rounded"></span> Moderate risk</div>
          </div>
          {safetyResult ? (
            <div>
              {safetyResult.findings?.length ? (
                <ul className="space-y-2">
                  {safetyResult.findings.map((f: any, i: number) => (
                    <li key={i} className="border rounded p-2">
                      <div className="text-sm font-medium text-gray-900">
                        {f.issue}{' '}
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded ${f.severity === 'major' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{f.severity}</span>
                      </div>
                      {f.explanation && (
                        <div className="text-xs text-gray-600 mt-1">{f.explanation}</div>
                      )}
                      <div className="text-sm text-gray-700">{f.recommendation}</div>
                      {Array.isArray(f.references) && f.references.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {f.references.map((ref: any, ri: number) => (
                            <a key={ri} href={ref.url} target="_blank" rel="noreferrer" className="text-xs text-blue-700 hover:underline inline-flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> {ref.label || 'Reference'}
                            </a>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-500">No significant risks detected.</div>
              )}
              {safetyResult.recommendations?.length > 0 && (
                <ul className="mt-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">
                  {safetyResult.recommendations.map((r: string, i: number) => (<li key={i}>• {r}</li>))}
                </ul>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No safety screening yet.</div>
          )}
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500">
        For clinical decision support only; verify with current guidelines.
      </div>
    </div>
  );
}

// Drug autocomplete using RxNorm-backed API
function DrugAutocomplete({ apiBase, value, onChange, onSelect }: {
  apiBase: string;
  value: string;
  onChange: (v: string) => void;
  onSelect: (d: { name: string; rxcui: string }) => void;
}) {
  const [q, setQ] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Array<{ name: string; rxcui: string }>>([]);
  const timer = useRef<any>(null);
  const [offlineSuggestions, setOfflineSuggestions] = useState(false);

  useEffect(() => { setQ(value || ''); }, [value]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q || q.trim().length < 2) { setItems([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${apiBase}/drugs/suggestions?q=${encodeURIComponent(q)}&limit=8`);
        if (resp.ok) {
          const data = await resp.json();
          const list = (data.suggestions || [])
            .map((s: any) => ({ name: s.name, rxcui: s.rxcui }))
            .filter((d: any) => d.name);
          setOfflineSuggestions(!!data.offline);
          setItems(list);
          setOpen(true);
        } else {
          setItems([]);
          setOpen(false);
          setOfflineSuggestions(false);
        }
      } catch {
        setItems([]); setOpen(false);
        setOfflineSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer.current);
  }, [apiBase, q]);

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); onChange(e.target.value); }}
        onFocus={() => items.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="w-full border rounded px-2 py-1 text-sm"
        placeholder="e.g., oxycodone"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded shadow">
          {offlineSuggestions && (
            <div className="px-2 py-1 text-[11px] text-gray-600 bg-gray-50 border-b border-gray-100">Using offline suggestions (RxNorm unavailable)</div>
          )}
          {loading && <div className="p-2 text-xs text-gray-500">Searching…</div>}
          {!loading && items.length === 0 && <div className="p-2 text-xs text-gray-500">No matches</div>}
          {!loading && items.map((it, i) => (
            <button
              key={it.rxcui + i}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(it);
                setQ(it.name);
                setOpen(false);
              }}
              onClick={() => { onSelect(it); setQ(it.name); setOpen(false); }}
              className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100"
            >
              <div className="flex justify-between">
                <span>{it.name}</span>
                <span className="text-[11px] text-gray-500">{it.rxcui}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
