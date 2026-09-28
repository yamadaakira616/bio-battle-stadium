import { useEffect, useRef, useState } from "react";
import Icon from "../components/Icon";
import Soroban from "../components/Soroban";
import {
  HUNDRED_COURSES,
  HUNDRED_VARIANTS,
  HUNDRED_SECONDS,
  checkHundredResult,
  hundredReward,
  hundredStep,
  hundredTotal,
  parseHundredInteger,
} from "../utils/hundredAbacus";
import { playCorrect, playWrong, playLevelUp } from "../utils/sound";
import "./hundred-abacus.css";

const DRAFT_KEY = "bio-battle-hundred-abacus-draft-v1";
const STATUSES = [
  "practice",
  "practice-feedback",
  "countdown",
  "timed",
  "entry",
];

function readDraft() {
  try {
    const run = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (
      !run ||
      typeof run.id !== "string" ||
      !(run.course in HUNDRED_COURSES) ||
      !(run.variant in HUNDRED_VARIANTS) ||
      !STATUSES.includes(run.status) ||
      (run.variant === "practice" &&
        !["practice", "practice-feedback"].includes(run.status)) ||
      (run.variant === "timed" &&
        !["countdown", "timed", "entry"].includes(run.status)) ||
      !Number.isInteger(run.questionNo) ||
      run.questionNo < 1 ||
      run.questionNo > 100 ||
      !Number.isInteger(run.correctCount) ||
      run.correctCount < 0 ||
      run.correctCount > 100 ||
      !Number.isInteger(run.answeredCount) ||
      run.answeredCount < run.correctCount ||
      run.answeredCount > 10000 ||
      !Number.isFinite(run.startedAt) ||
      run.startedAt <= 0
    )
      return null;
    if (
      run.variant === "practice" &&
      run.correctCount !==
        run.questionNo - 1 + Number(run.status === "practice-feedback")
    )
      return null;
    if (run.variant === "timed") {
      if (
        !Number.isFinite(run.countdownEndsAt) ||
        !Number.isFinite(run.deadline) ||
        run.deadline <= run.countdownEndsAt
      )
        return null;
      if (run.status === "countdown" && Date.now() >= run.countdownEndsAt)
        run.status = Date.now() >= run.deadline ? "entry" : "timed";
      if (run.status === "timed" && Date.now() >= run.deadline)
        run.status = "entry";
      if (run.status === "entry" && !run.endReason) run.endReason = "natural";
    }
    return run;
  } catch {
    return null;
  }
}

function countDown(deadline, now) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export default function HundredAbacusScreen({
  state,
  onBack,
  onFinish,
  onRecords,
}) {
  const [run, setRun] = useState(readDraft);
  const [course, setCourse] = useState(run?.course || "sequential");
  const [variant, setVariant] = useState(run?.variant || "practice");
  const [answer, setAnswer] = useState("");
  const [countInput, setCountInput] = useState("");
  const [beads, setBeads] = useState(
    run?.variant === "practice"
      ? hundredStep(run.course, run.questionNo)?.before || 0
      : 0,
  );
  const [useBeads, setUseBeads] = useState(true);
  const [showBeadValue, setShowBeadValue] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [formError, setFormError] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [confirmEarly, setConfirmEarly] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState(null);
  const finishing = useRef(false);
  const step =
    run?.variant === "practice"
      ? hundredStep(run.course, run.questionNo)
      : null;

  function saveDraft(next) {
    setRun(next);
    try {
      if (next) localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      else localStorage.removeItem(DRAFT_KEY);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }

  useEffect(() => {
    if (run?.status !== "countdown" && run?.status !== "timed")
      return undefined;
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 200);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [run?.status]);

  useEffect(() => {
    if (run?.status === "countdown" && now >= run.countdownEndsAt) {
      saveDraft({
        ...run,
        status: now >= run.deadline ? "entry" : "timed",
        endReason: now >= run.deadline ? "natural" : null,
      });
    } else if (run?.status === "timed" && now >= run.deadline) {
      saveDraft({ ...run, status: "entry", endReason: "natural" });
      playLevelUp();
      if (navigator.vibrate) navigator.vibrate([160, 80, 160]);
    }
  }, [run, now]);

  useEffect(() => {
    if (run?.status !== "timed" || !navigator.wakeLock?.request)
      return undefined;
    let cancelled = false;
    let sentinel;
    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) await lock.release();
        else sentinel = lock;
      } catch {
        /* 省電力設定などで使えない端末でもテストは続行できる */
      }
    };
    acquire();
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        (!sentinel || sentinel.released)
      )
        acquire();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      sentinel?.release?.().catch(() => {});
    };
  }, [run?.status]);

  function start() {
    finishing.current = false;
    const startedAt = Date.now();
    const countdownEndsAt = startedAt + 3000;
    saveDraft({
      id: crypto.randomUUID(),
      course,
      variant,
      status: variant === "timed" ? "countdown" : "practice",
      questionNo: 1,
      correctCount: 0,
      answeredCount: 0,
      startedAt,
      countdownEndsAt,
      deadline: countdownEndsAt + HUNDRED_SECONDS * 1000,
      endReason: null,
    });
    setNow(startedAt);
    setAnswer("");
    setCountInput("");
    setBeads(0);
    setFeedback(null);
    setFormError("");
    setResult(null);
  }

  function finishPractice(source = run) {
    if (!source || finishing.current) return;
    if (source.answeredCount === 0) {
      saveDraft(null);
      return;
    }
    finishing.current = true;
    const count = source.correctCount;
    const correct = count > 0;
    const earnedCoins = hundredReward({
      variant: "practice",
      correctCount: count,
      correct,
    });
    onFinish({
      id: source.id,
      mode: "hundred",
      hundred: {
        course: source.course,
        variant: "practice",
        count,
        answeredCount: source.answeredCount,
        correctCount: count,
        expected: count ? hundredTotal(source.course, count) : 0,
        answer: count ? hundredTotal(source.course, count) : 0,
        fullMinute: false,
        endReason: count === 100 ? "complete" : "early",
      },
      seconds: Math.max(0, Math.round((Date.now() - source.startedAt) / 1000)),
    });
    setResult({
      course: source.course,
      variant: "practice",
      count,
      expected: count ? hundredTotal(source.course, count) : 0,
      answer: count ? hundredTotal(source.course, count) : 0,
      correct,
      earnedCoins,
      answeredCount: source.answeredCount,
    });
    saveDraft(null);
    if (count === 100) playLevelUp();
  }

  function submitPractice(event) {
    event.preventDefault();
    if (!run || run.status !== "practice" || !step) return;
    if (run.answeredCount >= 10000) {
      setFormError("この回の回答上限です。ここまでの記録を残してください。");
      return;
    }
    const checked = useBeads
      ? { valid: true, value: beads }
      : parseHundredInteger(answer);
    if (!checked.valid) {
      setFormError(checked.error);
      return;
    }
    const correct = checked.value === step.expected;
    saveDraft({
      ...run,
      status: correct ? "practice-feedback" : "practice",
      correctCount: run.correctCount + (correct ? 1 : 0),
      answeredCount: run.answeredCount + 1,
    });
    setFeedback({
      correct,
      given: checked.value,
      expected: step.expected,
      number: run.questionNo,
    });
    setFormError("");
    if (correct) playCorrect();
    else playWrong();
  }

  function nextPractice() {
    if (!run || run.status !== "practice-feedback") return;
    if (run.questionNo === 100) {
      finishPractice(run);
      return;
    }
    const nextNo = run.questionNo + 1;
    saveDraft({ ...run, status: "practice", questionNo: nextNo });
    setBeads(hundredStep(run.course, nextNo).before);
    setAnswer("");
    setFeedback(null);
  }

  function submitTimed(event) {
    event.preventDefault();
    if (!run || run.status !== "entry" || finishing.current) return;
    const checked = checkHundredResult(run.course, countInput, answer);
    if (!checked.valid) {
      setFormError(Object.values(checked.errors).join(" "));
      return;
    }
    finishing.current = true;
    const fullMinute = run.endReason === "natural";
    const oldBest = state.learning.hundredRecords["timed"][run.course].best;
    const earnedCoins = hundredReward({
      variant: "timed",
      correct: checked.correct,
      correctCount: checked.correct ? 1 : 0,
      personalBest: fullMinute && checked.correct && checked.count > oldBest,
    });
    onFinish({
      id: run.id,
      mode: "hundred",
      hundred: {
        course: run.course,
        variant: "timed",
        count: checked.count,
        answeredCount: 1,
        correctCount: checked.correct ? 1 : 0,
        expected: checked.expected,
        answer: checked.answer,
        fullMinute,
        endReason: run.endReason,
      },
      seconds: fullMinute
        ? HUNDRED_SECONDS
        : Math.max(0, Math.round((Date.now() - run.countdownEndsAt) / 1000)),
    });
    setResult({
      course: run.course,
      variant: "timed",
      count: checked.count,
      expected: checked.expected,
      answer: checked.answer,
      correct: checked.correct,
      earnedCoins,
      fullMinute,
      answeredCount: 1,
    });
    saveDraft(null);
    setFormError("");
    if (checked.correct) playCorrect();
    else playWrong();
  }

  const phase = result ? "result" : run?.status || "setup";
  return (
    <div className="hundred-page">
      <button className="text-button back-button" onClick={onBack}>
        <Icon name="back" size={17} /> 冒険基地へ
      </button>
      <div className="page-heading">
        <div>
          <p className="eyebrow">THE 100 STEP ABACUS ROAD</p>
          <h1>1〜100 そろばんロード</h1>
          <p>ひと珠ずつ進んで、計算のチカラを育てよう。</p>
        </div>
        <span className="edition-tag">
          <Icon name="abacus" size={16} /> 全100ステップ
        </span>
      </div>
      {saveError && (
        <p className="hundred-alert" role="alert">
          途中の記録を保存できません。ブラウザーの保存設定を確認してください。
        </p>
      )}

      {phase === "setup" && (
        <div className="hundred-layout">
          <section className="panel hundred-main-card">
            <span className="hundred-kicker">CHOOSE YOUR COURSE</span>
            <h2>どの計算で冒険する？</h2>
            <div
              className="hundred-options"
              role="group"
              aria-label="そろばん種目"
            >
              {Object.entries(HUNDRED_COURSES).map(([key, item]) => (
                <button
                  key={key}
                  className={course === key ? "chosen" : ""}
                  aria-pressed={course === key}
                  onClick={() => setCourse(key)}
                >
                  <strong>{item.name}</strong>
                  <span>{item.description}</span>
                  <small>
                    {key === "sequential"
                      ? "3まで → 6 ／ 10まで → 55"
                      : "3回 → 495 ／ 100回 → 16,500"}
                  </small>
                </button>
              ))}
            </div>
            <h3>チャレンジ方法</h3>
            <div
              className="hundred-options hundred-variants"
              role="group"
              aria-label="チャレンジ方法"
            >
              {Object.entries(HUNDRED_VARIANTS).map(([key, name]) => (
                <button
                  key={key}
                  className={variant === key ? "chosen" : ""}
                  aria-pressed={variant === key}
                  onClick={() => setVariant(key)}
                >
                  <strong>{name}</strong>
                  <span>
                    {key === "practice"
                      ? "1問ずつ累計を確かめる。途中まででも記録に残せます。"
                      : "3秒後に開始。60秒で進んだ数と合計を答えます。"}
                  </span>
                </button>
              ))}
            </div>
            <button className="primary-button hundred-start" onClick={start}>
              <Icon name="bolt" /> チャレンジをはじめる <Icon name="arrow" />
            </button>
          </section>
          <aside className="panel hundred-side-card">
            <Icon name="trophy" size={30} />
            <h2>いままでのベスト</h2>
            {Object.entries(HUNDRED_COURSES).map(([key, item]) => (
              <div className="hundred-best-row" key={key}>
                <strong>{item.name}</strong>
                <span>
                  練習 {state.learning.hundredRecords.practice[key].best} / 100
                </span>
                <span>
                  1分 {state.learning.hundredRecords.timed[key].best} / 100
                </span>
              </div>
            ))}
            <p>練習は10問ごとに20コイン。1分は正確な自己ベストを記録します。</p>
            <button className="secondary-button full-width" onClick={onRecords}>
              成長のきろくを見る
            </button>
          </aside>
        </div>
      )}

      {(phase === "practice" || phase === "practice-feedback") && step && (
        <div className="hundred-layout">
          <section className="panel hundred-main-card">
            <div className="hundred-question-head">
              <span>{HUNDRED_COURSES[run.course].name}</span>
              <strong>
                {run.questionNo} <small>/ 100</small>
              </strong>
            </div>
            <div
              className="hundred-progress"
              aria-label={`${run.correctCount}問完了`}
            >
              <i style={{ width: `${run.correctCount}%` }} />
            </div>
            <p className="hundred-instruction">
              ここまでの合計を、そろばんで作ろう
            </p>
            <div className="hundred-equation">
              <span>{step.before.toLocaleString()}</span>
              <b>＋</b>
              <span>{step.add.toLocaleString()}</span>
              <b>＝</b>
              <em>?</em>
            </div>
            <p className="hundred-formula">
              {run.course === "sequential"
                ? `1 ＋ 2 ＋ … ＋ ${run.questionNo}`
                : `165を ${run.questionNo} 回足した合計`}
            </p>
            {phase === "practice" && (
              <>
                <div
                  className="hundred-answer-method"
                  role="group"
                  aria-label="答え方"
                >
                  <button
                    className={useBeads ? "active" : ""}
                    aria-pressed={useBeads}
                    onClick={() => setUseBeads(true)}
                  >
                    珠で答える
                  </button>
                  <button
                    className={!useBeads ? "active" : ""}
                    aria-pressed={!useBeads}
                    onClick={() => setUseBeads(false)}
                  >
                    数字で答える
                  </button>
                </div>
                <form onSubmit={submitPractice}>
                  {useBeads ? (
                    <>
                      <Soroban
                        value={beads}
                        onChange={setBeads}
                        digits={5}
                        showValue={showBeadValue}
                      />
                      <div className="soroban-controls">
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setBeads(step.before)}
                        >
                          前の合計にもどす
                        </button>
                        <label>
                          <input
                            type="checkbox"
                            checked={showBeadValue}
                            onChange={(e) => setShowBeadValue(e.target.checked)}
                          />{" "}
                          珠の数を表示
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <label
                        className="answer-label"
                        htmlFor="hundred-practice-answer"
                      >
                        ここまでの合計
                      </label>
                      <input
                        id="hundred-practice-answer"
                        className="answer-input"
                        inputMode="numeric"
                        autoComplete="off"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value.slice(0, 5))}
                        placeholder="?"
                      />
                    </>
                  )}
                  {formError && (
                    <p className="hundred-field-error" role="alert">
                      {formError}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="primary-button hundred-submit"
                  >
                    こたえあわせ <Icon name="check" />
                  </button>
                </form>
                {feedback && !feedback.correct && (
                  <div className="hundred-feedback retry" role="status">
                    <strong>もう一度チャレンジ！</strong>
                    <p>
                      {feedback.number}問目の正しい累計は{" "}
                      <b>{feedback.expected.toLocaleString()}</b>。
                      {step.before.toLocaleString()} に{" "}
                      {step.add.toLocaleString()} を足してみよう。
                    </p>
                  </div>
                )}
                <button
                  className="text-button hundred-finish-link"
                  onClick={() => finishPractice()}
                >
                  ここまでの記録を残す
                </button>
              </>
            )}
            {phase === "practice-feedback" && (
              <div className="hundred-feedback" role="status">
                <strong>せいかい！ {step.expected.toLocaleString()}</strong>
                <p>
                  {step.before.toLocaleString()} ＋ {step.add.toLocaleString()}{" "}
                  ＝ {step.expected.toLocaleString()}。
                  {run.questionNo % 10 === 0
                    ? `${run.questionNo}問クリア！ コインのチェックポイントに到達。`
                    : "この調子で次の数へ進もう。"}
                </p>
                <button className="primary-button" onClick={nextPractice}>
                  {run.questionNo === 100 ? "100問の結果を見る" : "つぎの数へ"}{" "}
                  <Icon name="arrow" />
                </button>
                {run.questionNo < 100 && (
                  <button
                    className="text-button hundred-finish-link"
                    onClick={() => finishPractice()}
                  >
                    ここまでの記録を残す
                  </button>
                )}
              </div>
            )}
          </section>
          <aside className="panel hundred-side-card">
            <Icon name="abacus" size={30} />
            <h2>積み上げた力</h2>
            <div className="hundred-big-number">
              {run.correctCount}
              <small> / 100 問</small>
            </div>
            <p>
              答えを間違えても、同じ数でもう一度。前の合計から珠を動かすと計算の流れが見えます。
            </p>
            <div className="hundred-mini-stat">
              <span>答えた回数</span>
              <b>{run.answeredCount}</b>
            </div>
            <div className="hundred-mini-stat">
              <span>次のコインまで</span>
              <b>{10 - (run.correctCount % 10)} 問</b>
            </div>
          </aside>
        </div>
      )}

      {(phase === "countdown" || phase === "timed") && (
        <section className="panel hundred-timer-card">
          <p className="hundred-kicker">ONE MINUTE CHALLENGE</p>
          {phase === "countdown" ? (
            <>
              <h2>そろばんを用意してね</h2>
              <div className="hundred-countdown" aria-live="assertive">
                {countDown(run.countdownEndsAt, now)}
              </div>
              <p>3秒後に始まります。数字を順に足してください。</p>
              <button
                className="secondary-button"
                onClick={() => saveDraft(null)}
              >
                開始を取り消す
              </button>
            </>
          ) : (
            <>
              <h2>{HUNDRED_COURSES[run.course].name}</h2>
              <div
                className="hundred-timer"
                role="timer"
                aria-label={`残り${countDown(run.deadline, now)}秒`}
              >
                {String(Math.floor(countDown(run.deadline, now) / 60)).padStart(
                  2,
                  "0",
                )}
                :{String(countDown(run.deadline, now) % 60).padStart(2, "0")}
              </div>
              <div className="hundred-flow">
                {run.course === "sequential"
                  ? "1 → 2 → 3 → … → 100"
                  : "165 → 330 → 495 → …"}
              </div>
              <p>
                手元のそろばんか暗算で進めよう。最後に足した数と合計を覚えておいてね。
              </p>
              {!confirmEarly ? (
                <button
                  className="secondary-button"
                  onClick={() => setConfirmEarly(true)}
                >
                  途中で終了する
                </button>
              ) : (
                <div
                  className="hundred-early-confirm"
                  role="group"
                  aria-label="途中終了の確認"
                >
                  <p>
                    ここまでで終了しますか？ 1分の自己ベストには入りません。
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => {
                      saveDraft({
                        ...run,
                        status: "entry",
                        endReason:
                          Date.now() >= run.deadline ? "natural" : "early",
                      });
                      setConfirmEarly(false);
                    }}
                  >
                    終了して答えを入力
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => setConfirmEarly(false)}
                  >
                    計算を続ける
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {phase === "entry" && (
        <section className="panel hundred-timer-card hundred-entry-card">
          <p className="hundred-kicker">ANSWER CHECK</p>
          <h2>
            {run.endReason === "natural"
              ? "1分チャレンジ終了！"
              : "ここまでを答え合わせ"}
          </h2>
          <p>
            足したところまでを教えてください。正しい答えを大きく表示します。
          </p>
          <form onSubmit={submitTimed}>
            <label htmlFor="hundred-count">
              {run.course === "sequential"
                ? "最後に足した数（1〜100）"
                : "165を足した回数（1〜100）"}
            </label>
            <input
              id="hundred-count"
              className="answer-input"
              inputMode="numeric"
              autoComplete="off"
              value={countInput}
              onChange={(e) => setCountInput(e.target.value.slice(0, 3))}
              placeholder="例：10"
            />
            <small>
              {run.course === "sequential"
                ? "3まで足したなら「3」（合計は6）"
                : "165を3回足したなら「3」（合計は495）"}
            </small>
            <label htmlFor="hundred-final-answer">計算した合計</label>
            <input
              id="hundred-final-answer"
              className="answer-input"
              inputMode="numeric"
              autoComplete="off"
              value={answer}
              onChange={(e) => setAnswer(e.target.value.slice(0, 5))}
              placeholder="?"
            />
            {formError && (
              <p className="hundred-field-error" role="alert">
                {formError}
              </p>
            )}
            <button type="submit" className="primary-button hundred-submit">
              答えを確かめる <Icon name="check" />
            </button>
          </form>
        </section>
      )}

      {phase === "result" && (
        <section className="panel hundred-result-card">
          <span className="hundred-result-emblem">
            <Icon name={result.correct ? "trophy" : "refresh"} size={36} />
          </span>
          <p className="hundred-kicker">CHALLENGE RESULT</p>
          <h2>
            {result.variant === "practice"
              ? result.count === 0
                ? "1問目から、また挑戦しよう"
                : result.count === 100
                  ? "100問、制覇！"
                  : "ここまでの記録を保存！"
              : result.correct
                ? "せいかい！"
                : "あと一歩！"}
          </h2>
          {result.variant === "practice" && result.count === 0 ? (
            <p>
              今回はまだ正解した数がありません。挑戦した回数は記録しました。次は1問目を珠でゆっくり確かめよう。
            </p>
          ) : (
            <>
              <div className="hundred-correct-answer">
                <small>正しい答え</small>
                <strong>{result.expected.toLocaleString()}</strong>
              </div>
              <p>
                {result.course === "sequential"
                  ? `1から${result.count}までの合計`
                  : `165を${result.count}回足した合計`}
                です。
              </p>
            </>
          )}
          {result.variant === "timed" && (
            <p>
              きみの答え：<b>{result.answer.toLocaleString()}</b> ／{" "}
              {result.fullMinute ? "1分完走" : "途中終了"}
            </p>
          )}
          <div className="hundred-result-stats">
            <span>
              <strong>{result.count}</strong>到達した数
            </span>
            <span>
              <strong>{result.answeredCount}</strong>答えた回数
            </span>
            <span>
              <strong>+{result.earnedCoins}</strong>コイン
            </span>
          </div>
          <div className="hundred-result-actions">
            <button className="primary-button" onClick={start}>
              <Icon name="refresh" /> 同じコースに再挑戦
            </button>
            <button className="secondary-button" onClick={onRecords}>
              成長のきろくを見る
            </button>
            <button
              className="text-button"
              onClick={() => {
                setResult(null);
                setAnswer("");
                setCountInput("");
              }}
            >
              種目をえらぶ
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
