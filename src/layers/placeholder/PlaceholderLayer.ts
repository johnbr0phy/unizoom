import { getCanvasSize } from '@/rendering/canvas';
import type { ILayer } from '../types';

export class PlaceholderLayer implements ILayer {
	constructor(
		public readonly id: string,
		public readonly minLogScale: number,
		public readonly maxLogScale: number,
		private readonly color: string,
		private readonly label: string,
	) {}

	render(ctx: CanvasRenderingContext2D, logScale: number): void {
		const { width, height } = getCanvasSize(ctx.canvas);

		// Radial gradient background
		const gradient = ctx.createRadialGradient(
			width / 2,
			height / 2,
			0,
			width / 2,
			height / 2,
			Math.min(width, height) / 2,
		);
		gradient.addColorStop(0, this.color);
		gradient.addColorStop(1, 'black');

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);

		// Label
		ctx.fillStyle = 'white';
		ctx.font = 'bold 32px monospace';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.label, width / 2, height / 2 - 20);

		// Scale indicator
		ctx.font = '18px monospace';
		ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
		ctx.fillText(`10^${logScale.toFixed(1)} m`, width / 2, height / 2 + 20);
	}
}
