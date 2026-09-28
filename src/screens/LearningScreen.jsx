import { useState, useRef } from "react";
import Icon from "../components/Icon";
import Soroban from "../components/Soroban";
import {
  MODES,
  generateLearningProblem,
  sessionReward,
  asset,
} from "../utils/learning";
import { playCorrect, playWrong, playPerfect } from "../utils/sound";

export default function LearningScreen({
  state,
  initialMode = "soroban",
  zone,
  onBack,
  onFinish,
  onFlash,
  onHundred,
}) {
  const [mode, setMode] = useState(initialMode),
    [difficulty, setDifficulty] = useState(zone?.difficulty || 1);
  const [phase, setPhase] = useState("setup"),
    [questions, setQuestions] = useState([]),
    [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(""),
    [beads, setBeads] = useState(0),
    [rows, setRows] = useState([]);
  const [feedback, setFeedback] = useState(null),
    [hint, setHint] = useState(false),
    [visible, setVisible] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const sessionRef = useRef(null),
    locked = useRef(false);
  const q = questions[index],
    isSoroban = mode === "soroban" && !zone;
  function start(overrideQuestions) {
    const list =
      overrideQuestions ||
      (mode === "review"
        ? state.learning.mistakes.slice(0, 5)
        : Array.from({ length: 5 }, (_, i) =>
            generateLearningProblem(mode, difficulty, i),
          ));
    if (!list.length) return;
    sessionRef.current = { id: crypto.randomUUID(), start: Date.now() };
    locked.current = false;
    setQuestions(list);
    setIndex(0);
    setRows([]);
    setAnswer("");
    setBeads(isSoroban ? list[0].a : 0);
    setFeedback(null);
    setHint(false);
    setReceipt(null);
    setPhase("play");
  }
  function submit(event) {
    event?.preventDefault();
    if (locked.current || feedback || (!isSoroban && !/^\d+$/.test(answer)))
      return;
    locked.current = true;
    const value = isSoroban ? beads : Number(answer),
      correct = value === q.answer;
    const row = { problem: q, given: value, correct, helped: hint };
    setRows((prev) => [...prev, row]);
    setFeedback(row);
    if (correct) playCorrect();
    else playWrong();
  }
  function next() {
    if (!feedback || locked.current === "finished") return;
    if (index + 1 === questions.length) {
      locked.current = "finished";
      const firstClear =
        !!zone &&
        rows.filter((r) => r.correct).length >= 4 &&
        !(state.learning.quests[zone.id] >= 4);
      setReceipt({
        coins: sessionReward(rows) + (firstClear ? 100 : 0),
        firstClear,
      });
      onFinish({
        id: sessionRef.current.id,
        mode: zone ? "quest" : mode,
        zoneId: zone?.id,
        difficulty,
        rows,
        seconds: Math.round((Date.now() - sessionRef.current.start) / 1000),
      });
      if (rows.every((r) => r.correct)) playPerfect();
      setPhase("result");
      return;
    }
    locked.current = false;
    setIndex((i) => i + 1);
    setAnswer("");
    setBeads(isSoroban ? questions[index + 1].a : 0);
    setFeedback(null);
    setHint(false);
  }
  const title = zone ? zone.title : MODES[mode].name;
  return (
    <div className="learning-page">
      <button className="text-button back-button" onClick={onBack}>
        <Icon name="back" size={17} /> {zone ? "冒険マップへ" : "冒険基地へ"}
        {phase === "play" ? "（この回の記録は残りません）" : ""}
      </button>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {zone ? "EXPEDITION CHALLENGE" : "TRAINING LAB"}
          </p>
          <h1>{title}</h1>
          <p>
            {zone ? "5問中4問せいかいで、エリアクリア。" : MODES[mode].caption}
          </p>
        </div>
        <span className="edition-tag">
          <Icon name="clock" size={15} />
          時間制限なし
        </span>
      </div>
      {phase === "setup" && (
        <>
          {!zone && (
            <div className="mode-tabs" role="group" aria-label="練習モード">
              {["soroban", "mental", "bonds", "review"].map((m) => (
                <button
                  key={m}
                  aria-pressed={mode === m}
                  className={mode === m ? "selected" : ""}
                  onClick={() => {
                    setMode(m);
                    if (m === "bonds" && difficulty > 2) setDifficulty(1);
                  }}
                >
                  <Icon name={MODES[m].icon} />
                  {MODES[m].name}
                  {m === "review" && (
                    <small>{state.learning.mistakes.length}</small>
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="training-setup-grid">
            <section className="panel setup-panel">
              {zone && (
                <img
                  className="setup-zone-image"
                  src={asset(zone.image)}
                  alt={zone.title}
                />
              )}
              <span className="large-mode-icon">
                <Icon name={zone ? "compass" : MODES[mode].icon} size={36} />
              </span>
              <h2>
                {zone
                  ? "計算の力で、道をひらこう。"
                  : mode === "review"
                    ? "もう一度、できるまで。"
                    : "きみのペースで、はじめよう。"}
              </h2>
              <p>
                {isSoroban
                  ? "最初の数を珠で用意してあるよ。たしたり、ひいたりして答えを作ろう。"
                  : mode === "review"
                    ? "まちがえた問題を最大5問ずつ。せいかいしたら、リストから卒業！"
                    : "答えを自分で入力しよう。ヒントを使っても大丈夫。"}
              </p>
              {!zone && mode !== "review" && (
                <>
                  <h3>むずかしさ</h3>
                  <div
                    className="difficulty-options"
                    role="group"
                    aria-label="むずかしさ"
                  >
                    {(mode === "bonds" ? [1, 2] : [1, 2, 3]).map((d) => (
                      <button
                        key={d}
                        aria-pressed={difficulty === d}
                        className={difficulty === d ? "selected" : ""}
                        onClick={() => setDifficulty(d)}
                      >
                        <span>
                          {mode === "bonds"
                            ? `${d === 1 ? 5 : 10}のなかま`
                            : `${d}けた`}
                        </span>
                        <small>
                          {
                            ["はじめの一歩", "ステップアップ", "チャレンジ"][
                              d - 1
                            ]
                          }
                        </small>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {mode === "review" && !state.learning.mistakes.length ? (
                <div className="empty-state">
                  <Icon name="check" />
                  <strong>いまは復習する問題がありません。</strong>
                  <p>ほかの練習で、新しい問題に挑戦しよう。</p>
                  <button
                    className="primary-button"
                    onClick={() => setMode("mental")}
                  >
                    暗算にチャレンジ
                  </button>
                </div>
              ) : (
                <button
                  className="primary-button start-training"
                  onClick={() => start()}
                >
                  <Icon name="bolt" />
                  {mode === "review"
                    ? `${Math.min(5, state.learning.mistakes.length)}問にもう一度挑戦`
                    : "5問のチャレンジをはじめる"}
                  <Icon name="arrow" />
                </button>
              )}
              <p className="reward-note">
                せいかい1問につき 20コイン。最後まで解くと記録されます。
              </p>
            </section>
            <aside className="panel coach-panel">
              <p className="eyebrow">EXPLORER'S GUIDE</p>
              <h2>
                「わかった！」を
                <br />
                ひとつずつ。
              </h2>
              <div className="coach-step">
                <b>01</b>
                <div>
                  <strong>あせらず考えよう</strong>
                  <p>新しい練習には時間制限がありません。</p>
                </div>
              </div>
              <div className="coach-step">
                <b>02</b>
                <div>
                  <strong>ヒントは、使っていい</strong>
                  <p>数を分けるコツや、珠の考え方を見てみよう。</p>
                </div>
              </div>
              <div className="coach-step">
                <b>03</b>
                <div>
                  <strong>まちがえても、前へ</strong>
                  <p>解き方を確かめて、リベンジすれば大丈夫。</p>
                </div>
              </div>
              {!zone && (
                <>
                  <button
                    className="secondary-button full-width"
                    onClick={onHundred}
                  >
                    <Icon name="abacus" />
                    1〜100 そろばんロードはこちら
                  </button>
                  <button
                    className="secondary-button full-width"
                    onClick={onFlash}
                  >
                    <Icon name="bolt" />
                    フラッシュ暗算はこちら
                  </button>
                </>
              )}
              {zone && (
                <div className="quest-prize">
                  <Icon name="gift" />
                  <strong>初回クリア特典</strong>
                  <p>{zone.creature}のカード ＋ 100コイン</p>
                </div>
              )}
            </aside>
          </div>
        </>
      )}
      {phase === "play" && q && (
        <div className="play-layout">
          <section className="panel question-panel">
            <div className="question-top">
              <span>
                QUESTION <b>{String(index + 1).padStart(2, "0")}</b>
                <small> / {questions.length}</small>
              </span>
              <span className="small-badge">
                {zone ? "QUEST" : isSoroban ? "SOROBAN" : "TRAINING"}
              </span>
            </div>
            <div className="question-progress">
              {questions.map((_, i) => (
                <span
                  key={i}
                  className={
                    i < index ? "complete" : i === index ? "current" : ""
                  }
                />
              ))}
            </div>
            {zone && (
              <div
                className="quest-battle-strip"
                style={{ backgroundImage: `url(${asset(zone.image)})` }}
              >
                <strong>遺跡のゲートをひらこう</strong>
                <span>
                  エネルギー {rows.filter((r) => r.correct).length} / 4
                </span>
                <div className="tiny-progress">
                  <i
                    style={{
                      width: `${Math.min(100, (rows.filter((r) => r.correct).length / 4) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
            <p className="question-instruction">
              {q.mode === "bonds"
                ? "□ に入る数は？"
                : isSoroban
                  ? "珠をうごかして答えを作ろう"
                  : "答えは、いくつ？"}
            </p>
            <div className="math-question" data-testid="math-question">
              {q.prompt}
              {q.mode !== "bonds" && <span>＝ ?</span>}
            </div>
            {isSoroban ? (
              <>
                <Soroban
                  value={beads}
                  onChange={setBeads}
                  disabled={!!feedback}
                  showValue={visible}
                />
                <div className="soroban-controls">
                  <button
                    className="text-button"
                    disabled={!!feedback}
                    onClick={() => setBeads(q.a)}
                  >
                    最初の数にもどす
                  </button>
                  <label>
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={(e) => setVisible(e.target.checked)}
                    />
                    珠の数を表示
                  </label>
                </div>
                {!feedback && (
                  <button
                    className="primary-button answer-button"
                    onClick={submit}
                  >
                    この数でこたえる <Icon name="check" />
                  </button>
                )}
              </>
            ) : (
              <form onSubmit={submit}>
                <label className="answer-label" htmlFor="math-answer">
                  きみの答え
                </label>
                <input
                  id="math-answer"
                  className="answer-input"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  value={answer}
                  readOnly={!!feedback}
                  onChange={(e) =>
                    setAnswer(e.target.value.replace(/[^0-9]/g, "").slice(0, 5))
                  }
                  placeholder="?"
                />
                <div className="number-pad">
                  {[
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "クリア",
                    "0",
                    "⌫",
                  ].map((n) => (
                    <button
                      type="button"
                      key={n}
                      disabled={!!feedback}
                      aria-label={n === "⌫" ? "1文字消す" : n}
                      onClick={() =>
                        setAnswer((a) =>
                          n === "クリア"
                            ? ""
                            : n === "⌫"
                              ? a.slice(0, -1)
                              : (a + n).slice(0, 5),
                        )
                      }
                    >
                      {n}
                    </button>
                  ))}
                </div>
                {!feedback && (
                  <button
                    className="primary-button answer-button"
                    type="submit"
                    disabled={!answer}
                  >
                    こたえあわせ <Icon name="check" />
                  </button>
                )}
              </form>
            )}
            {!feedback && (
              <button
                className="text-button hint-button"
                aria-expanded={hint}
                onClick={() => setHint((v) => !v)}
              >
                <Icon name="spark" size={17} />
                {hint ? "ヒントをとじる" : "考え方のヒント"}
              </button>
            )}
            {hint && !feedback && <p className="hint-box">{q.hint}</p>}
            {feedback && (
              <div
                className={`answer-feedback ${feedback.correct ? "correct" : "retry"}`}
                role="status"
              >
                <strong>
                  <Icon name={feedback.correct ? "check" : "refresh"} />
                  {feedback.correct
                    ? "せいかい！ その調子。"
                    : "だいじょうぶ。一緒にたしかめよう。"}
                </strong>
                {!feedback.correct && (
                  <p>
                    きみの答え {feedback.given} → せいかいは <b>{q.answer}</b>
                  </p>
                )}
                <p>{q.explanation}</p>
                <button className="primary-button full-width" onClick={next}>
                  {index + 1 === questions.length
                    ? "結果をみる"
                    : "つぎの問題へ"}
                  <Icon name="arrow" />
                </button>
              </div>
            )}
          </section>
          <aside className="panel session-side">
            <Icon name="trophy" size={30} />
            <h2>きみのチャレンジ</h2>
            <div className="session-count">
              <b>{rows.filter((r) => r.correct).length}</b>
              <span>せいかい</span>
            </div>
            <p>
              スピードよりも、
              <br />
              ひとつずつ「わかる」を大切に。
            </p>
            <div className="session-answer-list">
              {rows.map((r, i) => (
                <div key={i}>
                  <span>
                    {r.correct ? "✓" : "↻"} {r.problem.prompt}
                  </span>
                  <b>{r.problem.answer}</b>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
      {phase === "result" && (
        <section className="panel result-panel">
          <span className="result-emblem">
            <Icon name="trophy" size={48} />
          </span>
          <p className="eyebrow">CHALLENGE COMPLETE</p>
          <h2>
            {rows.every((r) => r.correct)
              ? "パーフェクト！"
              : zone && rows.filter((r) => r.correct).length < 4
                ? "もう少しで、道がひらく！"
                : "よくがんばったね！"}
          </h2>
          <p>
            {zone
              ? rows.filter((r) => r.correct).length >= 4
                ? "エリアクリア！ 冒険マップを見てみよう。"
                : "4問せいかいでクリア。解き方を確かめて、もう一度！"
              : "またひとつ、きみの力になった。"}
          </p>
          <div className="result-stats">
            <div>
              <strong>
                {rows.filter((r) => r.correct).length}
                <small> / {rows.length}</small>
              </strong>
              <span>せいかい</span>
            </div>
            <div>
              <strong>+{receipt?.coins}</strong>
              <span>コイン</span>
            </div>
            <div>
              <strong>
                +{rows.filter((r) => r.correct).length * 20 + rows.length * 5}
              </strong>
              <span>経験値</span>
            </div>
          </div>
          {receipt?.firstClear && (
            <div className="hint-box">
              新しい仲間「{zone.creature}」が図鑑に加わった！
            </div>
          )}
          <div className="result-review">
            {rows.map((r, i) => (
              <details key={i}>
                <summary>
                  <span className={r.correct ? "lime-text" : "amber-text"}>
                    {r.correct ? "✓" : "↻"}
                  </span>{" "}
                  {r.problem.prompt} <b>答え {r.problem.answer}</b>
                </summary>
                <p>{r.problem.explanation}</p>
              </details>
            ))}
          </div>
          <div className="result-actions">
            <button
              className="primary-button"
              onClick={() =>
                mode === "review" && !state.learning.mistakes.length
                  ? setPhase("setup")
                  : start()
              }
            >
              <Icon name="refresh" />
              {mode === "review" && !state.learning.mistakes.length
                ? "練習をえらぶ"
                : "もう一度チャレンジ"}
            </button>
            <button className="secondary-button" onClick={onBack}>
              {zone ? "冒険マップへ" : "冒険基地へ"}
              <Icon name="arrow" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
