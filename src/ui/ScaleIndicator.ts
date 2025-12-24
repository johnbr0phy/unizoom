import { formatScale } from '@/core/Camera';
import type { LayerConfig } from '@/layers/types';
import { getVisibleLayers } from '@/layers/visibility';

export class ScaleIndicator {
	private scaleValueEl: HTMLElement | null;
	private layerNameEl: HTMLElement | null;

	constructor(containerId: string) {
		const container = document.getElementById(containerId);
		if (!container) {
			this.scaleValueEl = null;
			this.layerNameEl = null;
			return;
		}

		this.scaleValueEl = container.querySelector('.scale-value');
		this.layerNameEl = container.querySelector('.layer-name');
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
	}
}

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
