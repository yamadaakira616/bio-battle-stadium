import { describe, it, expect } from 'vitest';
import { STICKERS, SERIES, rollGacha, DUPLICATE_COINS } from '../data/stickers.js';

describe('STICKERS', () => {
  it('156種類のシールがある', () => {
    expect(STICKERS).toHaveLength(156);
  });

  it('すべてのシールにid・name・series・imagePathがある', () => {
    for (const s of STICKERS) {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(typeof s.series).toBe('string');
      expect(s.imagePath).toBeTruthy();
    }
  });

  it('IDが重複していない', () => {
    const ids = STICKERS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('シリーズ別の枚数が正しい', () => {
    expect(STICKERS.filter(s => s.series === 'bio').length).toBe(44);
    expect(STICKERS.filter(s => s.series === 'arms').length).toBe(32);
    expect(STICKERS.filter(s => s.series === 'armbio').length).toBe(24);
    expect(STICKERS.filter(s => s.series === 'corps').length).toBe(24);
    expect(STICKERS.filter(s => s.series === 'catsle').length).toBe(12);
    expect(STICKERS.filter(s => s.series === 'legendary-bio').length).toBe(4);
    expect(STICKERS.filter(s => s.series === 'legendary-arms').length).toBe(4);
    expect(STICKERS.filter(s => s.series === 'legendary-armbio').length).toBe(4);
    expect(STICKERS.filter(s => s.series === 'legendary-corps').length).toBe(4);
    expect(STICKERS.filter(s => s.series === 'legendary-catsle').length).toBe(4);
  });
});

describe('rollGacha', () => {
  it('返り値はSTICKERSのいずれかである', () => {
    const result = rollGacha();
    expect(STICKERS).toContainEqual(result);
  });

  it('1000回試行して通常5シリーズがすべて出る', () => {
    const seen = new Set();
    for (let i = 0; i < 1000; i++) seen.add(rollGacha().series);
    // 通常シリーズ（bio/arms/armbio/corps/catsle）はすべて出る
    expect(seen.has('bio')).toBe(true);
    expect(seen.has('arms')).toBe(true);
    expect(seen.has('armbio')).toBe(true);
    expect(seen.has('corps')).toBe(true);
    expect(seen.has('catsle')).toBe(true);
    // Legendary（1%）も含め、合計6種以上のシリーズが出る
    expect(seen.size).toBeGreaterThanOrEqual(6);
  });
});
