import React from 'react';
import Modal from '../UI/Modal';
import Card from '../UI/Card';
import { usePatient } from '../../context/PatientContext';
import { PatientProfile } from '../../types';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose }) => {
  const { actions } = usePatient();
  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    sex: 'other',
    mrn: '',
    heightCm: '',
    weightKg: '',
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    const profile: PatientProfile = {
      id: crypto.randomUUID(),
      demographics: {
        firstName: form.firstName || 'Patient',
        lastName: form.lastName || 'User',
        dateOfBirth: form.dateOfBirth || '1980-01-01',
        sex: form.sex as any,
        mrn: form.mrn || undefined,
        heightCm: parseFloat(form.heightCm) || 170,
        weightKg: parseFloat(form.weightKg) || 70,
      } as any,
      allergies: [],
      medications: [],
      conditions: [],
      labValues: [],
      genetics: [],
      vitals: [],
      treatmentHistory: [],
      appointments: [],
      sideEffectReports: [],
      notes: [],
      preferences: {},
      lastUpdated: new Date().toISOString(),
      createdBy: 'self',
      isActive: true,
    } as any;
    actions.setCurrentPatient(profile);
    try { localStorage.setItem('osrx_onboarding_done', '1'); } catch {}
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome – Let’s set up your profile" size="lg">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input className="w-full border rounded px-3 py-2" value={form.firstName} onChange={e => update('firstName', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input className="w-full border rounded px-3 py-2" value={form.lastName} onChange={e => update('lastName', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
            <select className="w-full border rounded px-3 py-2" value={form.sex} onChange={e => update('sex', e.target.value)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MRN (optional)</label>
            <input className="w-full border rounded px-3 py-2" value={form.mrn} onChange={e => update('mrn', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <input className="w-full border rounded px-3 py-2" value={form.heightCm} onChange={e => update('heightCm', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input className="w-full border rounded px-3 py-2" value={form.weightKg} onChange={e => update('weightKg', e.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Skip</button>
          <button onClick={submit} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
        </div>
      </Card>
    </Modal>
  );
};

export default OnboardingWizard;

