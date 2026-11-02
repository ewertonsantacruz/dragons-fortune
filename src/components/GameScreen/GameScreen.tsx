import { useState } from 'react';
import { GameHeader } from '@/components/GameHeader/GameHeader';
import { JackpotMeter } from '@/components/JackpotMeter/JackpotMeter';
import { JackpotDisplay } from '@/components/JackpotDisplay/JackpotDisplay';
import { SlotMachine } from '@/components/SlotMachine/SlotMachine';
import { SpinButton } from '@/components/SpinButton/SpinButton';
import { WinDisplay } from '@/components/WinDisplay/WinDisplay';
import { BetControls } from '@/components/BetControls/BetControls';
import { BalanceDisplay } from '@/components/BalanceDisplay/BalanceDisplay';
import { Paytable } from '@/components/Paytable/Paytable';
import { AudioSettingsPanel } from '@/components/AudioSettingsPanel/AudioSettingsPanel';
import { BonusIntroScreen } from '@/components/BonusIntroScreen/BonusIntroScreen';
import { DragonEggPicker } from '@/components/DragonEggPicker/DragonEggPicker';
import { FreeSpinsOverlay } from '@/components/FreeSpinsOverlay/FreeSpinsOverlay';
import { BonusCompleteScreen } from '@/components/BonusCompleteScreen/BonusCompleteScreen';
import { JackpotWheel } from '@/components/JackpotWheel/JackpotWheel';
import { WinCelebration } from '@/components/WinCelebration/WinCelebration';
import { useGameStore } from '@/stores/gameStore';
import { useSpinController } from '@/hooks/useSpinController';
import { useAudio } from '@/hooks/useAudio';

export function GameScreen() {
  const { spin } = useSpinController();
  const audio = useAudio();
  const phase = useGameStore((s) => s.phase);
  const bonusPhase = useGameStore((s) => s.bonusPhase);
  const jackpotPhase = useGameStore((s) => s.jackpotPhase);
  const lastResult = useGameStore((s) => s.lastResult);
  const balance = useGameStore((s) => s.balance);
  const bet = useGameStore((s) => s.bet);
  const betIndex = useGameStore((s) => s.betIndex);
  const setBet = useGameStore((s) => s.setBet);
  const freeSpinsRemaining = useGameStore((s) => s.freeSpinsRemaining);
  const freeSpinsTotal = useGameStore((s) => s.freeSpinsTotal);
  const freeSpinsMultiplier = useGameStore((s) => s.freeSpinsMultiplier);
  const bonusTotal = useGameStore((s) => s.bonusTotal);
  const jackpotValue = useGameStore((s) => s.jackpotValue);

  const [showPaytable, setShowPaytable] = useState(false);
  const [showAudio, setShowAudio] = useState(false);

  const isSpinning = phase === 'SPINNING';
  const canSpin = phase === 'IDLE' && balance >= bet;

  return (
    <div className="min-h-[100dvh] bg-obsidian-900 text-gold-100">
      <GameHeader
        onPaytable={() => setShowPaytable(true)}
        onAudio={() => setShowAudio(true)}
      />

      <div className="mx-auto max-w-2xl px-3 pb-6">
        <JackpotMeter value={jackpotValue} />
        <JackpotDisplay />
        <SlotMachine lastResult={lastResult} isSpinning={isSpinning} />
        <WinDisplay visible={phase === 'SHOWING_RESULT'} result={lastResult} />
        <WinCelebration visible={phase === 'SHOWING_RESULT' && (lastResult?.category === 'MEGA_WIN' || lastResult?.category === 'EPIC_WIN')} result={lastResult} />
        <div className="mt-4 flex items-center justify-between gap-4">
          <BetControls bet={bet} betIndex={betIndex} onBetChange={setBet} disabled={isSpinning} />
          <SpinButton onClick={spin} disabled={!canSpin} state={isSpinning ? 'SPINNING' : canSpin ? 'READY' : 'DISABLED'} />
        </div>
        <BalanceDisplay balance={balance} />
      </div>

      <FreeSpinsOverlay visible={bonusPhase === 'FREE_SPINNING' || bonusPhase === 'FREE_SPIN_RESULT'} spinsRemaining={freeSpinsRemaining} spinsTotal={freeSpinsTotal} multiplier={freeSpinsMultiplier} totalWin={bonusTotal} />
      <BonusIntroScreen visible={bonusPhase === 'INTRO'} />
      <DragonEggPicker visible={bonusPhase === 'PICKING' || bonusPhase === 'PICK_REVEAL'} />
      <BonusCompleteScreen visible={bonusPhase === 'COMPLETE'} totalWin={bonusTotal} freeSpinsPlayed={freeSpinsTotal} multiplier={freeSpinsMultiplier} onDismiss={() => useGameStore.getState().setBonusPhase('NONE')} />
      <JackpotWheel visible={jackpotPhase !== 'NONE'} />

      {showPaytable && <Paytable bet={bet} onClose={() => setShowPaytable(false)} />}
      {showAudio && <AudioSettingsPanel open sfxVolume={audio.sfxVolume} musicVolume={audio.musicVolume} onSfxVolumeChange={audio.changeSfxVolume} onMusicVolumeChange={audio.changeMusicVolume} onClose={() => setShowAudio(false)} />}
    </div>
  );
}
