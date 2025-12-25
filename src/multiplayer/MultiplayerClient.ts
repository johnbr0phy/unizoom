import type {
	ClientMessage,
	DeleteAction,
	GameStateSnapshot,
	Player,
	ServerMessage,
} from './types';
import { TEAM_COLORS } from './types';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'offline';

export class MultiplayerClient {
	private ws: WebSocket | null = null;
	private connectionState: ConnectionState = 'disconnected';
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 3;
	private reconnectDelay = 1000;

	// Player info
	private playerId: string | null = null;
	private teamColor: string | null = null;

	// Event listeners
	private listeners = {
		connected: [] as Array<(player: Player, state: GameStateSnapshot) => void>,
		disconnected: [] as Array<() => void>,
		offline: [] as Array<(teamColor: string) => void>,
		playerJoined: [] as Array<(player: Player, count: number) => void>,
		playerLeft: [] as Array<(playerId: string, count: number) => void>,
		deleted: [] as Array<(action: DeleteAction) => void>,
		layerLeveled: [] as Array<(layerIndex: number, newLevel: number) => void>,
	};

	constructor(private serverUrl: string) {}

	connect(): void {
		if (this.connectionState !== 'disconnected') return;

		this.connectionState = 'connecting';
		console.log(`Connecting to multiplayer server: ${this.serverUrl}`);

		try {
			this.ws = new WebSocket(this.serverUrl);

			this.ws.onopen = () => {
				console.log('WebSocket connected');
				this.reconnectAttempts = 0;
				this.send({ type: 'join' });
			};

			this.ws.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data) as ServerMessage;
					this.handleMessage(message);
				} catch (error) {
					console.error('Failed to parse message:', error);
				}
			};

			this.ws.onclose = () => {
				console.log('WebSocket disconnected');
				this.connectionState = 'disconnected';
				this.ws = null;
				this.emit('disconnected');
				this.attemptReconnect();
			};

			this.ws.onerror = (error) => {
				console.error('WebSocket error:', error);
			};
		} catch (error) {
			console.error('Failed to connect:', error);
			this.connectionState = 'disconnected';
			this.attemptReconnect();
		}
	}

	private attemptReconnect(): void {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.log('Max reconnect attempts reached, switching to offline mode');
			this.goOffline();
			return;
		}

		this.reconnectAttempts++;
		const delay = this.reconnectDelay * 2 ** (this.reconnectAttempts - 1);
		console.log(
			`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`,
		);

		setTimeout(() => {
			this.connect();
		}, delay);
	}

	private goOffline(): void {
		this.connectionState = 'offline';
		// Assign a random team color for solo play
		const randomIndex = Math.floor(Math.random() * TEAM_COLORS.length);
		const randomColor = TEAM_COLORS[randomIndex] ?? '#FF6B6B';
		this.teamColor = randomColor;
		this.playerId = 'solo-player';
		console.log(`Playing in solo mode with color ${randomColor}`);
		this.emit('offline', randomColor);
	}

	private handleMessage(message: ServerMessage): void {
		switch (message.type) {
			case 'welcome':
				this.playerId = message.playerId;
				this.teamColor = message.teamColor;
				this.connectionState = 'connected';
				console.log(
					`Joined as player ${this.playerId} with color ${this.teamColor}`,
				);
				this.emit(
					'connected',
					{
						id: message.playerId,
						teamColor: message.teamColor,
						joinedAt: Date.now(),
					},
					message.state,
				);
				break;

			case 'player-joined':
				this.emit('playerJoined', message.player, message.playerCount);
				break;

			case 'player-left':
				this.emit('playerLeft', message.playerId, message.playerCount);
				break;

			case 'deleted':
				this.emit('deleted', message.action);
				break;

			case 'layer-leveled':
				this.emit('layerLeveled', message.layerIndex, message.newLevel);
				break;

			case 'pong':
				// Heartbeat response
				break;
		}
	}

	private send(message: ClientMessage): void {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(message));
		}
	}

	// Public API
	sendDelete(layerIndex: number, position: number): void {
		this.send({ type: 'delete', layerIndex, position });
	}

	getPlayerId(): string | null {
		return this.playerId;
	}

	getTeamColor(): string | null {
		return this.teamColor;
	}

	isConnected(): boolean {
		return this.connectionState === 'connected';
	}

	disconnect(): void {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
		this.connectionState = 'disconnected';
	}

	// Event subscription
	on<K extends keyof typeof this.listeners>(
		event: K,
		callback: (typeof this.listeners)[K][number],
	): () => void {
		(this.listeners[event] as Array<typeof callback>).push(callback);
		return () => {
			const index = this.listeners[event].indexOf(callback as never);
			if (index !== -1) {
				this.listeners[event].splice(index, 1);
			}
		};
	}

	private emit<K extends keyof typeof this.listeners>(
		event: K,
		...args: Parameters<(typeof this.listeners)[K][number]>
	): void {
		for (const callback of this.listeners[event]) {
			(callback as (...args: unknown[]) => void)(...args);
		}
	}
}

// Singleton instance - will be initialized when needed
let client: MultiplayerClient | null = null;

export function getMultiplayerClient(): MultiplayerClient | null {
	return client;
}

export function initMultiplayer(serverUrl: string): MultiplayerClient {
	if (client) {
		client.disconnect();
	}
	client = new MultiplayerClient(serverUrl);
	return client;
}
