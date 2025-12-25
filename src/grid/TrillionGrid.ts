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
	// Sparse storage: only store deleted squares
	// Key format: "pos0.pos1.pos2.pos3.pos4.pos5"
	private deleted: Set<string> = new Set();

	// Check if a square is deleted
	isDeleted(address: SquareAddress): boolean {
		return this.deleted.has(addressToKey(address));
	}

	// Check if a square at a given level is deleted (partial address)
	isDeletedAtLevel(partialAddress: number[], level: number): boolean {
		// A square is considered deleted if it OR any of its parents are deleted
		for (let l = 0; l <= level; l++) {
			const checkAddr = [...partialAddress.slice(0, l + 1)];
			// Pad with zeros to make full address for lookup
			while (checkAddr.length < GRID_LEVELS) {
				checkAddr.push(0);
			}
			if (this.deleted.has(checkAddr.join('.'))) {
				return true;
			}
		}
		return false;
	}

	// Delete a square (and all its children implicitly)
	delete(address: SquareAddress): void {
		this.deleted.add(addressToKey(address));
	}

	// Delete at a specific level (partial address)
	deleteAtLevel(partialAddress: number[], _level: number): void {
		// Create full address padded with zeros
		const fullAddress = [...partialAddress];
		while (fullAddress.length < GRID_LEVELS) {
			fullAddress.push(0);
		}
		this.deleted.add(fullAddress.join('.'));
	}

	// Restore a deleted square
	restore(address: SquareAddress): void {
		this.deleted.delete(addressToKey(address));
	}

	// Get count of deleted squares
	getDeletedCount(): number {
		return this.deleted.size;
	}

	// Get all deleted addresses
	getDeletedAddresses(): SquareAddress[] {
		return Array.from(this.deleted).map(keyToAddress);
	}

	// Clear all deletions
	reset(): void {
		this.deleted.clear();
	}

	// Export state for persistence
	export(): string[] {
		return Array.from(this.deleted);
	}

	// Import state
	import(data: string[]): void {
		this.deleted = new Set(data);
	}
}

// Singleton instance
export const trillionGrid = new TrillionGrid();
