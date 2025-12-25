import { createGridLayers } from '@/grid';
import type { LayerConfig } from './types';

// Create the 6 hierarchical grid levels for the trillion-square grid
const gridLayers = createGridLayers();

// Full layer set: 6 levels, 10x10 each = 1 trillion addressable squares
export const LAYERS: LayerConfig[] = gridLayers.map((layer) => ({
	id: layer.id,
	minLog: layer.minLogScale,
	maxLog: layer.maxLogScale,
	layer,
}));
