import { currentMonthIn, monthRange, todayIn } from './month.js';

describe('month', () => {
  it('borne un mois en [début, début du mois suivant[', () => {
    const { start, end } = monthRange('2026-02');
    expect(start.toISOString()).toBe('2026-02-01T00:00:00.000Z');
    expect(end.toISOString()).toBe('2026-03-01T00:00:00.000Z');
  });

  it('gère le passage à l’année suivante', () => {
    expect(monthRange('2026-12').end.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('refuse un format invalide', () => {
    expect(() => monthRange('2026-13')).toThrow(RangeError);
    expect(() => monthRange('2026-1')).toThrow(RangeError);
  });

  it('calcule le mois courant dans le fuseau du foyer, pas en UTC', () => {
    // 31 octobre 22:30 UTC = 1er novembre 01:30 à Antananarivo (UTC+3)
    const now = new Date('2026-10-31T22:30:00Z');
    expect(currentMonthIn('UTC', now)).toBe('2026-10');
    expect(currentMonthIn('Indian/Antananarivo', now)).toBe('2026-11');
    expect(todayIn('Indian/Antananarivo', now)).toBe('2026-11-01');
  });
});
