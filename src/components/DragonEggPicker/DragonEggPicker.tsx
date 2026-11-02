import { useEffect, useState } from 'react';
import { EGG_COUNT, EGGS_TO_PICK } from '@/config/game';
import type { EggPickResult } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';
import { audioEngine } from '@/services/audio/AudioEngine';

interface DragonEggPickerProps { visible: boolean; }
interface EggState { picked: boolean; revealed: boolean; result?: EggPickResult; }

const EGG_COLORS = [
  { base: '#FFD700', accent: '#B8860B', name: 'Gold' },
  { base: '#FF6B00', accent: '#8B3A00', name: 'Ember' },
  { base: '#E32636', accent: '#720913', name: 'Ruby' },
  { base: '#FFD700', accent: '#B8860B', name: 'Gold' },
  { base: '#FF6B00', accent: '#8B3A00', name: 'Ember' },
  { base: '#E32636', accent: '#720913', name: 'Ruby' },
];

export function DragonEggPicker({ visible }: DragonEggPickerProps) {
  const eggPicks = useGameStore((state) => state.eggPicks);
  const startFreeSpins = useGameStore((state) => state.startFreeSpins);
  const setBonusPhase = useGameStore((state) => state.setBonusPhase);
  const [eggs, setEggs] = useState<EggState[]>(() => Array.from({ length: EGG_COUNT }, () => ({ picked: false, revealed: false })));
  const [pickOrder, setPickOrder] = useState(0);
  const [allRevealed, setAllRevealed] = useState(false);

  useEffect(() => { if (visible) { setEggs(Array.from({ length: EGG_COUNT }, () => ({ picked: false, revealed: false }))); setPickOrder(0); setAllRevealed(false); } }, [visible]);

  const handleEggClick = async (index: number) => {
    if (pickOrder >= EGGS_TO_PICK) return;
    if (eggs[index].picked) return;
    const currentPick = pickOrder;
    const result = eggPicks[currentPick];
    setEggs((prev) => prev.map((egg, i) => (i === index ? { ...egg, picked: true } : egg)));
    audioEngine.eggCrack();
    await new Promise((resolve) => setTimeout(resolve, 600));
    setEggs((prev) => prev.map((egg, i) => (i === index ? { ...egg, revealed: true, result } : egg)));
    audioEngine.eggReveal();
    const nextOrder = currentPick + 1;
    setPickOrder(nextOrder);
    if (nextOrder >= EGGS_TO_PICK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setEggs((prev) => prev.map((egg) => ({ ...egg, revealed: true })));
      setAllRevealed(true);
      await new Promise((resolve) => setTimeout(resolve, 1400));
      await startFreeSpins(eggPicks, eggPicks.reduce((s, p) => s + p.freeSpins, 0), Math.max(...eggPicks.map((p) => p.multiplier)));
      setBonusPhase('FREE_SPIN_REQUESTING');
    }
  };

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-obsidian-900/95 via-ruby-900/90 to-obsidian-800/95" />
      <div className="absolute left-1/2 top-1/2 h-[100vw] w-[100vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,107,0,0.18),transparent_55%)]" />
      <div className="relative z-10 flex flex-col items-center gap-5 px-4 py-6">
        <div className="text-center"><p className="font-display text-xs font-semibold tracking-[0.35em] text-gold-300">PICK {Math.min(pickOrder + 1, EGGS_TO_PICK)} OF {EGGS_TO_PICK}</p><h2 className="mt-1 font-display text-2xl font-bold text-gold-100 sm:text-3xl">Choose Your Dragon Eggs</h2></div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {eggs.map((egg, index) => { const color = EGG_COLORS[index]; return (
            <button key={index} type="button" disabled={egg.picked || pickOrder >= EGGS_TO_PICK} onClick={() => void handleEggClick(index)} aria-label={`Dragon egg ${index + 1}${egg.revealed && egg.result ? `, ${egg.result.freeSpins} free spins, ${egg.result.multiplier}x multiplier` : ''}`} className="group relative flex h-24 w-24 items-center justify-center rounded-2xl sm:h-28 sm:w-28">
              {!egg.revealed ? (
                <div className={`relative h-20 w-16 sm:h-24 sm:w-20 transition-all duration-300 ${egg.picked ? 'animate-[eggShake_0.5s_ease-in-out]' : 'group-hover:scale-110 group-enabled:cursor-pointer'}`} style={{ filter: egg.picked ? 'brightness(1.3)' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
                  <svg viewBox="0 0 80 100" className="h-full w-full">
                    <defs><radialGradient id={`eggGrad-${index}`} cx="40%" cy="35%"><stop offset="0%" stopColor={color.base} stopOpacity="0.95" /><stop offset="60%" stopColor={color.accent} stopOpacity="0.9" /><stop offset="100%" stopColor={color.accent} stopOpacity="1" /></radialGradient></defs>
                    <ellipse cx="40" cy="55" rx="32" ry="42" fill={`url(#eggGrad-${index})`} />
                    <ellipse cx="30" cy="38" rx="10" ry="14" fill="white" opacity="0.25" />
                    {[0, 1, 2].map((row) => [0, 1, 2, 3].map((col) => (<ellipse key={`${row}-${col}`} cx={20 + col * 14 + (row % 2) * 7} cy={35 + row * 18} rx="6" ry="5" fill="none" stroke={color.accent} strokeWidth="0.8" opacity="0.5" />)))}
                  </svg>
                  {egg.picked && (<div className="absolute inset-0 animate-[eggCrack_0.5s_ease-out forwards]"><svg viewBox="0 0 80 100" className="h-full w-full"><path d="M 30 20 L 35 35 L 28 45 L 40 55 L 33 68 L 42 80" stroke="white" strokeWidth="2" fill="none" opacity="0.8" /><path d="M 48 25 L 52 40 L 45 50" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" /></svg></div>)}
                </div>
              ) : (
                <div className="animate-[eggReveal_0.5s_ease-out forwards] flex h-20 w-16 flex-col items-center justify-center rounded-xl border-2 border-gold-400/70 bg-gradient-to-b from-obsidian-700 to-obsidian-800 shadow-[0_0_20px_rgba(255,215,0,0.3)] sm:h-24 sm:w-20">
                  {egg.result ? (<><span className="font-display text-lg font-bold text-gold-400 sm:text-xl">{egg.result.freeSpins}</span><span className="text-[8px] font-semibold tracking-wider text-gold-100/70 sm:text-[9px]">SPINS</span><span className="mt-0.5 font-display text-sm font-bold text-ember-400 sm:text-base">{egg.result.multiplier}x</span></>) : (<span className="text-xs text-gold-100/40">—</span>)}
                </div>
              )}
            </button>
          ); })}
        </div>
        {pickOrder < EGGS_TO_PICK && !allRevealed && (<p className="text-center text-xs text-gold-100/60">Tap an egg to crack it open and reveal your reward</p>)}
        {allRevealed && (<div className="flex flex-col items-center gap-1"><p className="font-display text-sm font-semibold tracking-wider text-gold-300">EGGS COLLECTED</p><p className="text-xs text-gold-100/60">Preparing your free spins...</p></div>)}
      </div>
      <style>{`@keyframes eggShake { 0%, 100% { transform: rotate(0deg) scale(1.05); } 20% { transform: rotate(-8deg) scale(1.05); } 40% { transform: rotate(8deg) scale(1.05); } 60% { transform: rotate(-6deg) scale(1.05); } 80% { transform: rotate(6deg) scale(1.05); } } @keyframes eggCrack { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0.6; } } @keyframes eggReveal { 0% { transform: scale(0.5) rotate(-10deg); opacity: 0; } 50% { transform: scale(1.15) rotate(5deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }`}</style>
    </div>
  );
}
