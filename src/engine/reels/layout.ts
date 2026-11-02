export const DESIGN_WIDTH = 900;
export const DESIGN_HEIGHT = 540;
export const SYMBOL_SIZE = 150;
export const SYMBOL_GAP = 14;
export const REEL_STEP = SYMBOL_SIZE + SYMBOL_GAP;
export const REELS_WIDTH = 5 * REEL_STEP - SYMBOL_GAP;
export const REELS_HEIGHT = 3 * SYMBOL_SIZE + 2 * SYMBOL_GAP;
export const REELS_X = (DESIGN_WIDTH - REELS_WIDTH) / 2;
export const REELS_Y = (DESIGN_HEIGHT - REELS_HEIGHT) / 2;

export function reelX(reel: number): number {
  return REELS_X + reel * REEL_STEP;
}
