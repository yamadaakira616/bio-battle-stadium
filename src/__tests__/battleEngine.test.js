import { describe, it, expect } from 'vitest';
import { getCardStats } from '../utils/battleEngine.js';

describe('fusion series stats', () => {
  it('fusion カードのステータスが bio の 1.3 倍以上の HP を持つ', () => {
    const fusionCard = { id: 'wolphin', name: 'ウルフィン', series: 'fusion' };
    const bioCard    = { id: 'bio-african-lion', name: 'African Lion', series: 'bio' };
    const fStats = getCardStats(fusionCard);
    const bStats = getCardStats(bioCard);
    expect(fStats.maxHp).toBeGreaterThanOrEqual(bStats.maxHp * 1.3);
  });

  it('fusion カードの spDmg が atk × 2.0 になっている', () => {
    const card = { id: 'wolphin', name: 'ウルフィン', series: 'fusion' };
    const stats = getCardStats(card);
    expect(stats.spDmg).toBe(Math.round(stats.atk * 2.0));
  });
});
