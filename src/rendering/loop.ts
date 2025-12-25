type UpdateCallback = (deltaTime: number) => void;
type RenderCallback = () => void;

interface LoopState {
	isRunning: boolean;
	animationFrameId: number | null;
	lastTime: number;
	frameCount: number;
	lastFpsTime: number;
}

const state: LoopState = {
	isRunning: false,
	animationFrameId: null,
	lastTime: 0,
	frameCount: 0,
	lastFpsTime: 0,
};

export function startLoop(
	onUpdate: UpdateCallback,
	onRender: RenderCallback,
): void {
	if (state.isRunning) {
		return;
	}

	state.isRunning = true;
	state.lastTime = performance.now();
	state.lastFpsTime = state.lastTime;
	state.frameCount = 0;

	function tick(currentTime: number): void {
		if (!state.isRunning) {
			return;
		}

		const deltaTime = (currentTime - state.lastTime) / 1000; // Convert to seconds
		state.lastTime = currentTime;

		// FPS logging in dev mode
		if (import.meta.env.DEV) {
			state.frameCount++;
			if (currentTime - state.lastFpsTime >= 1000) {
				console.log(`FPS: ${state.frameCount}`);
				state.frameCount = 0;
				state.lastFpsTime = currentTime;
			}
		}

		onUpdate(deltaTime);
		onRender();

		state.animationFrameId = requestAnimationFrame(tick);
	}

	state.animationFrameId = requestAnimationFrame(tick);
}

export function stopLoop(): void {
	state.isRunning = false;
	if (state.animationFrameId !== null) {
		cancelAnimationFrame(state.animationFrameId);
		state.animationFrameId = null;
	}
}

export function isLoopRunning(): boolean {
	return state.isRunning;
}
