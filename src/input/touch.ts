import type { Camera } from '@/core';
import { clamp, setTargetLogScale } from '@/core/Camera';
import { MAX_LOG_SCALE, MIN_LOG_SCALE } from '@/core/constants';

interface TouchState {
	initialDistance: number | null;
	initialLogScale: number;
}

function getDistance(t1: Touch, t2: Touch): number {
	const dx = t1.clientX - t2.clientX;
	const dy = t1.clientY - t2.clientY;
	return Math.sqrt(dx * dx + dy * dy);
}

export function setupTouchZoom(
	canvas: HTMLCanvasElement,
	camera: Camera,
): () => void {
	const state: TouchState = {
		initialDistance: null,
		initialLogScale: 0,
	};

	const handleTouchStart = (e: TouchEvent): void => {
		if (e.touches.length === 2) {
			const touch1 = e.touches[0];
			const touch2 = e.touches[1];
			if (touch1 && touch2) {
				state.initialDistance = getDistance(touch1, touch2);
				state.initialLogScale = camera.targetLogScale;
			}
		}
	};

	const handleTouchMove = (e: TouchEvent): void => {
		if (e.touches.length === 2 && state.initialDistance !== null) {
			e.preventDefault();

			const touch1 = e.touches[0];
			const touch2 = e.touches[1];
			if (touch1 && touch2) {
				const currentDistance = getDistance(touch1, touch2);
				const scale = currentDistance / state.initialDistance;
				const logDelta = Math.log10(scale);

				// Minus because pinch out = zoom in (decrease logScale toward quarks)
				const newTarget = clamp(
					state.initialLogScale - logDelta,
					MIN_LOG_SCALE,
					MAX_LOG_SCALE,
				);

				setTargetLogScale(camera, newTarget);
			}
		}
	};

	const handleTouchEnd = (): void => {
		state.initialDistance = null;
	};

	canvas.addEventListener('touchstart', handleTouchStart);
	canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
	canvas.addEventListener('touchend', handleTouchEnd);
	canvas.addEventListener('touchcancel', handleTouchEnd);

	// Return cleanup function
	return () => {
		canvas.removeEventListener('touchstart', handleTouchStart);
		canvas.removeEventListener('touchmove', handleTouchMove);
		canvas.removeEventListener('touchend', handleTouchEnd);
		canvas.removeEventListener('touchcancel', handleTouchEnd);
	};
}
