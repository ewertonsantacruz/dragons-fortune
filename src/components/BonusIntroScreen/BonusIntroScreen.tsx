import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface BonusIntroScreenProps { visible: boolean; }

export function BonusIntroScreen({ visible }: BonusIntroScreenProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (visible) { const timer = setTimeout(() => setMounted(true), 10); return () => clearTimeout(timer); }
    setMounted(false);
  }, [visible]);
  if (!visible) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br from-ruby-900/95 via-obsidian-900/95 to-obsidian-800/95 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`} />
      <div className="absolute left-1/2 top-1/2 h-[120vw] w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.25),transparent_55%)]" />
      {mounted && Array.from({ length: 12 }).map((_, i) => (<span key={i} className="absolute block h-1.5 w-1.5 rounded-full bg-ember-500" style={{ left: `${10 + ((i * 7.3) % 80)}%`, top: `${20 + ((i * 11.7) % 60)}%`, animation: `floatUp ${2 + (i % 4) * 0.6}s ease-out ${(i % 5) * 0.3}s infinite` }} />))}
      <div className={`relative z-10 flex flex-col items-center gap-4 px-6 text-center transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 shadow-[0_0_40px_rgba(255,215,0,0.6)]"><Sparkles className="h-10 w-10 text-ruby-700" /></div>
        <div className="space-y-1"><p className="font-display text-xs font-semibold tracking-[0.4em] text-gold-300">BONUS ROUND</p><h2 className="font-display text-4xl font-bold tracking-wide text-gold-100 drop-shadow-[0_2px_12px_rgba(255,215,0,0.4)] sm:text-5xl">FREE SPINS</h2></div>
        <p className="max-w-xs text-sm leading-relaxed text-gold-100/80">Three dragon eggs have appeared! Pick your eggs to reveal your free spins and multiplier.</p>
        <div className="mt-2 flex gap-2">{['#FFD700', '#FF6B00', '#E32636'].map((color) => (<span key={color} className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: color, animationDelay: `${Math.random() * 0.4}s` }} />))}</div>
      </div>
      <style>{`@keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 0.8; } 100% { transform: translateY(-60px) scale(0.3); opacity: 0; } }`}</style>
    </div>
  );
}
