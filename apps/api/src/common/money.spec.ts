import { Decimal, formatAmount, parseAmount, sumAmounts } from './money.js';

describe('money', () => {
  it('additionne sans erreur de virgule flottante', () => {
    const total = sumAmounts([new Decimal('0.1'), new Decimal('0.2')]);
    expect(total.toString()).toBe('0.3');
  });

  it("refuse les décimales pour l'ariary", () => {
    expect(() => parseAmount('1500.5', 'MGA')).toThrow(RangeError);
    expect(parseAmount('1500', 'MGA').toString()).toBe('1500');
  });

  it('accepte deux décimales en euros', () => {
    expect(formatAmount(parseAmount('12.5', 'EUR'), 'EUR')).toBe('12.50');
  });

  it('refuse les montants nuls ou négatifs', () => {
    expect(() => parseAmount('0', 'MGA')).toThrow(RangeError);
    expect(() => parseAmount('-10', 'MGA')).toThrow(RangeError);
  });
});
