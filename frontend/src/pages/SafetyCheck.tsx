import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Info, Link2, LogOut, RefreshCw, ShieldAlert, X } from 'lucide-react';
import Card from '../components/UI/Card';
import {
  ApiError, endSmartSession, getSmartContext, getSmartPatient, listRegimens, recordOverride, runSafetyCheck,
  type AdjustResponse, type Finding, type Regimen, type SmartContext, type SmartPatient,
} from '../services/safetyCheckService';
import {
  ACTION_LABEL, EMPTY_FORM, NUMERIC_FIELDS, OVERRIDE_REASONS, PHENOTYPE_OPTIONS, SEVERITY_LABEL, ageLabel, buildRequest,
  ehrFields, formFromSmart, groupFindings, overrideBody, type FieldError, type FormState,
} from '../utils/safetyCheck';

type Feedback = { state: 'saving' } | { state: 'recorded'; label: string } | { state: 'error'; message: string };

const SEVERITY_STYLE: Record<string, string> = {
  critical: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40',
  high: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40',
  moderate: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30',
  low: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40',
};
const BADGE_STYLE: Record<string, string> = {
  critical: 'bg-red-600 text-white', high: 'bg-amber-600 text-white', moderate: 'bg-blue-600 text-white', low: 'bg-gray-600 text-white',
};

const inputCls = 'w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500';

function EhrChip({ text }: { text: string }) {
  return <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">{text}</span>;
}

function FindingCard({ f, feedback, onAccept, onOverride }: {
  f: Finding; feedback?: Feedback; onAccept: () => void; onOverride: (reasonCode: string, reasonText: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [text, setText] = useState('');
  const needsText = code === 'other';
  const canSubmit = !!code && (!needsText || text.trim().length >= 3);
  const done = feedback?.state === 'recorded';
  return (
    <li className={`rounded-lg border p-4 ${SEVERITY_STYLE[f.severity]}`} data-testid={`finding-${f.ruleId}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${BADGE_STYLE[f.severity]}`}>{SEVERITY_LABEL[f.severity]}</span>
        <span className="rounded border border-gray-300 px-2 py-0.5 text-xs font-medium dark:border-gray-600">{ACTION_LABEL[f.action] || f.action}</span>
        {f.drugs.length > 0 && <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{f.drugs.join(' + ')}</span>}
        {f.ruleStatus !== 'reviewed' && <span className="ml-auto rounded bg-yellow-100 px-2 py-0.5 text-[11px] font-medium text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-200" title="This rule has not yet been signed off by a clinical reviewer">Draft rule</span>}
      </div>
      <p className="mt-2 text-sm text-gray-800 dark:text-gray-100">{f.message}</p>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Source: {f.source?.url ? <a className="underline" href={f.source.url} target="_blank" rel="noopener noreferrer">{f.source.label}</a> : f.source?.label || 'n/a'} · Rule {f.ruleId}{f.ruleVersion ? ` (v${f.ruleVersion})` : ''}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {done ? (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4" aria-hidden /> {feedback && feedback.state === 'recorded' ? feedback.label : ''}</span>
        ) : (
          <>
            <button type="button" className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-white dark:border-gray-600 dark:hover:bg-gray-800 disabled:opacity-50" disabled={feedback?.state === 'saving'} onClick={onAccept}>Acknowledge</button>
            <button type="button" className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-white dark:border-gray-600 dark:hover:bg-gray-800 disabled:opacity-50" disabled={feedback?.state === 'saving'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>Override…</button>
          </>
        )}
        {feedback?.state === 'error' && <span role="alert" className="text-sm text-red-700 dark:text-red-300">{feedback.message}</span>}
      </div>

      {open && !done && (
        <form className="mt-3 space-y-2 rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
          onSubmit={(e) => { e.preventDefault(); if (canSubmit) { onOverride(code, text); setOpen(false); } }}>
          <label className="block text-sm font-medium" htmlFor={`reason-${f.ruleId}`}>Reason for overriding</label>
          <select id={`reason-${f.ruleId}`} className={inputCls} value={code} onChange={(e) => setCode(e.target.value)} required>
            <option value="">Select a reason…</option>
            {OVERRIDE_REASONS.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
          </select>
          <label className="block text-sm font-medium" htmlFor={`text-${f.ruleId}`}>Comment{needsText ? ' (required)' : ' (optional)'}</label>
          <textarea id={`text-${f.ruleId}`} className={inputCls} rows={2} maxLength={500} value={text} onChange={(e) => setText(e.target.value)} />
          <p className="text-xs text-gray-500 dark:text-gray-400">Do not enter patient names, MRNs or dates of birth.</p>
          <button type="submit" disabled={!canSubmit} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">Record override</button>
        </form>
      )}
    </li>
  );
}

export default function SafetyCheck() {
  const [regimens, setRegimens] = useState<Regimen[]>([]);
  const [regimenId, setRegimenId] = useState('');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [meds, setMeds] = useState<string[]>([]);
  const [medInput, setMedInput] = useState('');
  const [smart, setSmart] = useState<{ ctx: SmartContext | null; patient: SmartPatient | null; loading: boolean; error: string | null }>({ ctx: null, patient: null, loading: true, error: null });
  const [fromEhr, setFromEhr] = useState<Set<keyof FormState>>(new Set());
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [result, setResult] = useState<AdjustResponse | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});

  const loadSmart = useCallback(async () => {
    setSmart((s) => ({ ...s, loading: true, error: null }));
    try {
      const ctx = await getSmartContext();
      if (!ctx.authenticated) { setSmart({ ctx, patient: null, loading: false, error: null }); return; }
      const patient = ctx.patient ? await getSmartPatient() : null;
      setSmart({ ctx, patient, loading: false, error: null });
      if (patient) {
        setForm((prev) => ({ ...formFromSmart(patient), DPYD: prev.DPYD, UGT1A1: prev.UGT1A1 }));
        setMeds(patient.dosingInputs.medications);
        setFromEhr(ehrFields(patient));
        setResult(null); setFeedback({});
      }
    } catch (e) {
      setSmart({ ctx: null, patient: null, loading: false, error: e instanceof Error ? e.message : 'Could not read the EHR session' });
    }
  }, []);

  useEffect(() => {
    listRegimens().then(setRegimens).catch(() => setRegimens([]));
    loadSmart();
  }, [loadSmart]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFromEhr((s) => { if (!s.has(k)) return s; const n = new Set(s); n.delete(k); return n; }); // edited: no longer "from EHR"
  };
  const fieldError = (k: keyof FormState) => errors.find((e) => e.field === k)?.message;

  const addMed = () => {
    const v = medInput.trim();
    if (v && !meds.some((m) => m.toLowerCase() === v.toLowerCase())) setMeds([...meds, v]);
    setMedInput('');
  };

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunError(null);
    if (!regimenId) { setRunError('Choose a regimen first.'); return; }
    const { body, errors: errs } = buildRequest(form, regimenId, medInput.trim() ? [...meds, medInput.trim()] : meds);
    setErrors(errs);
    if (!body) return;
    setRunning(true);
    try { setResult(await runSafetyCheck(body)); setFeedback({}); }
    catch (err) { setResult(null); setRunError(err instanceof Error ? err.message : 'The check could not be run.'); }
    finally { setRunning(false); }
  };

  const submitFeedback = async (f: Finding, action: 'accept' | 'override', code?: string, text?: string) => {
    setFeedback((m) => ({ ...m, [f.ruleId]: { state: 'saving' } }));
    try {
      await recordOverride(overrideBody(f, action, regimenId, code, text));
      const label = action === 'accept' ? 'Acknowledged' : `Overridden: ${OVERRIDE_REASONS.find((r) => r.code === code)?.label || code}`;
      setFeedback((m) => ({ ...m, [f.ruleId]: { state: 'recorded', label } }));
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      const message = status === 401 ? 'Sign in to record a response.' : status === 503 ? 'Response storage is unavailable; nothing was recorded.' : 'Could not record the response.';
      setFeedback((m) => ({ ...m, [f.ruleId]: { state: 'error', message } }));
    }
  };

  const grouped = useMemo(() => (result ? groupFindings(result.findings) : null), [result]);
  const launched = !!smart.ctx?.authenticated;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100"><ClipboardCheck className="h-6 w-6" aria-hidden /> Regimen safety check</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Checks a regimen and the patient&apos;s other medications against dose-adjustment rules, pharmacogenomics, QT and serotonin load. Missing data is reported, never assumed.</p>
      </header>

      <div role="note" className="flex gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>Rules and drug lists are <strong>drafts pending pharmacist/oncologist review</strong>. Verify every recommendation against current labeling and your institutional protocol.</span>
      </div>

      {/* EHR context */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center gap-3" aria-live="polite">
          <Link2 className="h-5 w-5 text-gray-500" aria-hidden />
          {smart.loading ? <span className="text-sm text-gray-500">Checking for an EHR session…</span>
            : launched ? (
              <>
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Launched from your EHR</span>
                {smart.ctx?.patient && <span className="text-sm text-gray-600 dark:text-gray-300">Patient in context · values below came from the EHR</span>}
                <span className="ml-auto flex gap-2">
                  <button type="button" onClick={loadSmart} className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600"><RefreshCw className="h-3.5 w-3.5" aria-hidden /> Reload from EHR</button>
                  <button type="button" onClick={async () => { await endSmartSession(); setSmart({ ctx: { authenticated: false }, patient: null, loading: false, error: null }); setFromEhr(new Set()); }} className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600"><LogOut className="h-3.5 w-3.5" aria-hidden /> End EHR session</button>
                </span>
              </>
            ) : <span className="text-sm text-gray-600 dark:text-gray-300">Not launched from an EHR. Enter values manually, or open OncoSafeRx from your EHR to load them.</span>}
        </div>
        {smart.error && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{smart.error}</p>}
        {smart.patient && (smart.patient.notes.length > 0 || smart.patient.unconverted.length > 0 || smart.patient.medicationsUnresolved > 0) && (
          <ul className="mt-3 space-y-1 text-sm text-amber-800 dark:text-amber-200">
            {smart.patient.notes.map((n) => <li key={n} className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{n}</li>)}
            {smart.patient.unconverted.map((u) => <li key={u.field} className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{u.field}: not used ({u.reason}).</li>)}
          </ul>
        )}
      </Card>

      <form onSubmit={run} className="space-y-6" noValidate>
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Regimen</h2>
          <label htmlFor="regimen" className="mb-1 block text-sm font-medium">Regimen</label>
          <select id="regimen" className={inputCls} value={regimenId} onChange={(e) => setRegimenId(e.target.value)}>
            <option value="">Select a regimen…</option>
            {regimens.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.indication}</option>)}
          </select>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold">Patient and results</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="sex" className="mb-1 block text-sm font-medium">Sex{fromEhr.has('sex') && <EhrChip text="EHR" />}</label>
              <select id="sex" className={inputCls} value={form.sex} onChange={set('sex')}>
                <option value="">Not specified</option><option value="female">Female</option><option value="male">Male</option>
              </select>
            </div>
            {NUMERIC_FIELDS.map((f) => {
              const prov = smart.patient?.provenance[f.provenanceKey || ''];
              const err = fieldError(f.key);
              return (
                <div key={f.key}>
                  <label htmlFor={f.key} className="mb-1 block text-sm font-medium">
                    {f.label} <span className="font-normal text-gray-500">({f.unit})</span>
                    {fromEhr.has(f.key) && <EhrChip text={prov ? `EHR · ${ageLabel(prov.ageDays)}` : 'EHR'} />}
                  </label>
                  <input id={f.key} type="number" inputMode="decimal" step={f.step} min={f.min} max={f.max} className={inputCls} value={form[f.key]} onChange={set(f.key)} aria-invalid={!!err} aria-describedby={err ? `${f.key}-err` : undefined} />
                  {err && <p id={`${f.key}-err`} role="alert" className="mt-1 text-xs text-red-700 dark:text-red-300">{err}</p>}
                  {!form[f.key] && smart.patient?.staleFields.includes(f.provenanceKey || '') && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">EHR value too old to use; enter a current one.</p>}
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 text-lg font-semibold">Pharmacogenomics</h2>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">Leave blank if not tested; the check will flag the missing result.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {(['DPYD', 'UGT1A1'] as const).map((g) => (
              <div key={g}>
                <label htmlFor={g} className="mb-1 block text-sm font-medium">{g} phenotype</label>
                <select id={g} className={inputCls} value={form[g]} onChange={set(g)}>
                  {PHENOTYPE_OPTIONS.map((o) => <option key={o} value={o}>{o || 'Not tested / unknown'}</option>)}
                </select>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 text-lg font-semibold">Other current medications</h2>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">Used for QT, serotonin and interaction screening. Include supportive care (antiemetics, antidepressants, antibiotics).</p>
          <div className="flex gap-2">
            <label htmlFor="med-input" className="sr-only">Add a medication</label>
            <input id="med-input" className={inputCls} value={medInput} placeholder="e.g. ondansetron" onChange={(e) => setMedInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMed(); } }} />
            <button type="button" onClick={addMed} className="rounded-md border border-gray-300 px-3 text-sm dark:border-gray-600">Add</button>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Medications">
            {meds.map((m) => (
              <li key={m} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-700">
                {m}
                <button type="button" aria-label={`Remove ${m}`} onClick={() => setMeds(meds.filter((x) => x !== m))}><X className="h-3.5 w-3.5" aria-hidden /></button>
              </li>
            ))}
            {meds.length === 0 && <li className="text-sm text-gray-500">None added.</li>}
          </ul>
          {smart.patient && smart.patient.medicationsUnresolved > 0 && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{smart.patient.medicationsUnresolved} EHR order(s) reference a separate medication record and were not loaded; add them manually.</p>}
        </Card>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={running} className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{running ? 'Checking…' : 'Run safety check'}</button>
          {runError && <span role="alert" className="text-sm text-red-700 dark:text-red-300">{runError}</span>}
        </div>
      </form>

      <section aria-live="polite" aria-label="Results">
        {result && grouped && (
          <div className="space-y-6">
            <Card>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                <h2 className="text-lg font-semibold">{result.regimen.name}</h2>
                <span className="text-sm text-gray-600 dark:text-gray-300">BSA: {result.calculators.BSA ? `${result.calculators.BSA.toFixed(2)} m²` : 'not calculated'}</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">CrCl: {result.calculators.CrCl ? `${Math.round(result.calculators.CrCl)} mL/min` : 'not calculated'}</span>
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium" data-testid="summary">
                {grouped.total === 0 ? <><CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden /> No rule fired.</> : <><ShieldAlert className="h-4 w-4 text-red-600" aria-hidden /> {grouped.total} finding{grouped.total === 1 ? '' : 's'}</>}
                {grouped.gaps.length > 0 && <span className="font-normal text-gray-600 dark:text-gray-300">· {grouped.gaps.length} check(s) could not be performed (see below)</span>}
              </p>
              {grouped.total === 0 && <p className="mt-1 text-xs text-gray-500">&ldquo;No rule fired&rdquo; does not mean the regimen is safe: only checks with the data you provided were run.</p>}
            </Card>

            {grouped.bySeverity.map((g) => (
              <div key={g.severity}>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">{SEVERITY_LABEL[g.severity]}</h3>
                <ul className="space-y-3">
                  {g.items.map((f) => (
                    <FindingCard key={f.ruleId} f={f} feedback={feedback[f.ruleId]}
                      onAccept={() => submitFeedback(f, 'accept')} onOverride={(c, t) => submitFeedback(f, 'override', c, t)} />
                  ))}
                </ul>
              </div>
            ))}

            {grouped.gaps.length > 0 && (
              <Card>
                <h3 className="mb-2 text-base font-semibold">Checks not performed (missing data)</h3>
                <ul className="space-y-2 text-sm">
                  {grouped.gaps.map((f) => <li key={f.ruleId} className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden /><span>{f.message}</span></li>)}
                </ul>
              </Card>
            )}

            {result.interactionScreens && (result.interactionScreens.qtDrugs.length > 0 || result.interactionScreens.serotonergicDrugs.length > 0) && (
              <Card>
                <h3 className="mb-2 text-base font-semibold">What was screened</h3>
                <dl className="space-y-1 text-sm">
                  {result.interactionScreens.qtDrugs.length > 0 && <div><dt className="inline font-medium">QT-relevant: </dt><dd className="inline">{result.interactionScreens.qtDrugs.map((d) => `${d.name} (${d.tier})`).join(', ')}{result.interactionScreens.qtRiskFactors.length ? ` · risk factors: ${result.interactionScreens.qtRiskFactors.join(', ')}` : ''}</dd></div>}
                  {result.interactionScreens.serotonergicDrugs.length > 0 && <div><dt className="inline font-medium">Serotonergic: </dt><dd className="inline">{result.interactionScreens.serotonergicDrugs.map((d) => `${d.name} (${d.tier})`).join(', ')}</dd></div>}
                </dl>
              </Card>
            )}

            <Card>
              <h3 className="mb-1 text-base font-semibold">Standard doses (not adjusted for the findings above)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b text-xs uppercase text-gray-500"><th className="py-1 pr-4">Drug</th><th className="py-1 pr-4">Listed dose</th><th className="py-1 pr-4">Calculated</th><th className="py-1">Note</th></tr></thead>
                  <tbody>
                    {result.calculatedDoses.map((d) => (
                      <tr key={d.component} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-1 pr-4 font-medium">{d.component}</td><td className="py-1 pr-4">{d.dose}</td>
                        <td className="py-1 pr-4">{d.roundedMg !== undefined ? `${d.roundedMg} mg${d.cappedMg !== undefined ? ' (capped)' : ''}` : '—'}</td>
                        <td className="py-1 text-xs text-gray-500">{d.note || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </section>

    </div>
  );
}
