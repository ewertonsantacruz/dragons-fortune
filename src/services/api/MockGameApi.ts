import { BET_LEVELS, CURRENCY, DEFAULT_BET_INDEX, EGG_OPTIONS, GAME_NAME, JACKPOTS, JACKPOT_WHEEL_SEGMENTS, PAYLINES, PROGRESSIVE_JACKPOT_CONTRIBUTION, PROGRESSIVE_JACKPOT_HIT_THRESHOLD, PROGRESSIVE_JACKPOT_SEED, STARTING_BALANCE, TIMING } from '@/config/game';
import type { BalanceResponse, EggPickResult, FreeSpinsCompleteResponse, FreeSpinsStartResponse, FreeSpinResponse, GameConfiguration, JackpotSpinResponse, JackpotState, JackpotWheelResult, JackpotWheelSegment, SpinRequest, SpinResponse } from '@/types/game';
import { GameApiError, type GameApi } from './GameApi';
import { SPIN_FIXTURES, fixtureToGrid } from './mock/fixtures';
import { evaluateGrid } from './mock/evaluateWins';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const roundCents = (value: number) => Math.round(value * 100) / 100;

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export class MockGameApi implements GameApi {
  private balance = STARTING_BALANCE;
  private spinCount = 0;
  private bonusActive = false;
  private bonusBet = 0;
  private bonusSpinsRemaining = 0;
  private bonusMultiplier = 1;
  private bonusTotal = 0;
  private progressiveJackpot = PROGRESSIVE_JACKPOT_SEED;

  async getGameConfiguration(): Promise<GameConfiguration> {
    return { name: GAME_NAME, currency: CURRENCY, betLevels: BET_LEVELS, defaultBetIndex: DEFAULT_BET_INDEX, paylines: PAYLINES, jackpots: JACKPOTS };
  }

  async getBalance(): Promise<BalanceResponse> {
    return { balance: this.balance, currency: CURRENCY };
  }

  async spin({ bet }: SpinRequest): Promise<SpinResponse> {
    await wait(TIMING.mockLatencyMs);
    if (!BET_LEVELS.includes(bet)) throw new GameApiError('INVALID_BET', 'That bet is not available.');
    if (bet > this.balance) throw new GameApiError('INSUFFICIENT_FUNDS', 'Not enough DEMO CREDITS for this bet.');
    const fixture = SPIN_FIXTURES[this.spinCount % SPIN_FIXTURES.length];
    this.spinCount += 1;
    const grid = fixtureToGrid(fixture.rows);
    const { lineWins, totalWin, category } = evaluateGrid(grid, bet);
    this.balance = roundCents(this.balance - bet + totalWin);
    this.progressiveJackpot = roundCents(this.progressiveJackpot + bet * PROGRESSIVE_JACKPOT_CONTRIBUTION);
    return { spinId: `mock-${this.spinCount}`, grid, lineWins, totalWin, category, balance: this.balance };
  }

  async startFreeSpins(triggeringBet: number): Promise<FreeSpinsStartResponse> {
    await wait(TIMING.mockLatencyMs);
    const shuffled = shuffle(EGG_OPTIONS).slice(0, 3);
    const picks: EggPickResult[] = shuffled.map((option, index) => ({ eggIndex: index, freeSpins: option.freeSpins, multiplier: option.multiplier }));
    const totalFreeSpins = picks.reduce((sum, pick) => sum + pick.freeSpins, 0);
    const multiplier = Math.max(...picks.map((pick) => pick.multiplier));
    this.bonusActive = true;
    this.bonusBet = triggeringBet;
    this.bonusSpinsRemaining = totalFreeSpins;
    this.bonusMultiplier = multiplier;
    this.bonusTotal = 0;
    return { picks, totalFreeSpins, multiplier, balance: this.balance };
  }

  async freeSpin(): Promise<FreeSpinResponse> {
    await wait(TIMING.mockLatencyMs);
    if (!this.bonusActive) throw new GameApiError('NO_BONUS', 'No free spins round is active.');
    this.spinCount += 1;
    this.bonusSpinsRemaining -= 1;
    const fixture = SPIN_FIXTURES[(this.spinCount + 3) % SPIN_FIXTURES.length];
    const grid = fixtureToGrid(fixture.rows);
    const { lineWins, totalWin, category } = evaluateGrid(grid, this.bonusBet);
    const multipliedWin = roundCents(totalWin * this.bonusMultiplier);
    this.bonusTotal = roundCents(this.bonusTotal + multipliedWin);
    return { spinId: `mock-bonus-${this.spinCount}`, grid, lineWins, totalWin: multipliedWin, category, bonusTotal: this.bonusTotal, spinsRemaining: this.bonusSpinsRemaining, balance: this.balance };
  }

  async completeFreeSpins(): Promise<FreeSpinsCompleteResponse> {
    await wait(TIMING.mockLatencyMs);
    if (!this.bonusActive) throw new GameApiError('NO_BONUS', 'No free spins round is active.');
    this.balance = roundCents(this.balance + this.bonusTotal);
    const bonusTotal = this.bonusTotal;
    const balance = this.balance;
    this.bonusActive = false;
    this.bonusBet = 0;
    this.bonusSpinsRemaining = 0;
    this.bonusMultiplier = 1;
    this.bonusTotal = 0;
    return { bonusTotal, balance };
  }

  async getJackpotState(): Promise<JackpotState> {
    await wait(TIMING.mockLatencyMs);
    return { progressiveValue: this.progressiveJackpot, seedValue: PROGRESSIVE_JACKPOT_SEED, contributionRate: PROGRESSIVE_JACKPOT_CONTRIBUTION, hitThreshold: PROGRESSIVE_JACKPOT_HIT_THRESHOLD };
  }

  async contributeToJackpot(bet: number): Promise<JackpotSpinResponse> {
    await wait(TIMING.mockLatencyMs);
    this.progressiveJackpot = roundCents(this.progressiveJackpot + bet * PROGRESSIVE_JACKPOT_CONTRIBUTION);
    return { jackpotValue: this.progressiveJackpot, balance: this.balance };
  }

  async spinJackpotWheel(): Promise<JackpotWheelResult> {
    await wait(TIMING.mockLatencyMs);
    const totalWeight = JACKPOT_WHEEL_SEGMENTS.reduce((sum, seg) => sum + seg.weight, 0);
    let roll = Math.random() * totalWeight;
    let segment: JackpotWheelSegment = 'MINI';
    let multiplier = 1;
    for (const seg of JACKPOT_WHEEL_SEGMENTS) {
      roll -= seg.weight;
      if (roll <= 0) { segment = seg.segment; multiplier = seg.multiplier; break; }
    }
    const prize = roundCents(this.progressiveJackpot * multiplier);
    this.balance = roundCents(this.balance + prize);
    this.progressiveJackpot = PROGRESSIVE_JACKPOT_SEED;
    return { segment, prize, balance: this.balance };
  }
}
