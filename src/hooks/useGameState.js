import { useState, useEffect } from 'react';
import { DUPLICATE_COINS } from '../data/insects.js';
import { GACHA_COST } from '../utils/gameLogic.js';

const KEY = 'insect-flash-v1';
const DEFAULT_STATE = {
  level: 1,
  coins: 50,
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
      return s ? { ...DEFAULT_STATE, ...JSON.parse(s) } : DEFAULT_STATE;
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
      const prev = s.levelStars[lvl] || 0;
      if (stars <= prev) return s;
      const newStars = { ...s.levelStars, [lvl]: stars };
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

  function pullGacha(insect) {
    const isNew = !state.collection.includes(insect.id);
    if (isNew) {
      setState(s => ({
        ...s,
        coins: Math.max(0, s.coins - GACHA_COST),
        collection: [...s.collection, insect.id],
      }));
      return { isNew: true, coinBonus: 0 };
    } else {
      setState(s => ({
        ...s,
        coins: Math.max(0, s.coins - GACHA_COST) + DUPLICATE_COINS,
      }));
      return { isNew: false, coinBonus: DUPLICATE_COINS };
    }
  }

  return { state, addCoins, spendCoins, levelUp, saveStars, updateBestCombo, incTotalPlayed, pullGacha };
}
