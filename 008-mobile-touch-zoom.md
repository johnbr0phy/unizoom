# Task 008: Mobile Touch Zoom

## Goal
Add pinch-to-zoom support for mobile devices.

## Acceptance Criteria
- [ ] Pinch gesture changes targetLogScale
- [ ] Pinch out = zoom in (toward quarks)
- [ ] Pinch in = zoom out (toward universe)
- [ ] No page zoom or scroll interference
- [ ] Smooth animation during and after gesture
- [ ] Works on iOS Safari and Android Chrome
- [ ] `pnpm check` passes

## Relevant Files
- `src/input/touch.ts` (new)
- `src/input/index.ts` (update)
- `index.html` (viewport meta)
- CSS (touch-action)

## Critical CSS

```css
.canvas-container {
  touch-action: none; /* Disable ALL browser touch handling */
}
```

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

## Implementation

**Option A: Native touch events**
```typescript
let initialDistance: number | null = null;
let initialLogScale: number;

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    initialDistance = getDistance(e.touches[0], e.touches[1]);
    initialLogScale = camera.targetLogScale;
  }
});

canvas.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2 && initialDistance) {
    e.preventDefault();
    const currentDistance = getDistance(e.touches[0], e.touches[1]);
    const scale = currentDistance / initialDistance;
    const logDelta = Math.log10(scale);
    
    camera.targetLogScale = clamp(
      initialLogScale - logDelta, // minus because pinch out = zoom in
      MIN_LOG_SCALE,
      MAX_LOG_SCALE
    );
  }
}, { passive: false });

canvas.addEventListener('touchend', () => {
  initialDistance = null;
});

function getDistance(t1: Touch, t2: Touch): number {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
```

**Option B: Use @use-gesture/vanilla**
Cleaner API, handles edge cases:
```typescript
import { createGesture } from '@use-gesture/vanilla';

createGesture(canvas, {
  onPinch: ({ offset: [scale], first }) => {
    if (first) initialLogScale = camera.targetLogScale;
    camera.targetLogScale = clamp(
      initialLogScale - Math.log10(scale),
      MIN_LOG_SCALE,
      MAX_LOG_SCALE
    );
  }
});
```

## Recommendation
Start with Option A (native) to minimize dependencies. Switch to @use-gesture if edge cases appear.

## Testing
- iOS Safari: notoriously finicky with touch events
- Test on real devices, not just Chrome DevTools emulation
- Verify no page bounce/zoom when pinching at scale limits
