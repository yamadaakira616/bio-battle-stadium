import { useState, useEffect, useCallback, useRef } from 'react';
import { generateFlashProblem, generateChoices, getLevelConfig, QUESTIONS_PER_LEVEL, calcPlayReward } from '../utils/gameLogic';
import { playFlash, playCorrect, playWrong, playLevelUp, playPerfect, playCountdown, playGo, playCoinGet } from '../utils/sound';
import Confetti from '../components/Confetti';

const Phase = { COUNTDOWN:'countdown', FLASH:'flash', BLANK:'blank', ANSWER:'answer', FEEDBACK:'feedback', LEVELUP:'levelup', RESULT:'result' };

function StarRow({ count }) {
  return (
    <div className="flex gap-1 justify-center">
      {[1,2,3].map(i => (
        <span key={i} style={{ fontSize:32, filter: i<=count ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
      ))}
    </div>
  );
}

export default function GameScreen({ state, maxLevel, onBack, onEarnCoins, onLevelUp, onSaveStars, onBestCombo, onIncPlayed }) {
  const { level, coins } = state;
  const config = getLevelConfig(level);
  const levelPlayCount = state.levelPlayCount?.[String(level)] ?? 0;
  const isMaxLevel = level >= (maxLevel ?? level);

  const [phase, setPhase]               = useState(Phase.COUNTDOWN);
  const [countdown, setCountdown]       = useState(3);
  const [problem, setProblem]           = useState(null);
  const [choices, setChoices]           = useState([]);
  const [flashIdx, setFlashIdx]         = useState(0);
  const [questionNum, setQuestionNum]   = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected]         = useState(null);
  const [isCorrect, setIsCorrect]       = useState(null);
  const [shakeKey, setShakeKey]         = useState(0);
  const [combo, setCombo]               = useState(0);
  const [maxCombo, setMaxCombo]         = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answerTimer, setAnswerTimer]   = useState(10);
  const [earnedCoins, setEarnedCoins]   = useState(0);
  const [showInsectFlash, setShowInsectFlash] = useState(false);

  // タイマーを ref ごとに分離してクリーンアップ競合を防ぐ
  const countdownRef      = useRef(null);
  const flashRef          = useRef(null);
  const blankRef          = useRef(null);
  const answerRef         = useRef(null);
  const feedbackRef       = useRef(null);
  const confettiTimerRef  = useRef(null);
  const insectTimerRef    = useRef(null);

  const correctCountRef = useRef(0); // handleAnswer内で最新値を参照するため

  // BUG-07: 星計算を一箇所に集約
  const calcStars = (correct) => correct === 5 ? 3 : correct === 4 ? 2 : correct >= 3 ? 1 : 0;

  // 問題を生成してフラッシュ開始（カウントダウンなし）
  const startQuestion = useCallback((isFirst = false) => {
    const p = generateFlashProblem(level);
    setProblem(p);
    setChoices(generateChoices(p.answer, config.digits));
    setFlashIdx(0);
    setSelected(null);
    setIsCorrect(null);
    if (isFirst) {
      setPhase(Phase.COUNTDOWN);
      setCountdown(3);
    } else {
      // 問題間は短いインターバルのみ（カウントダウンなし）
      setPhase(Phase.FLASH);
    }
  }, [level, config.digits]);

  // 初回のみ実行
  useEffect(() => {
    startQuestion(true);
    return () => {
      clearTimeout(countdownRef.current);
      clearTimeout(flashRef.current);
      clearTimeout(blankRef.current);
      clearTimeout(answerRef.current);
      clearTimeout(feedbackRef.current);
      clearTimeout(confettiTimerRef.current);
      clearTimeout(insectTimerRef.current);
    };
  }, []);

  // ===== カウントダウン =====
  useEffect(() => {
    if (phase !== Phase.COUNTDOWN) return;
    if (countdown <= 0) {
      playGo();
      setPhase(Phase.FLASH);
      return;
    }
    playCountdown();
    countdownRef.current = setTimeout(() => setCountdown(c => c - 1), 700);
    return () => clearTimeout(countdownRef.current);
  }, [phase, countdown]);

  // ===== FLASH: 1つの数字を config.ms だけ表示 =====
  useEffect(() => {
    if (phase !== Phase.FLASH || !problem) return;
    playFlash();
    flashRef.current = setTimeout(() => {
      setPhase(Phase.BLANK);
    }, config.ms);
    return () => clearTimeout(flashRef.current);
  }, [phase, problem, flashIdx, config.ms]); // flashIdx を依存に含め同じ数字が連続する場合も再発火

  // ===== BLANK: 数字間の空白 (150ms) =====
  useEffect(() => {
    if (phase !== Phase.BLANK || !problem) return;
    blankRef.current = setTimeout(() => {
      if (flashIdx + 1 < problem.numbers.length) {
        setFlashIdx(i => i + 1);
        setPhase(Phase.FLASH);
      } else {
        setAnswerTimer(10);
        setPhase(Phase.ANSWER);
      }
    }, 150);
    return () => clearTimeout(blankRef.current);
  }, [phase, flashIdx, problem]);

  // ===== 答えタイマー =====
  useEffect(() => {
    if (phase !== Phase.ANSWER) return;
    if (answerTimer <= 0) {
      handleAnswer(-1); // タイムアウト
      return;
    }
    answerRef.current = setTimeout(() => setAnswerTimer(t => t - 1), 1000);
    return () => clearTimeout(answerRef.current);
  }, [phase, answerTimer]);

  function handleAnswer(choice) {
    if (phase !== Phase.ANSWER || selected !== null) return;
    clearTimeout(answerRef.current);

    setSelected(choice);
    const ok = choice === problem.answer;
    setIsCorrect(ok);

    if (ok) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      setCorrectCount(c => {
        correctCountRef.current = c + 1;
        return c + 1;
      });
      playCorrect();
      if (newCombo >= 3) {
        setShowConfetti(true);
        clearTimeout(confettiTimerRef.current);
        confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 2000);
      }
      setShowInsectFlash(true);
      clearTimeout(insectTimerRef.current);
      insectTimerRef.current = setTimeout(() => setShowInsectFlash(false), 500);
    } else {
      setCombo(0);
      playWrong();
      setShakeKey(k => k + 1);
    }

    setPhase(Phase.FEEDBACK);

    feedbackRef.current = setTimeout(() => {
      const isLast = questionNum >= QUESTIONS_PER_LEVEL;
      if (isLast) {
        const finalCorrect = correctCountRef.current;
        const stars = calcStars(finalCorrect);
        onSaveStars(level, stars);
        onBestCombo(Math.max(maxCombo, combo + (ok ? 1 : 0)));
        onIncPlayed(level);
        if (stars >= 1) {
          const reward = calcPlayReward(finalCorrect, levelPlayCount, isMaxLevel, level);
          onEarnCoins(reward);
          setEarnedCoins(reward);
          if (finalCorrect === 5) { playPerfect(); setTimeout(() => playCoinGet(), 800); }
          else { playLevelUp(); if (reward > 0) setTimeout(() => playCoinGet(), 800); }
          // BUG-05: レベル再プレイ時は最大レベルを上書きしない
          if (level < 50 && level >= (maxLevel ?? level)) onLevelUp();
          setPhase(Phase.LEVELUP);
        } else {
          setPhase(Phase.RESULT);
        }
      } else {
        setQuestionNum(n => n + 1);
        startQuestion(false); // カウントダウンなし
      }
    }, 1400);
  }

  // ===== LEVELUP =====
  if (phase === Phase.LEVELUP) {
    const finalCorrect = correctCountRef.current;
    const stars = calcStars(finalCorrect);
    const reward = earnedCoins; // 実際に付与したコインを表示（再計算しない）
    const isPerfect = finalCorrect === QUESTIONS_PER_LEVEL;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-5 p-6 text-center"
           style={{ background:'linear-gradient(180deg,#fce7f3 0%,#fdf2f8 100%)' }}>
        <Confetti active={true} />
        <div className="text-9xl animate-bounce-in">{isPerfect ? '🌟' : '💕'}</div>
        <h2 className="text-4xl font-black" style={{ color:'#db2777', textShadow:'3px 3px 0 #f9a8d4' }}>
          {isPerfect ? 'パーフェクト！' : 'クリア！'}
        </h2>
        <StarRow count={stars} />
        <div className="rounded-2xl p-4 w-full max-w-xs space-y-2"
             style={{ background:'rgba(255,255,255,0.8)', border:'2px solid #fbcfe8' }}>
          <div className="flex justify-between font-bold" style={{ color:'#9d174d' }}>
            <span>せいかい</span><span>{finalCorrect}/{QUESTIONS_PER_LEVEL}もん</span>
          </div>
          <div className="flex justify-between font-bold" style={{ color:'#9d174d' }}>
            <span>さいこうコンボ</span><span>🔥 x{maxCombo}</span>
          </div>
          <div className="pt-2 flex justify-between font-black text-xl"
               style={{ borderTop:'1px solid #fbcfe8', color:'#be185d' }}>
            <span>🪙 コイン</span><span>+{reward}</span>
          </div>
        </div>
        {isPerfect && (
          <p className="font-black text-sm animate-pulse" style={{ color:'#db2777' }}>
            🎊 5問全部せいかい！最高の{reward}コイン！！
          </p>
        )}
        {level < 50 && <p className="font-bold" style={{ color:'#16a34a' }}>Lv.{level} → Lv.{level + 1}!</p>}
        <button onClick={onBack}
          className="px-10 py-4 text-xl font-black text-white rounded-3xl active:scale-95 transition-transform"
          style={{ background:'linear-gradient(135deg,#f472b6,#ec4899)', boxShadow:'0 6px 0 #be185d' }}>
          つぎへ！
        </button>
      </div>
    );
  }

  // ===== RESULT (failed) =====
  if (phase === Phase.RESULT) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-5 p-6 text-center"
           style={{ background:'linear-gradient(180deg,#fce7f3 0%,#fdf2f8 100%)' }}>
        <div className="text-7xl">🥺</div>
        <h2 className="text-3xl font-black" style={{ color:'#db2777' }}>もう一回！</h2>
        <p style={{ color:'#9ca3af' }}>{correctCountRef.current}/{QUESTIONS_PER_LEVEL}もんせいかい</p>
        <p className="text-sm" style={{ color:'#d1d5db' }}>3もん以上せいかいでクリア！</p>
        <button onClick={onBack}
          className="px-10 py-4 text-xl font-black text-white rounded-3xl active:scale-95 transition-transform"
          style={{ background:'linear-gradient(135deg,#c084fc,#a855f7)', boxShadow:'0 6px 0 #7e22ce' }}>
          もどる
        </button>
      </div>
    );
  }

  // ===== メイン =====
  return (
    <div className="flex flex-col items-center min-h-screen p-4 gap-3"
         style={{ background:'linear-gradient(180deg,#fce7f3 0%,#fdf2f8 50%,#f5f0ff 100%)' }}>
      <Confetti active={showConfetti} />

      {showInsectFlash && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-40">
          <div className="text-8xl" style={{ opacity: 0.2, animation: 'silhouettePulse 0.5s ease' }}>
            💕
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="w-full flex items-center justify-between pt-2">
        <button
          aria-label="もどる"
          onClick={() => {
            if (phase === Phase.FLASH || phase === Phase.ANSWER || phase === Phase.FEEDBACK) {
              if (!window.confirm('ゲームをやめますか？')) return;
            }
            onBack();
          }}
          className="text-2xl p-2">←</button>
        <div className="font-bold text-gray-600 text-sm">{config.label} · {config.ms/1000}秒/こ</div>
        <div className="font-bold flex items-center gap-1">🪙{coins}</div>
      </div>

      {/* プログレス */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden"
           role="progressbar"
           aria-valuenow={questionNum - 1}
           aria-valuemin={0}
           aria-valuemax={QUESTIONS_PER_LEVEL}
           aria-label="もんだいのしんちょく">
        <div className="h-full rounded-full transition-all duration-500"
             style={{ width:`${((questionNum-1)/QUESTIONS_PER_LEVEL)*100}%`, background:'linear-gradient(90deg,#f9a8d4,#ec4899)' }}/>
      </div>

      {/* バッジ */}
      <div className="flex gap-2 flex-wrap justify-center">
        <span className="rounded-full px-3 py-1 font-bold text-sm"
              style={{ background:'#fce7f3', border:'2px solid #f9a8d4', color:'#be185d' }}>
          ✨ Lv.{level}
        </span>
        <span className="rounded-full px-3 py-1 font-bold text-sm"
              style={{ background:'white', border:'2px solid #fbcfe8', color:'#9d174d' }}>
          {questionNum}/{QUESTIONS_PER_LEVEL}
        </span>
        {combo >= 2 && (
          <span className="rounded-full px-3 py-1 font-bold text-sm text-white animate-pulse-scale"
                style={{ background:'linear-gradient(135deg,#f472b6,#ec4899)' }}>
            💕コンボ x{combo}
          </span>
        )}
      </div>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">

        {/* カウントダウン（初回のみ） */}
        {phase === Phase.COUNTDOWN && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-xl font-bold text-gray-500">{config.count}つの数字を足してね！</p>
            <div key={countdown} className="text-9xl font-black animate-pop"
                 style={{ color: countdown===1?'#e11d48':countdown===2?'#db2777':'#a855f7' }}>
              {countdown > 0 ? countdown : 'GO!'}
            </div>
          </div>
        )}

        {/* フラッシュ表示 */}
        {(phase === Phase.FLASH || phase === Phase.BLANK) && problem && (
          <div className="flex flex-col items-center gap-5">
            {/* 進行ドット */}
            <div className="flex gap-2">
              {problem.numbers.map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full transition-all duration-100"
                     style={{
                       background: i < flashIdx ? '#ec4899'
                                 : i === flashIdx && phase === Phase.FLASH ? '#f9a8d4'
                                 : '#fce7f3',
                       transform: i === flashIdx && phase === Phase.FLASH ? 'scale(1.3)' : 'scale(1)',
                     }}/>
              ))}
            </div>

            {/* 数字表示ボックス（シートめくり演出） */}
            <div className="w-64 h-48 rounded-3xl flex items-center justify-center shadow-xl overflow-hidden"
                 style={{ background:'rgba(255,255,255,0.9)', perspective:'600px' }}>
              {phase === Phase.FLASH ? (
                <div key={`${questionNum}-${flashIdx}`} className="font-black sheet-flip-in tabular-nums"
                     style={{
                       fontSize: config.digits===1 ? '7rem' : config.digits===2 ? '5rem' : '3.5rem',
                       color:'#831843',
                       textShadow:'3px 3px 0 rgba(251,207,232,0.8)',
                       display:'inline-block',
                     }}>
                  {problem.numbers[flashIdx]}
                </div>
              ) : (
                <div className="text-5xl text-gray-200 sheet-flip-out">···</div>
              )}
            </div>

            <p className="text-gray-400 font-bold text-lg">{flashIdx + 1} / {problem.numbers.length}</p>
          </div>
        )}

        {/* 答え入力 */}
        {(phase === Phase.ANSWER || phase === Phase.FEEDBACK) && (
          <div className="flex flex-col items-center gap-5 w-full">
            <div className="text-4xl font-black text-gray-700">ぜんぶで いくつ？</div>

            {/* 答えタイマーバー */}
            {phase === Phase.ANSWER && (
              <div className="w-full max-w-xs h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                     style={{
                       width:`${answerTimer * 10}%`,
                       background: answerTimer>6 ? '#f9a8d4' : answerTimer>3 ? '#f472b6' : '#e11d48',
                     }}/>
              </div>
            )}

            {/* 選択肢 */}
            <div key={shakeKey}
                 className={`grid grid-cols-2 gap-4 w-full max-w-xs ${isCorrect===false ? 'animate-shake' : ''}`}>
              {choices.map(c => {
                let bg='white', border='#fbcfe8', color='#be185d';
                if (selected === c) {
                  if (isCorrect) { bg='#22c55e'; border='#16a34a'; color='white'; }
                  else           { bg='#ef4444'; border='#b91c1c'; color='white'; }
                } else if (selected !== null && c === problem?.answer) {
                  bg='#bbf7d0'; border='#16a34a'; color='#166534';
                }
                return (
                  <button key={c} onClick={() => handleAnswer(c)}
                    disabled={selected !== null}
                    aria-label={`こたえ ${c}`}
                    className="rounded-3xl py-5 font-black shadow-md active:scale-95 transition-all border-4"
                    style={{
                      fontSize: config.digits===1 ? '2.5rem' : config.digits===2 ? '1.8rem' : '1.3rem',
                      background:bg, borderColor:border, color,
                    }}>
                    {c}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div role="alert" aria-live="assertive"
                   className={`text-3xl font-black animate-bounce-in ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {isCorrect
                  ? combo >= 3 ? `💕 ${combo}れんぞく！` : '🎉 せいかい！'
                  : `😢 こたえは ${problem?.answer}`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
