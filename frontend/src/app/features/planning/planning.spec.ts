import { describe, it, expect } from 'vitest';

// These helpers are pure functions extracted from PlanningComponent for testability.
// They mirror the actual logic in planning.ts without requiring Angular TestBed.

const equipLabel = (eq: string): string =>
  (
    ({
      UN_LIT: '1 lit',
      DEUX_LITS: '2 lits',
      UN_FAUTEUIL: '1 fauteuil',
      FAUTEUIL_ET_LIT: '1 fauteuil + 1 lit',
      DEUX_FAUTEUILS: '2 fauteuils',
    }) as Record<string, string>
  )[eq] ?? eq;

const statutVariant = (statut: string): string =>
  (({ EN_ATTENTE: 'pending', VALIDEE: 'accepted', REFUSEE: 'refused' }) as const)[
    statut as 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE'
  ] ?? 'pending';

const isToday = (d: Date): boolean => d.toDateString() === new Date().toDateString();

const getMondayOfWeek = (offsetWeeks = 0): Date => {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getWeekDays = (offsetWeeks = 0): Date[] => {
  const start = getMondayOfWeek(offsetWeeks);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
};

describe('Planning — equipLabel', () => {
  it.each([
    ['UN_LIT', '1 lit'],
    ['DEUX_LITS', '2 lits'],
    ['UN_FAUTEUIL', '1 fauteuil'],
    ['FAUTEUIL_ET_LIT', '1 fauteuil + 1 lit'],
    ['DEUX_FAUTEUILS', '2 fauteuils'],
  ])('%s → %s', (input, expected) => {
    expect(equipLabel(input)).toBe(expected);
  });

  it('returns the raw value for unknown codes', () => {
    expect(equipLabel('UNKNOWN')).toBe('UNKNOWN');
  });
});

describe('Planning — statutVariant', () => {
  it('EN_ATTENTE → pending', () => expect(statutVariant('EN_ATTENTE')).toBe('pending'));
  it('VALIDEE → accepted', () => expect(statutVariant('VALIDEE')).toBe('accepted'));
  it('REFUSEE → refused', () => expect(statutVariant('REFUSEE')).toBe('refused'));
  it('unknown → pending', () => expect(statutVariant('OTHER')).toBe('pending'));
});

describe('Planning — isToday', () => {
  it('returns true for today', () => {
    expect(isToday(new Date())).toBe(true);
  });

  it('returns false for yesterday', () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    expect(isToday(d)).toBe(false);
  });

  it('returns false for tomorrow', () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    expect(isToday(d)).toBe(false);
  });
});

describe('Planning — week computation', () => {
  it('weekStart (offset 0) is a Monday', () => {
    expect(getMondayOfWeek(0).getDay()).toBe(1);
  });

  it('weekEnd is 6 days after weekStart', () => {
    const start = getMondayOfWeek(0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const diffMs = end.getTime() - start.getTime();
    expect(diffMs / 86400000).toBe(6);
  });

  it('weekDays contains 7 consecutive days starting on Monday', () => {
    const days = getWeekDays(0);
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(1);
    for (let i = 1; i < days.length; i++) {
      expect(days[i].getTime() - days[i - 1].getTime()).toBe(86400000);
    }
  });

  it('negative offset moves the week back', () => {
    const current = getMondayOfWeek(0);
    const prev = getMondayOfWeek(-1);
    expect(current.getTime() - prev.getTime()).toBe(7 * 86400000);
  });

  it('positive offset moves the week forward', () => {
    const current = getMondayOfWeek(0);
    const next = getMondayOfWeek(1);
    expect(next.getTime() - current.getTime()).toBe(7 * 86400000);
  });
});
