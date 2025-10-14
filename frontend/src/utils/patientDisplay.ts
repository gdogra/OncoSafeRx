export type DisplayPatient = {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  sex?: string;
  conditions?: any[];
};

export function getDisplayPatient(currentPatient: any, user: any): DisplayPatient | null {
  if (currentPatient?.demographics) {
    return {
      firstName: currentPatient.demographics.firstName || '',
      lastName: currentPatient.demographics.lastName || '',
      dateOfBirth: currentPatient.demographics.dateOfBirth,
      sex: currentPatient.demographics.sex || currentPatient?.gender,
      conditions: Array.isArray(currentPatient?.conditions) ? currentPatient.conditions : [],
    };
  }
  if (user) {
    return {
      firstName: user.firstName || user.user_metadata?.first_name || '',
      lastName: user.lastName || user.user_metadata?.last_name || '',
      dateOfBirth: undefined,
      sex: user.gender || user.sex,
      conditions: [],
    };
  }
  return null;
}

export function calculateAgeFromDOB(dob?: string): number | undefined {
  try {
    if (!dob) return undefined;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  } catch {
    return undefined;
  }
}

export function getConditionNames(conditions: any[] | undefined, limit = 2): string[] {
  const list = Array.isArray(conditions) ? conditions : [];
  return list
    .map((c: any) => (typeof c === 'object' ? (c.name || c.primary || c.condition || '').trim() : ''))
    .filter((s: string) => !!s)
    .slice(0, limit);
}

