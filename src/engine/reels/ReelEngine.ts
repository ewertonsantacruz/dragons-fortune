import { Application, Container, Texture } from 'pixi.js';
import { gsap } from 'gsap';
import { Reel } from './Reel';
import { DESIGN_HEIGHT, DESIGN_WIDTH, REELS_HEIGHT, REELS_WIDTH, REELS_X, REELS_Y, SYMBOL_SIZE, reelX } from './layout';
import type { ReelGrid, SymbolId } from '@/types/game';
import { loadSymbolTextures } from '../symbols/symbolArt';

type ReelStopCallback = (reelIndex: number) => void;
const INITIAL_SYMBOLS: SymbolId[] = [
  'golden_dragon', 'red_dragon', 'dragon_crown', 'treasure_chest',
  'ruby_crystal', 'emerald_amulet', 'golden_coin', 'mystic_lotus',
  'wild', 'scatter',
];

export class ReelEngine {
  private readonly app = new Application();
  private readonly world = new Container();
  private readonly reels: Reel[] = [];
  private readonly textures = new Map<SymbolId, Texture>();
  private grid: ReelGrid = [];
  private reelStopCallback: ReelStopCallback | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private readonly host: HTMLElement;
  private destroyed = false;
  readonly ready: Promise<void>;

  constructor(host: HTMLElement) {
    this.host = host;
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    await this.app.init({
      width: DESIGN_WIDTH,
      height: DESIGN_HEIGHT,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    if (this.destroyed) {
      this.app.destroy(true);
      return;
    }
    this.host.appendChild(this.app.canvas);
    this.app.canvas.style.width = '100%';
    this.app.canvas.style.height = '100%';
    this.app.canvas.style.display = 'block';

    const imgMap = await loadSymbolTextures();
    if (this.destroyed) return;
    for (const [id, img] of imgMap) {
      this.textures.set(id, Texture.from(img));
    }

    this.app.stage.addChild(this.world);
    for (let r = 0; r < 5; r++) {
      const reel = new Reel(reelX(r));
      this.reels.push(reel);
      this.world.addChild(reel.view);
    }

    const initialGrid: ReelGrid = Array.from({ length: 5 }, (_, r) =>
      Array.from({ length: 3 }, (_, row) => INITIAL_SYMBOLS[(r * 3 + row) % INITIAL_SYMBOLS.length])
    );
    this.applyGrid(this.grid.length ? this.grid : initialGrid);
    this.layout();
    this.resizeObserver = new ResizeObserver(() => this.layout());
    this.resizeObserver.observe(this.host);
  }

  private layout() {
    if (this.destroyed || !this.app.renderer) return;
    const w = Math.max(1, this.host.clientWidth);
    const h = Math.max(1, this.host.clientHeight);
    // Renderer coordinates and world positioning must use the same CSS-pixel space.
    this.app.renderer.resize(w, h);
    const scale = Math.min(w / DESIGN_WIDTH, h / DESIGN_HEIGHT);
    this.world.scale.set(scale);
    this.world.position.set(
      (w - DESIGN_WIDTH * scale) / 2,
      (h - DESIGN_HEIGHT * scale) / 2
    );
    if (import.meta.env.DEV) {
      console.debug(
        `[ReelEngine.layout] viewport=${w}x${h} reels=(${REELS_X},${REELS_Y}) ${REELS_WIDTH}x${REELS_HEIGHT} symbol=${SYMBOL_SIZE} scale=${scale.toFixed(3)}`
      );
    }
  }

  private applyGrid(grid: ReelGrid) {
    this.grid = grid;
    grid.forEach((col, r) => this.reels[r]?.setSymbols(col, this.textures));
  }

  setGrid(grid: ReelGrid) {
    this.grid = grid;
    if (this.reels.length === 5) this.applyGrid(grid);
  }

  onReelStop(cb: ReelStopCallback) {
    this.reelStopCallback = cb;
  }

  async spin(grid: ReelGrid): Promise<void> {
    await this.ready;
    if (this.destroyed) return;
    await Promise.all(this.reels.map((reel, r) =>
      new Promise<void>((resolve) => {
        gsap.fromTo(reel.view,
          { y: REELS_Y - 60 },
          {
            y: REELS_Y,
            duration: 0.8 + r * 0.15,
            ease: 'power3.out',
            onComplete: () => {
              this.reelStopCallback?.(r);
              resolve();
            },
          }
        );
      })
    ));
    if (!this.destroyed) this.applyGrid(grid);
  }

  highlightWins(cells: { reel: number; row: number }[]) {
    cells.forEach(({ reel, row }) => {
      const sprite = this.reels[reel]?.getSpriteAt(row);
      if (!sprite) return;
      gsap.killTweensOf(sprite.scale);
      const scale = sprite.scale.x;
      gsap.fromTo(sprite.scale, { x: scale * 1.12, y: scale * 1.12 }, {
        x: scale, y: scale, duration: 0.5, ease: 'elastic.out(1, 0.5)',
      });
    });
  }

  clearHighlights() {
    this.reels.forEach((reel) => {
      reel.getSprites().forEach((sprite) => gsap.killTweensOf(sprite.scale));
    });
  }

  destroy() {
    this.destroyed = true;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.reels.forEach((reel) => gsap.killTweensOf(reel.view));
    this.clearHighlights();
    // The async initializer owns cleanup if Pixi has not initialized yet.
    void this.ready.then(() => {
      if (this.app.renderer) this.app.destroy(true);
    }).catch((err) => console.error('[ReelEngine] Initialization failed:', err));
  }
}
