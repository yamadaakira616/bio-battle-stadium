import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdventureShell from '../components/AdventureShell.jsx';

const state = {
  coins: 100,
  learning: { xp: 0 },
  soundEnabled: true,
};

describe('下部クイックメニュー', () => {
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
