# Task 004: Zoom Input Handling (Desktop)

## Goal
Implement mouse wheel zoom that modifies camera.targetLogScale.

## Acceptance Criteria
- [ ] Wheel scroll changes targetLogScale
- [ ] Scroll up = zoom in (decrease logScale toward quarks)
- [ ] Scroll down = zoom out (increase logScale toward universe)
- [ ] Zoom speed feels natural (~0.5 orders of magnitude per scroll click)
- [ ] Camera clamps to valid range
- [ ] Trackpad pinch works (sends wheel events with ctrlKey)
- [ ] Prevent page scroll when hovering canvas
- [ ] `pnpm check` passes

## Relevant Files
- `src/input/zoom.ts` (new)
- `src/input/index.ts` (new)
- `src/main.ts` (integrate)

## Context
From research: trackpad pinch-zoom sends wheel events with `ctrlKey: true`. Handle both cases.

```typescript
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  
  // Normalize delta (different browsers/devices vary wildly)
  const delta = e.deltaY > 0 ? 1 : -1;
  
  // ctrlKey indicates pinch gesture on trackpad
  const speed = e.ctrlKey ? PINCH_SPEED : WHEEL_SPEED;
  
  camera.targetLogScale = clamp(
    camera.targetLogScale + delta * speed,
    MIN_LOG_SCALE,
    MAX_LOG_SCALE
  );
}, { passive: false });
```

## Notes
- `{ passive: false }` required for preventDefault
- Consider debouncing for performance if needed
- Display current scale on screen for debugging (temporary UI)
