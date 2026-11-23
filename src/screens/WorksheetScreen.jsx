import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "../components/Icon";
import { WorksheetResult } from "../components/WorksheetRecords";
import { getWorksheet } from "../utils/worksheetBank";
import { makeWorksheetRecord, saveWorksheetRecord, WORKSHEET_CHALLENGE_COINS } from "../utils/worksheetHistory";
import "./worksheet.css";

const DRAFT_KEY = "bio-battle-worksheet-draft-v1";
const LIMIT = 5 * 60 * 1000;
const MODES = {
  timed: ["5分テスト", "5分たつと自動で丸つけ", "clock"],
  untimed: ["時間無制限テスト", "自分のペースで100問", "compass"],
  practice: ["ヒント付き練習", "時間無制限・考え方を確認", "abacus"],
};
const formatSet = (id) => String(id).padStart(2, "0");
const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

function decodeDraft(raw) {
  try {
    const saved = JSON.parse(raw);
    if (saved && typeof saved.id === "string" && Object.hasOwn(MODES, saved.mode)
      && Number.isInteger(saved.setId) && saved.setId >= 1 && saved.setId <= 20
      && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < 100
      && Number.isFinite(saved.startedAt) && saved.startedAt > 0
      && (saved.endedAt == null || Number.isFinite(saved.endedAt))
      && Array.isArray(saved.answers) && saved.answers.length === 100
      && saved.answers.every((a) => typeof a === "string" && a.length <= 12)) {
      return saved;
    }
  } catch { /* A new attempt can still be started without a saved draft. */ }
  return null;
}

function readDraft() {
  try { return decodeDraft(localStorage.getItem(DRAFT_KEY)); }
  catch { return null; }
}

function practiceHint(number) {
  if (number <= 5) return "10や100になるペアを思い出そう。分かっている数を全体から引くと、□が見つかるよ。";
  if (number <= 10 || (number >= 16 && number <= 25) || (number >= 56 && number <= 60)) return "位をそろえて足そう。□が足す数なら、合計からもう一方の数を引いてみよう。";
  if (number <= 15 || (number >= 26 && number <= 35) || (number >= 61 && number <= 65)) return "引き算は、答えと引く数を足すと元の数になるよ。□がどの場所にあるかを見てみよう。";
  if ((number >= 36 && number <= 45) || (number >= 76 && number <= 78)) return "かけられる数を位ごとに分けてかけ、最後に合わせよう。かける数が□なら、積をもう一方の数で割ろう。";
  if (number >= 66 && number <= 75) return "一の位と小数第一位をそろえよう。小数点を同じ位置に置くと、整数の足し引きと同じように考えられるよ。";
  if (number >= 82 && number <= 85) return "割る数 × 商 ＋ あまり ＝ 割られる数。この式に、分かっている数を当てはめよう。";
  if (number === 100) return "左のかけ算をして、そこから右辺の数を引こう。それがわり算の商になるよ。";
  if (number >= 86) return "かけ算・割り算を先に、同じ優先順位なら左から順に計算しよう。";
  return "割る数 × 商 ＝ 割られる数。商の見当をつけて、かけ算で確かめよう。";
}

export default function WorksheetScreen({ active = true, onBack, onRecords, onRecorded }) {
  const [draft, setDraft] = useState(readDraft);
  const current = useRef(draft);
  const lastSaved = useRef(draft ? JSON.stringify(draft) : null);
  const [mode, setMode] = useState("timed");
  const [setId, setSetId] = useState(1);
  const [now, setNow] = useState(Date.now);
  const [confirm, setConfirm] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [storageError, setStorageError] = useState("");
  const inputRef = useRef(null);
  const recordedCallback = useRef(onRecorded);
  useEffect(() => { recordedCallback.current = onRecorded; }, [onRecorded]);
  const questionSet = useMemo(() => draft ? getWorksheet(draft.setId) : null, [draft?.setId]);
  const question = questionSet?.[draft?.index];
  const deadline = draft?.mode === "timed" ? draft.startedAt + LIMIT : null;
  const answered = draft?.answers.filter((a) => a.trim() !== "").length || 0;

  // A tab that was left in the background must adopt the latest saved answer
  // before it can change the draft or submit it.
  const syncDraft = useCallback(() => {
    let saved;
    try { saved = decodeDraft(localStorage.getItem(DRAFT_KEY)); }
    catch { return true; }
    const snapshot = saved ? JSON.stringify(saved) : null;
    if (snapshot === lastSaved.current) return true;
    lastSaved.current = snapshot;
    current.current = saved;
    setDraft(saved);
    setConfirm(false);
    setMapOpen(false);
    return false;
  }, []);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === DRAFT_KEY || event.key === null) syncDraft();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [syncDraft]);

  const writeDraft = useCallback((next) => {
    current.current = next;
    setDraft(next);
    try {
      const snapshot = JSON.stringify(next);
      localStorage.setItem(DRAFT_KEY, snapshot);
      lastSaved.current = snapshot;
      setStorageError("");
    } catch {
      setStorageError("途中の答案を保存できません。この画面を開いたまま続けてください。");
    }
  }, []);

  const archive = useCallback((record) => {
    let saved;
    try {
      saved = saveWorksheetRecord(record) ?? record;
    } catch {
      setStorageError("この答案を端末に保存できませんでした。この画面から保存をやり直せます。");
      setResult(record);
      return;
    }
    // Another tab may already have started the next worksheet.
    try {
      if (readDraft()?.id === saved.id) localStorage.removeItem(DRAFT_KEY);
    } catch { /* The recorded ID is idempotent if a stale draft remains. */ }
    current.current = null;
    lastSaved.current = null;
    setDraft(null);
    setStorageError("");
    setResult(saved);
    recordedCallback.current?.(saved);
    window.dispatchEvent(new Event("bio-battle-worksheet-recorded"));
  }, []);

  const finish = useCallback(() => {
    if (!syncDraft()) return;
    const active = current.current;
    if (!active) return;
    const stop = active.endedAt ?? (active.mode === "timed"
      ? Math.min(Date.now(), active.startedAt + LIMIT) : Date.now());
    const frozen = { ...active, endedAt: Math.max(active.startedAt, stop) };
    if (active.endedAt == null) writeDraft(frozen);
    setConfirm(false);
    setMapOpen(false);
    archive(makeWorksheetRecord(frozen));
  }, [writeDraft, archive, syncDraft]);

  useEffect(() => {
    if (!draft || result) return;
    if (draft.endedAt != null) {
      finish();
      return;
    }
    if (!active && deadline == null) return;
    const tick = () => {
      const time = Date.now();
      if (active) setNow(time);
      if (deadline != null && time >= deadline) finish();
    };
    tick();
    const timer = active ? window.setInterval(tick, 500) : window.setTimeout(tick, Math.max(0, deadline - Date.now()));
    document.addEventListener("visibilitychange", tick);
    return () => {
      if (active) clearInterval(timer);
      else clearTimeout(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [active, draft?.id, draft?.endedAt, deadline, finish, result]);

  useEffect(() => {
    if (active && !confirm && !mapOpen && draft && draft.endedAt == null) {
      inputRef.current?.focus({ preventScroll: true });
      inputRef.current?.select();
    }
  }, [active, draft?.id, draft?.index, confirm, mapOpen]);

  function start() {
    if (!syncDraft()) return;
    const startedAt = Date.now();
    setNow(startedAt);
    setConfirm(false);
    setMapOpen(false);
    writeDraft({
      id: globalThis.crypto?.randomUUID?.() ?? `sheet-${startedAt}-${Math.random().toString(36).slice(2)}`,
      startedAt, setId, mode, index: 0, answers: Array(100).fill(""),
    });
  }

  function edit(changes) {
    if (!syncDraft()) return;
    const active = current.current;
    if (!active || active.endedAt != null) return;
    if (active.mode === "timed" && Date.now() >= active.startedAt + LIMIT) {
      finish();
      return;
    }
    writeDraft({ ...active, ...changes });
  }

  function go(index) {
    edit({ index });
    setMapOpen(false);
    setConfirm(false);
  }

  function advance() {
    if (draft.index < 99) go(draft.index + 1);
    else setConfirm(true);
  }

  if (!active) return null;

  if (result) {
    function returnToMenu() {
      if (storageError) {
        archive(result);
        return;
      }
      setResult(null);
      syncDraft();
    }
    return (
      <>
        {storageError && (
          <div className="ws-page ws-alert" role="alert">
            <p>{storageError}</p>
            <button className="secondary-button" onClick={() => archive(result)}>答案をもう一度保存</button>
          </div>
        )}
        <WorksheetResult record={result} saved={!storageError} onBack={returnToMenu}
          backLabel={storageError ? "答案をもう一度保存する" : "100問計算にもどる"} />
      </>
    );
  }

  if (!draft) {
    return (
      <section className="ws-page ws-setup">
        <header className="ws-heading">
          <div>
            <h1>100問計算</h1>
            <p>100問ずつ全20セット。整数・小数・あまりのある割り算を解いて、最後にまとめて丸つけします。</p>
          </div>
          <button className="secondary-button" onClick={onRecords}><Icon name="chart" size={17} />過去の答案</button>
        </header>
        <div className="ws-setup-panel panel">
          <label htmlFor="ws-set">問題セット</label>
          <select id="ws-set" value={setId} onChange={(e) => setSetId(Number(e.target.value))}>
            {Array.from({ length: 20 }, (_, i) => <option key={i} value={i + 1}>セット {formatSet(i + 1)}</option>)}
          </select>
          <fieldset className="ws-modes">
            <legend>解き方を選ぶ</legend>
            {Object.entries(MODES).map(([key, [label, description, icon]]) => (
              <button key={key} type="button" aria-pressed={mode === key} onClick={() => setMode(key)}>
                <Icon name={icon} size={22} />
                <span><strong>{label}</strong><small>{description}</small></span>
              </button>
            ))}
          </fieldset>
          <p className="ws-bonus-note">採点すると、正解分のコインに加えて毎回{WORKSHEET_CHALLENGE_COINS}コインもらえます。</p>
          <button className="primary-button ws-start" onClick={start}>100問をはじめる <Icon name="arrow" size={18} /></button>
        </div>
        <button className="text-button" onClick={onBack}><Icon name="back" size={16} />冒険基地へ</button>
      </section>
    );
  }

  const value = draft.answers[draft.index];
  const remaining = deadline == null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));
  const incomplete = draft.answers.findIndex((a) => !a.trim());
  const [before, after] = question.prompt.split("□");
  return (
    <section className="ws-page">
      <header className="ws-attempt-head">
        <div><h1>100問計算</h1><p>セット {formatSet(draft.setId)} · {MODES[draft.mode][0]}</p></div>
        <div className={`ws-clock ${remaining != null && remaining <= 30 ? "ws-clock-low" : ""}`}>
          <small>{remaining == null ? "経過時間" : "残り時間"}</small>
          <strong role="timer">{clock(remaining ?? Math.max(0, Math.floor((now - draft.startedAt) / 1000)))}</strong>
        </div>
      </header>
      {storageError && <p className="ws-alert" role="alert">{storageError}</p>}
      <div className="ws-progress"><span>回答済み <b>{answered}</b> / 100問</span><progress value={answered} max={100} aria-label="回答済みの問題数" /></div>
      {confirm ? (
        <section className="ws-confirm panel" aria-labelledby="ws-confirm-title">
          <h2 id="ws-confirm-title">答案を提出しますか？</h2>
          <p>{answered === 100 ? "全100問に答えました。" : `未回答は${100 - answered}問です。未回答は0点として採点します。`}</p>
          <button className="primary-button" onClick={finish}>採点する</button>
          {incomplete >= 0 && <button className="secondary-button" onClick={() => go(incomplete)}>未回答の問題へ戻る</button>}
          <button className="text-button" onClick={() => setConfirm(false)}>解答を続ける</button>
        </section>
      ) : (
        <>
          <form className="ws-sheet" onSubmit={(event) => { event.preventDefault(); if (value.trim()) advance(); }}>
            <div className="ws-sheet-head">
              <strong>第 {question.number} 問</strong><small>{question.topic}</small>
            </div>
            <div className="ws-equation" aria-label={question.prompt}>
              <span>{before}</span><span className="ws-blank" aria-hidden="true">□</span><span>{after}</span>
            </div>
            <label className="ws-answer-label" htmlFor="ws-answer">□ に入る数</label>
            <input id="ws-answer" ref={inputRef} type="text" inputMode="decimal" enterKeyHint="next"
              aria-label={`第${question.number}問の答え`} autoComplete="off" maxLength={12}
              value={value} onChange={(event) => {
                const answers = [...draft.answers];
                answers[draft.index] = event.target.value;
                edit({ answers });
              }} />
            {draft.mode === "practice" && (
              <details key={question.number} className="ws-hint"><summary>考え方のヒント</summary><p>{practiceHint(question.number)}</p></details>
            )}
            <div className="ws-answer-actions">
              <button type="button" className="ws-skip" onClick={advance} disabled={!!value.trim()}>スキップ</button>
              <button type="submit" className="primary-button" disabled={!value.trim()}>{draft.index === 99 ? "答案を見直す" : "次の問題へ"}<Icon name="arrow" size={16} /></button>
            </div>
          </form>
          <div className="ws-jump">
            <button className="secondary-button" disabled={draft.index === 0} onClick={() => go(draft.index - 1)}><Icon name="back" size={15} />前の問題</button>
            <button className="secondary-button" aria-expanded={mapOpen} onClick={() => setMapOpen(!mapOpen)}>問題一覧</button>
            <button className="text-button" onClick={() => setConfirm(true)}>採点に進む</button>
          </div>
          {mapOpen && (
            <section className="ws-map panel" aria-label="問題一覧">
              <h2>問題番号を選ぶ</h2>
              <p>● 回答済み　○ 未回答</p>
              <div>{draft.answers.map((answer, i) => (
                <button key={i} className={answer.trim() ? "ws-filled" : ""} aria-current={i === draft.index ? "step" : undefined}
                  aria-label={`第${i + 1}問・${answer.trim() ? "回答済み" : "未回答"}`} onClick={() => go(i)}>
                  <small aria-hidden="true">{answer.trim() ? "●" : "○"}</small> {i + 1}
                </button>
              ))}</div>
            </section>
          )}
        </>
      )}
    </section>
  );
}
