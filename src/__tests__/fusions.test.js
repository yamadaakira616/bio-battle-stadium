import { describe, it, expect } from 'vitest';
import { FUSIONS } from '../data/fusions.js';

describe('FUSIONS', () => {
  it('24体の融合キャラがある', () => {
    expect(FUSIONS).toHaveLength(24);
  });

  it('IDが重複していない', () => {
    const ids = FUSIONS.map(f => f.id);
    expect(new Set(ids).size).toBe(24);
  });

  it('すべてのキャラに必須フィールドがある', () => {
    for (const f of FUSIONS) {
      expect(f.id,        `${f.id}: id missing`).toBeTruthy();
      expect(f.name,      `${f.id}: name missing`).toBeTruthy();
      expect(f.nameEn,    `${f.id}: nameEn missing`).toBeTruthy();
      expect(f.imagePath, `${f.id}: imagePath missing`).toBeTruthy();
      expect(f.series).toBe('fusion');
    }
  });
});
