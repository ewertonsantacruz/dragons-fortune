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
import { GameApiError, type GameApi } from './GameApi';

export class HttpGameApi implements GameApi {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  getGameConfiguration(): Promise<GameConfiguration> {
    return this.request<GameConfiguration>('/game/configuration');
  }

  getBalance(): Promise<BalanceResponse> {
    return this.request<BalanceResponse>('/game/balance');
  }

  async spin(request: SpinRequest): Promise<SpinResponse> {
    const response = await this.request<SpinResponse>('/game/spin', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    if (!Array.isArray(response.grid) || !Array.isArray(response.lineWins) || typeof response.balance !== 'number') {
      throw new GameApiError('INVALID_RESPONSE', 'The game server returned an unexpected result.');
    }
    return response;
  }

  async startFreeSpins(triggeringBet: number): Promise<FreeSpinsStartResponse> {
    const response = await this.request<FreeSpinsStartResponse>('/game/free-spins/start', {
      method: 'POST',
      body: JSON.stringify({ bet: triggeringBet }),
    });
    if (!Array.isArray(response.picks) || typeof response.balance !== 'number') {
      throw new GameApiError('INVALID_RESPONSE', 'The game server returned an unexpected result.');
    }
    return response;
  }

  async freeSpin(triggeringBet: number): Promise<FreeSpinResponse> {
    const response = await this.request<FreeSpinResponse>('/game/free-spins/spin', {
      method: 'POST',
      body: JSON.stringify({ bet: triggeringBet }),
    });
    if (!Array.isArray(response.grid) || !Array.isArray(response.lineWins) || typeof response.balance !== 'number') {
      throw new GameApiError('INVALID_RESPONSE', 'The game server returned an unexpected result.');
    }
    return response;
  }

  async completeFreeSpins(): Promise<FreeSpinsCompleteResponse> {
    const response = await this.request<FreeSpinsCompleteResponse>('/game/free-spins/complete', {
      method: 'POST',
    });
    if (typeof response.balance !== 'number') {
      throw new GameApiError('INVALID_RESPONSE', 'The game server returned an unexpected result.');
    }
    return response;
  }

  async getJackpotState(): Promise<JackpotState> {
    const response = await this.request<JackpotState>('/game/jackpot');
    if (typeof response.progressiveValue !== 'number') {
      throw new GameApiError('INVALID_RESPONSE', 'The game server returned an unexpected result.');
    }
    return response;
  }

  async contributeToJackpot(bet: number): Promise<JackpotSpinResponse> {
    const response = await this.request<JackpotSpinResponse>('/game/jackpot/contribute', {
      method: 'POST',
      body: JSON.stringify({ bet }),
    });
    if (typeof response.jackpotValue !== 'number' || typeof response.balance !== 'number') {
      throw new GameApiError('INVALID_RESPONSE', 'The game server returned an unexpected result.');
    }
    return response;
  }

  async spinJackpotWheel(): Promise<JackpotWheelResult> {
    const response = await this.request<JackpotWheelResult>('/game/jackpot/wheel', {
      method: 'POST',
    });
    if (typeof response.prize !== 'number' || typeof response.balance !== 'number') {
      throw new GameApiError('INVALID_RESPONSE', 'The game server returned an unexpected result.');
    }
    return response;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...init?.headers },
      });
    } catch {
      throw new GameApiError('NETWORK', 'Could not reach the game server. No result was recorded.');
    }
    if (!response.ok) {
      throw new GameApiError('HTTP_ERROR', 'The game server could not complete the request. No result was recorded.');
    }
    return (await response.json()) as T;
  }
}
