# Task 009: Human Layer (The Classic Picnic Scene)

## Goal
Create the first real pixel art layer — the iconic human-scale picnic scene from Powers of Ten.

## Acceptance Criteria
- [ ] `HumanLayer` class implementing ILayer
- [ ] Pixel art picnic scene (person lying on blanket)
- [ ] Scene centered in canvas
- [ ] Scales appropriately within its logScale range
- [ ] Smooth crossfade with adjacent layers
- [ ] `pnpm check` passes

## Relevant Files
- `src/layers/human/HumanLayer.ts` (new)
- `src/layers/human/index.ts` (new)
- `src/assets/human/` (new - sprite files)
- `src/layers/registry.ts` (add HumanLayer)

## Layer Config
- ID: `human`
- Range: logScale -3 to 3 (millimeter to kilometer)
- Primary visibility: logScale 0 (1 meter)

## Pixel Art Specs
- Canvas: 512x512 pixels
- Style: Clean, limited palette (8-16 colors)
- Content: Top-down view of person on picnic blanket in park
- Reference: Original film frame at 10⁰ meters

## Scaling Behavior

At logScale=0 (1m view), the scene fills most of the canvas.
As you zoom out (logScale increases), the scene shrinks toward center.
As you zoom in (logScale decreases), the scene expands (showing blanket detail).

```typescript
render(ctx: CanvasRenderingContext2D, logScale: number): void {
  const baseScale = Math.pow(10, -logScale); // Inverse: zoom out = shrink
  const size = this.baseSize * baseScale;
  
  ctx.drawImage(
    this.sprite,
    (ctx.canvas.width - size) / 2,
    (ctx.canvas.height - size) / 2,
    size,
    size
  );
}
```

## Asset Loading
```typescript
// Preload sprite in constructor or init
async load(): Promise<void> {
  this.sprite = await loadImage('/assets/human/picnic.png');
}
```

## Notes
- Can use placeholder colored rectangle initially, replace with real art later
- Consider multiple sprites for different zoom levels (LOD)
- The human layer is the "anchor" — everything else is relative to this
