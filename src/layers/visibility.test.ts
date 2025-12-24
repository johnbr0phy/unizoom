import { describe, expect, it } from 'vitest';
import type { ILayer, LayerConfig } from './types';
import {
	getLayerOpacity,
	getVisibleLayers,
	isLayerVisible,
} from './visibility';

const createMockLayer = (
	id: string,
	minLog: number,
	maxLog: number,
): LayerConfig => ({
	id,
	minLog,
	maxLog,
	layer: {
		id,
		minLogScale: minLog,
		maxLogScale: maxLog,
		render: () => {},
	} as ILayer,
});

describe('isLayerVisible', () => {
	const layer = createMockLayer('test', 5, 10);

	it('returns true when logScale is within range', () => {
		expect(isLayerVisible(layer, 7)).toBe(true);
	});

	it('returns true at min boundary', () => {
		expect(isLayerVisible(layer, 5)).toBe(true);
	});

	it('returns true at max boundary', () => {
		expect(isLayerVisible(layer, 10)).toBe(true);
	});

	it('returns false when below range', () => {
		expect(isLayerVisible(layer, 4)).toBe(false);
	});

	it('returns false when above range', () => {
		expect(isLayerVisible(layer, 11)).toBe(false);
	});
});

describe('getVisibleLayers', () => {
	const layers = [
		createMockLayer('a', 0, 5),
		createMockLayer('b', 4, 8),
		createMockLayer('c', 6, 12),
	];

	it('returns layers that contain the logScale', () => {
		const visible = getVisibleLayers(layers, 7);
		expect(visible.map((l) => l.id)).toEqual(['b', 'c']);
	});

	it('returns overlapping layers', () => {
		const visible = getVisibleLayers(layers, 4.5);
		expect(visible.map((l) => l.id)).toEqual(['a', 'b']);
	});

	it('returns empty array when no layers visible', () => {
		const visible = getVisibleLayers(layers, -5);
		expect(visible).toEqual([]);
	});
});

describe('getLayerOpacity', () => {
	const layer = createMockLayer('test', 5, 10);

	it('returns 0 when outside range', () => {
		expect(getLayerOpacity(layer, 4)).toBe(0);
		expect(getLayerOpacity(layer, 11)).toBe(0);
	});

	it('returns 1 in middle of range', () => {
		expect(getLayerOpacity(layer, 7.5)).toBe(1);
	});

	it('fades in at min edge', () => {
		const opacity = getLayerOpacity(layer, 5.5);
		expect(opacity).toBeCloseTo(0.5);
	});

	it('fades out at max edge', () => {
		const opacity = getLayerOpacity(layer, 9.5);
		expect(opacity).toBeCloseTo(0.5);
	});

	it('returns 0 at exact min', () => {
		expect(getLayerOpacity(layer, 5)).toBe(0);
	});
});
