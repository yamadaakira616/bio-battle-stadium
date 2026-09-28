import { StrictMode } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import GameScreen from '../screens/GameScreen';
vi.mock('../utils/gameLogic', async importOriginal => {
  const real = await importOriginal();
  return { ...real, generateFlashProblem: () => ({ numbers:[3,4],answer:7 }), generateChoices: () => [4,7,10,13], getLevelConfig: () => ({digits:1,count:2,ms:100,label:'テスト'}) };
});
afterEach(()=>{cleanup();vi.useRealTimers();vi.unstubAllGlobals();});
describe('flash learning integration',()=>{
  it('records all five answers once in StrictMode while keeping the existing reward',()=>{
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const finish=vi.fn(),coins=vi.fn(),levelUp=vi.fn(),stars=vi.fn();
    render(<StrictMode><GameScreen state={{level:1,coins:500}} maxLevel={1} onBack={()=>{}} onEarnCoins={coins} onLevelUp={levelUp} onSaveStars={stars} onBestCombo={()=>{}} onIncPlayed={()=>{}} onLearningFinish={finish}/></StrictMode>);
    for(let i=0;i<3;i++) act(()=>vi.advanceTimersByTime(700));
    for(let i=0;i<5;i++) {
      for(let j=0;j<2;j++) {act(()=>vi.advanceTimersByTime(100));act(()=>vi.advanceTimersByTime(150));}
      fireEvent.click(screen.getByRole('button',{name:'こたえ 7',exact:true}));
      act(()=>vi.advanceTimersByTime(1400));
    }
    expect(finish).toHaveBeenCalledTimes(1);
    expect(finish.mock.calls[0][0]).toMatchObject({mode:'flash',level:1,legacyReward:true});
    expect(finish.mock.calls[0][0].rows).toHaveLength(5);
    expect(coins).toHaveBeenCalledTimes(1);expect(coins).toHaveBeenCalledWith(300);
    expect(stars).toHaveBeenCalledWith(1,3);expect(levelUp).toHaveBeenCalledTimes(1);
    expect(screen.getByText('パーフェクト！')).toBeTruthy();
  });
});
