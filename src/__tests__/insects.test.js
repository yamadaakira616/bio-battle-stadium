import { describe, it, expect } from 'vitest';
import { INSECTS, DUPLICATE_COINS, rollGacha } from '../data/insects.js';

describe('INSECTS data integrity', () => {
  it('has exactly 39 insects', () => {
    expect(INSECTS.length).toBe(39);
  });

  it('all IDs are unique strings', () => {
    const ids = INSECTS.map(i => i.id);
    expect(new Set(ids).size).toBe(39);
    ids.forEach(id => expect(typeof id).toBe('string'));
  });

  it('all required fields are present and non-empty', () => {
    INSECTS.forEach(insect => {
      expect(insect.id, `${insect.id} missing id`).toBeTruthy();
      expect(insect.name, `${insect.id} missing name`).toBeTruthy();
      expect(insect.nameEn, `${insect.id} missing nameEn`).toBeTruthy();
      expect(insect.origin, `${insect.id} missing origin`).toBeTruthy();
      expect(insect.length, `${insect.id} missing length`).toBeTruthy();
      expect(insect.description, `${insect.id} missing description`).toBeTruthy();
      expect(insect.bgColor, `${insect.id} missing bgColor`).toBeTruthy();
    });
  });

  it('all rarities are valid', () => {
    const valid = new Set(['common', 'rare', 'superRare', 'ultra']);
    INSECTS.forEach(i => expect(valid.has(i.rarity), `${i.id} invalid rarity: ${i.rarity}`).toBe(true));
  });

  it('rarity counts: ultra=3, superRare=9, rare=15, common=12', () => {
    const count = r => INSECTS.filter(i => i.rarity === r).length;
    expect(count('ultra')).toBe(3);
    expect(count('superRare')).toBe(9);
    expect(count('rare')).toBe(15);
    expect(count('common')).toBe(12);
  });

  it('world values are 1, 2, or 3', () => {
    INSECTS.forEach(i => expect([1,2,3]).toContain(i.world));
  });

  it('DUPLICATE_COINS is 30', () => {
    expect(DUPLICATE_COINS).toBe(30);
  });
});

describe('rollGacha', () => {
  it('returns an insect from INSECTS', () => {
    const result = rollGacha();
    expect(INSECTS.find(i => i.id === result.id)).toBeTruthy();
  });

  it('always returns an object with rarity field', () => {
    for (let i = 0; i < 20; i++) {
      const r = rollGacha();
      expect(r.rarity).toBeTruthy();
    }
  });

  it('approximate distribution: ultra ~3%, common ~60% over 10000 rolls', () => {
    const counts = { ultra: 0, superRare: 0, rare: 0, common: 0 };
    for (let i = 0; i < 10000; i++) counts[rollGacha().rarity]++;
    expect(counts.ultra / 100).toBeCloseTo(3, 0);
    expect(counts.common / 100).toBeCloseTo(60, 0);
  });
});
