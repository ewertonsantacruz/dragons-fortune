import { JACKPOTS, CURRENCY } from '@/config/game';
import { formatCredits } from '@/utils/format';

export function JackpotDisplay() {
  return (
    <div className="mt-2 grid grid-cols-4 gap-2">
      {JACKPOTS.map((jackpot) => (
        <div key={jackpot.tier} className="rounded-lg border border-gold-500/20 bg-obsidian-800 px-2 py-1.5 text-center">
          <p className="text-[9px] font-semibold tracking-wider text-gold-300">{jackpot.tier}</p>
          <p className="font-display text-sm font-bold tabular-nums text-gold-400">{formatCredits(jackpot.value)}</p>
        </div>
      ))}
    </div>
  );
}
