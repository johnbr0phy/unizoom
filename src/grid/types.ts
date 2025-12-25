// 6 levels, 10x10 each = 1 trillion squares
export const GRID_SIZE = 10;
export const GRID_LEVELS = 6;
export const TOTAL_SQUARES = GRID_SIZE ** (2 * GRID_LEVELS); // 10^12 = 1 trillion

// Square address: array of 6 positions, each 0-99 (row*10 + col)
// Example: [34, 72, 15, 89, 03, 56] = level1[3,4] > level2[7,2] > ...
export type SquareAddress = [number, number, number, number, number, number];

// Level names and their scale ranges
export const LEVEL_CONFIG = [
	{ name: 'COSMOS', color: '#FF00FF', logMin: 20, logMax: 26 },
	{ name: 'GALAXY', color: '#FF4500', logMin: 16, logMax: 22 },
	{ name: 'STAR', color: '#FFA500', logMin: 12, logMax: 18 },
	{ name: 'PLANET', color: '#FFFF00', logMin: 8, logMax: 14 },
	{ name: 'CITY', color: '#00FF00', logMin: 4, logMax: 10 },
	{ name: 'HUMAN', color: '#00FFFF', logMin: 0, logMax: 6 },
] as const;

// Price per square at each level (in dollars)
export const LEVEL_PRICES = [
	10_000_000_000, // $10B per cosmos square
	100_000_000, // $100M per galaxy square
	1_000_000, // $1M per star square
	10_000, // $10K per planet square
	100, // $100 per city square
	1, // $1 per human square
] as const;
