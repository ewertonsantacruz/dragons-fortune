import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { REEL_STEP, REELS_HEIGHT, SYMBOL_SIZE } from './layout';
import type { SymbolId } from '@/types/game';

const POOL_SIZE = 5;

export class Reel {
  readonly view = new Container();
  private sprites: Sprite[] = [];
  private symbols: SymbolId[] = [];
  private readonly x: number;

  constructor(x: number) {
    this.x = x;
    this.view.x = x;
    this.view.y = REELS_HEIGHT > 0 ? (540 - REELS_HEIGHT) / 2 : 38;

    const mask = new Graphics()
      .rect(0, 0, SYMBOL_SIZE, REELS_HEIGHT)
      .fill(0xffffff);
    this.view.addChild(mask);
    this.view.mask = mask;

    for (let i = 0; i < POOL_SIZE; i++) {
      const sprite = new Sprite(Texture.EMPTY);
      sprite.anchor.set(0.5);
      sprite.x = SYMBOL_SIZE / 2;
      this.view.addChild(sprite);
      this.sprites.push(sprite);
    }
  }

  setSymbols(symbols: SymbolId[], textures: Map<SymbolId, Texture>) {
    this.symbols = symbols;
    symbols.forEach((id, i) => {
      const sprite = this.sprites[i];
      if (!sprite) return;
      const tex = textures.get(id);
      if (tex) {
        sprite.texture = tex;
        const scale = Math.min(SYMBOL_SIZE / tex.width, SYMBOL_SIZE / tex.height);
        sprite.scale.set(scale);
      }
      sprite.y = SYMBOL_SIZE / 2 + i * REEL_STEP;
    });
  }

  getSymbolAt(row: number): SymbolId | null {
    return this.symbols[row] ?? null;
  }
}
