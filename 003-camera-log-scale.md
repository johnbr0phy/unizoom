# Task 003: Camera State with Logarithmic Scale

## Goal
Implement camera state using logarithmic scale as the single source of truth.

## Acceptance Criteria
- [ ] Camera interface with `logScale` and `targetLogScale`
- [ ] `createCamera()` factory with initial scale (0 = human scale)
- [ ] `updateCamera(camera, dt)` smoothly animates toward target
- [ ] `getScale(logScale)` converts to meters (10^logScale)
- [ ] `formatScale(logScale)` returns human-readable string (e.g., "1.5 km")
- [ ] Constants: `MIN_LOG_SCALE = -16`, `MAX_LOG_SCALE = 26`
- [ ] Unit tests for all functions
- [ ] `pnpm check` passes

## Relevant Files
- `src/core/Camera.ts` (new)
- `src/core/Camera.test.ts` (new)
- `src/core/constants.ts` (new)
- `src/core/index.ts` (new)

## Context
From the research: interpolate in log-space for perceptually smooth zoom. The smoothing factor should feel natural — start with 0.1 and tune.

```typescript
// Animation formula
camera.logScale += (camera.targetLogScale - camera.logScale) * SMOOTHING * dt;
```

## Test Cases
- `getScale(0)` → `1`
- `getScale(3)` → `1000`
- `getScale(-3)` → `0.001`
- `formatScale(0)` → `"1.0 m"`
- `formatScale(6)` → `"1000.0 km"` or `"1.0 Mm"`
- Camera clamps to MIN/MAX range
