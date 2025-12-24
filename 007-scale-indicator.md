# Task 007: Scale Indicator UI

## Goal
Add a clean scale indicator showing current zoom level and what's visible.

## Acceptance Criteria
- [ ] Scale displayed in human-readable format (nm, μm, mm, m, km, etc.)
- [ ] Position: bottom-left corner, semi-transparent background
- [ ] Shows scale bar (visual reference line with distance)
- [ ] Optionally shows current layer name(s)
- [ ] Updates smoothly as camera animates
- [ ] Doesn't interfere with canvas interaction
- [ ] `pnpm check` passes

## Relevant Files
- `src/ui/ScaleIndicator.ts` (new)
- `src/ui/index.ts` (new)
- `src/main.ts` (integrate)
- `index.html` or CSS (styling)

## Design

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              [CANVAS]                   │
│                                         │
│                                         │
│  ┌──────────────────┐                   │
│  │ ═══════  10 km   │                   │
│  │ Solar System     │                   │
│  └──────────────────┘                   │
└─────────────────────────────────────────┘
```

## Implementation Options

**Option A: Canvas overlay**
Draw UI directly on canvas after layers. Simple, no DOM.

**Option B: HTML overlay**
Separate div positioned over canvas. Better for text rendering.

Recommend Option B — DOM text is crisper and easier to style.

## Scale Formatting

```typescript
const SCALE_UNITS = [
  { exp: -15, unit: 'fm', name: 'femtometer' },
  { exp: -12, unit: 'pm', name: 'picometer' },
  { exp: -9,  unit: 'nm', name: 'nanometer' },
  { exp: -6,  unit: 'μm', name: 'micrometer' },
  { exp: -3,  unit: 'mm', name: 'millimeter' },
  { exp: 0,   unit: 'm',  name: 'meter' },
  { exp: 3,   unit: 'km', name: 'kilometer' },
  { exp: 6,   unit: 'Mm', name: 'megameter' },
  { exp: 9,   unit: 'Gm', name: 'gigameter' },
  { exp: 12,  unit: 'Tm', name: 'terameter' },
  // ... up to observable universe
];
```

## Notes
- Scale bar length should stay roughly constant on screen
- Round to nice numbers (1, 2, 5, 10, 20, 50, 100...)
- Consider adding exponent notation for extreme scales: "10²⁶ m"
