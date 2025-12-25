// Team colors for players
export const TEAM_COLORS = [
	'#FF6B6B', // Red
	'#4ECDC4', // Teal
	'#45B7D1', // Blue
	'#96CEB4', // Green
	'#FFEAA7', // Yellow
	'#DDA0DD', // Plum
	'#98D8C8', // Mint
	'#F7DC6F', // Gold
	'#BB8FCE', // Purple
	'#85C1E9', // Sky
] as const;

export interface Player {
	id: string;
	teamColor: string;
	joinedAt: number;
}

export interface DeleteAction {
	playerId: string;
	teamColor: string;
	layerIndex: number;
	position: number;
	timestamp: number;
}

// Messages from client to server
export type ClientMessage =
	| { type: 'join' }
	| { type: 'delete'; layerIndex: number; position: number }
	| { type: 'ping' };

// Messages from server to client
export type ServerMessage =
	| {
			type: 'welcome';
			playerId: string;
			teamColor: string;
			state: GameStateSnapshot;
	  }
	| { type: 'player-joined'; player: Player; playerCount: number }
	| { type: 'player-left'; playerId: string; playerCount: number }
	| { type: 'deleted'; action: DeleteAction }
	| { type: 'layer-leveled'; layerIndex: number; newLevel: number }
	| { type: 'pong' };

export interface LayerState {
	level: number;
	deleted: number[]; // Array of deleted positions
}

export interface GameStateSnapshot {
	layers: LayerState[];
	playerCount: number;
}
