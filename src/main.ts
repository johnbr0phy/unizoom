import { createCamera, updateCamera } from '@/core';
import { GridLayer } from '@/grid';
import { setupTouchZoom, setupWheelZoom } from '@/input';
import { LAYERS } from '@/layers';
import { getVisibleLayers } from '@/layers/visibility';
import { render, setupCanvas, startLoop, updateLayers } from '@/rendering';
import { ScaleIndicator } from '@/ui';

console.log('Trillion Dollar Homepage — Starting...');

// Initialize canvas
const { canvas, ctx } = setupCanvas('canvas');

// Create camera at human scale (logScale = 3, middle of human level 0-6)
const camera = createCamera(3);

// Setup input handlers
setupWheelZoom(canvas, camera);
setupTouchZoom(canvas, camera);

// Setup click-to-delete handler
canvas.addEventListener('click', (e) => {
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	const x = (e.clientX - rect.left) * scaleX;
	const y = (e.clientY - rect.top) * scaleY;

	// Try to handle click on visible layers
	const visibleLayers = getVisibleLayers(LAYERS, camera.logScale);
	for (const config of visibleLayers) {
		if (config.layer instanceof GridLayer) {
			if (config.layer.handleClick(x, y, camera.logScale)) {
				break; // Click was handled
			}
		}
	}
});

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

console.log('Trillion Dollar Homepage — Running!');
console.log(
	'Click squares to delete them. Zoom to explore 1 trillion squares!',
);
