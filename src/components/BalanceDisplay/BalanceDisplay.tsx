import { formatCredits } from '@/utils/format';
import { CURRENCY } from '@/config/game';

interface BalanceDisplayProps {
  balance: number;
}

export function BalanceDisplay({ balance }: BalanceDisplayProps) {
  return (
    <div className="mt-3 text-center">
      <span className="text-[10px] font-semibold tracking-[0.2em] text-gold-100/60">BALANCE</span>
      <p className="font-display text-lg font-bold tabular-nums text-gold-400">{formatCredits(balance)} <span className="text-xs text-gold-100/50">{CURRENCY}</span></p>
    </div>
  );
}
