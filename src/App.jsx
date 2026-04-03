import { useState } from 'react';
import { useGameState } from './hooks/useGameState.js';
import HomeScreen from './screens/HomeScreen.jsx';
import LevelSelectScreen from './screens/LevelSelectScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import GachaScreen from './screens/GachaScreen.jsx';
import EncyclopediaScreen from './screens/EncyclopediaScreen.jsx';
import BattleMapScreen from './screens/BattleMapScreen.jsx';
import TeamSelectScreen from './screens/TeamSelectScreen.jsx';
import BattleScreen from './screens/BattleScreen.jsx';

const SCREEN = {
  HOME: 'HOME',
  LEVEL_SELECT: 'LEVEL_SELECT',
  GAME: 'GAME',
  GACHA: 'GACHA',
  ENCYCLOPEDIA: 'ENCYCLOPEDIA',
  BATTLE_MAP: 'BATTLE_MAP',
  TEAM_SELECT: 'TEAM_SELECT',
  BATTLE: 'BATTLE',
};

export default function App() {
  const [screen, setScreen] = useState(SCREEN.HOME);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedNation, setSelectedNation] = useState(null);
  const [battleTeam, setBattleTeam] = useState([]);

  const {
    state, addCoins, spendCoins, levelUp, saveStars,
    updateBestCombo, incLevelPlayCount, pullGacha, updateBookPage,
    updateBattleProgress, saveBattleTeam, upgradeCard, addCardToCollection,
  } = useGameState();

  if (screen === SCREEN.HOME) return (
    <HomeScreen
      state={state}
      onPlay={() => setScreen(SCREEN.LEVEL_SELECT)}
      onEncyclopedia={() => setScreen(SCREEN.ENCYCLOPEDIA)}
      onGacha={() => setScreen(SCREEN.GACHA)}
      onBattle={() => setScreen(SCREEN.BATTLE_MAP)}
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
      onIncPlayed={lvl => incLevelPlayCount(lvl)}
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
      onUpgradeCard={upgradeCard}
    />
  );

  if (screen === SCREEN.BATTLE_MAP) return (
    <BattleMapScreen
      state={state}
      onBack={() => setScreen(SCREEN.HOME)}
      onSelectNation={nation => {
        setSelectedNation(nation);
        setScreen(SCREEN.TEAM_SELECT);
      }}
    />
  );

  if (screen === SCREEN.TEAM_SELECT) return (
    <TeamSelectScreen
      state={state}
      nation={selectedNation}
      onBack={() => setScreen(SCREEN.BATTLE_MAP)}
      onConfirm={teamIds => {
        saveBattleTeam(teamIds);
        setBattleTeam(teamIds);
        setScreen(SCREEN.BATTLE);
      }}
    />
  );

  if (screen === SCREEN.BATTLE) return (
    <BattleScreen
      state={state}
      nation={selectedNation}
      teamCardIds={battleTeam}
      cardLevels={state.cardLevels || {}}
      onBack={() => setScreen(SCREEN.BATTLE_MAP)}
      onVictory={(nationId, teamIds, reward, rewardCardId) => {
        addCoins(reward);
        updateBattleProgress(nationId, teamIds);
        if (rewardCardId) addCardToCollection(rewardCardId);
        setScreen(SCREEN.BATTLE_MAP);
      }}
      onDefeat={action => {
        if (action === 'retry') setScreen(SCREEN.BATTLE);
        else if (action === 'changeTeam') setScreen(SCREEN.TEAM_SELECT);
        else setScreen(SCREEN.BATTLE_MAP);
      }}
    />
  );

  return null;
}
