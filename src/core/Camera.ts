import {
	CAMERA_SMOOTHING,
	MAX_LOG_SCALE,
	MIN_LOG_SCALE,
} from '@/core/constants';

export interface Camera {
	logScale: number;
	targetLogScale: number;
}

export function createCamera(initialLogScale = 0): Camera {
	const clamped = clamp(initialLogScale, MIN_LOG_SCALE, MAX_LOG_SCALE);
	return {
		logScale: clamped,
		targetLogScale: clamped,
	};
}

export function updateCamera(camera: Camera, deltaTime: number): void {
	const diff = camera.targetLogScale - camera.logScale;
	if (Math.abs(diff) < 0.0001) {
		camera.logScale = camera.targetLogScale;
		return;
	}
	// Smooth interpolation in log space
	camera.logScale += diff * CAMERA_SMOOTHING * Math.min(deltaTime * 60, 2);
}

export function setTargetLogScale(camera: Camera, logScale: number): void {
	camera.targetLogScale = clamp(logScale, MIN_LOG_SCALE, MAX_LOG_SCALE);
}

export function getScale(logScale: number): number {
	return 10 ** logScale;
}

export function getLogScale(scale: number): number {
	return Math.log10(scale);
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

const SCALE_UNITS: Array<{ exp: number; unit: string }> = [
	{ exp: -15, unit: 'fm' },
	{ exp: -12, unit: 'pm' },
	{ exp: -9, unit: 'nm' },
	{ exp: -6, unit: 'μm' },
	{ exp: -3, unit: 'mm' },
	{ exp: 0, unit: 'm' },
	{ exp: 3, unit: 'km' },
	{ exp: 6, unit: 'Mm' },
	{ exp: 9, unit: 'Gm' },
	{ exp: 12, unit: 'Tm' },
	{ exp: 15, unit: 'Pm' },
	{ exp: 18, unit: 'Em' },
	{ exp: 21, unit: 'Zm' },
	{ exp: 24, unit: 'Ym' },
];

export function formatScale(logScale: number): string {
	// Find the appropriate unit
	let selectedUnit = SCALE_UNITS[0];
	for (const unit of SCALE_UNITS) {
		if (logScale >= unit.exp) {
			selectedUnit = unit;
		} else {
			break;
		}
	}

	if (selectedUnit === undefined) {
		return `10^${logScale.toFixed(0)} m`;
	}

	const value = 10 ** (logScale - selectedUnit.exp);

	if (value >= 1000 || value < 0.1) {
		return `10^${logScale.toFixed(0)} m`;
	}

	return `${value.toFixed(1)} ${selectedUnit.unit}`;
}
