import { create } from 'zustand';
import type { EggPickResult, JackpotWheelResult, LineWin, ReelGrid, WinCategory } from '@/types/game';
import { STARTING_BALANCE } from '@/config/game';
import { createGameApi } from '@/services/api';

const api = createGameApi();

export type GamePhase =
  | 'IDLE'
  | 'SPINNING'
  | 'SHOWING_RESULT'
  | 'ERROR';

export type BonusPhase =
  | 'NONE'
  | 'INTRO'
  | 'PICKING'
  | 'PICK_REVEAL'
  | 'FREE_SPIN_REQUESTING'
  | 'FREE_SPINNING'
  | 'FREE_SPIN_RESULT'
  | 'COMPLETE'
  | 'BONUS_IDLE';

export type JackpotPhase =
  | 'NONE'
  | 'TRIGGERED'
  | 'WHEEL_SPINNING'
  | 'WHEEL_RESULT';

interface SpinResult {
  grid: ReelGrid;
  lineWins: LineWin[];
  totalWin: number;
  category: WinCategory;
  bet: number;
}

interface GameState {
  balance: number;
  bet: number;
  betIndex: number;
  phase: GamePhase;
  bonusPhase: BonusPhase;
  jackpotPhase: JackpotPhase;
  lastResult: SpinResult | null;
  freeSpinsRemaining: number;
  freeSpinsTotal: number;
  freeSpinsMultiplier: number;
  bonusTotal: number;
  eggPicks: EggPickResult[];
  jackpotValue: number;
  jackpotWheelResult: JackpotWheelResult | null;
  error: string | null;
  setBalance: (balance: number) => void;
  setBet: (bet: number, index: number) => void;
  setPhase: (phase: GamePhase) => void;
  setBonusPhase: (phase: BonusPhase) => void;
  setJackpotPhase: (phase: JackpotPhase) => void;
  applyResult: (result: SpinResult) => void;
  setEggPicks: (picks: EggPickResult[]) => void;
  startFreeSpins: (picks: EggPickResult[], total: number, multiplier: number) => Promise<void>;
  setFreeSpinsRemaining: (n: number) => void;
  setBonusTotal: (n: number) => void;
  setJackpotValue: (n: number) => void;
  spinJackpotWheel: () => Promise<void>;
  setJackpotWheelResult: (r: JackpotWheelResult) => void;
  dismissJackpot: () => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  balance: STARTING_BALANCE,
  bet: 50,
  betIndex: 2,
  phase: 'IDLE',
  bonusPhase: 'NONE',
  jackpotPhase: 'NONE',
  lastResult: null,
  freeSpinsRemaining: 0,
  freeSpinsTotal: 0,
  freeSpinsMultiplier: 1,
  bonusTotal: 0,
  eggPicks: [],
  jackpotValue: 50000,
  jackpotWheelResult: null,
  error: null,
  setBalance: (balance) => set({ balance }),
  setBet: (bet, betIndex) => set({ bet, betIndex }),
  setPhase: (phase) => set({ phase }),
  setBonusPhase: (bonusPhase) => set({ bonusPhase }),
  setJackpotPhase: (jackpotPhase) => set({ jackpotPhase }),
  applyResult: (result) => {
    set({ lastResult: result, phase: 'SHOWING_RESULT' });
    if (result.category === 'BONUS_TRIGGER') {
      set({ bonusPhase: 'INTRO' });
    }
  },
  setEggPicks: (picks) => set({ eggPicks: picks }),
  startFreeSpins: async (picks, total, multiplier) => {
    set({
      eggPicks: picks,
      freeSpinsRemaining: total,
      freeSpinsTotal: total,
      freeSpinsMultiplier: multiplier,
      bonusTotal: 0,
      bonusPhase: 'PICK_REVEAL',
    });
  },
  setFreeSpinsRemaining: (n) => set({ freeSpinsRemaining: n }),
  setBonusTotal: (n) => set({ bonusTotal: n }),
  setJackpotValue: (n) => set({ jackpotValue: n }),
  spinJackpotWheel: async () => {
    set({ jackpotPhase: 'WHEEL_SPINNING' });
    try {
      const result = await api.spinJackpotWheel();
      set({ jackpotWheelResult: result, jackpotPhase: 'WHEEL_RESULT', balance: result.balance, jackpotValue: 50000 });
    } catch {
      set({ jackpotPhase: 'WHEEL_RESULT' });
    }
  },
  setJackpotWheelResult: (r) => set({ jackpotWheelResult: r, jackpotPhase: 'WHEEL_RESULT' }),
  dismissJackpot: () => set({ jackpotPhase: 'NONE', jackpotWheelResult: null, phase: 'IDLE' }),
  setError: (msg) => set({ error: msg, phase: 'ERROR' }),
  reset: () => set({
    balance: STARTING_BALANCE,
    phase: 'IDLE',
    bonusPhase: 'NONE',
    jackpotPhase: 'NONE',
    lastResult: null,
    error: null,
  }),
}));
