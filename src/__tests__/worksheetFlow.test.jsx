import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import WorksheetScreen from '../screens/WorksheetScreen';
import WorksheetRecords from '../components/WorksheetRecords';
import { listWorksheetRecords } from '../utils/worksheetHistory';
import { getWorksheet } from '../utils/worksheetBank';

const startTime = new Date('2026-11-23T10:00:00+09:00').getTime();
const click = name => fireEvent.click(screen.getByRole('button', { name }));
const answer = (number, text) => fireEvent.change(screen.getByRole('textbox', {name: `第${number}問の答え`}), {target: {value: String(text)}});
function start(mode, setId) {
  fireEvent.change(screen.getByLabelText('問題セット'), {target: {value: String(setId)}});
  click(mode);
  click('100問をはじめる');
}
const mount = onRecorded => render(<WorksheetScreen onBack={vi.fn()} onRecords={vi.fn()} onRecorded={onRecorded} />);

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(startTime);
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe('100問計算の解答と提出', () => {
  it('keeps the original timed deadline on reload and automatically scores the saved answers once', () => {
    const recorded = vi.fn();
    const {unmount} = mount(recorded);
    start(/^5分テスト/, 20);
    expect(screen.getByRole('timer').textContent).toBe('5:00');
    answer(1, getWorksheet(20)[0].answer);
    click('次の問題へ');
    unmount();
    vi.setSystemTime(startTime + 4 * 60_000 + 59_000);
    const resumed = mount(recorded);
    expect(screen.getByRole('timer').textContent).toBe('0:01');
    expect(screen.getByRole('textbox', {name: '第2問の答え'})).toBeTruthy();
    resumed.unmount();
    vi.setSystemTime(startTime + 8 * 60_000);
    mount(recorded);
    expect(screen.getByRole('heading', {name: '100問の採点結果'})).toBeTruthy();
    expect(recorded).toHaveBeenCalledTimes(1);
    expect(listWorksheetRecords().records).toHaveLength(1);
    expect(listWorksheetRecords().records[0]).toMatchObject({mode:'timed', setId:20, score:1, empty:99, endedAt:startTime + 300_000});
  });

  it('revisits a skipped answer in an unlimited test and leaves an inspectable graded submission', () => {
    const view = mount(vi.fn());
    const set = getWorksheet(12);
    start(/^時間無制限テスト/, 12);
    click('スキップ');
    answer(2, set[1].answer + 1);
    click('次の問題へ');
    click('問題一覧');
    click('第1問・未回答');
    answer(1, set[0].answer);
    expect(listWorksheetRecords().records).toHaveLength(0);
    expect(screen.queryByRole('heading',{name:'100問の採点結果'})).toBeNull();
    vi.setSystemTime(startTime + 6 * 60_000);
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(screen.getByRole('timer').textContent).toBe('6:00');
    click('採点に進む');
    expect(screen.getByText(/未回答は98問/)).toBeTruthy();
    click('採点する');
    expect(listWorksheetRecords().records[0]).toMatchObject({mode:'untimed', score:1, wrong:1, empty:98});
    view.unmount();
    render(<WorksheetRecords />);
    click(/セット 12.*1点の答案を見る/);
    click('まちがい 1');
    const row = within(screen.getByRole('list')).getByRole('listitem');
    expect(row.textContent).toContain(set[1].prompt);
    expect(row.textContent).toContain(`自分の答え ${set[1].answer + 1}`);
    expect(row.textContent).toContain(`正しい答え ${set[1].answer}`);
  });

  it('archives the timed worksheet exactly once at five minutes while the records screen is open', () => {
    const onRecorded = vi.fn();
    const appView = active => <>
      <WorksheetScreen active={active} onBack={vi.fn()} onRecords={vi.fn()} onRecorded={onRecorded} />
      {!active && <WorksheetRecords />}
    </>;
    const view = render(appView(true));
    start(/^5分テスト/, 19);
    answer(1, getWorksheet(19)[0].answer);
    view.rerender(appView(false));
    act(() => { vi.advanceTimersByTime(299_999); });
    expect(screen.queryByRole('button', {name: /答案を見る/})).toBeNull();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.getByRole('button', {name: /セット 19.*1点の答案を見る/})).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(120_000);
      document.dispatchEvent(new Event('visibilitychange'));
    });
    view.rerender(appView(true));
    const { records } = listWorksheetRecords();
    expect(records).toHaveLength(1);
    expect(records[0].endedAt - records[0].startedAt).toBe(300_000);
    expect(onRecorded).toHaveBeenCalledTimes(1);
  });

  it('allows practice hints without grading until submission or imposing a five-minute limit', () => {
    const {unmount} = mount(vi.fn());
    start(/^ヒント付き練習/, 1);
    fireEvent.click(screen.getByText('考え方のヒント'));
    expect(screen.getByText(/10や100になるペア/)).toBeTruthy();
    answer(1, getWorksheet(1)[0].answer);
    click('次の問題へ');
    unmount();
    vi.setSystemTime(startTime + 10 * 60_000);
    mount(vi.fn());
    expect(screen.getByRole('timer').textContent).toBe('10:00');
    expect(screen.getByRole('textbox', {name:'第2問の答え'})).toBeTruthy();
    expect(listWorksheetRecords().records).toHaveLength(0);
    click('採点に進む'); click('採点する');
    expect(listWorksheetRecords().records[0]).toMatchObject({mode:'practice', score:1, empty:99});
  });
});
