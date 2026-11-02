import { Application, Container, Sprite, Texture } from 'pixi.js';
import { gsap } from 'gsap';
import { Reel } from './Reel';
import { DESIGN_HEIGHT, DESIGN_WIDTH, REELS_HEIGHT, REELS_WIDTH, REELS_X, REELS_Y, SYMBOL_SIZE, reelX } from './layout';
import type { ReelGrid, SymbolId } from '@/types/game';
import { loadSymbolTextures } from '../symbols/symbolArt';

type ReelStopCallback = (reelIndex: number) => void;

export class ReelEngine {
  private app: Application;
  private world = new Container();
  private reels: Reel[] = [];
  private textures = new Map<SymbolId, Texture>();
  private grid: ReelGrid = [];
  private reelStopCallback: ReelStopCallback | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private host: HTMLElement;
  private destroyed = false;

  constructor(host: HTMLElement) {
    this.host = host;
    this.app = new Application();
    void this.init();
  }

  private async init() {
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
    for (const [id, img] of imgMap) {
      const tex = await Texture.from(img);
      this.textures.set(id, tex);
    }

    this.world.sortableChildren = true;
    this.app.stage.addChild(this.world);

    for (let r = 0; r < 5; r++) {
      const reel = new Reel(reelX(r));
      this.reels.push(reel);
      this.world.addChild(reel.view);
    }

    this.layout();
    this.resizeObserver = new ResizeObserver(() => this.layout());
    this.resizeObserver.observe(this.host);
  }

  private layout() {
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    const scale = Math.min(w / DESIGN_WIDTH, h / DESIGN_HEIGHT);
    this.world.scale.set(scale);
    this.world.x = (w - DESIGN_WIDTH * scale) / 2;
    this.world.y = (h - DESIGN_HEIGHT * scale) / 2;
    if (import.meta.env.DEV) {
      console.debug(
        `[ReelEngine.layout] canvas=${w}x${h} reels=(${REELS_X},${REELS_Y}) ${REELS_WIDTH}x${REELS_HEIGHT} step=${SYMBOL_SIZE} scale=${scale.toFixed(3)}`
      );
    }
  }

  setGrid(grid: ReelGrid) {
    this.grid = grid;
    grid.forEach((col, r) => {
      this.reels[r]?.setSymbols(col, this.textures);
    });
  }

  onReelStop(cb: ReelStopCallback) {
    this.reelStopCallback = cb;
  }

  async spin(grid: ReelGrid): Promise<void> {
    for (let r = 0; r < this.reels.length; r++) {
      gsap.fromTo(
        this.reels[r].view,
        { y: REELS_Y - 200 },
        {
          y: REELS_Y,
          duration: 0.8 + r * 0.15,
          ease: 'power3.out',
          onComplete: () => this.reelStopCallback?.(r),
        }
      );
    }
    await gsap.delayedCall(0.8 + (this.reels.length - 1) * 0.15 + 0.1, () => {});
    this.setGrid(grid);
  }

  highlightWins(cells: { reel: number; row: number }[]) {
    cells.forEach(({ reel, row }) => {
      const r = this.reels[reel];
      if (!r) return;
      const sprite = r.view.children.find((c): c is Sprite => c instanceof Sprite && c.y > row * SYMBOL_SIZE && c.y < (row + 1) * SYMBOL_SIZE + SYMBOL_SIZE);
      if (sprite) {
        gsap.fromTo(sprite, { scale: sprite.scale.x * 1.2 }, { scale: sprite.scale.x, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      }
    });
  }

  clearHighlights() {
    this.reels.forEach((reel) => {
      reel.view.children.forEach((child) => {
        if (child instanceof Sprite) {
          gsap.killTweensOf(child.scale);
        }
      });
    });
  }

  destroy() {
    this.destroyed = true;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.app.destroy(true);
  }
}
