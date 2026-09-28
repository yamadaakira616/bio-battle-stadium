import { useState, useEffect } from "react";
import { useGameState } from "./hooks/useGameState.js";
import HomeScreen from "./screens/AdventureHome.jsx";
import AdventureShell from "./components/AdventureShell.jsx";
import LearningScreen from "./screens/LearningScreen.jsx";
import QuestScreen from "./screens/QuestScreen.jsx";
import RecordsScreen from "./screens/RecordsScreen.jsx";
import { setSoundEnabled } from "./utils/sound";
import "./adventure.css";
import LevelSelectScreen from "./screens/LevelSelectScreen.jsx";
import GameScreen from "./screens/GameScreen.jsx";
import GachaScreen from "./screens/GachaScreen.jsx";
import EncyclopediaScreen from "./screens/EncyclopediaScreen.jsx";
import BattleMapScreen from "./screens/BattleMapScreen.jsx";
import TeamSelectScreen from "./screens/TeamSelectScreen.jsx";
import BattleScreen from "./screens/BattleScreen.jsx";
import FusionScreen from "./screens/FusionScreen.jsx";

const SCREEN = {
  HOME: "HOME",
  LEARN: "LEARN",
  QUEST: "QUEST",
  RECORDS: "RECORDS",
  QUEST_PLAY: "QUEST_PLAY",
  LEVEL_SELECT: "LEVEL_SELECT",
  GAME: "GAME",
  GACHA: "GACHA",
  ENCYCLOPEDIA: "ENCYCLOPEDIA",
  BATTLE_MAP: "BATTLE_MAP",
  TEAM_SELECT: "TEAM_SELECT",
  BATTLE: "BATTLE",
  FUSION: "FUSION",
};

export default function App() {
  const [screen, setScreen] = useState(SCREEN.HOME);
  const [practiceMode, setPracticeMode] = useState("soroban");
  const [questZone, setQuestZone] = useState(null);
  const [learningKey, setLearningKey] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedNation, setSelectedNation] = useState(null);
  const [battleTeam, setBattleTeam] = useState([]);
  const [battleKey, setBattleKey] = useState(0);

  const {
    state,
    addCoins,
    spendCoins,
    levelUp,
    saveStars,
    finishLearning,
    claimMission,
    claimLogin,
    toggleSound,
    updateBestCombo,
    incLevelPlayCount,
    pullGacha,
    updateBookPage,
    updateBattleProgress,
    saveBattleTeam,
    upgradeCard,
    addCardToCollection,
    attemptFusion,
  } = useGameState();

  useEffect(() => {
    setSoundEnabled(state.soundEnabled);
  }, [state.soundEnabled]);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [screen]);
  function navigate(next) {
    setScreen(next);
    if (next === "LEARN") {
      setPracticeMode("soroban");
      setLearningKey((k) => k + 1);
    }
  }
  function practice(mode) {
    setPracticeMode(mode);
    setLearningKey((k) => k + 1);
    setScreen("LEARN");
  }
  function quest(zone) {
    setQuestZone(zone);
    setLearningKey((k) => k + 1);
    setScreen("QUEST_PLAY");
  }
  const content = (() => {
    if (screen === "LEARN" || screen === "QUEST_PLAY")
      return (
        <LearningScreen
          key={learningKey}
          state={state}
          initialMode={screen === "QUEST_PLAY" ? "mental" : practiceMode}
          zone={screen === "QUEST_PLAY" ? questZone : null}
          onBack={() => setScreen(screen === "QUEST_PLAY" ? "QUEST" : "HOME")}
          onFinish={finishLearning}
          onFlash={() => setScreen("LEVEL_SELECT")}
        />
      );
    if (screen === "QUEST")
      return <QuestScreen learning={state.learning} onSelect={quest} />;
    if (screen === "RECORDS")
      return (
        <RecordsScreen
          state={state}
          learning={state.learning}
          onReview={() => practice("review")}
        />
      );
    if (screen === SCREEN.HOME)
      return (
        <HomeScreen
          state={state}
          onNavigate={navigate}
          onPractice={practice}
          onQuest={quest}
          onClaim={claimMission}
          onClaimLogin={claimLogin}
          onPlay={() => setScreen(SCREEN.LEVEL_SELECT)}
          onEncyclopedia={() => setScreen(SCREEN.ENCYCLOPEDIA)}
          onGacha={() => setScreen(SCREEN.GACHA)}
          onBattle={() => setScreen(SCREEN.BATTLE_MAP)}
          onFusion={() => setScreen(SCREEN.FUSION)}
        />
      );

    if (screen === SCREEN.LEVEL_SELECT)
      return (
        <LevelSelectScreen
          state={state}
          onBack={() => setScreen(SCREEN.HOME)}
          onSelect={(lvl) => {
            setSelectedLevel(lvl);
            setScreen(SCREEN.GAME);
          }}
        />
      );

    if (screen === SCREEN.GAME)
      return (
        <GameScreen
          state={{ ...state, level: selectedLevel || state.level }}
          maxLevel={state.level}
          onBack={() => setScreen(SCREEN.LEVEL_SELECT)}
          onEarnCoins={addCoins}
          onLearningFinish={finishLearning}
          onLevelUp={levelUp}
          onSaveStars={saveStars}
          onBestCombo={updateBestCombo}
          onIncPlayed={(lvl) => incLevelPlayCount(lvl)}
        />
      );

    if (screen === SCREEN.GACHA)
      return (
        <GachaScreen
          state={state}
          onBack={() => setScreen(SCREEN.HOME)}
          onPull={pullGacha}
        />
      );

    if (screen === SCREEN.ENCYCLOPEDIA)
      return (
        <EncyclopediaScreen
          state={state}
          onBack={() => setScreen(SCREEN.HOME)}
          onUpgradeCard={upgradeCard}
        />
      );

    if (screen === SCREEN.BATTLE_MAP)
      return (
        <BattleMapScreen
          state={state}
          onBack={() => setScreen(SCREEN.HOME)}
          onSelectNation={(nation) => {
            setSelectedNation(nation);
            setScreen(SCREEN.TEAM_SELECT);
          }}
        />
      );

    if (screen === SCREEN.TEAM_SELECT)
      return (
        <TeamSelectScreen
          state={state}
          nation={selectedNation}
          onBack={() => setScreen(SCREEN.BATTLE_MAP)}
          onConfirm={(teamIds) => {
            saveBattleTeam(teamIds);
            setBattleTeam(teamIds);
            setScreen(SCREEN.BATTLE);
          }}
        />
      );

    if (screen === SCREEN.BATTLE)
      return (
        <BattleScreen
          key={battleKey}
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
          onDefeat={(action) => {
            if (action === "retry") setBattleKey((k) => k + 1);
            else if (action === "changeTeam") setScreen(SCREEN.TEAM_SELECT);
            else setScreen(SCREEN.BATTLE_MAP);
          }}
        />
      );

    if (screen === SCREEN.FUSION)
      return (
        <FusionScreen
          state={state}
          onBack={() => setScreen(SCREEN.HOME)}
          onAttemptFusion={attemptFusion}
        />
      );

    return null;
  })();
  return (
    <AdventureShell
      screen={screen}
      state={state}
      onNavigate={navigate}
      onSound={toggleSound}
    >
      {content}
    </AdventureShell>
  );
}
