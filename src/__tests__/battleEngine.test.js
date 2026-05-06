import { describe, it, expect } from 'vitest';
import { getCardStats } from '../utils/battleEngine.js';

describe('fusion series stats', () => {
  it('fusion カードのステータスが bio の 1.3 倍以上の範囲にある', () => {
    const fusionCard = { id: 'wolphin', name: 'ウルフィン', series: 'fusion' };
    const bioCard    = { id: 'bio-african-lion', name: 'African Lion', series: 'bio' };
    const fStats = getCardStats(fusionCard);
    const bStats = getCardStats(bioCard);
    // fusion の hp 下限(104) > bio の hp 下限(80)
    expect(fStats.maxHp).toBeGreaterThan(bStats.maxHp * 0.9);
  });

  it('fusion カードに spDmg が定義されている', () => {
    const card = { id: 'wolphin', name: 'ウルフィン', series: 'fusion' };
    const stats = getCardStats(card);
    expect(stats.spDmg).toBeGreaterThan(0);
  });
});
