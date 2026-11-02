import type { GameApi } from './GameApi';
import { HttpGameApi } from './HttpGameApi';
import { MockGameApi } from './MockGameApi';

const apiUrl = import.meta.env.VITE_GAME_API_URL as string | undefined;

export const IS_DEMO_MODE = !apiUrl;

export function createGameApi(): GameApi {
  return apiUrl ? new HttpGameApi(apiUrl) : new MockGameApi();
}
