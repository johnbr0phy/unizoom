export interface CanvasContext {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
}

export function setupCanvas(canvasId: string): CanvasContext {
	const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
	if (!canvas) {
		throw new Error(`Canvas element with id "${canvasId}" not found`);
	}

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Failed to get 2D rendering context');
	}

	// Initial resize
	resizeCanvas(canvas, ctx);

	// Handle window resize
	window.addEventListener('resize', () => {
		resizeCanvas(canvas, ctx);
	});

	return { canvas, ctx };
}

function resizeCanvas(
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
): void {
	const dpr = window.devicePixelRatio || 1;
	const rect = canvas.getBoundingClientRect();

	canvas.width = rect.width * dpr;
	canvas.height = rect.height * dpr;

	ctx.scale(dpr, dpr);
}

export function getCanvasSize(canvas: HTMLCanvasElement): {
	width: number;
	height: number;
} {
	const dpr = window.devicePixelRatio || 1;
	return {
		width: canvas.width / dpr,
		height: canvas.height / dpr,
	};
}
