import { getCanvasSize } from '@/rendering/canvas';
import type { ILayer } from '../types';

// Simple hash for consistent random per grid cell
function cellHash(x: number, y: number, seed: number): number {
	const h = (x * 374761393 + y * 668265263 + seed) ^ (seed >> 13);
	return ((h * 1274126177) >>> 0) / 4294967296;
}

export class PlaceholderLayer implements ILayer {
	private readonly midLogScale: number;
	private readonly seed: number;
	private animTime = 0;

	constructor(
		public readonly id: string,
		public readonly minLogScale: number,
		public readonly maxLogScale: number,
		private readonly color: string,
		private readonly label: string,
	) {
		this.midLogScale = (minLogScale + maxLogScale) / 2;
		// Generate seed from layer id
		this.seed = this.hashString(id);
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
		const baseSize = 80;
		const clusterSize = baseSize * scaleFactor;
		const spacing = clusterSize * 1.8;

		// Draw grid of themed clusters
		this.drawClusterGrid(
			ctx,
			width,
			height,
			centerX,
			centerY,
			clusterSize,
			spacing,
		);

		// Label
		ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
		ctx.font = 'bold 24px monospace';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.label, centerX, height - 40);
	}

	private drawClusterGrid(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		centerX: number,
		centerY: number,
		clusterSize: number,
		spacing: number,
	): void {
		const maxDim = Math.max(width, height) * 3;

		// Skip if clusters are too small or too large
		if (clusterSize < 1 || clusterSize > maxDim) return;

		// Calculate grid offset to keep centered
		const offsetX = centerX % spacing;
		const offsetY = centerY % spacing;

		// Calculate grid cell indices for consistent seeding
		const gridStartX = Math.floor((centerX - width) / spacing);
		const gridStartY = Math.floor((centerY - height) / spacing);

		let gridX = gridStartX;
		for (let x = -spacing + offsetX; x < width + spacing; x += spacing) {
			let gridY = gridStartY;
			for (let y = -spacing + offsetY; y < height + spacing; y += spacing) {
				// Distance from center for vignette
				const dx = (x - centerX) / width;
				const dy = (y - centerY) / height;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const alpha = Math.max(0, 1 - dist * 0.8);

				if (alpha > 0.01) {
					// Get consistent random values for this grid cell
					const variant = Math.floor(cellHash(gridX, gridY, this.seed) * 4);
					const rotation = cellHash(gridX, gridY, this.seed + 1) * Math.PI * 2;
					const sizeVariation =
						0.7 + cellHash(gridX, gridY, this.seed + 2) * 0.6;

					ctx.save();
					ctx.translate(x, y);
					ctx.rotate(rotation);
					ctx.globalAlpha = alpha * 0.9;

					const size = clusterSize * sizeVariation;
					const px = Math.max(1, size / 8);

					// Subtle animation
					const wobble = Math.sin(this.animTime * 2 + rotation) * 0.05;
					const pulse =
						1 + Math.sin(this.animTime * 1.5 + gridX + gridY) * 0.03;
					ctx.rotate(wobble);
					ctx.scale(pulse, pulse);

					this.drawThemedCluster(ctx, size, px, variant);

					ctx.restore();
				}
				gridY++;
			}
			gridX++;
		}
		ctx.globalAlpha = 1;
	}

	private drawThemedCluster(
		ctx: CanvasRenderingContext2D,
		size: number,
		px: number,
		variant: number,
	): void {
		switch (this.id) {
			case 'quark':
				this.drawQuark(ctx, size, px, variant);
				break;
			case 'nucleus':
				this.drawNucleus(ctx, size, px, variant);
				break;
			case 'atom':
				this.drawAtom(ctx, size, px, variant);
				break;
			case 'molecule':
				this.drawMolecule(ctx, size, px, variant);
				break;
			case 'cell':
				this.drawCell(ctx, size, px, variant);
				break;
			case 'human':
				this.drawHuman(ctx, size, px, variant);
				break;
			case 'earth':
				this.drawCity(ctx, size, px, variant);
				break;
			case 'solar':
				this.drawPlanet(ctx, size, px, variant);
				break;
			case 'stellar':
				this.drawStar(ctx, size, px, variant);
				break;
			case 'cosmic':
				this.drawGalaxy(ctx, size, px, variant);
				break;
			default:
				this.drawGeneric(ctx, size);
		}
	}

	private drawQuark(
		ctx: CanvasRenderingContext2D,
		size: number,
		px: number,
		variant: number,
	): void {
		const colors = ['#ff0066', '#00ffff', '#ffff00'];
		const angles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

		for (let i = 0; i < 3; i++) {
			const baseAngle = angles[i] ?? 0;
			const angle = baseAngle + (variant * Math.PI) / 6;
			const r = size * 0.3;
			const x = Math.cos(angle) * r;
			const y = Math.sin(angle) * r;

			ctx.fillStyle = colors[i] ?? '#fff';
			ctx.beginPath();
			ctx.arc(x, y, px * 2, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	private drawNucleus(
		ctx: CanvasRenderingContext2D,
		size: number,
		px: number,
		variant: number,
	): void {
		const count = 4 + variant * 2;
		for (let i = 0; i < count; i++) {
			const angle = (i / count) * Math.PI * 2;
			const r = size * 0.2 * (0.5 + (i % 2) * 0.5);
			const x = Math.cos(angle) * r;
			const y = Math.sin(angle) * r;

			ctx.fillStyle = i % 2 === 0 ? '#ff4444' : '#4444ff';
			ctx.beginPath();
			ctx.arc(x, y, px * 1.5, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	private drawAtom(
		ctx: CanvasRenderingContext2D,
		size: number,
		px: number,
		variant: number,
	): void {
		// Nucleus
		ctx.fillStyle = '#4444ff';
		ctx.beginPath();
		ctx.arc(0, 0, px * 2, 0, Math.PI * 2);
		ctx.fill();

		// Electron orbits
		ctx.strokeStyle = '#00aaff';
		ctx.lineWidth = Math.max(1, px * 0.3);
		for (let i = 0; i < 2 + variant; i++) {
			ctx.save();
			ctx.rotate((i * Math.PI) / (2 + variant));
			ctx.beginPath();
			ctx.ellipse(0, 0, size * 0.4, size * 0.15, 0, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
		}

		// Electrons
		ctx.fillStyle = '#00ffff';
		const electronAngle = this.animTime * 3 + variant;
		ctx.beginPath();
		ctx.arc(
			Math.cos(electronAngle) * size * 0.35,
			Math.sin(electronAngle) * size * 0.12,
			px,
			0,
			Math.PI * 2,
		);
		ctx.fill();
	}

	private drawMolecule(
		ctx: CanvasRenderingContext2D,
		size: number,
		px: number,
		variant: number,
	): void {
		const atoms = 3 + variant;
		const positions: Array<{ x: number; y: number }> = [];

		for (let i = 0; i < atoms; i++) {
			const angle = (i / atoms) * Math.PI * 2;
			const r = size * 0.25;
			positions.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
		}

		// Bonds
		ctx.strokeStyle = '#888';
		ctx.lineWidth = Math.max(1, px * 0.5);
		for (let i = 0; i < positions.length; i++) {
			const p1 = positions[i];
			const p2 = positions[(i + 1) % positions.length];
			if (p1 && p2) {
				ctx.beginPath();
				ctx.moveTo(p1.x, p1.y);
				ctx.lineTo(p2.x, p2.y);
				ctx.stroke();
			}
		}

		// Atoms
		const atomColors = ['#ff6666', '#66ff66', '#6666ff', '#ffff66'];
		for (let i = 0; i < positions.length; i++) {
			const p = positions[i];
			if (p) {
				ctx.fillStyle = atomColors[i % atomColors.length] ?? '#fff';
				ctx.beginPath();
				ctx.arc(p.x, p.y, px * 1.5, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}

	private drawCell(
		ctx: CanvasRenderingContext2D,
		size: number,
		px: number,
		variant: number,
	): void {
		// Membrane
		ctx.strokeStyle = '#00aa88';
		ctx.lineWidth = Math.max(1, px);
		ctx.beginPath();
		ctx.ellipse(0, 0, size * 0.4, size * 0.3, variant * 0.3, 0, Math.PI * 2);
		ctx.stroke();

		// Nucleus
		ctx.fillStyle = '#884488';
		ctx.beginPath();
		ctx.arc(size * 0.05, 0, size * 0.12, 0, Math.PI * 2);
		ctx.fill();

		// Organelles
		ctx.fillStyle = '#44aa44';
		for (let i = 0; i < 3 + variant; i++) {
			const angle = (i / (3 + variant)) * Math.PI * 2;
			const r = size * 0.2;
			ctx.beginPath();
			ctx.arc(
				Math.cos(angle) * r,
				Math.sin(angle) * r,
				px * 1.2,
				0,
				Math.PI * 2,
			);
			ctx.fill();
		}
	}

	private drawHuman(
		ctx: CanvasRenderingContext2D,
		size: number,
		px: number,
		variant: number,
	): void {
		const colors = ['#ff6666', '#6666ff', '#66ff66', '#ffff66'];
		const skinColor = '#ffcc99';
		const shirtColor = colors[variant] ?? '#ff6666';

		// Head
		ctx.fillStyle = skinColor;
		ctx.fillRect(-px * 1.5, -size * 0.35, px * 3, px * 3);

		// Body
		ctx.fillStyle = shirtColor;
		ctx.fillRect(-px * 2, -size * 0.35 + px * 3, px * 4, px * 4);

		// Legs
		ctx.fillStyle = '#4444aa';
		ctx.fillRect(-px * 2, -size * 0.35 + px * 7, px * 1.5, px * 3);
		ctx.fillRect(px * 0.5, -size * 0.35 + px * 7, px * 1.5, px * 3);
	}

	private drawCity(
		ctx: CanvasRenderingContext2D,
		_size: number,
		px: number,
		variant: number,
	): void {
		const buildings = 3 + variant;

		for (let i = 0; i < buildings; i++) {
			const bWidth = px * (2 + (i % 2));
			const bHeight = px * (4 + i * 2);
			const x = (i - buildings / 2) * px * 3;

			ctx.fillStyle = `hsl(${200 + i * 20}, 30%, ${30 + i * 5}%)`;
			ctx.fillRect(x - bWidth / 2, -bHeight, bWidth, bHeight);

			// Windows
			ctx.fillStyle = '#ffff88';
			for (let w = 0; w < bHeight / px - 1; w++) {
				if ((w + i) % 2 === 0) {
					ctx.fillRect(
						x - bWidth / 4,
						-bHeight + px + w * px,
						px * 0.5,
						px * 0.5,
					);
				}
			}
		}
	}

	private drawPlanet(
		ctx: CanvasRenderingContext2D,
		size: number,
		px: number,
		variant: number,
	): void {
		const colors = ['#ff8844', '#88aaff', '#ffaa44', '#aaffaa'];
		const planetColor = colors[variant] ?? '#ff8844';

		ctx.fillStyle = planetColor;
		ctx.beginPath();
		ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
		ctx.fill();

		// Ring for some variants
		if (variant === 1 || variant === 3) {
			ctx.strokeStyle = '#ccaa88';
			ctx.lineWidth = Math.max(1, px);
			ctx.beginPath();
			ctx.ellipse(0, 0, size * 0.5, size * 0.1, 0.3, 0, Math.PI * 2);
			ctx.stroke();
		}

		// Surface detail
		ctx.fillStyle = '#00000044';
		ctx.beginPath();
		ctx.arc(size * 0.05, -size * 0.05, size * 0.1, 0, Math.PI * 2);
		ctx.fill();
	}

	private drawStar(
		ctx: CanvasRenderingContext2D,
		size: number,
		px: number,
		variant: number,
	): void {
		const colors = ['#ffffff', '#ffff88', '#ff8844', '#88aaff'];
		const starColor = colors[variant] ?? '#ffffff';

		// Glow
		const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.4);
		gradient.addColorStop(0, starColor);
		gradient.addColorStop(0.3, `${starColor}88`);
		gradient.addColorStop(1, 'transparent');

		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
		ctx.fill();

		// Core
		ctx.fillStyle = '#ffffff';
		ctx.beginPath();
		ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
		ctx.fill();

		// Rays
		ctx.strokeStyle = starColor;
		ctx.lineWidth = Math.max(1, px * 0.5);
		for (let i = 0; i < 4; i++) {
			const angle = (i * Math.PI) / 2 + this.animTime * 0.5;
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(Math.cos(angle) * size * 0.5, Math.sin(angle) * size * 0.5);
			ctx.stroke();
		}
	}

	private drawGalaxy(
		ctx: CanvasRenderingContext2D,
		size: number,
		px: number,
		variant: number,
	): void {
		const arms = 2 + (variant % 2);
		const points = 30;

		for (let arm = 0; arm < arms; arm++) {
			const armOffset = (arm * Math.PI * 2) / arms;

			for (let i = 0; i < points; i++) {
				const t = i / points;
				const angle = armOffset + t * Math.PI * 2 + this.animTime * 0.2;
				const r = t * size * 0.4;
				const x = Math.cos(angle) * r;
				const y = Math.sin(angle) * r * 0.4;

				const brightness = 1 - t * 0.5;
				ctx.fillStyle = `rgba(200, 180, 255, ${brightness})`;
				ctx.beginPath();
				ctx.arc(x, y, Math.max(1, px * (1 - t * 0.5)), 0, Math.PI * 2);
				ctx.fill();
			}
		}

		// Core
		const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.15);
		coreGradient.addColorStop(0, '#ffffcc');
		coreGradient.addColorStop(0.5, '#ffcc88');
		coreGradient.addColorStop(1, 'transparent');
		ctx.fillStyle = coreGradient;
		ctx.beginPath();
		ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
		ctx.fill();
	}

	private drawGeneric(ctx: CanvasRenderingContext2D, size: number): void {
		ctx.fillStyle = this.color;
		ctx.fillRect(-size / 4, -size / 4, size / 2, size / 2);
	}
}
