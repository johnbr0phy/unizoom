# Task 002: Canvas Setup and Render Loop

## Goal
Create a fullscreen canvas with a proper requestAnimationFrame render loop.

## Acceptance Criteria
- [ ] Canvas fills viewport (100vw x 100vh)
- [ ] Canvas resizes on window resize
- [ ] RAF loop running with deltaTime calculation
- [ ] Render function clears and draws placeholder (centered circle)
- [ ] FPS counter in dev mode (console.log every 60 frames)
- [ ] `pnpm check` passes

## Relevant Files
- `src/main.ts`
- `src/rendering/canvas.ts` (new)
- `src/rendering/loop.ts` (new)
- `src/rendering/index.ts` (new)

## Context
The render loop will later call layer.render() for each visible layer. For now just draw a placeholder.

```typescript
// src/rendering/loop.ts structure
export function startLoop(onUpdate: (dt: number) => void, onRender: () => void): void;
export function stopLoop(): void;
```

## Notes
- Use `performance.now()` for timing, not Date
- Handle device pixel ratio for crisp rendering on retina displays
- Canvas context should be stored, not re-fetched each frame
