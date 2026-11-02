import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { REEL_STEP, REELS_HEIGHT, SYMBOL_SIZE, REELS_Y } from './layout';
import type { SymbolId } from '@/types/game';

const POOL_SIZE = 5;

/** One reel: its mask clips only the sprite layer, not the entire reel container. */
export class Reel {
  readonly view = new Container();
  private readonly strip = new Container();
  private readonly sprites: Sprite[] = [];
  private symbols: SymbolId[] = [];

  constructor(x: number) {
    this.view.position.set(x, REELS_Y);

    const viewportMask = new Graphics()
      .rect(0, 0, SYMBOL_SIZE, REELS_HEIGHT)
      .fill(0xffffff);

    this.view.addChild(viewportMask);
    this.view.addChild(this.strip);
    this.strip.mask = viewportMask;

    for (let i = 0; i < POOL_SIZE; i++) {
      const sprite = new Sprite(Texture.EMPTY);
      sprite.anchor.set(0.5);
      sprite.x = SYMBOL_SIZE / 2;
      sprite.y = SYMBOL_SIZE / 2 + i * REEL_STEP;
      this.strip.addChild(sprite);
      this.sprites.push(sprite);
    }
  }

  setSymbols(symbols: SymbolId[], textures: Map<SymbolId, Texture>) {
    this.symbols = [...symbols];
    symbols.forEach((id, i) => {
      const sprite = this.sprites[i];
      if (!sprite) return;
      const tex = textures.get(id);
      if (!tex || tex.width <= 0 || tex.height <= 0) return;
      sprite.texture = tex;
      const scale = Math.min(SYMBOL_SIZE / tex.width, SYMBOL_SIZE / tex.height);
      sprite.scale.set(scale);
      sprite.position.set(SYMBOL_SIZE / 2, SYMBOL_SIZE / 2 + i * REEL_STEP);
    });
  }

  getSymbolAt(row: number): SymbolId | null {
    return this.symbols[row] ?? null;
  }

  getSpriteAt(row: number): Sprite | undefined {
    return this.sprites[row];
  }

  getSprites(): readonly Sprite[] {
    return this.sprites;
  }
}
