import { useEffect, useState } from 'react';
import { listWorksheetRecords, loadWorksheetAnswers, worksheetRows, WORKSHEET_MODE_LABELS } from '../utils/worksheetHistory';
import Icon from './Icon';
import './worksheet-records.css';

const STATUS = { correct: '正解', wrong: 'まちがい', empty: '未回答' };
const dateFormat = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const setName = id => `セット ${String(id).padStart(2, '0')}`;
function duration(record) {
  const seconds = Math.max(0, Math.floor((record.endedAt - record.startedAt) / 1000));
  return `${Math.floor(seconds / 60)}分${String(seconds % 60).padStart(2, '0')}秒`;
}

export function WorksheetResult({ record, onBack, backLabel = '100問計算にもどる' }) {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const rows = worksheetRows(record).filter(row => filter === 'all' || row.status === filter);
  const counts = { all: 100, correct: record.score, wrong: record.wrong, empty: record.empty };
  const pageCount = Math.ceil(rows.length / 10);
  return <section className="panel ws-report" aria-label="100問計算の採点結果">
    <div className="ws-report-head">
      <div><p className="ws-report-meta">{setName(record.setId)} · {WORKSHEET_MODE_LABELS[record.mode]}</p>
        <h2>100問の採点結果</h2>
        <p>{dateFormat.format(record.endedAt)}　所要時間 {duration(record)}</p>
      </div>
      <div className="ws-report-score"><strong>{record.score}</strong><span> / 100点</span></div>
    </div>
    <div className="ws-report-counts" aria-label="採点の内訳">
      <span>正解 <b>{record.score}問</b></span><span>まちがい <b>{record.wrong}問</b></span><span>未回答 <b>{record.empty}問</b></span>
    </div>
    <button className="secondary-button ws-report-back" onClick={onBack}><Icon name="back" size={16} /> {backLabel}</button>
    <h3>答案を見なおす</h3>
    <div className="ws-review-filters" role="group" aria-label="見なおす問題">
      {['all','wrong','empty','correct'].map(value => <button type="button" key={value} aria-pressed={filter === value}
        onClick={() => { setFilter(value); setPage(0); }}>{value === 'all' ? 'すべて' : STATUS[value]} <small>{counts[value]}</small></button>)}
    </div>
    {rows.length ? <>
      <ol className="ws-review-list">
        {rows.slice(page * 10, page * 10 + 10).map(row => <li key={row.number} value={row.number}>
          <div className="ws-review-id"><b>問{row.number}</b><span className={'ws-mark ' + row.status}>{STATUS[row.status]}</span></div>
          <div><strong className="ws-review-equation">{row.prompt}</strong><p>自分の答え <b>{row.given || '—'}</b>　正しい答え <b>{row.answer}</b></p></div>
        </li>)}
      </ol>
      {pageCount > 1 && <div className="ws-review-pages"><button type="button" disabled={!page} onClick={() => setPage(page - 1)}>前の10問</button>
        <span aria-live="polite">{page + 1} / {pageCount}</span><button type="button" disabled={page >= pageCount - 1} onClick={() => setPage(page + 1)}>次の10問</button></div>}
    </> : <p className="ws-report-note">この回の{STATUS[filter]}はありません。</p>}
  </section>;
}

function readHistory() {
  try { return listWorksheetRecords(); }
  catch { return { records: [], error: true }; }
}

export default function WorksheetRecords() {
  const [history, setHistory] = useState(readHistory);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('all');
  const [limit, setLimit] = useState(10);
  useEffect(() => {
    const refresh = () => setHistory(readHistory());
    window.addEventListener('storage', refresh);
    window.addEventListener('bio-battle-worksheet-recorded', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('bio-battle-worksheet-recorded', refresh);
    };
  }, []);
  function show(summary) {
    try { setSelected(loadWorksheetAnswers(summary)); setError(''); }
    catch { setError('この回の答案を読み込めませんでした。'); }
  }
  if (selected) return <WorksheetResult key={selected.id} record={selected} backLabel="100問計算の記録にもどる" onBack={() => setSelected(null)} />;
  const records = history.records.filter(r => mode === 'all' || r.mode === mode);
  return <section className="panel ws-history" aria-label="100問計算の記録">
    <div className="section-heading"><h2><Icon name="chart" /> 100問計算の記録</h2>
      {history.records.length > 0 && <label>モード <select value={mode} onChange={e => { setMode(e.target.value); setLimit(10); }}>
        <option value="all">すべて</option>{Object.entries(WORKSHEET_MODE_LABELS).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
      </select></label>}
    </div>
    {(history.error || history.unreadable > 0 || error) && <p role="alert">{error || (history.error ? 'このブラウザーの記録を読み込めませんでした。' : '一部の記録を読み込めませんでした。')}</p>}
    {records.length ? <>
      <p className="ws-report-note">{records.length}回の記録 · 最高 {records.reduce((best, r) => Math.max(best, r.score), 0)}点</p>
      <ul className="ws-history-list">{records.slice(0, limit).map(r => <li key={r.id}>
        <button type="button" onClick={() => show(r)} aria-label={`${dateFormat.format(r.endedAt)} ${setName(r.setId)} ${WORKSHEET_MODE_LABELS[r.mode]} ${r.score}点の答案を見る`}>
          <span><strong>{setName(r.setId)} · {WORKSHEET_MODE_LABELS[r.mode]}</strong><small>{dateFormat.format(r.endedAt)}　{duration(r)}</small></span>
          <span className="ws-history-open"><b>{r.score}点</b> 答案を見る ›</span>
        </button></li>)}</ul>
      {records.length > limit && <button className="secondary-button ws-report-back" onClick={() => setLimit(limit + 10)}>前の記録を表示</button>}
    </> : !history.error && <p className="ws-report-note">{history.records.length ? 'このモードの記録はまだありません。' : '100問計算を採点すると、ここから点数と答案を見返せます。'}</p>}
  </section>;
}
