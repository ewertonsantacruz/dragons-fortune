import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { CURRENCY } from '@/config/game';
import { formatCredits } from '@/utils/format';

interface BonusCompleteScreenProps {
  visible: boolean;
  totalWin: number;
  freeSpinsPlayed: number;
  multiplier: number;
  onDismiss: () => void;
}

export function BonusCompleteScreen({ visible, totalWin, freeSpinsPlayed, multiplier, onDismiss }: BonusCompleteScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [countValue, setCountValue] = useState(0);

  useEffect(() => {
    if (!visible) { setMounted(false); setCountValue(0); return; }
    const mountTimer = setTimeout(() => setMounted(true), 10);
    const startDelay = setTimeout(() => {
      const duration = 1800; const start = performance.now();
      const tick = (now: number) => { const progress = Math.min((now - start) / duration, 1); const eased = 1 - Math.pow(1 - progress, 3); setCountValue(totalWin * eased); if (progress < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, 700);
    const dismissTimer = setTimeout(onDismiss, 4500);
    return () => { clearTimeout(mountTimer); clearTimeout(startDelay); clearTimeout(dismissTimer); };
  }, [visible, totalWin, onDismiss]);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br from-ruby-900/96 via-obsidian-900/96 to-obsidian-800/96 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
      <div className="absolute left-1/2 top-1/2 h-[100vw] w-[100vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.2),transparent_50%)]" />
      {mounted && Array.from({ length: 20 }).map((_, i) => (<span key={i} className="absolute block h-2 w-2 rounded-full" style={{ backgroundColor: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FF6B00' : '#E32636', left: `${5 + ((i * 4.7) % 90)}%`, top: '-2%', animation: `coinFall ${1.5 + (i % 4) * 0.4}s linear ${(i % 6) * 0.2}s infinite` }} />))}
      <div className={`relative z-10 flex flex-col items-center gap-4 px-6 text-center transition-all duration-700 ${mounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 via-gold-400 to-gold-500 shadow-[0_0_50px_rgba(255,215,0,0.5)]"><div className="absolute inset-0 animate-ping rounded-full bg-gold-400/30" /><Trophy className="relative h-12 w-12 text-ruby-700" /></div>
        <div className="space-y-1"><p className="font-display text-xs font-semibold tracking-[0.4em] text-gold-300">BONUS COMPLETE</p><h2 className="font-display text-3xl font-bold tracking-wide text-gold-100 drop-shadow-[0_2px_12px_rgba(255,215,0,0.4)] sm:text-4xl">DRAGON'S HOARD</h2></div>
        <div className="rounded-2xl border border-gold-400/40 bg-obsidian-800/80 px-8 py-4"><p className="text-[10px] font-semibold tracking-[0.25em] text-gold-100/60">TOTAL BONUS WINNINGS</p><p className="mt-1 font-display text-4xl font-bold tabular-nums text-gold-400 sm:text-5xl">{formatCredits(countValue)}</p><p className="mt-0.5 text-xs text-gold-100/50">{CURRENCY}</p></div>
        <div className="flex gap-4"><div className="flex flex-col items-center"><span className="text-[9px] font-semibold tracking-wider text-gold-100/60">FREE SPINS</span><span className="font-display text-lg font-bold text-gold-100">{freeSpinsPlayed}</span></div><div className="h-8 w-px bg-gold-500/30" /><div className="flex flex-col items-center"><span className="text-[9px] font-semibold tracking-wider text-gold-100/60">MULTIPLIER</span><span className="font-display text-lg font-bold text-ember-400">{multiplier}x</span></div></div>
        <p className="text-xs text-gold-100/50">Returning to the reels...</p>
      </div>
      <style>{`@keyframes coinFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(105vh) rotate(360deg); opacity: 0.3; } }`}</style>
    </div>
  );
}
