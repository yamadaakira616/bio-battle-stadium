import { useState, useEffect, useRef } from 'react';
import { DUPLICATE_COINS } from '../data/stickers.js';
import { GACHA_COST } from '../utils/gameLogic.js';
import { getLevelUpCost, MAX_CARD_LEVEL } from '../utils/battleEngine.js';

const KEY = 'sticker-book-v1';
const DEFAULT_STATE = {
  level: 1,
  coins: 100,
  collection: [],
  levelStars: {},
  totalStars: 0,
  bestCombo: 0,
  totalPlayed: 0,
  levelPlayCount: {},
  bookPages: [[], [], [], [], []],
  battleProgress: {
    conquered: [],
    teamIds: [],
  },
  cardLevels: {},
};

export function getLevelCoinMultiplier(playCount) {
  if (playCount === 0) return 1.0;
  if (playCount === 1) return 0.75;
  if (playCount === 2) return 0.5;
  return 0.3;
}

export function useGameState() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return DEFAULT_STATE;
      const parsed = JSON.parse(raw);
      const level = (typeof parsed.level === 'number' && parsed.level >= 1 && parsed.level <= 50)
        ? parsed.level : DEFAULT_STATE.level;
      const rawCoins = (typeof parsed.coins === 'number' && parsed.coins >= 0)
        ? parsed.coins : DEFAULT_STATE.coins;
      const coins = Math.max(rawCoins, 1500); // TEMP: 最低1500コイン保証
      const collection = Array.isArray(parsed.collection)
        ? parsed.collection : DEFAULT_STATE.collection;
      const bookPages = Array.isArray(parsed.bookPages) && parsed.bookPages.length === 5
        ? parsed.bookPages : DEFAULT_STATE.bookPages;
      return { ...DEFAULT_STATE, ...parsed, level, coins, collection, bookPages };
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

  function incLevelPlayCount(lvl) {
    setState(s => {
      const key = String(lvl);
      const prev = s.levelPlayCount?.[key] ?? 0;
      return {
        ...s,
        levelPlayCount: { ...(s.levelPlayCount || {}), [key]: prev + 1 },
        totalPlayed: s.totalPlayed + 1,
      };
    });
  }

  const pullGachaResultRef = useRef(null);

  function pullGacha(sticker) {
    pullGachaResultRef.current = null;
    setState(s => {
      const isNew = !s.collection.includes(sticker.id);
      if (isNew) {
        pullGachaResultRef.current = { isNew: true, coinBonus: 0 };
        return {
          ...s,
          coins: Math.max(0, s.coins - GACHA_COST),
          collection: [...s.collection, sticker.id],
        };
      } else {
        pullGachaResultRef.current = { isNew: false, coinBonus: DUPLICATE_COINS };
        return {
          ...s,
          coins: Math.max(0, s.coins - GACHA_COST) + DUPLICATE_COINS,
        };
      }
    });
    return pullGachaResultRef.current;
  }

  function updateBookPage(pageIndex, placed) {
    if (pageIndex < 0 || pageIndex >= 5) return;
    setState(s => {
      const newPages = [...s.bookPages];
      newPages[pageIndex] = placed;
      return { ...s, bookPages: newPages };
    });
  }

  function updateBattleProgress(nationId, teamIds) {
    setState(s => ({
      ...s,
      battleProgress: {
        conquered: (s.battleProgress?.conquered || []).includes(nationId)
          ? (s.battleProgress?.conquered || [])
          : [...(s.battleProgress?.conquered || []), nationId],
        teamIds,
      },
    }));
  }

  function addCardToCollection(cardId) {
    setState(s => {
      if (s.collection.includes(cardId)) return s;
      return { ...s, collection: [...s.collection, cardId] };
    });
  }

  function upgradeCard(cardId, series) {
    setState(s => {
      const currentLv = (s.cardLevels?.[cardId] || 1);
      if (currentLv >= MAX_CARD_LEVEL) return s;
      const cost = getLevelUpCost(series, currentLv);
      if (cost === null || s.coins < cost) return s;
      return {
        ...s,
        coins: s.coins - cost,
        cardLevels: { ...(s.cardLevels || {}), [cardId]: currentLv + 1 },
      };
    });
  }

  function saveBattleTeam(teamIds) {
    setState(s => ({
      ...s,
      battleProgress: {
        ...(s.battleProgress || { conquered: [] }),
        teamIds,
      },
    }));
  }

  return {
    state,
    addCoins,
    spendCoins,
    levelUp,
    saveStars,
    updateBestCombo,
    incLevelPlayCount,
    pullGacha,
    updateBookPage,
    updateBattleProgress,
    saveBattleTeam,
    upgradeCard,
    addCardToCollection,
  };
}
