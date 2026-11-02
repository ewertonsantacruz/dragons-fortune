export const ASSET_PATHS = {
  background: '/assets/backgrounds/dragon-temple.webp',
  cabinet: '/assets/cabinet/dragon-cabinet.png',
  logo: '/assets/branding/dragon-fortune-logo.png',
  dragonCharacter: '/assets/characters/golden-dragon.png',
  symbols: (id: string) => `/assets/symbols/${id}.png`,
} as const;

export function warnMissingAsset(name: string, path: string) {
  if (import.meta.env.DEV) {
    console.warn(`[assets] Missing asset: ${name} at ${path}`);
  }
}
