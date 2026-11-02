import { Flame, Music, Settings, Volume2 } from 'lucide-react';
import { ASSET_PATHS } from '@/config/assets';

interface GameHeaderProps {
  onPaytable: () => void;
  onAudio: () => void;
}

export function GameHeader({ onPaytable, onAudio }: GameHeaderProps) {
  return (
    <header className="relative z-20 flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <img src={ASSET_PATHS.logo} alt="Dragon's Fortune" className="h-8 w-auto" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <Flame className="h-6 w-6 text-ember-500" />
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onPaytable} aria-label="Paytable" className="rounded-lg p-2 text-gold-300 transition hover:text-gold-100">
          <Settings className="h-5 w-5" />
        </button>
        <button type="button" onClick={onAudio} aria-label="Audio settings" className="rounded-lg p-2 text-gold-300 transition hover:text-gold-100">
          <Volume2 className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
