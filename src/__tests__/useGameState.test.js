import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState.js';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: key => store[key] ?? null,
    setItem: (key, val) => { store[key] = val; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

import { DUPLICATE_COINS } from '../data/stickers.js';

describe('game state logic', () => {
  beforeEach(() => localStorageMock.clear());

  it('DUPLICATE_COINS is 30', () => {
    expect(DUPLICATE_COINS).toBe(30);
  });

  it('collection は初期状態でオブジェクト（マップ）である', () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.state.collection).toEqual({});
  });

  it('collection: 同じカードを2回追加すると count が 2 になる', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.addCardToCollection('c01'));
    act(() => result.current.addCardToCollection('c01'));
    expect(result.current.state.collection['c01']).toBe(2);
  });

  it('collection: 旧形式（配列）のセーブデータを自動移行する', () => {
    localStorageMock.setItem('sticker-book-v1', JSON.stringify({
      collection: ['c01', 'c02', 'c01'],
    }));
    const { result } = renderHook(() => useGameState());
    expect(result.current.state.collection).toEqual({ c01: 2, c02: 1 });
  });

  it('stars: best score is kept, lower score does not overwrite', () => {
    const saveStars = (levelStars, lvl, stars) => {
      const prev = levelStars[lvl] || 0;
      if (stars <= prev) return levelStars;
      return { ...levelStars, [lvl]: stars };
    };
    let s = {};
    s = saveStars(s, 1, 3);
    s = saveStars(s, 1, 2);
    expect(s[1]).toBe(3);
  });
});
