import { createCamera, updateCamera } from '@/core';
import { setupTouchZoom, setupWheelZoom } from '@/input';
import { LAYERS } from '@/layers';
import { render, setupCanvas, startLoop, updateLayers } from '@/rendering';
import { ScaleIndicator } from '@/ui';

console.log('Powers of Ten — Starting...');

// Initialize canvas
const { canvas, ctx } = setupCanvas('canvas');

// Create camera at human scale (logScale = 0)
const camera = createCamera(0);

// Setup input handlers
setupWheelZoom(canvas, camera);
setupTouchZoom(canvas, camera);

// Setup UI
const scaleIndicator = new ScaleIndicator('scale-indicator');

// Start the render loop
startLoop(
	(deltaTime) => {
		// Update camera (smooth animation toward target)
		updateCamera(camera, deltaTime);

		// Update all layers (for animations)
		updateLayers(LAYERS, deltaTime);

		// Update UI
		scaleIndicator.update(camera.logScale, LAYERS);
	},
	() => {
		// Render all visible layers
		render(ctx, camera, LAYERS);
	},
);

console.log('Powers of Ten — Running!');
