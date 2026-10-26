import { transactionVisibilityWhere } from './transaction-visibility.js';

describe('transactionVisibilityWhere', () => {
  it('le contexte personnel ne renvoie que les transactions personnelles du propriétaire', () => {
    expect(transactionVisibilityWhere({ kind: 'personal', userId: 'user-a' })).toEqual({
      scope: 'PERSONAL',
      ownerId: 'user-a',
    });
  });

  it('le contexte foyer exclut toute transaction personnelle des membres', () => {
    const where = transactionVisibilityWhere({ kind: 'household', householdId: 'household-a' });
    expect(where).toEqual({ scope: 'HOUSEHOLD', householdId: 'household-a' });
    expect(where).not.toHaveProperty('ownerId');
  });
});
