import { getCanvasSize } from '@/rendering/canvas';
import type { ILayer } from '../types';

export class PlaceholderLayer implements ILayer {
	private readonly midLogScale: number;

	constructor(
		public readonly id: string,
		public readonly minLogScale: number,
		public readonly maxLogScale: number,
		private readonly color: string,
		private readonly label: string,
	) {
		// Reference point - center of this layer's range
		this.midLogScale = (minLogScale + maxLogScale) / 2;
	}

	render(ctx: CanvasRenderingContext2D, logScale: number): void {
		const { width, height } = getCanvasSize(ctx.canvas);
		const centerX = width / 2;
		const centerY = height / 2;

		// Black background
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, width, height);

		// Scale factor: how much bigger/smaller squares appear relative to reference
		// As logScale decreases (zoom in), scaleFactor increases (squares grow)
		const scaleFactor = 10 ** (this.midLogScale - logScale);

		// Base square size at reference scale
		const baseSize = 60;
		const squareSize = baseSize * scaleFactor;

		// Calculate grid spacing
		const spacing = squareSize * 1.5;

		// How many squares we need to cover the screen (with buffer)
		const maxDim = Math.max(width, height) * 2;

		// Only draw if squares are visible (not too tiny or too huge)
		if (squareSize > 0.5 && squareSize < maxDim) {
			ctx.fillStyle = this.color;

			// Calculate offset to keep grid centered
			const offsetX = centerX % spacing;
			const offsetY = centerY % spacing;

			// Draw grid of squares
			const startX = -spacing + offsetX;
			const startY = -spacing + offsetY;

			for (let x = startX; x < width + spacing; x += spacing) {
				for (let y = startY; y < height + spacing; y += spacing) {
					// Distance from center affects opacity (vignette effect)
					const dx = (x - centerX) / width;
					const dy = (y - centerY) / height;
					const dist = Math.sqrt(dx * dx + dy * dy);
					const alpha = Math.max(0, 1 - dist * 1.2);

					ctx.globalAlpha = alpha * 0.8;
					ctx.fillRect(
						x - squareSize / 2,
						y - squareSize / 2,
						squareSize,
						squareSize,
					);
				}
			}
			ctx.globalAlpha = 1;
		}

		// Draw nested squares in center (representing next level down)
		this.drawNestedSquares(ctx, centerX, centerY, squareSize);

		// Label
		ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
		ctx.font = 'bold 24px monospace';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.label, centerX, height - 40);
	}

	private drawNestedSquares(
		ctx: CanvasRenderingContext2D,
		cx: number,
		cy: number,
		baseSize: number,
	): void {
		// Draw smaller nested squares in the center
		// These hint at the next level of detail
		const levels = 5;
		const shrinkFactor = 0.4;

		ctx.strokeStyle = this.color;
		ctx.lineWidth = 2;

		let size = baseSize * 0.8;
		for (let i = 0; i < levels; i++) {
			size *= shrinkFactor;
			if (size < 2) break;

			const alpha = 0.6 - i * 0.1;
			ctx.globalAlpha = Math.max(0.1, alpha);
			ctx.strokeRect(cx - size / 2, cy - size / 2, size, size);
		}
		ctx.globalAlpha = 1;
	}
}
