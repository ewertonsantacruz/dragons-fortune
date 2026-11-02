import { PAYLINES, REEL_COUNT, SCATTER_TRIGGER_COUNT, SYMBOL_RULES, WIN_TIERS } from '@/config/game';
import type { CellPosition, LineWin, ReelGrid, SymbolId, WinCategory } from '@/types/game';

const roundCents = (value: number) => Math.round(value * 100) / 100;

function evaluateLine(grid: ReelGrid, line: number[], paylineIndex: number, bet: number): LineWin | null {
  let symbol: SymbolId | null = null;
  for (let reel = 0; reel < REEL_COUNT; reel++) {
    const current = grid[reel][line[reel]];
    if (current === 'scatter') return null;
    if (current !== 'wild') { symbol = current; break; }
  }
  const target: SymbolId = symbol ?? 'wild';
  const cells: CellPosition[] = [];
  for (let reel = 0; reel < REEL_COUNT; reel++) {
    const row = line[reel];
    const current = grid[reel][row];
    if (current !== target && current !== 'wild') break;
    cells.push({ reel, row });
  }
  if (cells.length < 3) return null;
  const pays = SYMBOL_RULES[target].pays;
  const amount = roundCents(bet * pays[Math.min(cells.length, 5) - 3]);
  return { paylineIndex, symbol: target, count: cells.length, amount, cells };
}

function evaluateScatters(grid: ReelGrid, bet: number): LineWin | null {
  const cells: CellPosition[] = [];
  grid.forEach((column, reel) => column.forEach((symbol, row) => { if (symbol === 'scatter') cells.push({ reel, row }); }));
  if (cells.length < 3) return null;
  const pays = SYMBOL_RULES.scatter.pays;
  const amount = roundCents(bet * pays[Math.min(cells.length, 5) - 3]);
  return { paylineIndex: null, symbol: 'scatter', count: cells.length, amount, cells };
}

export function categorizeWin(totalWin: number, bet: number, scatterCount: number): WinCategory {
  if (scatterCount >= SCATTER_TRIGGER_COUNT) return 'BONUS_TRIGGER';
  if (totalWin <= 0) return 'NO_WIN';
  const multiplier = totalWin / bet;
  if (multiplier <= 1) return 'PARTIAL_RETURN';
  let category: WinCategory = 'STANDARD_WIN';
  for (const tier of WIN_TIERS) { if (multiplier >= tier.minMultiplier) category = tier.category; }
  return category;
}

export function evaluateGrid(grid: ReelGrid, bet: number) {
  const lineWins: LineWin[] = [];
  PAYLINES.forEach((line, index) => { const win = evaluateLine(grid, line, index, bet); if (win) lineWins.push(win); });
  const scatterWin = evaluateScatters(grid, bet);
  if (scatterWin) lineWins.push(scatterWin);
  const totalWin = roundCents(lineWins.reduce((sum, win) => sum + win.amount, 0));
  const scatterCount = grid.flat().filter((symbol) => symbol === 'scatter').length;
  return { lineWins, totalWin, category: categorizeWin(totalWin, bet, scatterCount) };
}
