import { Music, Volume2, X, Zap } from 'lucide-react';
import { audioEngine } from '@/services/audio/AudioEngine';

interface AudioSettingsPanelProps {
  open: boolean;
  sfxVolume: number;
  musicVolume: number;
  onSfxVolumeChange: (volume: number) => void;
  onMusicVolumeChange: (volume: number) => void;
  onClose: () => void;
}

function VolumeSlider({ value, onChange, icon, label, color }: { value: number; onChange: (value: number) => void; icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={color}>{icon}</span>
        <span className="font-display text-sm font-semibold tracking-wider text-gold-100">{label}</span>
        <span className="ml-auto text-xs tabular-nums text-gold-100/60">{Math.round(value * 100)}%</span>
      </div>
      <input type="range" min={0} max={1} step={0.01} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} onInput={(e) => { if (label === 'Sound Effects' && Math.random() < 0.15) audioEngine.buttonClick(); }} aria-label={`${label} volume`} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-obsidian-700 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold-400 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,215,0,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold-400" style={{ background: `linear-gradient(to right, ${value > 0 ? '#FFD700' : 'transparent'} 0%, #FFD700 ${value * 100}%, #1A1420 ${value * 100}%)` }} />
    </div>
  );
}

export function AudioSettingsPanel({ open, sfxVolume, musicVolume, onSfxVolumeChange, onMusicVolumeChange, onClose }: AudioSettingsPanelProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-obsidian-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-[fadeIn_0.25s_ease-out] relative z-10 w-full max-w-sm rounded-2xl border border-gold-500/40 bg-gradient-to-b from-obsidian-700 to-obsidian-800 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(255,215,0,0.15)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-wide text-gold-300">Audio Settings</h2>
          <button type="button" onClick={onClose} aria-label="Close audio settings" className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-500/40 bg-obsidian-900 text-gold-300 transition hover:border-gold-400 hover:text-gold-100 active:scale-95"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-5">
          <VolumeSlider value={sfxVolume} onChange={onSfxVolumeChange} icon={<Zap className="h-4 w-4" />} label="Sound Effects" color="text-ember-400" />
          <div className="h-px bg-gold-500/20" />
          <VolumeSlider value={musicVolume} onChange={onMusicVolumeChange} icon={<Music className="h-4 w-4" />} label="Background Music" color="text-gold-400" />
        </div>
        <p className="mt-4 text-center text-[10px] text-gold-100/40">Adjust each channel independently. Settings apply in real time.</p>
      </div>
    </div>
  );
}
