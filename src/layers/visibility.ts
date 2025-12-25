import { FADE_RANGE } from '@/core/constants';
import type { LayerConfig } from './types';

export function isLayerVisible(config: LayerConfig, logScale: number): boolean {
	return logScale >= config.minLog && logScale <= config.maxLog;
}

export function getVisibleLayers(
	layers: LayerConfig[],
	logScale: number,
): LayerConfig[] {
	return layers.filter((config) => isLayerVisible(config, logScale));
}

export function getLayerOpacity(config: LayerConfig, logScale: number): number {
	if (!isLayerVisible(config, logScale)) {
		return 0;
	}

	const fadeRange = FADE_RANGE;

	// Fade in at bottom of range
	if (logScale < config.minLog + fadeRange) {
		return (logScale - config.minLog) / fadeRange;
	}

	// Fade out at top of range
	if (logScale > config.maxLog - fadeRange) {
		return (config.maxLog - logScale) / fadeRange;
	}

	// Full opacity in middle
	return 1;
}
