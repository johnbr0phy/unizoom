# Task 005: Layer System Foundation

## Goal
Create the ILayer interface, layer registry, and opacity/visibility logic.

## Acceptance Criteria
- [ ] `ILayer` interface defined
- [ ] `LayerConfig` type for registry entries
- [ ] `LAYERS` registry array (empty implementations for now)
- [ ] `getVisibleLayers(logScale)` returns layers in range
- [ ] `getLayerOpacity(layer, logScale)` returns 0-1 with fade at edges
- [ ] Fade range is configurable (default 1 order of magnitude)
- [ ] Unit tests for visibility and opacity calculations
- [ ] `pnpm check` passes

## Relevant Files
- `src/layers/types.ts` (new)
- `src/layers/registry.ts` (new)
- `src/layers/visibility.ts` (new)
- `src/layers/visibility.test.ts` (new)
- `src/layers/index.ts` (new)

## Interface Definition

```typescript
export interface ILayer {
  readonly id: string;
  readonly minLogScale: number;
  readonly maxLogScale: number;
  
  render(ctx: CanvasRenderingContext2D, logScale: number): void;
  update?(deltaTime: number): void;
  
  // Optional lifecycle
  onEnter?(): void;
  onExit?(): void;
}

export interface LayerConfig {
  id: string;
  minLog: number;
  maxLog: number;
  layer: ILayer;
}
```

## Opacity Logic

```
logScale:  |----minLog----[FADE IN]----[FULL]----[FADE OUT]----maxLog----|
opacity:   |      0       | 0→1 |      1      | 1→0  |       0          |
```

## Test Cases
- Layer with range [5, 10], logScale=7 → opacity=1
- Layer with range [5, 10], logScale=5.5 → opacity=0.5 (fading in)
- Layer with range [5, 10], logScale=4 → opacity=0 (not visible)
- `getVisibleLayers(7)` with layers at [0,5], [4,8], [6,12] → returns middle two
