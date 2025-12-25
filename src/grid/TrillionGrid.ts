import { GRID_LEVELS, GRID_SIZE, type SquareAddress } from './types';

// Convert address to string key for storage
export function addressToKey(address: SquareAddress): string {
	return address.join('.');
}

// Convert string key back to address
export function keyToAddress(key: string): SquareAddress {
	const parts = key.split('.').map(Number);
	if (parts.length !== GRID_LEVELS) {
		throw new Error(`Invalid address key: ${key}`);
	}
	return parts as SquareAddress;
}

// Get row and column from a position index (0-99)
export function posToRowCol(pos: number): { row: number; col: number } {
	return {
		row: Math.floor(pos / GRID_SIZE),
		col: pos % GRID_SIZE,
	};
}

// Get position index from row and column
export function rowColToPos(row: number, col: number): number {
	return row * GRID_SIZE + col;
}

// Check if a square is a parent of another
export function isParentOf(
	parent: Partial<SquareAddress>,
	child: SquareAddress,
): boolean {
	const parentLevels = Object.keys(parent).length;
	for (let i = 0; i < parentLevels; i++) {
		if (parent[i as keyof typeof parent] !== child[i]) {
			return false;
		}
	}
	return true;
}

export class TrillionGrid {
	// Per-level deletion sets - each level tracks its own deleted squares
	// Key format: "row,col" for each position in the 10x10 grid
	private deletedByLevel: Map<number, Set<string>> = new Map();

	private getDeletedSet(level: number): Set<string> {
		let set = this.deletedByLevel.get(level);
		if (!set) {
			set = new Set();
			this.deletedByLevel.set(level, set);
		}
		return set;
	}

	// Check if a square is deleted at a specific level
	isDeletedAtLevel(partialAddress: number[], level: number): boolean {
		const pos = partialAddress[partialAddress.length - 1];
		if (pos === undefined) return false;
		return this.getDeletedSet(level).has(String(pos));
	}

	// Delete at a specific level
	deleteAtLevel(partialAddress: number[], level: number): void {
		const pos = partialAddress[partialAddress.length - 1];
		if (pos === undefined) return;
		this.getDeletedSet(level).add(String(pos));
	}

	// Restore at a specific level
	restoreAtLevel(pos: number, level: number): void {
		this.getDeletedSet(level).delete(String(pos));
	}

	// Get count of deleted squares at a level
	getDeletedCountAtLevel(level: number): number {
		return this.getDeletedSet(level).size;
	}

	// Get total deleted across all levels
	getDeletedCount(): number {
		let total = 0;
		for (const set of this.deletedByLevel.values()) {
			total += set.size;
		}
		return total;
	}

	// Clear all deletions
	reset(): void {
		this.deletedByLevel.clear();
	}

	// Clear deletions for a specific layer
	resetLayer(level: number): void {
		this.deletedByLevel.delete(level);
	}

	// Export state for persistence
	export(): Record<number, string[]> {
		const result: Record<number, string[]> = {};
		for (const [level, set] of this.deletedByLevel.entries()) {
			result[level] = Array.from(set);
		}
		return result;
	}

	// Import state
	import(data: Record<number, string[]>): void {
		this.deletedByLevel.clear();
		for (const [level, positions] of Object.entries(data)) {
			this.deletedByLevel.set(Number(level), new Set(positions));
		}
	}
}

// Singleton instance
export const trillionGrid = new TrillionGrid();
