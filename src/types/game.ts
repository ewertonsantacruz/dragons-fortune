export const SYMBOL_IDS = [
  'golden_dragon',
  'red_dragon',
  'dragon_crown',
  'treasure_chest',
  'ruby_crystal',
  'emerald_amulet',
  'golden_coin',
  'mystic_lotus',
  'wild',
  'scatter',
] as const;

export type SymbolId = (typeof SYMBOL_IDS)[number];

export type ReelGrid = SymbolId[][];

export interface CellPosition {
  reel: number;
  row: number;
}

export interface LineWin {
  paylineIndex: number | null;
  symbol: SymbolId;
  count: number;
  amount: number;
  cells: CellPosition[];
}

export type WinCategory =
  | 'NO_WIN'
  | 'PARTIAL_RETURN'
  | 'STANDARD_WIN'
  | 'BIG_WIN'
  | 'MEGA_WIN'
  | 'EPIC_WIN'
  | 'BONUS_TRIGGER';

export interface JackpotTier {
  tier: 'GRAND' | 'MAJOR' | 'MINOR' | 'MINI';
  value: number;
}

export interface GameConfiguration {
  name: string;
  currency: string;
  betLevels: number[];
  defaultBetIndex: number;
  paylines: number[][];
  jackpots: JackpotTier[];
}

export interface BalanceResponse {
  balance: number;
  currency: string;
}

export interface SpinRequest {
  bet: number;
}

export interface SpinResponse {
  spinId: string;
  grid: ReelGrid;
  lineWins: LineWin[];
  totalWin: number;
  category: WinCategory;
  balance: number;
}

export interface EggPickResult {
  eggIndex: number;
  freeSpins: number;
  multiplier: number;
}

export interface FreeSpinsStartResponse {
  picks: EggPickResult[];
  totalFreeSpins: number;
  multiplier: number;
  balance: number;
}

export interface FreeSpinResponse {
  spinId: string;
  grid: ReelGrid;
  lineWins: LineWin[];
  totalWin: number;
  category: WinCategory;
  bonusTotal: number;
  spinsRemaining: number;
  balance: number;
}

export interface FreeSpinsCompleteResponse {
  bonusTotal: number;
  balance: number;
}

export type JackpotWheelSegment = 'GRAND' | 'MAJOR' | 'MINOR' | 'MINI';

export interface JackpotState {
  progressiveValue: number;
  seedValue: number;
  contributionRate: number;
  hitThreshold: number;
}

export interface JackpotSpinResponse {
  jackpotValue: number;
  balance: number;
}

export interface JackpotWheelResult {
  segment: JackpotWheelSegment;
  prize: number;
  balance: number;
}
