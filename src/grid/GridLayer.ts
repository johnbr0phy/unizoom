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

	private getParentPath(): number[] {
		return this.currentPath;
	}

	render(ctx: CanvasRenderingContext2D, logScale: number): void {
		const { width, height } = getCanvasSize(ctx.canvas);
		const centerX = width / 2;
		const centerY = height / 2;

		// Black background
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, width, height);

		// Scale factor: squares grow as you zoom in
		const scaleFactor = 10 ** (this.midLogScale - logScale);

		// Base square size - large enough to feel vast
		const baseSize = 80;
		const squareSize = baseSize * scaleFactor;

		// Spacing between squares
		const spacing = squareSize * 1.4;

		// Maximum dimension for visibility check
		const maxDim = Math.max(width, height) * 2;

		// Only draw if squares are visible size
		if (squareSize > 0.5 && squareSize < maxDim) {
			ctx.fillStyle = this.color;

			// Calculate offset to keep grid centered on screen
			const offsetX = centerX % spacing;
			const offsetY = centerY % spacing;

			// Start positions (extend beyond screen edges)
			const startX = -spacing + offsetX;
			const startY = -spacing + offsetY;

			// Draw grid of squares filling the entire screen
			let gridCol = 0;
			for (let x = startX; x < width + spacing; x += spacing) {
				let gridRow = 0;
				for (let y = startY; y < height + spacing; y += spacing) {
					// Map to 10x10 grid position (wrapping)
					const row = gridRow % GRID_SIZE;
					const col = gridCol % GRID_SIZE;
					const pos = rowColToPos(row, col);
					const partialAddress = [...this.getParentPath(), pos];

					// Check if this square is deleted
					const isDeleted = trillionGrid.isDeletedAtLevel(
						partialAddress,
						this.levelIndex,
					);

					if (!isDeleted) {
						// Distance from center affects opacity (vignette effect)
						const dx = (x - centerX) / width;
						const dy = (y - centerY) / height;
						const dist = Math.sqrt(dx * dx + dy * dy);
						const alpha = Math.max(0, 1 - dist * 1.2);

						ctx.globalAlpha = alpha * 0.85;
						ctx.fillRect(
							x - squareSize / 2,
							y - squareSize / 2,
							squareSize,
							squareSize,
						);

						// Draw nested hint showing next level (when squares are large enough)
						if (this.levelIndex < 5 && squareSize > 40) {
							this.drawNestedHint(ctx, x, y, squareSize);
						}
					}

					gridRow++;
				}
				gridCol++;
			}
			ctx.globalAlpha = 1;
		}

		// Draw nested squares in center (representing zoom depth)
		this.drawCenterNest(ctx, centerX, centerY, squareSize);

		// Label
		ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
		ctx.font = 'bold 24px monospace';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.label, centerX, height - 40);

		// Level info
		ctx.font = '14px monospace';
		ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
		const deleted = this.countDeletedAtLevel();
		ctx.fillText(
			`Level ${this.levelIndex + 1}/6 • ${deleted} deleted`,
			centerX,
			height - 70,
		);
	}

	private drawNestedHint(
		ctx: CanvasRenderingContext2D,
		cx: number,
		cy: number,
		size: number,
	): void {
		// Draw a subtle 3x3 grid inside to hint at deeper structure
		const innerSize = size * 0.6;
		const cellSize = innerSize / 3;
		const left = cx - innerSize / 2;
		const top = cy - innerSize / 2;

		ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
		ctx.lineWidth = 1;

		for (let i = 0; i <= 3; i++) {
			ctx.beginPath();
			ctx.moveTo(left + i * cellSize, top);
			ctx.lineTo(left + i * cellSize, top + innerSize);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(left, top + i * cellSize);
			ctx.lineTo(left + innerSize, top + i * cellSize);
			ctx.stroke();
		}
	}

	private drawCenterNest(
		ctx: CanvasRenderingContext2D,
		cx: number,
		cy: number,
		baseSize: number,
	): void {
		// Draw nested squares showing zoom depth
		const levels = 6;
		const shrinkFactor = 0.35;

		ctx.strokeStyle = this.color;
		ctx.lineWidth = 2;

		let size = baseSize * 0.7;
		for (let i = 0; i < levels; i++) {
			size *= shrinkFactor;
			if (size < 2) break;

			const alpha = 0.5 - i * 0.08;
			ctx.globalAlpha = Math.max(0.1, alpha);
			ctx.strokeRect(cx - size / 2, cy - size / 2, size, size);
		}
		ctx.globalAlpha = 1;
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

	handleClick(screenX: number, screenY: number, logScale: number): boolean {
		const canvas = document.getElementById('canvas') as HTMLCanvasElement;
		if (!canvas) return false;

		const { width, height } = getCanvasSize(canvas);
		const centerX = width / 2;
		const centerY = height / 2;

		const scaleFactor = 10 ** (this.midLogScale - logScale);
		const baseSize = 80;
		const squareSize = baseSize * scaleFactor;
		const spacing = squareSize * 1.4;

		// Don't handle clicks if squares aren't visible
		const maxDim = Math.max(width, height) * 2;
		if (squareSize < 0.5 || squareSize > maxDim) {
			return false;
		}

		// Calculate which grid position was clicked
		const offsetX = centerX % spacing;
		const offsetY = centerY % spacing;
		const startX = -spacing + offsetX;
		const startY = -spacing + offsetY;

		// Find which cell contains the click
		const relX = screenX - startX;
		const relY = screenY - startY;
		const gridCol = Math.floor(relX / spacing);
		const gridRow = Math.floor(relY / spacing);

		// Check if click is within a square (not in the gap)
		const cellX = relX - gridCol * spacing;
		const cellY = relY - gridRow * spacing;
		const halfSize = squareSize / 2;
		const cellCenterOffset = spacing / 2;

		if (
			Math.abs(cellX - cellCenterOffset) > halfSize ||
			Math.abs(cellY - cellCenterOffset) > halfSize
		) {
			return false; // Clicked in the gap between squares
		}

		// Map to 10x10 grid
		const row = ((gridRow % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
		const col = ((gridCol % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
		const pos = rowColToPos(row, col);
		const partialAddress = [...this.getParentPath(), pos];

		if (!trillionGrid.isDeletedAtLevel(partialAddress, this.levelIndex)) {
			trillionGrid.deleteAtLevel(partialAddress, this.levelIndex);
			console.log(`Deleted square [${row},${col}] at level ${this.levelIndex}`);
			return true;
		}

		return false;
	}
}

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
