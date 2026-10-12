import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdventureShell from '../components/AdventureShell.jsx';

const state = {
  coins: 100,
  learning: { xp: 0 },
  soundEnabled: true,
};

describe('下部クイックメニュー', () => {
  it('1分テストを下部とサイドの両方から開ける', () => {
    const onNavigate = vi.fn();
    render(
      <AdventureShell
        state={state}
        screen="HOME"
        onNavigate={onNavigate}
        onSound={vi.fn()}
      >
        <p>画面の内容</p>
      </AdventureShell>,
    );
    const quickMenu = screen.getByRole('navigation', { name: 'クイックメニュー' });
    const mainMenu = screen.getByRole('navigation', { name: 'メインメニュー' });
    fireEvent.click(within(quickMenu).getByRole('button', { name: '1分テスト' }));
    fireEvent.click(within(mainMenu).getByRole('button', { name: '1〜100 1分テスト' }));
    expect(onNavigate).toHaveBeenCalledTimes(2);
    expect(onNavigate).toHaveBeenNthCalledWith(1, 'HUNDRED');
    expect(onNavigate).toHaveBeenNthCalledWith(2, 'HUNDRED');
  });

  it('ガチャを表示し、選ぶと遷移して選択状態になる', () => {
    const onNavigate = vi.fn();
    const props = {
      state,
      onNavigate,
      onSound: vi.fn(),
      children: <p>画面の内容</p>,
    };
    const { rerender } = render(<AdventureShell {...props} screen="HOME" />);
    const quickMenu = screen.getByRole('navigation', { name: 'クイックメニュー' });
    const gacha = within(quickMenu).getByRole('button', { name: 'ガチャ' });

    expect(gacha).toBeTruthy();
    expect(gacha.getAttribute('aria-current')).toBeNull();
    fireEvent.click(gacha);
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith('GACHA');

    rerender(<AdventureShell {...props} screen="GACHA" />);
    const selectedGacha = within(quickMenu).getByRole('button', { name: 'ガチャ' });
    expect(selectedGacha.getAttribute('aria-current')).toBe('page');
    expect(selectedGacha.classList.contains('active')).toBe(true);
  });
});
