import { useEffect, useRef, useState } from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { CURRENCY } from '@/config/game';
import { JACKPOT_WHEEL_SEGMENTS } from '@/config/game';
import type { JackpotWheelSegment } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';
import { audioEngine } from '@/services/audio/AudioEngine';
import { formatCredits } from '@/utils/format';

interface JackpotWheelProps { visible: boolean; }
interface Segment { segment: JackpotWheelSegment; weight: number; multiplier: number; color: string; label: string; }

const SEGMENTS: Segment[] = JACKPOT_WHEEL_SEGMENTS.map((seg) => {
  const colors: Record<JackpotWheelSegment, { color: string; label: string }> = { MINI: { color: '#B8860B', label: 'MINI' }, MINOR: { color: '#C1121F', label: 'MINOR' }, MAJOR: { color: '#FF6B00', label: 'MAJOR' }, GRAND: { color: '#FFD700', label: 'GRAND' } };
  return { ...seg, color: colors[seg.segment].color, label: colors[seg.segment].label };
});

const SEGMENT_COUNT = 16;
const TICK_ANGLE = 360 / SEGMENT_COUNT;

function buildWheelSegments(): Segment[] {
  const result: Segment[] = []; const distribution: Segment[] = [];
  SEGMENTS.forEach((seg) => { const count = Math.round((seg.weight / 100) * SEGMENT_COUNT); for (let i = 0; i < count; i++) distribution.push(seg); });
  while (distribution.length < SEGMENT_COUNT) distribution.push(SEGMENTS[0]);
  const sorted = [...distribution].sort(() => Math.random() - 0.5);
  for (let i = 0; i < SEGMENT_COUNT; i++) result.push(sorted[i % sorted.length]);
  return result;
}

export function JackpotWheel({ visible }: JackpotWheelProps) {
  const jackpotPhase = useGameStore((state) => state.jackpotPhase);
  const jackpotWheelResult = useGameStore((state) => state.jackpotWheelResult);
  const spinJackpotWheel = useGameStore((state) => state.spinJackpotWheel);
  const dismissJackpot = useGameStore((state) => state.dismissJackpot);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const wheelSegmentsRef = useRef<Segment[]>([]);
  const [wheelSegments] = useState(() => { wheelSegmentsRef.current = buildWheelSegments(); return wheelSegmentsRef.current; });

  useEffect(() => { if (visible && jackpotPhase === 'TRIGGERED') audioEngine.jackpotTrigger(); }, [visible, jackpotPhase]);
  useEffect(() => { if (jackpotPhase !== 'TRIGGERED') return; const timer = setTimeout(() => { void doSpin(); }, 1800); return () => clearTimeout(timer); }, [jackpotPhase]);
  useEffect(() => { if (jackpotPhase !== 'WHEEL_RESULT') return; setShowResult(true); if (jackpotWheelResult) audioEngine.wheelStop(jackpotWheelResult.prize); const timer = setTimeout(() => { dismissJackpot(); setShowResult(false); }, 5000); return () => clearTimeout(timer); }, [jackpotPhase, jackpotWheelResult, dismissJackpot]);

  const doSpin = async () => {
    if (spinning) return;
    setSpinning(true); setShowResult(false); audioEngine.buttonClick();
    await spinJackpotWheel();
    const result = useGameStore.getState().jackpotWheelResult;
    if (!result) { setSpinning(false); return; }
    const matchingIndices: number[] = [];
    wheelSegmentsRef.current.forEach((seg, i) => { if (seg.segment === result.segment) matchingIndices.push(i); });
    const targetIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)] ?? 0;
    const targetAngle = targetIndex * TICK_ANGLE;
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = rotation + fullSpins * 360 + (360 - targetAngle) + (Math.random() * TICK_ANGLE * 0.6 - TICK_ANGLE * 0.3);
    setRotation(finalRotation);
    const spinDuration = 4200; const tickCount = 20;
    for (let i = 0; i < tickCount; i++) setTimeout(() => audioEngine.wheelTick(), (spinDuration / tickCount) * i * (1 + i * 0.03));
    setTimeout(() => { setSpinning(false); }, spinDuration + 200);
  };

  if (!visible) return null;
  const wheelSize = 280; const radius = wheelSize / 2;
  return (
    <div className="fixed inset-0 z-[55] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-ruby-900/96 via-obsidian-900/96 to-obsidian-800/96" />
      <div className="absolute left-1/2 top-1/2 h-[80vw] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.18),transparent_50%)]" />
      {Array.from({ length: 10 }).map((_, i) => (<span key={i} className="absolute block h-1.5 w-1.5 rounded-full bg-gold-400" style={{ left: `${15 + ((i * 8.5) % 70)}%`, top: `${25 + ((i * 7.2) % 50)}%`, animation: `floatUp 2.5s ease-out ${(i % 4) * 0.3}s infinite`, opacity: 0.5 }} />))}
      <div className="relative z-10 flex flex-col items-center gap-4 px-4">
        {jackpotPhase === 'TRIGGERED' && (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 shadow-[0_0_40px_rgba(255,215,0,0.5)]"><Crown className="h-8 w-8 text-ruby-700" /></div>
            <div className="space-y-1"><p className="font-display text-xs font-semibold tracking-[0.4em] text-gold-300">JACKPOT TRIGGERED</p><h2 className="font-display text-3xl font-bold text-gold-100 drop-shadow-[0_2px_10px_rgba(255,215,0,0.4)]">DRAGON'S FORTUNE</h2><p className="text-sm text-gold-100/70">The wheel of fortune is spinning...</p></div>
          </div>
        )}
        {(jackpotPhase === 'WHEEL_SPINNING' || jackpotPhase === 'WHEEL_RESULT') && (
          <>
            <div className="relative" style={{ width: wheelSize + 20, height: wheelSize + 20 }}>
              <div className="absolute left-1/2 top-[-4px] z-20 -translate-x-1/2"><div className="h-0 w-0 border-x-[10px] border-t-[18px] border-x-transparent border-t-gold-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" /></div>
              <div className="absolute inset-0 rounded-full border-4 border-gold-500 shadow-[0_0_30px_rgba(255,215,0,0.3)]" />
              <svg viewBox={`0 0 ${wheelSize} ${wheelSize}`} className="absolute inset-[10px]" style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? `transform 4.2s cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none' }}>
                {wheelSegments.map((seg, i) => {
                  const startAngle = (i * TICK_ANGLE - 90) * (Math.PI / 180); const endAngle = ((i + 1) * TICK_ANGLE - 90) * (Math.PI / 180);
                  const x1 = radius + radius * Math.cos(startAngle); const y1 = radius + radius * Math.sin(startAngle);
                  const x2 = radius + radius * Math.cos(endAngle); const y2 = radius + radius * Math.sin(endAngle);
                  const largeArc = TICK_ANGLE > 180 ? 1 : 0; const path = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  const labelAngle = ((i + 0.5) * TICK_ANGLE - 90) * (Math.PI / 180);
                  const labelX = radius + radius * 0.65 * Math.cos(labelAngle); const labelY = radius + radius * 0.65 * Math.sin(labelAngle);
                  return (<g key={i}><path d={path} fill={seg.color} stroke="#09070D" strokeWidth="1.5" opacity="0.9" /><text x={labelX} y={labelY} fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${(i + 0.5) * TICK_ANGLE} ${labelX} ${labelY})`} style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{seg.label}</text></g>);
                })}
                <circle cx={radius} cy={radius} r="22" fill="#FFD700" stroke="#B8860B" strokeWidth="3" /><circle cx={radius} cy={radius} r="14" fill="#C1121F" />
              </svg>
            </div>
            {showResult && jackpotWheelResult && (
              <div className="animate-[fadeIn_0.5s_ease-out] flex flex-col items-center gap-2 rounded-2xl border border-gold-400/50 bg-obsidian-800/90 px-6 py-4">
                <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-gold-400" /><p className="font-display text-lg font-bold tracking-wide text-gold-300">{jackpotWheelResult.segment} JACKPOT!</p></div>
                <p className="font-display text-3xl font-bold tabular-nums text-gold-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]">{formatCredits(jackpotWheelResult.prize)}</p>
                <p className="text-xs text-gold-100/50">{CURRENCY}</p>
              </div>
            )}
            {spinning && !showResult && (<p className="font-display text-sm tracking-wider text-gold-100/60 animate-pulse">Spinning...</p>)}
          </>
        )}
      </div>
      <style>{`@keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 0.6; } 100% { transform: translateY(-50px) scale(0.2); opacity: 0; } }`}</style>
    </div>
  );
}
