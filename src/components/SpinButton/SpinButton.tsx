interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
  state: 'READY' | 'SPINNING' | 'DISABLED' | 'ERROR';
}

export function SpinButton({ onClick, disabled, state }: SpinButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Spin"
      className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-400 bg-gradient-to-br from-gold-300 to-gold-500 shadow-[0_0_20px_rgba(255,215,0,0.4)] transition active:scale-95 disabled:opacity-50"
    >
      <span className="font-display text-sm font-bold text-ruby-700">{state === 'SPINNING' ? '...' : 'SPIN'}</span>
    </button>
  );
}
