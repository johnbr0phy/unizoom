export type { ILayer, LayerConfig } from './types';
export { LAYERS } from './registry';
export {
	getLayerOpacity,
	getVisibleLayers,
	isLayerVisible,
} from './visibility';
export { PlaceholderLayer } from './placeholder/PlaceholderLayer';
