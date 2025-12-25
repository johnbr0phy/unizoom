import { createCamera, updateCamera } from '@/core';
import { GridLayer, gameState, trillionGrid } from '@/grid';
import { setupTouchZoom, setupWheelZoom } from '@/input';
import { LAYERS } from '@/layers';
import { getVisibleLayers } from '@/layers/visibility';
import { initMultiplayer } from '@/multiplayer';
import { render, setupCanvas, startLoop, updateLayers } from '@/rendering';
import { ScaleIndicator } from '@/ui';

console.log('Delete the Universe — Starting...');

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

// Initialize multiplayer
const WS_URL =
	import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8080`;
const multiplayer = initMultiplayer(WS_URL);

// Handle multiplayer events
multiplayer.on('connected', (player, state) => {
	console.log(`Connected as ${player.id} with team color ${player.teamColor}`);

	// Load initial state from server
	for (let i = 0; i < state.layers.length; i++) {
		const layerState = state.layers[i];
		if (!layerState) continue;
		gameState.setLayerLevel(i, layerState.level);
		for (const pos of layerState.deleted) {
			const deletedBy =
				(layerState as { deletedBy?: Record<string, string> }).deletedBy?.[
					String(pos)
				] ?? '#888888';
			trillionGrid.deleteAtLevel([pos], i, deletedBy);
		}
	}

	// Update player UI
	updatePlayerIndicator(player.teamColor, state.playerCount);
});

multiplayer.on('playerJoined', (_player, count) => {
	updatePlayerCount(count);
});

multiplayer.on('playerLeft', (_playerId, count) => {
	updatePlayerCount(count);
});

multiplayer.on('deleted', (action) => {
	// Another player deleted a square - update locally
	trillionGrid.deleteAtLevel(
		[action.position],
		action.layerIndex,
		action.teamColor,
	);
});

multiplayer.on('layerLeveled', (layerIndex, newLevel) => {
	gameState.setLayerLevel(layerIndex, newLevel);
	trillionGrid.resetLayer(layerIndex);
});

multiplayer.on('offline', (teamColor) => {
	// Playing in solo mode
	updatePlayerIndicatorOffline(teamColor);
});

// Connect to multiplayer server
multiplayer.connect();

// UI helper functions
function updatePlayerIndicator(teamColor: string, playerCount: number): void {
	const indicator = document.getElementById('player-indicator');
	if (indicator) {
		indicator.innerHTML = `
			<div class="player-color" style="background: ${teamColor}"></div>
			<span class="player-count">${playerCount} online</span>
		`;
	}
}

function updatePlayerCount(count: number): void {
	const countEl = document.querySelector('.player-count');
	if (countEl) {
		countEl.textContent = `${count} online`;
	}
}

function updatePlayerIndicatorOffline(teamColor: string): void {
	const indicator = document.getElementById('player-indicator');
	if (indicator) {
		indicator.innerHTML = `
			<div class="player-color" style="background: ${teamColor}"></div>
			<span class="player-count">Solo</span>
		`;
	}
}

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

console.log('Delete the Universe — Running!');
console.log('Click squares to delete them. Compete with others to level up!');
