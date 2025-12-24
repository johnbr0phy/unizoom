import { getCanvasSize } from '@/rendering/canvas';
import type { ILayer } from '../types';

// Simple hash for consistent random per grid cell
function cellHash(x: number, y: number, seed: number): number {
	const h = (x * 374761393 + y * 668265263 + seed) ^ (seed >> 13);
	return ((h * 1274126177) >>> 0) / 4294967296;
}

// Pixel pattern type: array of [x, y, colorIndex] for each filled cell
type PixelPattern = Array<[number, number, number]>;

// Pattern definitions - each is a small grid of square pixels
// Coordinates are relative to center, colorIndex maps to layer's palette
const PATTERNS: Record<string, PixelPattern[]> = {
	quark: [
		// Triplet patterns
		[
			[-1, -1, 0],
			[1, -1, 1],
			[0, 1, 2],
		],
		[
			[-1, 0, 0],
			[1, 0, 1],
			[0, -1, 2],
		],
		[
			[0, -1, 0],
			[-1, 1, 1],
			[1, 1, 2],
		],
		[
			[-1, -1, 0],
			[1, 1, 1],
			[0, 0, 2],
		],
	],
	nucleus: [
		// Clustered protons/neutrons
		[
			[0, 0, 0],
			[1, 0, 1],
			[0, 1, 0],
			[1, 1, 1],
		],
		[
			[0, 0, 0],
			[-1, 0, 1],
			[0, -1, 0],
			[1, 0, 1],
			[0, 1, 0],
		],
		[
			[-1, -1, 0],
			[0, -1, 1],
			[1, 0, 0],
			[0, 0, 1],
			[-1, 1, 0],
			[0, 1, 1],
		],
		[
			[0, 0, 0],
			[1, 0, 1],
			[-1, 0, 0],
			[0, 1, 1],
			[0, -1, 0],
			[1, 1, 1],
			[-1, -1, 0],
		],
	],
	atom: [
		// Bohr model-ish patterns
		[
			[0, 0, 0],
			[-2, 0, 1],
			[2, 0, 1],
			[0, -1, 1],
			[0, 1, 1],
		],
		[
			[0, 0, 0],
			[-1, -1, 1],
			[1, 1, 1],
			[-1, 1, 1],
			[1, -1, 1],
		],
		[
			[0, 0, 0],
			[-2, -1, 1],
			[2, 1, 1],
			[0, -2, 1],
			[0, 2, 1],
		],
		[
			[0, 0, 0],
			[-1, 0, 1],
			[1, 0, 1],
			[0, -2, 1],
			[0, 2, 1],
			[-2, -1, 1],
			[2, 1, 1],
		],
	],
	molecule: [
		// Connected atoms
		[
			[-1, 0, 0],
			[0, 0, 2],
			[1, 0, 1],
		],
		[
			[-1, -1, 0],
			[0, 0, 2],
			[1, 1, 1],
			[0, -1, 2],
			[1, 0, 2],
		],
		[
			[0, -1, 0],
			[-1, 0, 2],
			[1, 0, 1],
			[0, 1, 3],
		],
		[
			[-1, -1, 0],
			[1, -1, 1],
			[-1, 1, 2],
			[1, 1, 3],
			[0, 0, 2],
		],
	],
	cell: [
		// Cell with nucleus
		[
			[0, 0, 1],
			[-1, 0, 0],
			[1, 0, 0],
			[0, -1, 0],
			[0, 1, 0],
			[-1, -1, 2],
			[1, 1, 2],
		],
		[
			[0, 0, 1],
			[-1, -1, 0],
			[0, -1, 0],
			[1, -1, 0],
			[-1, 0, 0],
			[1, 0, 0],
			[-1, 1, 0],
			[0, 1, 0],
			[1, 1, 0],
			[1, 0, 2],
		],
		[
			[0, 0, 1],
			[-2, 0, 0],
			[2, 0, 0],
			[0, -1, 0],
			[0, 1, 0],
			[-1, -1, 2],
			[1, 1, 2],
			[-1, 1, 0],
			[1, -1, 0],
		],
		[
			[0, 0, 1],
			[0, 1, 1],
			[-1, 0, 0],
			[1, 0, 0],
			[-1, -1, 0],
			[1, -1, 0],
			[-1, 1, 0],
			[1, 1, 0],
			[0, -1, 0],
			[0, 2, 0],
			[-2, 0, 2],
			[2, 1, 2],
		],
	],
	human: [
		// Stick figure pixel art
		[
			[0, -2, 0],
			[0, -1, 1],
			[-1, 0, 1],
			[0, 0, 1],
			[1, 0, 1],
			[0, 1, 2],
			[-1, 2, 2],
			[1, 2, 2],
		],
		[
			[0, -2, 0],
			[-1, -1, 1],
			[0, -1, 1],
			[1, -1, 1],
			[0, 0, 1],
			[0, 1, 2],
			[-1, 2, 2],
			[1, 2, 2],
		],
		[
			[0, -2, 0],
			[0, -1, 1],
			[0, 0, 1],
			[-1, 0, 3],
			[1, 0, 3],
			[0, 1, 2],
			[-1, 2, 2],
			[1, 2, 2],
		],
		[
			[0, -2, 0],
			[0, -1, 1],
			[-1, 0, 1],
			[0, 0, 1],
			[1, 0, 1],
			[-1, 1, 2],
			[1, 1, 2],
			[-1, 2, 2],
			[1, 2, 2],
		],
	],
	earth: [
		// Buildings/cities
		[
			[-1, 0, 0],
			[-1, -1, 0],
			[-1, -2, 0],
			[0, 0, 1],
			[0, -1, 1],
			[1, 0, 2],
			[1, -1, 2],
			[1, -2, 2],
			[1, -3, 2],
		],
		[
			[-2, 0, 0],
			[-2, -1, 0],
			[-1, 0, 1],
			[-1, -1, 1],
			[-1, -2, 1],
			[0, 0, 0],
			[1, 0, 2],
			[1, -1, 2],
			[2, 0, 1],
			[2, -1, 1],
			[2, -2, 1],
		],
		[
			[-1, 0, 0],
			[-1, -1, 0],
			[-1, -2, 0],
			[0, 0, 1],
			[0, -1, 1],
			[0, -2, 1],
			[0, -3, 1],
			[1, 0, 2],
			[1, -1, 2],
		],
		[
			[-2, 0, 0],
			[-1, 0, 1],
			[-1, -1, 1],
			[-1, -2, 1],
			[0, 0, 2],
			[0, -1, 2],
			[1, 0, 1],
			[1, -1, 1],
			[1, -2, 1],
			[1, -3, 1],
			[2, 0, 0],
			[2, -1, 0],
		],
	],
	solar: [
		// Planets
		[
			[0, 0, 0],
			[-1, 0, 0],
			[1, 0, 0],
			[0, -1, 0],
			[0, 1, 0],
		],
		[
			[0, 0, 0],
			[-1, 0, 0],
			[1, 0, 0],
			[0, -1, 0],
			[0, 1, 0],
			[-1, -1, 0],
			[1, 1, 0],
			[-2, 0, 1],
			[2, 0, 1],
		],
		[
			[0, 0, 0],
			[-1, 0, 0],
			[1, 0, 0],
			[0, -1, 0],
			[0, 1, 0],
			[-1, -1, 0],
			[1, -1, 0],
			[-1, 1, 0],
			[1, 1, 0],
		],
		[
			[0, 0, 0],
			[-1, 0, 0],
			[1, 0, 0],
			[0, -1, 0],
			[0, 1, 0],
			[-2, -1, 1],
			[-1, -2, 1],
			[2, 1, 1],
			[1, 2, 1],
		],
	],
	stellar: [
		// Stars
		[
			[0, 0, 0],
			[-1, 0, 1],
			[1, 0, 1],
			[0, -1, 1],
			[0, 1, 1],
		],
		[
			[0, 0, 0],
			[-1, 0, 0],
			[1, 0, 0],
			[0, -1, 0],
			[0, 1, 0],
			[-2, 0, 1],
			[2, 0, 1],
			[0, -2, 1],
			[0, 2, 1],
		],
		[
			[0, 0, 0],
			[-1, -1, 1],
			[1, 1, 1],
			[-1, 1, 1],
			[1, -1, 1],
		],
		[
			[0, 0, 0],
			[-1, 0, 0],
			[1, 0, 0],
			[0, -1, 0],
			[0, 1, 0],
			[-1, -1, 1],
			[1, 1, 1],
			[-1, 1, 1],
			[1, -1, 1],
		],
	],
	cosmic: [
		// Galaxies - spiral-ish
		[
			[0, 0, 0],
			[-1, 0, 1],
			[0, -1, 1],
			[1, 1, 1],
			[-1, -1, 1],
			[2, 0, 1],
			[-2, 1, 1],
		],
		[
			[0, 0, 0],
			[0, -1, 0],
			[-1, 0, 1],
			[1, 0, 1],
			[-1, -1, 1],
			[1, 1, 1],
			[-2, -1, 1],
			[2, 1, 1],
			[0, 2, 1],
		],
		[
			[0, 0, 0],
			[-1, 0, 0],
			[1, 0, 1],
			[0, -1, 1],
			[0, 1, 1],
			[-2, 1, 1],
			[2, -1, 1],
			[-1, -2, 1],
			[1, 2, 1],
		],
		[
			[0, 0, 0],
			[1, 0, 0],
			[-1, 0, 0],
			[0, 1, 0],
			[0, -1, 0],
			[-1, -1, 1],
			[1, 1, 1],
			[-2, 0, 1],
			[2, 0, 1],
			[0, -2, 1],
			[0, 2, 1],
		],
	],
};

// Color palettes for each layer type
const PALETTES: Record<string, string[]> = {
	quark: ['#ff0066', '#00ffff', '#ffff00'],
	nucleus: ['#ff4444', '#4444ff'],
	atom: ['#4444ff', '#00ffff'],
	molecule: ['#ff6666', '#66ff66', '#888888', '#ffff66'],
	cell: ['#00aa88', '#884488', '#44aa44'],
	human: ['#ffcc99', '#ff6666', '#4444aa', '#66ff66'],
	earth: ['#445566', '#556677', '#667788'],
	solar: ['#ff8844', '#ccaa88'],
	stellar: ['#ffffff', '#ffff88'],
	cosmic: ['#ffffcc', '#aaaaff'],
};

export class PlaceholderLayer implements ILayer {
	private readonly midLogScale: number;
	private readonly seed: number;
	private readonly patterns: PixelPattern[];
	private readonly palette: string[];
	private animTime = 0;

	constructor(
		public readonly id: string,
		public readonly minLogScale: number,
		public readonly maxLogScale: number,
		private readonly color: string,
		private readonly label: string,
	) {
		this.midLogScale = (minLogScale + maxLogScale) / 2;
		this.seed = this.hashString(id);
		this.patterns = PATTERNS[id] ?? ([[[0, 0, 0]]] as PixelPattern[]);
		this.palette = PALETTES[id] ?? [this.color];
	}

	private hashString(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = (hash << 5) - hash + str.charCodeAt(i);
			hash |= 0;
		}
		return Math.abs(hash);
	}

	update(deltaTime: number): void {
		this.animTime += deltaTime;
	}

	render(ctx: CanvasRenderingContext2D, logScale: number): void {
		const { width, height } = getCanvasSize(ctx.canvas);
		const centerX = width / 2;
		const centerY = height / 2;

		// Black background
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, width, height);

		// Scale factor for this layer
		const scaleFactor = 10 ** (this.midLogScale - logScale);
		const basePixelSize = 12;
		const pixelSize = basePixelSize * scaleFactor;
		const spacing = pixelSize * 8; // Space between pattern centers

		// Draw grid of pixel patterns
		this.drawPixelGrid(
			ctx,
			width,
			height,
			centerX,
			centerY,
			pixelSize,
			spacing,
		);

		// Label
		ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
		ctx.font = 'bold 24px monospace';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.label, centerX, height - 40);
	}

	private drawPixelGrid(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		centerX: number,
		centerY: number,
		pixelSize: number,
		spacing: number,
	): void {
		const maxDim = Math.max(width, height) * 3;

		// Skip if pixels are too small or too large
		if (pixelSize < 0.5 || pixelSize > maxDim) return;

		// Calculate grid offset
		const offsetX = centerX % spacing;
		const offsetY = centerY % spacing;

		const gridStartX = Math.floor((centerX - width) / spacing);
		const gridStartY = Math.floor((centerY - height) / spacing);

		let gridX = gridStartX;
		for (let x = -spacing + offsetX; x < width + spacing; x += spacing) {
			let gridY = gridStartY;
			for (let y = -spacing + offsetY; y < height + spacing; y += spacing) {
				// Vignette
				const dx = (x - centerX) / width;
				const dy = (y - centerY) / height;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const alpha = Math.max(0, 1 - dist * 0.8);

				if (alpha > 0.01) {
					// Pick pattern variant based on grid position
					const patternIndex = Math.floor(
						cellHash(gridX, gridY, this.seed) * this.patterns.length,
					);
					const pattern = this.patterns[patternIndex] ?? this.patterns[0];

					// Subtle animation - some cells blink
					const blink = cellHash(gridX, gridY, this.seed + 3);
					const blinkPhase = Math.sin(this.animTime * 2 + blink * 10);
					const blinkAlpha = blink > 0.9 ? 0.7 + blinkPhase * 0.3 : 1;

					ctx.globalAlpha = alpha * blinkAlpha;

					// Draw each pixel in the pattern
					if (pattern) {
						for (const [px, py, colorIdx] of pattern) {
							const color = this.palette[colorIdx % this.palette.length];
							if (color) {
								ctx.fillStyle = color;
								ctx.fillRect(
									x + px * pixelSize - pixelSize / 2,
									y + py * pixelSize - pixelSize / 2,
									pixelSize,
									pixelSize,
								);
							}
						}
					}
				}
				gridY++;
			}
			gridX++;
		}
		ctx.globalAlpha = 1;
	}
}
