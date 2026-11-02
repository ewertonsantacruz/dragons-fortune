import { useEffect, useRef, useState } from 'react';
import { useSlotEngine } from '@/hooks/useSlotEngine';
import { useGameStore } from '@/stores/gameStore';
import { ASSET_PATHS } from '@/config/assets';

interface SlotMachineProps {
  lastResult: { grid: string[][]; lineWins: { cells: { reel: number; row: number }[] }[] } | null;
  isSpinning: boolean;
}

export function SlotMachine({ lastResult, isSpinning }: SlotMachineProps) {
  const { hostRef, engineRef } = useSlotEngine();
  const [cabinetError, setCabinetError] = useState(false);
  const lastGridRef = useRef<string[][] | null>(null);

  useEffect(() => {
    if (lastResult?.grid && !isSpinning) {
      if (lastGridRef.current !== lastResult.grid) {
        engineRef.current?.setGrid(lastResult.grid as any);
        lastGridRef.current = lastResult.grid;
      }
      if (lastResult.lineWins.length > 0) {
        const cells = lastResult.lineWins.flatMap((w) => w.cells);
        engineRef.current?.highlightWins(cells as any);
      }
    }
  }, [lastResult, isSpinning, engineRef]);

  return (
    <div className="relative mx-auto w-full max-w-xl">
      {!cabinetError && (
        <img src={ASSET_PATHS.cabinet} alt="" className="absolute inset-0 h-full w-full object-contain" onError={() => setCabinetError(true)} />
      )}
      <div ref={hostRef} className="relative z-10 mx-auto" style={{ width: '100%', minHeight: '300px', aspectRatio: '900 / 540' }} />
    </div>
  );
}
