# Task 010: Full Layer Set Definitions

## Goal
Define all 10 layers with placeholder implementations, establishing the complete scale journey.

## Acceptance Criteria
- [ ] All 10 layers defined in registry
- [ ] Each layer has placeholder render (colored gradient + label)
- [ ] Full zoom from quark to universe works
- [ ] Crossfades smooth at all transitions
- [ ] Scale indicator shows correct names
- [ ] `pnpm check` passes

## Layer Definitions

| # | ID | logScale Range | Real Scale | Color | Content Description |
|---|-----|----------------|------------|-------|---------------------|
| 1 | quark | -16 to -14 | 10⁻¹⁶ to 10⁻¹⁴ m | violet | Quarks, quantum foam |
| 2 | nucleus | -14 to -11 | 10⁻¹⁴ to 10⁻¹¹ m | indigo | Protons, neutrons, nucleus |
| 3 | atom | -11 to -9 | 10⁻¹¹ to 10⁻⁹ m | blue | Electron clouds, atoms |
| 4 | molecule | -9 to -7 | 10⁻⁹ to 10⁻⁷ m | cyan | DNA, molecules |
| 5 | cell | -7 to -4 | 10⁻⁷ to 10⁻⁴ m | teal | Cells, organelles |
| 6 | human | -4 to 3 | 10⁻⁴ to 10³ m | green | Skin → person → park |
| 7 | earth | 3 to 7 | 10³ to 10⁷ m | yellow | City → Earth |
| 8 | solar | 7 to 13 | 10⁷ to 10¹³ m | orange | Solar system |
| 9 | stellar | 13 to 20 | 10¹³ to 10²⁰ m | red | Stars, nebulae, Milky Way |
| 10 | cosmic | 20 to 26 | 10²⁰ to 10²⁶ m | magenta | Galaxies, clusters, universe |

## Overlap Strategy

Each layer overlaps neighbors by 1-2 orders of magnitude for smooth crossfade:
- quark [−16, −14] ↔ nucleus [−14, −11]: overlap at −14
- nucleus [−14, −11] ↔ atom [−11, −9]: overlap at −11
- etc.

## Placeholder Implementation

```typescript
class PlaceholderLayer implements ILayer {
  constructor(
    public readonly id: string,
    public readonly minLogScale: number,
    public readonly maxLogScale: number,
    private readonly color: string,
    private readonly label: string
  ) {}

  render(ctx: CanvasRenderingContext2D, logScale: number): void {
    const { width, height } = ctx.canvas;
    
    // Gradient background
    const gradient = ctx.createRadialGradient(
      width/2, height/2, 0,
      width/2, height/2, width/2
    );
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'black');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Label
    ctx.fillStyle = 'white';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, width/2, height/2);
    ctx.fillText(`10^${logScale.toFixed(1)} m`, width/2, height/2 + 30);
  }
}
```

## File Structure

```
src/layers/
├── types.ts
├── registry.ts      # All layer configs
├── visibility.ts
├── placeholder/
│   └── PlaceholderLayer.ts
├── quark/
│   └── QuarkLayer.ts
├── nucleus/
│   └── NucleusLayer.ts
... (one folder per layer)
└── index.ts
```

## Notes
- Start with PlaceholderLayer for all
- Replace with real implementations one at a time
- Pixel art can be added incrementally
- This task establishes structure, not final art
