import { X } from 'lucide-react';
import { SYMBOL_IDS } from '@/types/game';
import { GAME_NAME, SCATTER_TRIGGER_COUNT, SYMBOL_RULES } from '@/config/game';
import { symbolDataUrl } from '@/engine/symbols/symbolArt';
import { formatCredits } from '@/utils/format';

interface PaytableProps { bet: number; onClose: () => void; }

export function Paytable({ bet, onClose }: PaytableProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label={`${GAME_NAME} paytable`}>
      <div className="flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-3xl border border-gold-500/50 bg-obsidian-900 shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-gold-500/20 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-gold-400">Paytable</h2>
          <button type="button" onClick={onClose} aria-label="Close paytable" className="rounded-full p-2 text-gold-100/70 transition hover:text-gold-300"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4">
          <p className="mb-3 text-xs text-gold-100/60">Pays per line, for 3, 4 and 5 matching symbols, at the current bet of {formatCredits(bet)}. 20 fixed paylines.</p>
          <ul className="flex flex-col gap-2">
            {SYMBOL_IDS.map((id) => { const rule = SYMBOL_RULES[id]; return (
              <li key={id} className="flex items-center gap-3 rounded-xl border border-gold-500/20 bg-obsidian-800 px-3 py-2">
                <img src={symbolDataUrl(id)} alt="" className="h-12 w-12 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold text-gold-100">{rule.name}</p>
                  <p className="text-[11px] text-gold-100/60 tabular-nums">{rule.pays.map((multiplier, index) => `${index + 3}x ${formatCredits(multiplier * bet)}`).join('   ')}</p>
                </div>
              </li>
            ); })}
          </ul>
          <div className="mt-4 space-y-2 text-xs leading-relaxed text-gold-100/70">
            <p>The Dragon Wild substitutes for every symbol except the Dragon Egg Scatter.</p>
            <p>Three or more Dragon Egg Scatters anywhere on the reels trigger a bonus ({SCATTER_TRIGGER_COUNT}+ eggs).</p>
            <p>All amounts are shown in DEMO CREDITS and carry no monetary value.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
