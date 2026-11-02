import type { ReelGrid, SymbolId } from '@/types/game';

export interface SpinFixture {
  name: string;
  rows: [string, string, string];
}

const CODES: Record<string, SymbolId> = {
  GD: 'golden_dragon', RD: 'red_dragon', DC: 'dragon_crown', TC: 'treasure_chest',
  RC: 'ruby_crystal', EA: 'emerald_amulet', GC: 'golden_coin', ML: 'mystic_lotus',
  W: 'wild', S: 'scatter',
};

export const SPIN_FIXTURES: SpinFixture[] = [
  { name: 'No win', rows: ['RC EA GC ML TC', 'GC TC RD EA ML', 'ML RC TC GC EA'] },
  { name: 'Standard win on middle line', rows: ['RC TC EA ML GC', 'GC GC GC RD EA', 'ML RC TC GC ML'] },
  { name: 'Partial return', rows: ['RC TC EA GC RC', 'GC RC RD EA GC', 'ML ML ML TC EA'] },
  { name: 'Big win on dragon crowns', rows: ['RC TC GC ML TC', 'DC DC DC EA RC', 'EA ML RC TC ML'] },
  { name: 'Mega win on golden dragons', rows: ['GD GD GD TC RC', 'EA RD DC GC ML', 'ML RC TC EA GC'] },
  { name: 'Epic win on red dragons', rows: ['GC EA TC ML GC', 'RD RD RD RD RD', 'ML TC RC GC EA'] },
  { name: 'Dragon egg scatter trigger', rows: ['S TC GC ML RC', 'EA RD S GC TC', 'GC ML TC S RD'] },
  { name: 'Wild substitution', rows: ['RC TC EA ML EA', 'GC GC W GC RD', 'ML RC TC EA GD'] },
];

export function fixtureToGrid(rows: SpinFixture['rows']): ReelGrid {
  const grid: ReelGrid = Array.from({ length: 5 }, () => []);
  rows.forEach((row) => {
    row.split(' ').forEach((code, reel) => { grid[reel].push(CODES[code]); });
  });
  return grid;
}
