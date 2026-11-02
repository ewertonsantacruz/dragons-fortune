import { useEffect, useState } from 'react';
import { Coins, Zap } from 'lucide-react';
import { CURRENCY } from '@/config/game';
import { formatCredits } from '@/utils/format';

interface FreeSpinsOverlayProps {
  visible: boolean;
  spinsRemaining: number;
  spinsTotal: number;
  multiplier: number;
  totalWin: number;
}

export function FreeSpinsOverlay({ visible, spinsRemaining, spinsTotal, multiplier, totalWin }: FreeSpinsOverlayProps) {
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [pulseSpins, setPulseSpins] = useState(false);

  useEffect(() => { if (!visible) { setAnimatedTotal(0); return; } setAnimatedTotal(totalWin); }, [visible, totalWin]);
  useEffect(() => { if (!visible) return; setPulseSpins(true); const timer = setTimeout(() => setPulseSpins(false), 400); return () => clearTimeout(timer); }, [spinsRemaining, visible]);

  if (!visible) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-2 sm:px-6">
      <div className="mx-auto flex max-w-xl items-stretch gap-2 rounded-2xl border border-gold-400/40 bg-gradient-to-r from-ruby-900/90 via-obsidian-800/90 to-obsidian-800/90 p-2.5 shadow-[0_4px_24px_rgba(255,107,0,0.25)] backdrop-blur-md">
        <div className={`flex flex-col items-center justify-center rounded-xl bg-obsidian-900/60 px-3 py-1.5 transition-transform ${pulseSpins ? 'scale-110' : 'scale-100'}`}>
          <div className="flex items-center gap-1"><Coins className="h-3.5 w-3.5 text-gold-400" /><span className="text-[9px] font-semibold tracking-[0.2em] text-gold-100/70">SPINS</span></div>
          <div className="flex items-baseline gap-1"><span className="font-display text-xl font-bold tabular-nums text-gold-100">{spinsRemaining}</span><span className="text-[10px] text-gold-100/50">/ {spinsTotal}</span></div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-ember-500/30 to-ruby-700/30 px-3 py-1.5">
          <div className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-ember-400" /><span className="text-[9px] font-semibold tracking-[0.2em] text-ember-400">MULTIPLIER</span></div>
          <span className="font-display text-xl font-bold text-ember-400 drop-shadow-[0_0_8px_rgba(255,107,0,0.4)]">{multiplier}x</span>
        </div>
        <div className="flex flex-1 flex-col items-end justify-center rounded-xl bg-obsidian-900/60 px-3 py-1.5">
          <span className="text-[9px] font-semibold tracking-[0.2em] text-gold-100/70">BONUS WIN</span>
          <span className="font-display text-lg font-bold tabular-nums text-gold-400">{formatCredits(animatedTotal)}</span>
          <span className="text-[8px] text-gold-100/40">{CURRENCY}</span>
        </div>
      </div>
      <div className="mx-auto mt-1.5 h-1 max-w-xl overflow-hidden rounded-full bg-obsidian-700/60">
        <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-ember-500 transition-all duration-500 ease-out" style={{ width: `${spinsTotal > 0 ? ((spinsTotal - spinsRemaining) / spinsTotal) * 100 : 0}%` }} />
      </div>
    </div>
  );
}
