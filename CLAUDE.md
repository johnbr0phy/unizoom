# CLAUDE.md — Powers of Ten in Pixels

> A pixel art recreation of the 1977 Eames "Powers of Ten" film as an interactive zoomable experience.

## Project Vision

Scroll from quarks to the observable universe. Fixed zoom path, no panning. Pixel art layers crossfade as you traverse ~42 orders of magnitude (10⁻¹⁶ to 10²⁶ meters). Multiplayer presence comes later — nail the zoom feel first.

---

## Architecture Principles

### Monorepo Structure

Everything in one place. No context switching.

```
/powers-of-ten
├── CLAUDE.md              # This file — read every session
├── README.md              # User-facing docs
├── package.json           # Workspace root
├── tsconfig.json          # Shared TS config
├── biome.json             # Linting + formatting
├── /src
│   ├── /core              # Camera, coordinates, scale math
│   ├── /layers            # Each scale layer is a self-contained module
│   ├── /rendering         # Canvas/WebGL setup, draw loop
│   ├── /ui                # Scale indicator, controls
│   ├── /assets            # Pixel art sprites per layer
│   └── main.ts            # Entry point
├── /tasks                 # Micro-task files for Claude
├── /tests                 # Vitest tests
└── /dist                  # Build output
```

### Vertical Slice Architecture

Each layer is a self-contained feature module:

```
/src/layers/solar-system/
├── index.ts           # Public exports
├── SolarSystemLayer.ts    # Layer class implementing ILayer
├── sprites.ts         # Sprite definitions
├── constants.ts       # Scale range, colors
└── SolarSystemLayer.test.ts
```

Layers don't import from each other. They implement a shared `ILayer` interface.

---

## Technical Architecture

### The Core Problem

JavaScript floats have ~15.9 significant digits. We need 42 orders of magnitude. Solution: **logarithmic scale as single source of truth**.

### Coordinate System

**No x/y panning** — this is a fixed-path zoom like the original film. Position is implicit in the content.

```typescript
// Camera state is just the scale exponent
interface Camera {
  logScale: number;     // -16 (quarks) to 26 (universe)
  targetLogScale: number; // For smooth animation
}

// Scale conversion
const getScale = (logScale: number) => Math.pow(10, logScale);
const getLogScale = (scale: number) => Math.log10(scale);
```

### Layer System

```typescript
interface ILayer {
  id: string;
  minLogScale: number;  // Layer visible when logScale >= this
  maxLogScale: number;  // Layer visible when logScale <= this
  
  // Opacity based on position within range (for crossfade)
  getOpacity(logScale: number): number;
  
  // Render at current scale
  render(ctx: CanvasRenderingContext2D, scale: number): void;
  
  // Optional: update animations
  update?(deltaTime: number): void;
}
```

### Layer Registry

```typescript
// Layers ordered from smallest to largest scale
const LAYERS: LayerConfig[] = [
  { id: 'quark',        minLog: -16, maxLog: -14, content: QuarkLayer },
  { id: 'atom',         minLog: -14, maxLog: -10, content: AtomLayer },
  { id: 'molecule',     minLog: -10, maxLog: -8,  content: MoleculeLayer },
  { id: 'cell',         minLog: -8,  maxLog: -5,  content: CellLayer },
  { id: 'human',        minLog: -5,  maxLog: 1,   content: HumanLayer },
  { id: 'city',         minLog: 1,   maxLog: 5,   content: CityLayer },
  { id: 'earth',        minLog: 5,   maxLog: 7,   content: EarthLayer },
  { id: 'solar-system', minLog: 7,   maxLog: 13,  content: SolarSystemLayer },
  { id: 'galaxy',       minLog: 13,  maxLog: 21,  content: GalaxyLayer },
  { id: 'universe',     minLog: 21,  maxLog: 26,  content: UniverseLayer },
];
```

### Zoom Implementation

From deep research: interpolate in log-space for perceptually smooth zoom.

```typescript
// Smooth zoom animation
function updateCamera(camera: Camera, deltaTime: number): void {
  const SMOOTHING = 0.1;
  camera.logScale += (camera.targetLogScale - camera.logScale) * SMOOTHING;
}

// Wheel/pinch input
function handleZoom(delta: number): void {
  // Each scroll unit = ~0.5 orders of magnitude
  const ZOOM_SPEED = 0.5;
  camera.targetLogScale = clamp(
    camera.targetLogScale + delta * ZOOM_SPEED,
    MIN_LOG_SCALE,  // -16
    MAX_LOG_SCALE   // 26
  );
}
```

### Crossfade Transitions

Layers overlap by 1-2 orders of magnitude. Opacity ramps up/down at edges.

```typescript
function getLayerOpacity(layer: LayerConfig, logScale: number): number {
  const FADE_RANGE = 1; // 1 order of magnitude fade
  
  if (logScale < layer.minLog || logScale > layer.maxLog) return 0;
  
  // Fade in at bottom of range
  if (logScale < layer.minLog + FADE_RANGE) {
    return (logScale - layer.minLog) / FADE_RANGE;
  }
  
  // Fade out at top of range
  if (logScale > layer.maxLog - FADE_RANGE) {
    return (layer.maxLog - logScale) / FADE_RANGE;
  }
  
  return 1;
}
```

### Rendering

Canvas 2D is sufficient for this (no WebGL needed — we're drawing pre-made sprites).

```typescript
function render(ctx: CanvasRenderingContext2D, camera: Camera): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const visibleLayers = layers.filter(l => 
    camera.logScale >= l.minLog && camera.logScale <= l.maxLog
  );
  
  for (const layer of visibleLayers) {
    ctx.globalAlpha = getLayerOpacity(layer, camera.logScale);
    layer.render(ctx, getScale(camera.logScale));
  }
  
  ctx.globalAlpha = 1;
}
```

---

## Tooling & Commands

### Single Check Command

Run this after every change:

```bash
pnpm check
```

This runs (in sequence):
1. `biome check --apply` — format + lint
2. `tsc --noEmit` — type checking  
3. `vitest run` — tests

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "check": "biome check --apply && tsc --noEmit && vitest run",
    "test": "vitest",
    "test:watch": "vitest watch"
  }
}
```

### Pre-commit Hook

Runs `pnpm check` before every commit. Configured via simple-git-hooks.

---

## Code Conventions

### TypeScript

- Strict mode enabled
- No `any` — use `unknown` and narrow
- Interfaces over types for object shapes
- Const assertions for literal configs

### File Naming

- `PascalCase.ts` for classes/components
- `camelCase.ts` for utilities/functions
- `SCREAMING_SNAKE.ts` for constants-only files
- `*.test.ts` co-located with source

### Imports

```typescript
// External dependencies first
import { createCanvas } from 'canvas';

// Internal absolute imports (from src/)
import { Camera } from '@/core/Camera';
import { ILayer } from '@/layers/types';

// Relative imports last (same feature)
import { SCALE_RANGE } from './constants';
```

### State Management

No framework. Simple module-level state:

```typescript
// src/core/state.ts
export const state = {
  camera: { logScale: 0, targetLogScale: 0 },
  layers: [] as ILayer[],
  isRunning: false,
};
```

---

## Asset Pipeline

### Pixel Art Specs

- Base resolution: 512x512 per layer
- Color palette: Limited (8-16 colors per layer for cohesion)
- Format: PNG with transparency
- Naming: `{layer-id}-{variant}.png`

### Loading

```typescript
async function loadLayerAssets(layerId: string): Promise<HTMLImageElement[]> {
  const manifest = await import(`@/assets/${layerId}/manifest.json`);
  return Promise.all(manifest.sprites.map(loadImage));
}
```

---

## Testing Strategy

### Unit Tests

Test pure functions: scale math, opacity calculations, layer visibility.

```typescript
// src/core/Camera.test.ts
describe('getLayerOpacity', () => {
  it('returns 0 outside layer range', () => {
    expect(getLayerOpacity(solarSystemLayer, 5)).toBe(0);
  });
  
  it('returns 1 in middle of range', () => {
    expect(getLayerOpacity(solarSystemLayer, 10)).toBe(1);
  });
  
  it('fades at edges', () => {
    const opacity = getLayerOpacity(solarSystemLayer, 7.5);
    expect(opacity).toBeGreaterThan(0);
    expect(opacity).toBeLessThan(1);
  });
});
```

### Visual Regression (Later)

Playwright screenshots at key scale points.

---

## Task Format

Tasks live in `/tasks` as markdown files. Format:

```markdown
# Task: [Short Title]

## Goal
One sentence describing the outcome.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] `pnpm check` passes

## Relevant Files
- `src/core/Camera.ts`
- `src/layers/types.ts`

## Context
Any additional context or constraints.

## Notes
Implementation hints if needed.
```

---

## Milestones

### M1: Foundation
- [ ] Project scaffold (Vite + TS + Biome)
- [ ] Canvas setup with RAF loop
- [ ] Camera state with log scale
- [ ] Wheel zoom input (desktop)

### M2: Layer System
- [ ] ILayer interface
- [ ] Layer registry
- [ ] Opacity/crossfade logic
- [ ] 2 placeholder layers (colored rectangles)

### M3: Real Content
- [ ] Human layer (picnic scene — the classic)
- [ ] Earth layer
- [ ] Solar system layer
- [ ] Crossfade transitions working

### M4: Full Scale
- [ ] All 10 layers with placeholder art
- [ ] Scale indicator UI
- [ ] Smooth zoom feel tuned

### M5: Polish
- [ ] Final pixel art for all layers
- [ ] Touch/pinch zoom (mobile)
- [ ] Performance optimization
- [ ] PWA setup

### M6: Multiplayer (Future)
- [ ] WebSocket connection
- [ ] Player cursors at scale
- [ ] Presence indicators

---

## Reference Implementation Details

### Logarithmic Zoom (from research)

```typescript
// Perceptually smooth zoom animation
function lerpLogScale(current: number, target: number, t: number): number {
  return current + (target - current) * t;
}

// NOT this (jerky at large scales):
// function lerpScale(current, target, t) {
//   return current + (target - current) * t;
// }
```

### Touch Handling (from research)

```css
/* Prevent browser zoom, enable custom handling */
.canvas-container {
  touch-action: none;
}
```

```typescript
// Pinch zoom with Hammer.js or native
let initialLogScale: number;

onPinchStart((e) => {
  initialLogScale = camera.targetLogScale;
});

onPinch((e) => {
  // scale: 1 = no change, 2 = double size, 0.5 = half size
  const logDelta = Math.log10(e.scale);
  camera.targetLogScale = clamp(
    initialLogScale - logDelta,
    MIN_LOG_SCALE,
    MAX_LOG_SCALE
  );
});
```

### Scale Indicator UI

```typescript
function formatScale(logScale: number): string {
  const scale = Math.pow(10, logScale);
  
  if (logScale < -9) return `${scale.toExponential(1)} m`;
  if (logScale < -6) return `${(scale * 1e9).toFixed(1)} nm`;
  if (logScale < -3) return `${(scale * 1e6).toFixed(1)} μm`;
  if (logScale < 0) return `${(scale * 1e3).toFixed(1)} mm`;
  if (logScale < 3) return `${scale.toFixed(1)} m`;
  if (logScale < 6) return `${(scale / 1e3).toFixed(1)} km`;
  if (logScale < 9) return `${(scale / 1e6).toFixed(1)} Mm`;
  return `${scale.toExponential(1)} m`;
}
```

---

## Common Pitfalls

1. **Linear zoom feels wrong** — Always interpolate in log space
2. **Layers pop in/out** — Ensure overlap ranges and smooth crossfade
3. **Mobile zoom conflicts** — Set `touch-action: none` on canvas container
4. **Scroll hijacking** — Only capture wheel events when canvas is focused/hovered
5. **Floating point at extremes** — Not an issue here since we only use logScale, never raw scale for position

---

## Quick Reference

```typescript
// Scale conversion
Math.pow(10, logScale)  // logScale → meters
Math.log10(meters)      // meters → logScale

// Human scale
logScale = 0  // 1 meter

// Clamp helper
const clamp = (n: number, min: number, max: number) => 
  Math.min(Math.max(n, min), max);

// Layer visibility check
const isVisible = (layer: LayerConfig, logScale: number) =>
  logScale >= layer.minLog && logScale <= layer.maxLog;
```

---

## Run Commands Summary

```bash
pnpm dev      # Start dev server
pnpm check    # Format + lint + typecheck + test (run after changes)
pnpm build    # Production build
pnpm test     # Run tests in watch mode
```
