import { getWorksheet } from './worksheetBank';

export const WORKSHEET_CHALLENGE_COINS = 500;

export const WORKSHEET_MODE_LABELS = {
  timed: '5分テスト', untimed: '時間無制限テスト', practice: 'ヒント付き練習',
};

const ATTEMPTS = 'bio-battle-worksheet-attempt-v1:';
const SHEETS = 'bio-battle-worksheet-sheet-v1:';

function mark(answer, expected) {
  const text = answer.normalize('NFKC').trim();
  if (!text) return 'empty';
  if (!/^\+?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return 'wrong';
  // Compare the written decimals exactly. Accept 4, 04 and 4.00 as the same number.
  const [whole, fraction = ''] = text.replace(/^\+/, '').split('.');
  const digits = whole.replace(/^0+/, '') || '0';
  const decimals = fraction.replace(/0+$/, '');
  return (decimals ? `${digits}.${decimals}` : digits) === String(expected) ? 'correct' : 'wrong';
}

function validSummary(record) {
  return record && typeof record.id === 'string' && record.id.length > 0 &&
    Number.isInteger(record.setId) && record.setId >= 1 && record.setId <= 20 &&
    Object.hasOwn(WORKSHEET_MODE_LABELS, record.mode) &&
    Number.isFinite(record.startedAt) && Number.isFinite(record.endedAt) && record.endedAt >= record.startedAt &&
    [record.score, record.wrong, record.empty].every(n => Number.isInteger(n) && n >= 0) &&
    record.score + record.wrong + record.empty === 100 &&
    Array.isArray(record.answers) && record.answers.length === 100 && record.answers.every(a => typeof a === 'string');
}

export function makeWorksheetRecord({ id, setId, mode, startedAt, endedAt, answers }) {
  const sheet = getWorksheet(setId);
  const submitted = sheet.map((_, i) => String(answers?.[i] ?? '').trim());
  const counts = { correct: 0, wrong: 0, empty: 0 };
  sheet.forEach((question, i) => { counts[mark(submitted[i], question.answer)] += 1; });
  const record = { id, setId, mode, startedAt, endedAt, answers: submitted, sheet,
    score: counts.correct, wrong: counts.wrong, empty: counts.empty, challengeCoins: WORKSHEET_CHALLENGE_COINS };
  if (!validSummary(record)) throw new Error('答案の形式を確認できません。');
  return record;
}

export function worksheetRows(record) {
  return record.sheet.map((question, i) => ({ ...question, given: record.answers[i], status: mark(record.answers[i], question.answer) }));
}

// Share a snapshot across attempts at the same set. If the bank changes in a
// later release, keep the old snapshot so earlier submissions stay reviewable.
function storeSheet(record) {
  const serialized = JSON.stringify(record.sheet);
  for (let revision = 1; ; revision++) {
    const key = `${SHEETS}${record.setId}:${revision}`;
    const existing = localStorage.getItem(key);
    if (existing === serialized) return key;
    if (existing === null) {
      localStorage.setItem(key, serialized);
      return key;
    }
  }
}

export function saveWorksheetRecord(record) {
  if (!validSummary(record)) throw new Error('答案の形式を確認できません。');
  const key = ATTEMPTS + record.id;
  const saved = localStorage.getItem(key);
  if (saved !== null) {
    const summary = JSON.parse(saved);
    if (!validSummary(summary) || summary.id !== record.id) throw new Error('保存済みの答案を読み込めません。');
    return loadWorksheetAnswers(summary);
  }
  const { sheet, ...summary } = record;
  const sheetKey = storeSheet(record);
  localStorage.setItem(key, JSON.stringify({ ...summary, sheetKey }));
  return record;
}

export function listWorksheetRecords() {
  const records = [];
  let unreadable = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(ATTEMPTS)) continue;
    const raw = localStorage.getItem(key);
    try {
      const record = JSON.parse(raw);
      if (validSummary(record) && key === ATTEMPTS + record.id && record.sheetKey?.startsWith(`${SHEETS}${record.setId}:`)) records.push(record);
      else unreadable++;
    } catch { unreadable++; }
  }
  records.sort((a, b) => b.endedAt - a.endedAt || b.startedAt - a.startedAt);
  return { records, unreadable };
}

export function loadWorksheetAnswers(summary) {
  const sheet = JSON.parse(localStorage.getItem(summary.sheetKey));
  if (!Array.isArray(sheet) || sheet.length !== 100 || !sheet.every((q, i) =>
    q?.number === i + 1 && typeof q.prompt === 'string' && Number.isFinite(q.answer) && typeof q.topic === 'string')) {
    throw new Error('この回の問題を読み込めませんでした。');
  }
  return { ...summary, sheet };
}
