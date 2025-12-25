import { trillionGrid } from './TrillionGrid';
import { LEVEL_CONFIG } from './types';

// Game progression: each game level multiplies squares by 10
// Level 1: 1 square per layer (1x1)
// Level 2: 10 squares per layer (not quite 10, let's do 2x2=4, then 3x3=9, close to 10)
// Actually let's do: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 (perfect squares)
// Or simpler: 1, 10, 100 (powers of 10, grid size 1x1, ~3x3, 10x10)

// Let's use grid dimensions that make visual sense:
// Level 1: 1x1 = 1 square
// Level 2: 2x2 = 4 squares
// Level 3: 3x3 = 9 squares
// Level 4: 4x4 = 16 squares
// Level 5: 5x5 = 25 squares
// ...
// Level 10: 10x10 = 100 squares (full grid)

export interface GameState {
	level: number;
	squaresPerSide: number; // 1, 2, 3, ... 10
	totalSquaresPerLayer: number; // 1, 4, 9, 16, ... 100
}

class GameStateManager {
	private _level = 1;
	private listeners: Array<() => void> = [];

	get level(): number {
		return this._level;
	}

	get squaresPerSide(): number {
		return Math.min(this._level, 10);
	}

	get totalSquaresPerLayer(): number {
		return this.squaresPerSide ** 2;
	}

	get totalSquaresAllLayers(): number {
		return this.totalSquaresPerLayer * LEVEL_CONFIG.length;
	}

	// Check if a position is within current game level bounds
	isPositionInBounds(row: number, col: number): boolean {
		const maxIndex = this.squaresPerSide - 1;
		// Center the active squares in the 10x10 grid
		const offset = Math.floor((10 - this.squaresPerSide) / 2);
		const minIndex = offset;
		const maxBound = offset + maxIndex;

		return (
			row >= minIndex && row <= maxBound && col >= minIndex && col <= maxBound
		);
	}

	// Get offset for centering squares
	getGridOffset(): number {
		return Math.floor((10 - this.squaresPerSide) / 2);
	}

	// Count total deleted across all layers
	getTotalDeleted(): number {
		let total = 0;
		for (let i = 0; i < LEVEL_CONFIG.length; i++) {
			total += trillionGrid.getDeletedCountAtLevel(i);
		}
		return total;
	}

	// Check if current level is complete
	isLevelComplete(): boolean {
		// All squares at all layers must be deleted
		for (let layerIndex = 0; layerIndex < LEVEL_CONFIG.length; layerIndex++) {
			const deleted = trillionGrid.getDeletedCountAtLevel(layerIndex);
			if (deleted < this.totalSquaresPerLayer) {
				return false;
			}
		}
		return true;
	}

	// Advance to next level
	nextLevel(): void {
		if (this._level < 10) {
			this._level++;
			// Clear deletions for new level (fresh start with more squares)
			trillionGrid.reset();
			this.notifyListeners();
		}
	}

	// Check and auto-advance if level complete
	checkLevelComplete(): boolean {
		if (this.isLevelComplete()) {
			this.nextLevel();
			return true;
		}
		return false;
	}

	// Reset to level 1
	reset(): void {
		this._level = 1;
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
}

export const gameState = new GameStateManager();
