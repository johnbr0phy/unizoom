import { formatScale } from '@/core/Camera';
import { gameState } from '@/grid';
import type { LayerConfig } from '@/layers/types';
import { getVisibleLayers } from '@/layers/visibility';

export class ScaleIndicator {
	private scaleValueEl: HTMLElement | null;
	private layerNameEl: HTMLElement | null;
	private gameLevelEl: HTMLElement | null;

	constructor(containerId: string) {
		const container = document.getElementById(containerId);
		if (!container) {
			this.scaleValueEl = null;
			this.layerNameEl = null;
			this.gameLevelEl = null;
			return;
		}

		this.scaleValueEl = container.querySelector('.scale-value');
		this.layerNameEl = container.querySelector('.layer-name');
		this.gameLevelEl = container.querySelector('.game-level');
	}

	update(logScale: number, layers: LayerConfig[]): void {
		if (this.scaleValueEl) {
			this.scaleValueEl.textContent = formatScale(logScale);
		}

		if (this.layerNameEl) {
			const visible = getVisibleLayers(layers, logScale);
			const names = visible.map((l) => capitalize(l.id)).join(' / ');
			this.layerNameEl.textContent = names || '—';
		}

		if (this.gameLevelEl) {
			const deleted = gameState.getTotalDeleted();
			const total = gameState.totalSquaresAllLayers;
			this.gameLevelEl.textContent = `Level ${gameState.level} • ${deleted}/${total}`;
		}
	}
}

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
