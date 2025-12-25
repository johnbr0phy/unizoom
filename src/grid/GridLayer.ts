import type { ILayer } from '@/layers/types';
import { getCanvasSize } from '@/rendering/canvas';
import { gameState } from './GameState';
import { rowColToPos, trillionGrid } from './TrillionGrid';
import { LEVEL_CONFIG } from './types';

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

			// Get this layer's level and grid size
			const gridSize = gameState.getSquaresPerSideForLayer(this.levelIndex);
			const gridOffset = gameState.getGridOffsetForLayer(this.levelIndex);

			// Always draw a centered grid
			const totalGridSize = gridSize * spacing;
			const gridStartX = centerX - totalGridSize / 2 + spacing / 2;
			const gridStartY = centerY - totalGridSize / 2 + spacing / 2;

			for (let gridRow = 0; gridRow < gridSize; gridRow++) {
				for (let gridCol = 0; gridCol < gridSize; gridCol++) {
					const row = gridOffset + gridRow;
					const col = gridOffset + gridCol;
					const pos = rowColToPos(row, col);
					const partialAddress = [...this.getParentPath(), pos];

					const isDeleted = trillionGrid.isDeletedAtLevel(
						partialAddress,
						this.levelIndex,
					);

					if (!isDeleted) {
						const x = gridStartX + gridCol * spacing;
						const y = gridStartY + gridRow * spacing;

						// Vignette effect for larger grids
						const dx = (x - centerX) / width;
						const dy = (y - centerY) / height;
						const dist = Math.sqrt(dx * dx + dy * dy);
						const alpha = gridSize <= 3 ? 0.9 : Math.max(0.3, 1 - dist * 0.8);

						ctx.globalAlpha = alpha * 0.9;
						ctx.fillRect(
							x - squareSize / 2,
							y - squareSize / 2,
							squareSize,
							squareSize,
						);

						if (this.levelIndex < 5 && squareSize > 40) {
							this.drawNestedHint(ctx, x, y, squareSize);
						}
					}
				}
			}
			ctx.globalAlpha = 1;
		}

		// Draw nested squares in center (representing zoom depth)
		this.drawCenterNest(ctx, centerX, centerY, squareSize);

		// Label with game progress
		ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
		ctx.font = 'bold 24px monospace';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.label, centerX, height - 40);

		// Layer level info
		ctx.font = '14px monospace';
		ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
		const progress = gameState.getLayerProgress(this.levelIndex);
		ctx.fillText(
			`Lv.${progress.level} • ${progress.deleted}/${progress.totalSquares}`,
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

		const gridSize = gameState.getSquaresPerSideForLayer(this.levelIndex);
		const gridOffset = gameState.getGridOffsetForLayer(this.levelIndex);
		const halfSize = squareSize / 2;

		// Centered grid - calculate position relative to center
		const totalGridSize = gridSize * spacing;
		const gridStartX = centerX - totalGridSize / 2 + spacing / 2;
		const gridStartY = centerY - totalGridSize / 2 + spacing / 2;

		const relX = screenX - gridStartX;
		const relY = screenY - gridStartY;

		const clickCol = Math.floor((relX + spacing / 2) / spacing);
		const clickRow = Math.floor((relY + spacing / 2) / spacing);

		// Check bounds
		if (
			clickRow < 0 ||
			clickRow >= gridSize ||
			clickCol < 0 ||
			clickCol >= gridSize
		) {
			return false;
		}

		// Check if click is within the square
		const sqCenterX = clickCol * spacing;
		const sqCenterY = clickRow * spacing;
		if (
			Math.abs(relX - sqCenterX) > halfSize ||
			Math.abs(relY - sqCenterY) > halfSize
		) {
			return false;
		}

		const row = gridOffset + clickRow;
		const col = gridOffset + clickCol;

		const pos = rowColToPos(row, col);
		const partialAddress = [...this.getParentPath(), pos];

		if (!trillionGrid.isDeletedAtLevel(partialAddress, this.levelIndex)) {
			trillionGrid.deleteAtLevel(partialAddress, this.levelIndex);
			console.log(`Deleted square [${row},${col}] at layer ${this.levelIndex}`);

			// Check if this layer is complete and level it up
			if (gameState.checkLayerComplete(this.levelIndex)) {
				const newLevel = gameState.getLevelForLayer(this.levelIndex);
				console.log(`Layer ${this.levelIndex} leveled up to ${newLevel}!`);
			}

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
