import { Minus, Plus } from 'lucide-react';
import { BET_LEVELS } from '@/config/game';

interface BetControlsProps {
  bet: number;
  betIndex: number;
  onBetChange: (bet: number, index: number) => void;
  disabled: boolean;
}

export function BetControls({ bet, betIndex, onBetChange, disabled }: BetControlsProps) {
  const decrease = () => { if (betIndex > 0 && !disabled) onBetChange(BET_LEVELS[betIndex - 1], betIndex - 1); };
  const increase = () => { if (betIndex < BET_LEVELS.length - 1 && !disabled) onBetChange(BET_LEVELS[betIndex + 1], betIndex + 1); };

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={decrease} disabled={disabled || betIndex === 0} aria-label="Decrease bet" className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-500/40 bg-obsidian-800 text-gold-300 transition hover:border-gold-400 disabled:opacity-40">
        <Minus className="h-4 w-4" />
      </button>
      <div className="text-center">
        <p className="text-[9px] font-semibold tracking-wider text-gold-100/60">BET</p>
        <p className="font-display text-lg font-bold tabular-nums text-gold-400">{bet}</p>
      </div>
      <button type="button" onClick={increase} disabled={disabled || betIndex === BET_LEVELS.length - 1} aria-label="Increase bet" className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-500/40 bg-obsidian-800 text-gold-300 transition hover:border-gold-400 disabled:opacity-40">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
