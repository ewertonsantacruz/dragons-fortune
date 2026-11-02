import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { formatCredits } from '@/utils/format';
import type { SpinResult } from '@/stores/gameStore';

interface WinCelebrationProps {
  visible: boolean;
  result: SpinResult | null;
}

const TIER_CONFIG = {
  MEGA_WIN: { glow: 'rgba(227,38,54,0.6)', label: 'MEGA WIN', color: '#E32636', coins: false },
  EPIC_WIN: { glow: 'rgba(255,215,0,0.6)', label: 'EPIC WIN', color: '#FFD700', coins: true },
} as const;

export function WinCelebration({ visible, result }: WinCelebrationProps) {
  const [countValue, setCountValue] = useState(0);
  const headlineRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !result) return;
    const config = TIER_CONFIG[result.category as keyof typeof TIER_CONFIG];
    if (!config) return;

    setCountValue(0);

    const duration = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCountValue(result.totalWin * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    const startTimer = setTimeout(() => requestAnimationFrame(tick), 500);

    if (headlineRef.current) {
      gsap.fromTo(headlineRef.current, { scale: 0.3, opacity: 0, rotation: -5 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' });
    }
    if (ringRef.current) {
      gsap.fromTo(ringRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' });
    }

    return () => clearTimeout(startTimer);
  }, [visible, result]);

  if (!visible || !result) return null;
  const config = TIER_CONFIG[result.category as keyof typeof TIER_CONFIG];
  if (!config) return null;

  const multiplier = (result.totalWin / result.bet).toFixed(1);

  return (
    <div className="pointer-events-none fixed inset-0 z-[45] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, ${config.glow}, transparent 60%)` }} />
      <div ref={ringRef} className="absolute left-1/2 top-1/2 h-[80vw] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full border-2" style={{ borderColor: config.color, opacity: 0.2 }} />
      {config.coins && Array.from({ length: 48 }).map((_, i) => (
        <span key={i} className="absolute block h-3 w-3 rounded-full" style={{ left: `${Math.random() * 100}%`, top: '-5%', backgroundColor: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FF6B00' : '#E32636', animation: `coinFall ${1.5 + Math.random() * 1.5}s linear ${Math.random() * 0.8}s infinite` }} />
      ))}
      <div ref={headlineRef} className="relative z-10 flex flex-col items-center gap-3">
        <p className="font-display text-sm font-semibold tracking-[0.4em] text-gold-300">{config.label}</p>
        <p className="font-display text-5xl font-bold tabular-nums text-gold-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)] sm:text-6xl">{formatCredits(countValue)}</p>
        <div className="rounded-full border-2 border-gold-400/60 bg-obsidian-900/80 px-4 py-1">
          <span className="font-display text-lg font-bold text-ember-400">{multiplier}x BET</span>
        </div>
      </div>
    </div>
  );
}
