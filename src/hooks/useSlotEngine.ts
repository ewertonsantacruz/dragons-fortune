import { useEffect, useRef } from 'react';
import { ReelEngine } from '@/engine/reels/ReelEngine';

export function useSlotEngine() {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ReelEngine | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const engine = new ReelEngine(hostRef.current);
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return { hostRef, engineRef };
}
