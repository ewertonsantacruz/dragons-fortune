import { useGameStore } from '@/stores/gameStore';
import { createGameApi } from '@/services/api';
import { audioEngine } from '@/services/audio/AudioEngine';
import { TIMING, PROGRESSIVE_JACKPOT_HIT_THRESHOLD } from '@/config/game';
import type { SpinResponse } from '@/types/game';

const api = createGameApi();

export function useSpinController() {
  const spin = async () => {
    const store = useGameStore.getState();
    if (store.phase === 'SPINNING') return;

    const bet = store.bet;
    if (bet > store.balance) {
      store.setError('Not enough credits for this bet.');
      return;
    }

    store.setPhase('SPINNING');
    audioEngine.spinStart();

    try {
      const result: SpinResponse = await api.spin({ bet });

      useGameStore.getState().applyResult({
        grid: result.grid,
        lineWins: result.lineWins,
        totalWin: result.totalWin,
        category: result.category,
        bet,
      });

      useGameStore.getState().setBalance(result.balance);

      const jackpotValue = useGameStore.getState().jackpotValue + bet * 0.02;
      useGameStore.getState().setJackpotValue(jackpotValue);

      playWinSound(result.category);

      const holdMs =
        result.category === 'EPIC_WIN'      ? 5000 :
        result.category === 'MEGA_WIN'      ? 4000 :
        result.category === 'BIG_WIN'       ? 2500 :
        result.category === 'PARTIAL_RETURN' ? 2200 :
        TIMING.highlightHoldMs;

      await new Promise((r) => setTimeout(r, holdMs));

      if (jackpotValue >= PROGRESSIVE_JACKPOT_HIT_THRESHOLD) {
        useGameStore.getState().setJackpotPhase('TRIGGERED');
      } else {
        useGameStore.getState().setPhase('IDLE');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong during the spin.';
      useGameStore.getState().setError(msg);
    }
  };

  return { spin };
}

function playWinSound(category: string) {
  switch (category) {
    case 'EPIC_WIN':
    case 'MEGA_WIN':
      audioEngine.megaWin();
      break;
    case 'BIG_WIN':
    case 'PARTIAL_RETURN':
      audioEngine.bigWin();
      break;
    case 'STANDARD_WIN':
      audioEngine.coinWin();
      break;
    case 'BONUS_TRIGGER':
      audioEngine.bonusTrigger();
      break;
    default:
      break;
  }
}
