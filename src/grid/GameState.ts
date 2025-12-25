import { trillionGrid } from './TrillionGrid';
import { LEVEL_CONFIG } from './types';

// Game progression: each layer levels up independently
// Level 1: 1x1 = 1 square
// Level 2: 2x2 = 4 squares
// Level 3: 3x3 = 9 squares
// ...
// Level 10: 10x10 = 100 squares (max)

export interface LayerProgress {
	level: number;
	squaresPerSide: number;
	totalSquares: number;
	deleted: number;
}

class GameStateManager {
	// Per-layer levels (0-5 for each of 6 layers)
	private layerLevels: number[] = [1, 1, 1, 1, 1, 1];
	private listeners: Array<() => void> = [];

	// Get level for a specific layer
	getLevelForLayer(layerIndex: number): number {
		return this.layerLevels[layerIndex] ?? 1;
	}

	// Get squares per side for a specific layer
	getSquaresPerSideForLayer(layerIndex: number): number {
		return Math.min(this.getLevelForLayer(layerIndex), 10);
	}

	// Get total squares for a specific layer
	getTotalSquaresForLayer(layerIndex: number): number {
		const side = this.getSquaresPerSideForLayer(layerIndex);
		return side ** 2;
	}

	// Get grid offset for centering squares at a layer
	getGridOffsetForLayer(layerIndex: number): number {
		const side = this.getSquaresPerSideForLayer(layerIndex);
		return Math.floor((10 - side) / 2);
	}

	// Check if position is in bounds for a layer
	isPositionInBoundsForLayer(
		row: number,
		col: number,
		layerIndex: number,
	): boolean {
		const side = this.getSquaresPerSideForLayer(layerIndex);
		const offset = this.getGridOffsetForLayer(layerIndex);
		const maxBound = offset + side - 1;
		return row >= offset && row <= maxBound && col >= offset && col <= maxBound;
	}

	// Get progress for a specific layer
	getLayerProgress(layerIndex: number): LayerProgress {
		const level = this.getLevelForLayer(layerIndex);
		const squaresPerSide = this.getSquaresPerSideForLayer(layerIndex);
		const totalSquares = squaresPerSide ** 2;
		const deleted = trillionGrid.getDeletedCountAtLevel(layerIndex);
		return { level, squaresPerSide, totalSquares, deleted };
	}

	// Get all layer progress for UI
	getAllLayerProgress(): Array<
		LayerProgress & { color: string; name: string }
	> {
		return LEVEL_CONFIG.map((config, index) => ({
			...this.getLayerProgress(index),
			color: config.color,
			name: config.name,
		}));
	}

	// Check if a layer is complete and level it up
	checkLayerComplete(layerIndex: number): boolean {
		const progress = this.getLayerProgress(layerIndex);
		if (progress.deleted >= progress.totalSquares && progress.level < 10) {
			const currentLevel = this.layerLevels[layerIndex];
			if (currentLevel !== undefined) {
				this.layerLevels[layerIndex] = currentLevel + 1;
			}
			// Clear this layer's deletions for the new level
			trillionGrid.resetLayer(layerIndex);
			this.notifyListeners();
			return true;
		}
		return false;
	}

	// Get total deleted across all layers
	getTotalDeleted(): number {
		let total = 0;
		for (let i = 0; i < LEVEL_CONFIG.length; i++) {
			total += trillionGrid.getDeletedCountAtLevel(i);
		}
		return total;
	}

	// Get sum of all layer levels (for overall progress)
	getTotalLevels(): number {
		return this.layerLevels.reduce((sum, level) => sum + level, 0);
	}

	// Reset everything
	reset(): void {
		this.layerLevels = [1, 1, 1, 1, 1, 1];
		trillionGrid.reset();
		this.notifyListeners();
	}

	// Subscribe to state changes
	subscribe(listener: () => void): () => void {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter((l) => l !== listener);
		};
	}

	private notifyListeners(): void {
		for (const listener of this.listeners) {
			listener();
		}
	}

	// Legacy compatibility - use layer 0 as default
	get level(): number {
		return this.getLevelForLayer(0);
	}

	get squaresPerSide(): number {
		return this.getSquaresPerSideForLayer(0);
	}

	get totalSquaresPerLayer(): number {
		return this.getTotalSquaresForLayer(0);
	}

	get totalSquaresAllLayers(): number {
		let total = 0;
		for (let i = 0; i < LEVEL_CONFIG.length; i++) {
			total += this.getTotalSquaresForLayer(i);
		}
		return total;
	}

	getGridOffset(): number {
		return this.getGridOffsetForLayer(0);
	}

	isPositionInBounds(row: number, col: number): boolean {
		return this.isPositionInBoundsForLayer(row, col, 0);
	}
}

export const gameState = new GameStateManager();
