import { PlaceholderLayer } from './placeholder/PlaceholderLayer';
import type { LayerConfig } from './types';

// Full layer set from quarks to the observable universe
export const LAYERS: LayerConfig[] = [
	{
		id: 'quark',
		minLog: -16,
		maxLog: -14,
		layer: new PlaceholderLayer('quark', -16, -14, '#8B00FF', 'QUARKS'),
	},
	{
		id: 'nucleus',
		minLog: -15,
		maxLog: -11,
		layer: new PlaceholderLayer('nucleus', -15, -11, '#4B0082', 'NUCLEUS'),
	},
	{
		id: 'atom',
		minLog: -12,
		maxLog: -9,
		layer: new PlaceholderLayer('atom', -12, -9, '#0000FF', 'ATOMS'),
	},
	{
		id: 'molecule',
		minLog: -10,
		maxLog: -7,
		layer: new PlaceholderLayer('molecule', -10, -7, '#00FFFF', 'MOLECULES'),
	},
	{
		id: 'cell',
		minLog: -8,
		maxLog: -4,
		layer: new PlaceholderLayer('cell', -8, -4, '#008080', 'CELLS'),
	},
	{
		id: 'human',
		minLog: -5,
		maxLog: 3,
		layer: new PlaceholderLayer('human', -5, 3, '#00FF00', 'HUMAN'),
	},
	{
		id: 'earth',
		minLog: 2,
		maxLog: 7,
		layer: new PlaceholderLayer('earth', 2, 7, '#FFFF00', 'EARTH'),
	},
	{
		id: 'solar',
		minLog: 6,
		maxLog: 13,
		layer: new PlaceholderLayer('solar', 6, 13, '#FFA500', 'SOLAR SYSTEM'),
	},
	{
		id: 'stellar',
		minLog: 12,
		maxLog: 20,
		layer: new PlaceholderLayer(
			'stellar',
			12,
			20,
			'#FF4500',
			'STARS & GALAXIES',
		),
	},
	{
		id: 'cosmic',
		minLog: 19,
		maxLog: 26,
		layer: new PlaceholderLayer('cosmic', 19, 26, '#FF00FF', 'UNIVERSE'),
	},
];
