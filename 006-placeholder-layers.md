# Task 006: Placeholder Layers and Render Integration

## Goal
Create 2-3 placeholder layers and integrate them with the render loop.

## Acceptance Criteria
- [ ] `PlaceholderLayer` class implementing ILayer
- [ ] Each placeholder draws a colored rectangle with label
- [ ] At least 3 layers with overlapping ranges
- [ ] Main render loop draws visible layers with correct opacity
- [ ] Crossfade visually works when zooming through overlap
- [ ] `pnpm check` passes

## Relevant Files
- `src/layers/placeholder/PlaceholderLayer.ts` (new)
- `src/layers/registry.ts` (update with placeholder layers)
- `src/rendering/renderer.ts` (new - main render function)
- `src/main.ts` (integrate everything)

## Placeholder Layers

| ID | Range | Color | Label |
|----|-------|-------|-------|
| small | -5 to 0 | blue | "MICRO" |
| human | -2 to 4 | green | "HUMAN" |
| large | 2 to 8 | red | "MACRO" |

Note the overlaps: small↔human overlap at [-2, 0], human↔large overlap at [2, 4].

## Render Implementation

```typescript
export function render(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  layers: ILayer[]
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  const visible = getVisibleLayers(layers, camera.logScale);
  
  for (const { layer, config } of visible) {
    ctx.save();
    ctx.globalAlpha = getLayerOpacity(config, camera.logScale);
    layer.render(ctx, camera.logScale);
    ctx.restore();
  }
}
```

## Visual Debug

- Display current logScale in corner
- Display visible layer IDs
- Display each layer's current opacity

## Success Test
1. Start at logScale=0 (human layer fully visible)
2. Scroll to zoom out → see green fade, red fade in
3. Scroll to zoom in → see green fade, blue fade in
4. Transitions are smooth, no popping
