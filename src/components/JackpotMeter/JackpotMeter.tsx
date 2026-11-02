import { formatCredits } from '@/utils/format';
import { PROGRESSIVE_JACKPOT_HIT_THRESHOLD } from '@/config/game';

interface JackpotMeterProps {
  value: number;
}

export function JackpotMeter({ value }: JackpotMeterProps) {
  const progress = Math.min(value / PROGRESSIVE_JACKPOT_HIT_THRESHOLD, 1);
  const isNear = progress > 0.8;

  return (
    <div className="rounded-2xl border border-gold-500/30 bg-gradient-to-b from-obsidian-800 to-obsidian-900 p-3 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs font-semibold tracking-[0.3em] text-gold-300">PROGRESSIVE JACKPOT</span>
        <span className={`font-display text-lg font-bold tabular-nums ${isNear ? 'text-ember-400 animate-pulse' : 'text-gold-400'}`}>{formatCredits(value)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-obsidian-700">
        <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-ember-500 transition-all duration-500" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
