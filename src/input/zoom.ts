import type { Camera } from '@/core';
import { clamp, setTargetLogScale } from '@/core/Camera';
import {
	MAX_LOG_SCALE,
	MIN_LOG_SCALE,
	PINCH_SPEED,
	WHEEL_SPEED,
} from '@/core/constants';

export function setupWheelZoom(
	canvas: HTMLCanvasElement,
	camera: Camera,
): () => void {
	const handler = (e: WheelEvent): void => {
		e.preventDefault();

		// Normalize delta across browsers
		const delta = e.deltaY > 0 ? 1 : -1;

		// ctrlKey indicates pinch gesture on trackpad
		const speed = e.ctrlKey ? PINCH_SPEED : WHEEL_SPEED;

		const newTarget = clamp(
			camera.targetLogScale + delta * speed,
			MIN_LOG_SCALE,
			MAX_LOG_SCALE,
		);

		setTargetLogScale(camera, newTarget);
	};

	canvas.addEventListener('wheel', handler, { passive: false });

	// Return cleanup function
	return () => {
		canvas.removeEventListener('wheel', handler);
	};
}
