import { type WebSocket, WebSocketServer } from 'ws';

// Team colors for players
const TEAM_COLORS = [
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
];

interface Player {
	id: string;
	teamColor: string;
	ws: WebSocket;
	joinedAt: number;
}

interface LayerState {
	level: number;
	deleted: Set<number>;
	deletedBy: Map<number, string>; // position -> teamColor
}

// Game state
const players = new Map<string, Player>();
const layers: LayerState[] = Array.from({ length: 6 }, () => ({
	level: 1,
	deleted: new Set(),
	deletedBy: new Map(),
}));

let nextPlayerId = 1;
let nextColorIndex = 0;

function generatePlayerId(): string {
	return `player-${nextPlayerId++}`;
}

function getNextTeamColor(): string {
	const color = TEAM_COLORS[nextColorIndex % TEAM_COLORS.length];
	nextColorIndex++;
	return color;
}

function getSquaresPerSide(level: number): number {
	return Math.min(level, 10);
}

function getTotalSquares(level: number): number {
	const side = getSquaresPerSide(level);
	return side * side;
}

function broadcast(message: object, excludePlayerId?: string): void {
	const data = JSON.stringify(message);
	for (const player of players.values()) {
		if (player.id !== excludePlayerId) {
			player.ws.send(data);
		}
	}
}

function getGameStateSnapshot() {
	return {
		layers: layers.map((layer) => ({
			level: layer.level,
			deleted: Array.from(layer.deleted),
			deletedBy: Object.fromEntries(layer.deletedBy),
		})),
		playerCount: players.size,
	};
}

function checkLayerComplete(layerIndex: number): boolean {
	const layer = layers[layerIndex];
	const totalSquares = getTotalSquares(layer.level);

	if (layer.deleted.size >= totalSquares && layer.level < 10) {
		layer.level++;
		layer.deleted.clear();
		layer.deletedBy.clear();

		broadcast({
			type: 'layer-leveled',
			layerIndex,
			newLevel: layer.level,
		});

		console.log(`Layer ${layerIndex} leveled up to ${layer.level}!`);
		return true;
	}
	return false;
}

const port = Number(process.env.PORT) || 8080;
const wss = new WebSocketServer({ port });

console.log(`WebSocket server running on port ${port}`);

wss.on('connection', (ws) => {
	let player: Player | null = null;

	ws.on('message', (data) => {
		try {
			const message = JSON.parse(data.toString());

			switch (message.type) {
				case 'join': {
					const playerId = generatePlayerId();
					const teamColor = getNextTeamColor();

					player = {
						id: playerId,
						teamColor,
						ws,
						joinedAt: Date.now(),
					};

					players.set(playerId, player);

					// Send welcome with current state
					ws.send(
						JSON.stringify({
							type: 'welcome',
							playerId,
							teamColor,
							state: getGameStateSnapshot(),
						}),
					);

					// Notify others
					broadcast(
						{
							type: 'player-joined',
							player: {
								id: playerId,
								teamColor,
								joinedAt: player.joinedAt,
							},
							playerCount: players.size,
						},
						playerId,
					);

					console.log(
						`Player ${playerId} joined with color ${teamColor}. Total: ${players.size}`,
					);
					break;
				}

				case 'delete': {
					if (!player) break;

					const { layerIndex, position } = message;
					const layer = layers[layerIndex];

					if (layer && !layer.deleted.has(position)) {
						layer.deleted.add(position);
						layer.deletedBy.set(position, player.teamColor);

						// Broadcast deletion
						broadcast({
							type: 'deleted',
							action: {
								playerId: player.id,
								teamColor: player.teamColor,
								layerIndex,
								position,
								timestamp: Date.now(),
							},
						});

						// Check for level up
						checkLayerComplete(layerIndex);
					}
					break;
				}

				case 'ping': {
					ws.send(JSON.stringify({ type: 'pong' }));
					break;
				}
			}
		} catch (error) {
			console.error('Failed to process message:', error);
		}
	});

	ws.on('close', () => {
		if (player) {
			players.delete(player.id);
			broadcast({
				type: 'player-left',
				playerId: player.id,
				playerCount: players.size,
			});
			console.log(`Player ${player.id} left. Total: ${players.size}`);
		}
	});

	ws.on('error', (error) => {
		console.error('WebSocket error:', error);
	});
});
