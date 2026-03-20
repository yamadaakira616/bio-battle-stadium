import { useState, useEffect, useRef } from 'react';
import { DUPLICATE_COINS } from '../data/insects.js';
import { GACHA_COST } from '../utils/gameLogic.js';

const KEY = 'insect-flash-v1';
const DEFAULT_STATE = {
  level: 1,
  coins: 100,
  collection: [],
  levelStars: {},
  totalStars: 0,
  bestCombo: 0,
  totalPlayed: 0,
};

export function useGameState() {
  const [state, setState] = useState(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (!s) return DEFAULT_STATE;
      const parsed = JSON.parse(s);
      // BUG-12: validate loaded state
      const level = (typeof parsed.level === 'number' && parsed.level >= 1 && parsed.level <= 50)
        ? parsed.level : DEFAULT_STATE.level;
      const coins = (typeof parsed.coins === 'number' && parsed.coins >= 0)
        ? parsed.coins : DEFAULT_STATE.coins;
      const collection = Array.isArray(parsed.collection)
        ? parsed.collection : DEFAULT_STATE.collection;
      return { ...DEFAULT_STATE, ...parsed, level, coins, collection };
    } catch { return DEFAULT_STATE; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  function addCoins(n) {
    setState(s => ({ ...s, coins: s.coins + n }));
  }

  function spendCoins(n) {
    setState(s => ({ ...s, coins: Math.max(0, s.coins - n) }));
  }

  function levelUp() {
    setState(s => ({ ...s, level: Math.min(s.level + 1, 50) }));
  }

  function saveStars(lvl, stars) {
    setState(s => {
      // BUG-06: normalize key to string
      const key = String(lvl);
      const prev = s.levelStars[key] || 0;
      if (stars <= prev) return s;
      const newStars = { ...s.levelStars, [key]: stars };
      const total = Object.values(newStars).reduce((a, b) => a + b, 0);
      return { ...s, levelStars: newStars, totalStars: total };
    });
  }

  function updateBestCombo(combo) {
    setState(s => ({ ...s, bestCombo: Math.max(s.bestCombo, combo) }));
  }

  function incTotalPlayed() {
    setState(s => ({ ...s, totalPlayed: s.totalPlayed + 1 }));
  }

  // BUG-01: use a ref to communicate isNew out of the functional updater
  const pullGachaResultRef = useRef(null);

  function pullGacha(insect) {
    pullGachaResultRef.current = null;
    setState(s => {
      const isNew = !s.collection.includes(insect.id);
      if (isNew) {
        pullGachaResultRef.current = { isNew: true, coinBonus: 0 };
        return {
          ...s,
          coins: Math.max(0, s.coins - GACHA_COST),
          collection: [...s.collection, insect.id],
        };
      } else {
        pullGachaResultRef.current = { isNew: false, coinBonus: DUPLICATE_COINS };
        return {
          ...s,
          coins: Math.max(0, s.coins - GACHA_COST) + DUPLICATE_COINS,
        };
      }
    });
    // Return result synchronously; ref is set during the updater call above
    return pullGachaResultRef.current;
  }

  return { state, addCoins, spendCoins, levelUp, saveStars, updateBestCombo, incTotalPlayed, pullGacha };
}
