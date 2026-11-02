import { useEffect, useRef } from 'react';
import { audioEngine } from '@/services/audio/AudioEngine';

export function useAudio() {
  const unlocked = useRef(false);

  useEffect(() => {
    if (unlocked.current) return;
    const unlock = () => {
      audioEngine.unlock();
      unlocked.current = true;
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return {
    muted: audioEngine.isMuted(),
    toggleMute: () => audioEngine.setMuted(!audioEngine.isMuted()),
    sfxVolume: audioEngine.getSfxVolume(),
    musicVolume: audioEngine.getMusicVolume(),
    changeSfxVolume: (v: number) => audioEngine.setSfxVolume(v),
    changeMusicVolume: (v: number) => audioEngine.setMusicVolume(v),
  };
}
