import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { getWorksheet } from '../utils/worksheetBank';
import { makeWorksheetRecord, saveWorksheetRecord, listWorksheetRecords, loadWorksheetAnswers } from '../utils/worksheetHistory';
import WorksheetRecords from '../components/WorksheetRecords';

function attempt(id = 'first', answers = getWorksheet(2).map(q => String(q.answer))) {
  return makeWorksheetRecord({ id, setId: 2, mode: 'timed', startedAt: 1000000, endedAt: 1300000, answers });
}

beforeEach(() => { localStorage.clear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('100問計算の成績', () => {
  it('awards one point per correct answer and accepts equivalent decimals and full-width digits', () => {
    const answers = getWorksheet(2).map(q => String(q.answer));
    expect(attempt('perfect', answers).score).toBe(100);
    const decimal = answers.findIndex(s => s.includes('.'));
    answers[decimal] = (answers[decimal] + '0').replace(/[\d.]/g, c => String.fromCharCode(c.charCodeAt(0) + 65248));
    answers[0] = ''; answers[1] = `0x${Number(answers[1]).toString(16)}`;
    const record = attempt('imperfect', answers);
    expect([record.score, record.wrong, record.empty]).toEqual([98, 1, 1]);
    expect(attempt('blank', []).empty).toBe(100);
  });

  it('retains the submitted sheet and answers, isolates attempts, and tolerates a repeated submission', () => {
    const record = attempt(); saveWorksheetRecord(record);
    expect(saveWorksheetRecord(attempt('first', [])).score).toBe(100);
    const next = attempt('second', []); next.endedAt += 1000; saveWorksheetRecord(next);
    expect(localStorage.length).toBe(3); // two attempts share one sheet
    const { records } = listWorksheetRecords();
    expect(records.map(r => r.id)).toEqual(['second', 'first']);
    expect(loadWorksheetAnswers(records[1]).sheet).toEqual(record.sheet);
    expect(loadWorksheetAnswers(records[0]).answers).toEqual(Array(100).fill(''));
    const revised = attempt('revised');
    revised.sheet = revised.sheet.map((q,i) => i === 0 ? { ...q, topic: '新しい分類' } : q);
    saveWorksheetRecord(revised);
    expect(loadWorksheetAnswers(records[1]).sheet[0].topic).toBe(record.sheet[0].topic);
  });

  it('exposes storage failure and keeps previous attempts readable', () => {
    saveWorksheetRecord(attempt());
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('容量不足'); });
    expect(() => saveWorksheetRecord(attempt('next'))).toThrow('容量不足');
    setItem.mockRestore(); expect(listWorksheetRecords().records).toHaveLength(1);
    localStorage.setItem('bio-battle-worksheet-attempt-v1:damaged', '{');
    expect(listWorksheetRecords().unreadable).toBe(1);
    expect(listWorksheetRecords().records).toHaveLength(1);
  });

  it('reopens an old test and shows wrong answers and skipped problems separately', () => {
    const record = attempt('review', ['9999']);
    saveWorksheetRecord(record); render(<WorksheetRecords />);
    fireEvent.click(screen.getByRole('button', { name: /セット 02.*答案を見る/ }));
    fireEvent.click(screen.getByRole('button', { name: 'まちがい 1' }));
    const rows = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(rows).toHaveLength(1); expect(rows[0].textContent).toContain(record.sheet[0].prompt);
    expect(rows[0].textContent).toContain('9999');
    fireEvent.click(screen.getByRole('button', { name: '未回答 99' }));
    expect(within(screen.getByRole('list')).getAllByRole('listitem')[0].textContent).toContain('問2');
    fireEvent.click(screen.getByRole('button', { name: '次の10問' }));
    expect(within(screen.getByRole('list')).getAllByRole('listitem')[0].textContent).toContain('問12');
  });
});
