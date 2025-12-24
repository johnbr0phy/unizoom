export interface ILayer {
	readonly id: string;
	readonly minLogScale: number;
	readonly maxLogScale: number;

	render(ctx: CanvasRenderingContext2D, logScale: number): void;
	update?(deltaTime: number): void;

	// Optional lifecycle
	onEnter?(): void;
	onExit?(): void;
}

export interface LayerConfig {
	id: string;
	minLog: number;
	maxLog: number;
	layer: ILayer;
}
