import type { Camera } from '@/core';
import type { LayerConfig } from '@/layers/types';
import { getLayerOpacity, getVisibleLayers } from '@/layers/visibility';
import { getCanvasSize } from './canvas';

export function updateLayers(layers: LayerConfig[], deltaTime: number): void {
	for (const config of layers) {
		config.layer.update?.(deltaTime);
	}
}

export function render(
	ctx: CanvasRenderingContext2D,
	camera: Camera,
	layers: LayerConfig[],
): void {
	const { width, height } = getCanvasSize(ctx.canvas);

	// Clear canvas
	ctx.clearRect(0, 0, width, height);

	// Draw black background
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, width, height);

	// Get visible layers and render with opacity
	const visibleLayers = getVisibleLayers(layers, camera.logScale);

	for (const config of visibleLayers) {
		ctx.save();
		ctx.globalAlpha = getLayerOpacity(config, camera.logScale);
		config.layer.render(ctx, camera.logScale);
		ctx.restore();
	}
}
