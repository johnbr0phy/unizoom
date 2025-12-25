import { describe, expect, it } from 'vitest';
import {
	clamp,
	createCamera,
	formatScale,
	getLogScale,
	getScale,
	setTargetLogScale,
	updateCamera,
} from './Camera';
import { MAX_LOG_SCALE, MIN_LOG_SCALE } from './constants';

describe('clamp', () => {
	it('returns value when within range', () => {
		expect(clamp(5, 0, 10)).toBe(5);
	});

	it('clamps to min when below', () => {
		expect(clamp(-5, 0, 10)).toBe(0);
	});

	it('clamps to max when above', () => {
		expect(clamp(15, 0, 10)).toBe(10);
	});
});

describe('getScale', () => {
	it('converts logScale 0 to 1', () => {
		expect(getScale(0)).toBe(1);
	});

	it('converts logScale 3 to 1000', () => {
		expect(getScale(3)).toBe(1000);
	});

	it('converts logScale -3 to 0.001', () => {
		expect(getScale(-3)).toBeCloseTo(0.001);
	});
});

describe('getLogScale', () => {
	it('converts 1 to logScale 0', () => {
		expect(getLogScale(1)).toBe(0);
	});

	it('converts 1000 to logScale 3', () => {
		expect(getLogScale(1000)).toBe(3);
	});
});

describe('createCamera', () => {
	it('creates camera at initial scale', () => {
		const camera = createCamera(5);
		expect(camera.logScale).toBe(5);
		expect(camera.targetLogScale).toBe(5);
	});

	it('defaults to human scale (0)', () => {
		const camera = createCamera();
		expect(camera.logScale).toBe(0);
	});

	it('clamps to valid range', () => {
		const camera = createCamera(100);
		expect(camera.logScale).toBe(MAX_LOG_SCALE);
	});
});

describe('setTargetLogScale', () => {
	it('sets target within range', () => {
		const camera = createCamera(0);
		setTargetLogScale(camera, 10);
		expect(camera.targetLogScale).toBe(10);
	});

	it('clamps target to max', () => {
		const camera = createCamera(0);
		setTargetLogScale(camera, 100);
		expect(camera.targetLogScale).toBe(MAX_LOG_SCALE);
	});

	it('clamps target to min', () => {
		const camera = createCamera(0);
		setTargetLogScale(camera, -100);
		expect(camera.targetLogScale).toBe(MIN_LOG_SCALE);
	});
});

describe('updateCamera', () => {
	it('moves logScale toward target', () => {
		const camera = createCamera(0);
		camera.targetLogScale = 10;
		updateCamera(camera, 1 / 60);
		expect(camera.logScale).toBeGreaterThan(0);
		expect(camera.logScale).toBeLessThan(10);
	});

	it('snaps when very close to target', () => {
		const camera = createCamera(0);
		camera.targetLogScale = 0.00001;
		updateCamera(camera, 1 / 60);
		expect(camera.logScale).toBe(camera.targetLogScale);
	});
});

describe('formatScale', () => {
	it('formats human scale', () => {
		expect(formatScale(0)).toBe('1.0 m');
	});

	it('formats kilometer scale', () => {
		expect(formatScale(3)).toBe('1.0 km');
	});

	it('formats millimeter scale', () => {
		expect(formatScale(-3)).toBe('1.0 mm');
	});

	it('formats nanometer scale', () => {
		expect(formatScale(-9)).toBe('1.0 nm');
	});

	it('uses Yottameters for large scales', () => {
		expect(formatScale(25)).toBe('10.0 Ym');
	});

	it('uses exponential beyond defined units', () => {
		expect(formatScale(28)).toBe('10^28 m');
	});
});
