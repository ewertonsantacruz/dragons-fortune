import { ASSET_PATHS } from '@/config/assets';
import type { SymbolId } from '@/types/game';

export interface LoadedSymbolTextures {
  [symbolId: string]: { texture: import('pixi.js').Texture; source: 'png' | 'svg' };
}

const htmlImageCache = new Map<string, HTMLImageElement>();
const svgCache = new Map<string, string>();

export function symbolDataUrl(id: SymbolId): string {
  const cached = svgCache.get(id);
  if (cached) return cached;
  const svg = drawSymbolSvg(id);
  const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  svgCache.set(id, url);
  return url;
}

function drawSymbolSvg(id: SymbolId): string {
  const size = 150;
  const colors: Record<string, { bg: string; fg: string; accent: string }> = {
    golden_dragon: { bg: '#1a0f00', fg: '#FFD700', accent: '#B8860B' },
    red_dragon:    { bg: '#1a0000', fg: '#E32636', accent: '#720913' },
    dragon_crown:  { bg: '#0f1a00', fg: '#FFD700', accent: '#FF6B00' },
    treasure_chest:{ bg: '#0f0a00', fg: '#B8860B', accent: '#FFD700' },
    ruby_crystal:  { bg: '#0f0000', fg: '#E32636', accent: '#C1121F' },
    emerald_amulet:{ bg: '#001a0f', fg: '#50C878', accent: '#2E8B57' },
    golden_coin:   { bg: '#0f0a00', fg: '#FFD700', accent: '#B8860B' },
    mystic_lotus:  { bg: '#0f001a', fg: '#DDA0DD', accent: '#9932CC' },
    wild:          { bg: '#0f0a1a', fg: '#FFD700', accent: '#FF6B00' },
    scatter:       { bg: '#0f1a0f', fg: '#FF6B00', accent: '#FFD700' },
  };
  const c = colors[id] ?? { bg: '#0f0a00', fg: '#FFD700', accent: '#B8860B' };
  const shapes: Record<string, string> = {
    golden_dragon: `<path d="M 75 20 Q 55 40 60 60 Q 40 70 50 90 Q 70 85 75 100 Q 80 85 100 90 Q 110 70 90 60 Q 95 40 75 20" fill="${c.fg}" opacity="0.9"/><circle cx="65" cy="50" r="4" fill="${c.accent}"/>`,
    red_dragon: `<path d="M 75 20 Q 55 40 60 60 Q 40 70 50 90 Q 70 85 75 100 Q 80 85 100 90 Q 110 70 90 60 Q 95 40 75 20" fill="${c.fg}" opacity="0.9"/><circle cx="65" cy="50" r="4" fill="${c.accent}"/>`,
    dragon_crown: `<path d="M 50 90 L 50 50 L 60 65 L 75 35 L 90 65 L 100 50 L 100 90 Z" fill="${c.fg}"/><circle cx="75" cy="55" r="6" fill="${c.accent}"/>`,
    treasure_chest: `<rect x="45" y="50" width="60" height="50" rx="4" fill="${c.fg}"/><rect x="45" y="48" width="60" height="12" fill="${c.accent}"/><circle cx="75" cy="72" r="5" fill="${c.accent}"/>`,
    ruby_crystal: `<path d="M 75 30 L 95 55 L 85 100 L 65 100 L 55 55 Z" fill="${c.fg}" opacity="0.85"/><path d="M 75 30 L 65 100 L 85 100 Z" fill="${c.accent}" opacity="0.3"/>`,
    emerald_amulet: `<circle cx="75" cy="60" r="22" fill="none" stroke="${c.fg}" stroke-width="3"/><circle cx="75" cy="60" r="14" fill="${c.fg}" opacity="0.7"/><path d="M 75 38 L 75 28" stroke="${c.accent}" stroke-width="2"/>`,
    golden_coin: `<circle cx="75" cy="75" r="30" fill="${c.fg}"/><circle cx="75" cy="75" r="22" fill="none" stroke="${c.accent}" stroke-width="2"/><text x="75" y="80" text-anchor="middle" font-size="20" fill="${c.accent}" font-family="serif">D</text>`,
    mystic_lotus: `<ellipse cx="75" cy="75" rx="8" ry="30" fill="${c.fg}" opacity="0.7"/><ellipse cx="75" cy="75" rx="30" ry="8" fill="${c.fg}" opacity="0.7"/><ellipse cx="75" cy="75" rx="20" ry="20" fill="${c.fg}" opacity="0.5"/>`,
    wild: `<text x="75" y="85" text-anchor="middle" font-size="28" font-weight="bold" fill="${c.fg}" font-family="serif">W</text><path d="M 50 100 Q 75 110 100 100" stroke="${c.accent}" stroke-width="2" fill="none"/>`,
    scatter: `<text x="75" y="80" text-anchor="middle" font-size="18" font-weight="bold" fill="${c.fg}" font-family="serif">SCATTER</text><circle cx="75" cy="50" r="10" fill="${c.accent}" opacity="0.6"/>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="12" fill="${c.bg}"/>${shapes[id] ?? ''}</svg>`;
}

export async function loadSymbolTextures(): Promise<Map<SymbolId, HTMLImageElement>> {
  const { Texture } = await import('pixi.js');
  const map = new Map<SymbolId, HTMLImageElement>();
  const ids: SymbolId[] = [
    'golden_dragon', 'red_dragon', 'dragon_crown', 'treasure_chest',
    'ruby_crystal', 'emerald_amulet', 'golden_coin', 'mystic_lotus',
    'wild', 'scatter',
  ];
  await Promise.all(
    ids.map(async (id) => {
      const pngPath = ASSET_PATHS.symbols(id);
      try {
        const res = await fetch(pngPath);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('img load'));
          img.src = url;
        });
        htmlImageCache.set(id, img);
        map.set(id, img);
        if (import.meta.env.DEV) {
          console.debug(`[symbolArt] ${id}: PNG TEXTURE ${img.naturalWidth}x${img.naturalHeight}`);
        }
      } catch {
        const url = symbolDataUrl(id);
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('svg load'));
          img.src = url;
        });
        htmlImageCache.set(id, img);
        map.set(id, img);
        if (import.meta.env.DEV) {
          console.debug(`[symbolArt] ${id}: SVG FALLBACK ${img.naturalWidth}x${img.naturalHeight}`);
        }
      }
    }),
  );
  void Texture;
  return map;
}

export function getCachedSymbolImage(id: SymbolId): HTMLImageElement | null {
  return htmlImageCache.get(id) ?? null;
}
