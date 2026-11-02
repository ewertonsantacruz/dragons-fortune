import { useEffect, useState } from 'react';
import { formatCredits } from '@/utils/format';
import type { SpinResult } from '@/stores/gameStore';

interface WinDisplayProps {
  visible: boolean;
  result: SpinResult | null;
}

const BANNER_LABELS: Record<string, string> = {
  PARTIAL_RETURN: 'WIN!',
  STANDARD_WIN: 'WIN!',
  BIG_WIN: 'BIG WIN!',
  MEGA_WIN: 'MEGA WIN!',
  EPIC_WIN: 'EPIC WIN!',
  BONUS_TRIGGER: 'BONUS!',
};

export function WinDisplay({ visible, result }: WinDisplayProps) {
  const [countValue, setCountValue] = useState(0);

  useEffect(() => {
    if (!visible || !result) return;
    if (result.category === 'NO_WIN') return;
    if (result.category === 'MEGA_WIN' || result.category === 'EPIC_WIN') return;

    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCountValue(result.totalWin * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, result]);

  if (!visible || !result || result.category === 'NO_WIN') return null;
  if (result.category === 'MEGA_WIN' || result.category === 'EPIC_WIN') return null;

  const label = BANNER_LABELS[result.category] ?? 'WIN!';
  const heavy = result.category === 'BIG_WIN' || result.category === 'PARTIAL_RETURN';

  return (
    <div className="pointer-events-none fixed inset-x-0 top-1/3 z-30 flex flex-col items-center gap-2">
      {result.category !== 'BONUS_TRIGGER' && (
        <>
          <div
            className="animate-[fadeIn_0.3s_ease-out] rounded-full border-2 border-gold-400/60 bg-obsidian-900/80 px-6 py-2 shadow-[0_0_30px_rgba(255,215,0,0.3)]"
            style={{ animation: `fadeIn 0.3s ease-out` }}
          >
            <span
              className="font-display text-2xl font-bold tracking-wide text-gold-300"
              style={{ animation: `pulse 0.6s ease-in-out ${heavy ? 5 : 3}` }}
            >
              {label}
            </span>
          </div>
          <p className="font-display text-3xl font-bold tabular-nums text-gold-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]">
            {formatCredits(countValue)}
          </p>
        </>
      )}
      {result.category === 'BONUS_TRIGGER' && (
        <div className="animate-[fadeIn_0.3s_ease-out] rounded-full border-2 border-ember-500/60 bg-obsidian-900/80 px-6 py-2 shadow-[0_0_30px_rgba(255,107,0,0.3)]">
          <span className="font-display text-2xl font-bold tracking-wide text-ember-400">{label}</span>
        </div>
      )}
      {heavy && (
        <div className="pointer-events-none fixed inset-0 z-20">
          {Array.from({ length: heavy ? 28 : 14 }).map((_, i) => (
            <span
              key={i}
              className="absolute block h-2 w-2 rounded-full"
              style={{
                left: '50%',
                top: '33%',
                backgroundColor: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FF6B00' : '#E32636',
                animation: `particleBurst ${0.8 + (i % 3) * 0.3}s ease-out ${(i % 5) * 0.1}s`,
                ['--vx' as string]: `${(Math.random() - 0.5) * 400}px`,
                ['--vy' as string]: `${(Math.random() - 0.5) * 400}px`,
              }}
            />
          ))}
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(${heavy ? 1.07 : 1.04}); }
          50% { transform: scale(${heavy ? 1.15 : 1.08}); }
        }
      `}</style>
    </div>
  );
}
