import { formatScale } from '@/core/Camera';
import { gameState } from '@/grid';
import type { LayerConfig } from '@/layers/types';
import { getVisibleLayers } from '@/layers/visibility';

export class ScaleIndicator {
	private scaleValueEl: HTMLElement | null;
	private layerNameEl: HTMLElement | null;
	private layerProgressEl: HTMLElement | null;

	constructor(containerId: string) {
		const container = document.getElementById(containerId);
		if (!container) {
			this.scaleValueEl = null;
			this.layerNameEl = null;
			this.layerProgressEl = null;
			return;
		}

		this.scaleValueEl = container.querySelector('.scale-value');
		this.layerNameEl = container.querySelector('.layer-name');
		this.layerProgressEl = container.querySelector('.layer-progress');
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

		if (this.layerProgressEl) {
			this.updateLayerProgress();
		}
	}

	private updateLayerProgress(): void {
		if (!this.layerProgressEl) return;

		const allProgress = gameState.getAllLayerProgress();
		this.layerProgressEl.innerHTML = allProgress
			.map(
				(p) =>
					`<div class="layer-row">
						<span class="layer-dot" style="background: ${p.color}"></span>
						<span class="layer-info">Lv.${p.level} ${p.deleted}/${p.totalSquares}</span>
					</div>`,
			)
			.join('');
	}
}

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
