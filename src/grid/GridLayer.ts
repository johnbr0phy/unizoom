import type { ILayer } from '@/layers/types';
import { getCanvasSize } from '@/rendering/canvas';
import { rowColToPos, trillionGrid } from './TrillionGrid';
import { GRID_SIZE, LEVEL_CONFIG } from './types';

export class GridLayer implements ILayer {
	private readonly midLogScale: number;
	private readonly levelIndex: number;

	// Track current path through the hierarchy
	private currentPath: number[] = [];

	constructor(
		public readonly id: string,
		public readonly minLogScale: number,
		public readonly maxLogScale: number,
		private readonly color: string,
		private readonly label: string,
		levelIndex: number,
	) {
		this.midLogScale = (minLogScale + maxLogScale) / 2;
		this.levelIndex = levelIndex;
	}

	// Get the path to the currently centered square at parent levels
	private getParentPath(): number[] {
		// For now, we center on square 44 (row 4, col 4 - center of 10x10)
		// In a full implementation, this would track user navigation
		return this.currentPath;
	}

	render(ctx: CanvasRenderingContext2D, logScale: number): void {
		const { width, height } = getCanvasSize(ctx.canvas);
		const centerX = width / 2;
		const centerY = height / 2;

		// Black background
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, width, height);

		// Scale factor relative to this level's reference point
		const scaleFactor = 10 ** (this.midLogScale - logScale);

		// Base size of entire grid at reference scale
		const baseGridSize = Math.min(width, height) * 0.8;
		const gridSize = baseGridSize * scaleFactor;

		// Size of each cell
		const cellSize = gridSize / GRID_SIZE;
		const cellPadding = cellSize * 0.1;
		const squareSize = cellSize - cellPadding * 2;

		// Grid position (centered)
		const gridLeft = centerX - gridSize / 2;
		const gridTop = centerY - gridSize / 2;

		// Only draw if grid is reasonable size
		const maxDim = Math.max(width, height) * 3;
		if (gridSize > 10 && gridSize < maxDim) {
			// Draw the 10x10 grid
			for (let row = 0; row < GRID_SIZE; row++) {
				for (let col = 0; col < GRID_SIZE; col++) {
					const pos = rowColToPos(row, col);
					const partialAddress = [...this.getParentPath(), pos];

					// Check if this square is deleted
					if (trillionGrid.isDeletedAtLevel(partialAddress, this.levelIndex)) {
						continue; // Don't draw deleted squares
					}

					const x = gridLeft + col * cellSize + cellPadding;
					const y = gridTop + row * cellSize + cellPadding;

					// Distance from center for vignette
					const dx = (x + squareSize / 2 - centerX) / width;
					const dy = (y + squareSize / 2 - centerY) / height;
					const dist = Math.sqrt(dx * dx + dy * dy);
					const alpha = Math.max(0.2, 1 - dist * 0.8);

					ctx.globalAlpha = alpha * 0.9;
					ctx.fillStyle = this.color;
					ctx.fillRect(x, y, squareSize, squareSize);

					// Draw nested hint for next level down (if not at deepest level)
					if (this.levelIndex < 5 && squareSize > 20) {
						this.drawNestedHint(ctx, x, y, squareSize);
					}
				}
			}
			ctx.globalAlpha = 1;

			// Draw grid lines
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
			ctx.lineWidth = 1;
			for (let i = 0; i <= GRID_SIZE; i++) {
				// Vertical lines
				ctx.beginPath();
				ctx.moveTo(gridLeft + i * cellSize, gridTop);
				ctx.lineTo(gridLeft + i * cellSize, gridTop + gridSize);
				ctx.stroke();
				// Horizontal lines
				ctx.beginPath();
				ctx.moveTo(gridLeft, gridTop + i * cellSize);
				ctx.lineTo(gridLeft + gridSize, gridTop + i * cellSize);
				ctx.stroke();
			}
		}

		// Label
		ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
		ctx.font = 'bold 24px monospace';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.label, centerX, height - 40);

		// Show level info
		ctx.font = '14px monospace';
		ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
		const remaining = 100 - this.countDeletedAtLevel();
		ctx.fillText(
			`Level ${this.levelIndex + 1}/6 • ${remaining}/100 squares`,
			centerX,
			height - 70,
		);
	}

	private drawNestedHint(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		size: number,
	): void {
		// Draw a tiny 3x3 grid hint inside each square
		const padding = size * 0.2;
		const innerSize = size - padding * 2;
		const miniCellSize = innerSize / 3;

		ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
		ctx.lineWidth = 0.5;

		for (let i = 0; i <= 3; i++) {
			// Vertical
			ctx.beginPath();
			ctx.moveTo(x + padding + i * miniCellSize, y + padding);
			ctx.lineTo(x + padding + i * miniCellSize, y + padding + innerSize);
			ctx.stroke();
			// Horizontal
			ctx.beginPath();
			ctx.moveTo(x + padding, y + padding + i * miniCellSize);
			ctx.lineTo(x + padding + innerSize, y + padding + i * miniCellSize);
			ctx.stroke();
		}
	}

	private countDeletedAtLevel(): number {
		let count = 0;
		for (let row = 0; row < GRID_SIZE; row++) {
			for (let col = 0; col < GRID_SIZE; col++) {
				const pos = rowColToPos(row, col);
				const partialAddress = [...this.getParentPath(), pos];
				if (trillionGrid.isDeletedAtLevel(partialAddress, this.levelIndex)) {
					count++;
				}
			}
		}
		return count;
	}

	// Handle click at screen position
	handleClick(screenX: number, screenY: number, logScale: number): boolean {
		const canvas = document.getElementById('canvas') as HTMLCanvasElement;
		if (!canvas) return false;

		const { width, height } = getCanvasSize(canvas);
		const centerX = width / 2;
		const centerY = height / 2;

		const scaleFactor = 10 ** (this.midLogScale - logScale);
		const baseGridSize = Math.min(width, height) * 0.8;
		const gridSize = baseGridSize * scaleFactor;
		const cellSize = gridSize / GRID_SIZE;

		const gridLeft = centerX - gridSize / 2;
		const gridTop = centerY - gridSize / 2;

		// Check if click is within grid
		if (
			screenX < gridLeft ||
			screenX > gridLeft + gridSize ||
			screenY < gridTop ||
			screenY > gridTop + gridSize
		) {
			return false;
		}

		// Calculate which cell was clicked
		const col = Math.floor((screenX - gridLeft) / cellSize);
		const row = Math.floor((screenY - gridTop) / cellSize);

		if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
			const pos = rowColToPos(row, col);
			const partialAddress = [...this.getParentPath(), pos];

			// Toggle deletion
			if (!trillionGrid.isDeletedAtLevel(partialAddress, this.levelIndex)) {
				trillionGrid.deleteAtLevel(partialAddress, this.levelIndex);
				console.log(
					`Deleted square at level ${this.levelIndex}:`,
					partialAddress,
				);
				return true;
			}
		}

		return false;
	}
}

// Export level configs for registry
export function createGridLayers(): GridLayer[] {
	return LEVEL_CONFIG.map(
		(config, index) =>
			new GridLayer(
				`grid-level-${index}`,
				config.logMin,
				config.logMax,
				config.color,
				config.name,
				index,
			),
	);
}
