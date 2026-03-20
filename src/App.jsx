import { useState } from 'react';
import { useGameState } from './hooks/useGameState.js';
import HomeScreen from './screens/HomeScreen.jsx';
import LevelSelectScreen from './screens/LevelSelectScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import GachaScreen from './screens/GachaScreen.jsx';
import EncyclopediaScreen from './screens/EncyclopediaScreen.jsx';

const SCREEN = {
  HOME: 'HOME',
  LEVEL_SELECT: 'LEVEL_SELECT',
  GAME: 'GAME',
  GACHA: 'GACHA',
  ENCYCLOPEDIA: 'ENCYCLOPEDIA',
};

export default function App() {
  const [screen, setScreen] = useState(SCREEN.HOME);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const { state, addCoins, levelUp, saveStars, updateBestCombo, incTotalPlayed, pullGacha } = useGameState();

  if (screen === SCREEN.HOME) return (
    <HomeScreen
      state={state}
      onPlay={() => setScreen(SCREEN.LEVEL_SELECT)}
      onEncyclopedia={() => setScreen(SCREEN.ENCYCLOPEDIA)}
      onGacha={() => setScreen(SCREEN.GACHA)}
    />
  );

  if (screen === SCREEN.LEVEL_SELECT) return (
    <LevelSelectScreen
      state={state}
      onBack={() => setScreen(SCREEN.HOME)}
      onSelect={lvl => { setSelectedLevel(lvl); setScreen(SCREEN.GAME); }}
    />
  );

  if (screen === SCREEN.GAME) return (
    <GameScreen
      state={{ ...state, level: selectedLevel || state.level }}
      maxLevel={state.level}
      onBack={() => setScreen(SCREEN.LEVEL_SELECT)}
      onEarnCoins={addCoins}
      onLevelUp={levelUp}
      onSaveStars={saveStars}
      onBestCombo={updateBestCombo}
      onIncPlayed={incTotalPlayed}
    />
  );

  if (screen === SCREEN.GACHA) return (
    <GachaScreen
      state={state}
      onBack={() => setScreen(SCREEN.HOME)}
      onPull={pullGacha}
    />
  );

  if (screen === SCREEN.ENCYCLOPEDIA) return (
    <EncyclopediaScreen
      state={state}
      onBack={() => setScreen(SCREEN.HOME)}
    />
  );

  return null;
}
