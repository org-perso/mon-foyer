/**
 * Les transactions portent une date calendaire (`occurredOn`, type DATE),
 * saisie dans le fuseau du foyer. Un mois « AAAA-MM » correspond donc à
 * l'intervalle [1er du mois, 1er du mois suivant[ sans conversion horaire.
 * Le fuseau n'intervient que pour déterminer la date ou le mois « courant ».
 */

const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export interface MonthRange {
  /** Inclusif, minuit UTC du premier jour */
  start: Date;
  /** Exclusif, minuit UTC du premier jour du mois suivant */
  end: Date;
}

export function isValidMonth(month: string): boolean {
  return MONTH_PATTERN.test(month);
}

export function monthRange(month: string): MonthRange {
  const match = MONTH_PATTERN.exec(month);
  if (!match) {
    throw new RangeError(`Mois invalide : ${month} (format attendu AAAA-MM)`);
  }
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  return {
    start: new Date(Date.UTC(year, monthIndex, 1)),
    end: new Date(Date.UTC(year, monthIndex + 1, 1)),
  };
}

/** Date du jour (AAAA-MM-JJ) dans le fuseau donné. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  // en-CA formate en AAAA-MM-JJ
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Mois courant (AAAA-MM) dans le fuseau donné. */
export function currentMonthIn(timeZone: string, now: Date = new Date()): string {
  return todayIn(timeZone, now).slice(0, 7);
}
