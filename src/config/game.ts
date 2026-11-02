import type { JackpotTier, JackpotWheelSegment, SymbolId, WinCategory } from '@/types/game';

export const GAME_NAME = "Dragon's Fortune";
export const CURRENCY = 'CREDITS';
export const STARTING_BALANCE = 10_000;

export const BET_LEVELS = [10, 25, 50, 100, 200, 500];
export const DEFAULT_BET_INDEX = 2;

export const REEL_COUNT = 5;
export const ROW_COUNT = 3;
export const EGG_COUNT = 6;
export const EGGS_TO_PICK = 3;
export const SCATTER_TRIGGER_COUNT = 3;

export const REEL_STRIP: SymbolId[] = [
  'golden_dragon', 'red_dragon', 'dragon_crown', 'treasure_chest',
  'ruby_crystal', 'emerald_amulet', 'golden_coin', 'mystic_lotus',
  'wild', 'scatter',
];

export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 1, 1, 0],
  [2, 1, 1, 1, 2],
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],
  [1, 0, 1, 0, 1],
  [1, 2, 1, 2, 1],
  [0, 0, 1, 0, 0],
  [2, 2, 1, 2, 2],
  [0, 2, 0, 2, 0],
  [2, 0, 2, 0, 2],
  [1, 1, 0, 1, 1],
];

export interface SymbolRule {
  name: string;
  pays: [number, number, number];
}

export const SYMBOL_RULES: Record<SymbolId, SymbolRule> = {
  golden_dragon: { name: 'Golden Dragon', pays: [5, 15, 50] },
  red_dragon:    { name: 'Red Dragon',    pays: [4, 12, 40] },
  dragon_crown:  { name: 'Dragon Crown',  pays: [3, 10, 30] },
  treasure_chest:{ name: 'Treasure Chest',pays: [3, 8, 25] },
  ruby_crystal:  { name: 'Ruby Crystal',  pays: [2, 6, 20] },
  emerald_amulet:{ name: 'Emerald Amulet',pays: [2, 5, 15] },
  golden_coin:   { name: 'Golden Coin',   pays: [1, 4, 12] },
  mystic_lotus:  { name: 'Mystic Lotus',  pays: [1, 3, 10] },
  wild:          { name: 'Dragon Wild',   pays: [0, 0, 0] },
  scatter:       { name: 'Dragon Egg',    pays: [2, 5, 20] },
};

export const WIN_TIERS: { category: WinCategory; minMultiplier: number }[] = [
  { category: 'STANDARD_WIN', minMultiplier: 1 },
  { category: 'BIG_WIN',      minMultiplier: 10 },
  { category: 'MEGA_WIN',     minMultiplier: 25 },
  { category: 'EPIC_WIN',     minMultiplier: 50 },
];

export const PROGRESSIVE_JACKPOT_SEED = 50_000;
export const PROGRESSIVE_JACKPOT_HIT_THRESHOLD = 75_000;
export const PROGRESSIVE_JACKPOT_CONTRIBUTION = 0.02;

export const JACKPOTS: JackpotTier[] = [
  { tier: 'GRAND',  value: 50_000 },
  { tier: 'MAJOR',  value: 10_000 },
  { tier: 'MINOR',  value: 2_500 },
  { tier: 'MINI',   value: 500 },
];

export const JACKPOT_WHEEL_SEGMENTS: { segment: JackpotWheelSegment; weight: number; multiplier: number }[] = [
  { segment: 'MINI',  weight: 50, multiplier: 1 },
  { segment: 'MINOR', weight: 30, multiplier: 3 },
  { segment: 'MAJOR', weight: 15, multiplier: 10 },
  { segment: 'GRAND', weight: 5,  multiplier: 50 },
];

export const EGG_OPTIONS = [
  { freeSpins: 5,  multiplier: 2 },
  { freeSpins: 8,  multiplier: 2 },
  { freeSpins: 10, multiplier: 3 },
  { freeSpins: 12, multiplier: 3 },
  { freeSpins: 15, multiplier: 5 },
  { freeSpins: 20, multiplier: 5 },
];

export const TIMING = {
  mockLatencyMs: 300,
  spinDurationMs: 800,
  highlightHoldMs: 1800,
  bonusIntroMs: 2500,
  bonusCompleteMs: 4500,
  jackpotTriggerMs: 1800,
  jackpotResultMs: 5000,
};

export const BONUS_TIMING = {
  eggCrackMs: 600,
  eggRevealMs: 600,
  revealAllMs: 1000,
  startFreeSpinsMs: 1400,
};
