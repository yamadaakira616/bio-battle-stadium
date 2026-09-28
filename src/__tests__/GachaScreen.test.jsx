import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import GachaScreen from '../screens/GachaScreen.jsx';

vi.mock('../data/stickers.js', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    isLegendaryConfirm: () => false,
    rollGacha: () => actual.STICKERS.find(sticker => sticker.id === 'new-thunder-stag-knight'),
  };
});

vi.mock('../utils/sound.js', () => ({
  playGachaTick: vi.fn(),
  playGachaSlowTick: vi.fn(),
  playGachaReveal: vi.fn(),
  playGachaFlash: vi.fn(),
}));

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('召喚ガチャ', () => {
  it('新しい12体を紹介し、図鑑の発見数を表示する', () => {
    const { container } = render(<GachaScreen state={{ coins: 500, collection: {} }} onBack={() => {}} onPull={() => ({ isNew: true })} />);
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('/ 208 体 発見')).toBeTruthy();
    expect(container.querySelectorAll('.gacha-featured-card')).toHaveLength(12);
    expect(screen.getByText('雷のクワガタ騎士')).toBeTruthy();
  });

  it('引いた瞬間に結果が確定し、演出を飛ばしても二重確定しない', () => {
    vi.useFakeTimers();
    const onPull = vi.fn(() => ({ isNew: true, coinBonus: 0 }));
    render(<GachaScreen state={{ coins: 500, collection: {} }} onBack={() => {}} onPull={onPull} />);
    fireEvent.click(screen.getByRole('button', { name: /1回召喚する/ }));
    expect(onPull).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: '演出をスキップ' }));
    expect(onPull).toHaveBeenCalledTimes(1);
    expect(screen.getByText('✦ 図鑑に新登録！')).toBeTruthy();
    expect(screen.getByText('1 / 208 体を発見しました')).toBeTruthy();
    act(() => vi.advanceTimersByTime(15000));
    expect(onPull).toHaveBeenCalledTimes(1);
  });

  it('演出中に画面がアンマウントされても抽選結果を失わない', () => {
    vi.useFakeTimers();
    const onPull = vi.fn(() => ({ isNew: true, coinBonus: 0 }));
    const { unmount } = render(<GachaScreen state={{ coins: 500, collection: {} }} onBack={() => {}} onPull={onPull} />);
    fireEvent.click(screen.getByRole('button', { name: /1回召喚する/ }));
    expect(onPull).toHaveBeenCalledTimes(1);
    unmount();
    act(() => vi.advanceTimersByTime(15000));
    expect(onPull).toHaveBeenCalledTimes(1);
  });
});
