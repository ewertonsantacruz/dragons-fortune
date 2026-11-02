import type {
  BalanceResponse,
  FreeSpinsCompleteResponse,
  FreeSpinsStartResponse,
  FreeSpinResponse,
  GameConfiguration,
  JackpotSpinResponse,
  JackpotState,
  JackpotWheelResult,
  SpinRequest,
  SpinResponse,
} from '@/types/game';

export interface GameApi {
  getGameConfiguration(): Promise<GameConfiguration>;
  getBalance(): Promise<BalanceResponse>;
  spin(request: SpinRequest): Promise<SpinResponse>;
  startFreeSpins(triggeringBet: number): Promise<FreeSpinsStartResponse>;
  freeSpin(triggeringBet: number): Promise<FreeSpinResponse>;
  completeFreeSpins(): Promise<FreeSpinsCompleteResponse>;
  getJackpotState(): Promise<JackpotState>;
  contributeToJackpot(bet: number): Promise<JackpotSpinResponse>;
  spinJackpotWheel(): Promise<JackpotWheelResult>;
}

export class GameApiError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'GameApiError';
    this.code = code;
  }
}
