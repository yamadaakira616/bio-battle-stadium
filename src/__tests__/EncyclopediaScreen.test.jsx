import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import EncyclopediaScreen from '../screens/EncyclopediaScreen.jsx';

describe('カード図鑑', () => {
  it('新登場を絞り込めて、未入手の新カードもシルエットで見られる', () => {
    const { container } = render(<EncyclopediaScreen state={{ coins: 500, collection: {} }} onBack={() => {}} onUpgradeCard={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '✦ 新登場 8' }));
    expect(screen.getByText('8体')).toBeTruthy();
    expect(container.querySelectorAll('.grid.grid-cols-3 > div')).toHaveLength(8);
    expect(screen.getAllByText('NEW')).toHaveLength(8);
    fireEvent.click(screen.getByRole('button', { name: '入手済み' }));
    expect(screen.getByText('まだ入手したカードがありません')).toBeTruthy();
  });
});
