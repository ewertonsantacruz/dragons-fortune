# Dragon's Fortune

A premium fantasy slot machine game built with React 18, PixiJS v8, GSAP, Zustand, and Tailwind CSS.

## Features

- 5 reels × 3 rows, 20 fixed paylines
- 10 illustrated symbols with PNG artwork and SVG fallback
- Free Spins bonus round with dragon egg picker and multipliers
- Progressive jackpot meter with jackpot wheel minigame
- Three win celebration tiers: low (particle burst), MEGA WIN overlay, EPIC WIN with coin shower
- Procedural Web Audio background music and sound effects with independent volume controls
- Mobile-first responsive layout
- Demo mode with mock API (no server required)

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

- React 18 + TypeScript + Vite
- PixiJS v8 — reel rendering and symbol animations
- GSAP — reel spin, win counters, celebration effects
- Zustand — global game state
- Tailwind CSS — UI chrome, overlays, controls
- Web Audio API — procedural music and SFX

## Asset Directories

Place premium artwork in `public/assets/`:

```
public/assets/
  backgrounds/dragon-temple.webp
  symbols/{symbol-id}.png       (golden_dragon, red_dragon, ...)
  cabinet/dragon-cabinet.png
  branding/dragon-fortune-logo.png
  characters/golden-dragon.png
```

The game uses SVG fallbacks when PNG files are not present.
