import { ref, set, onValue, off, push, get, Database } from 'firebase/database';
import { database } from './config';

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
}

export interface RoomState {
  roomCode: string;
  players: { [key: string]: Player };
  status: 'waiting' | 'playing' | 'ended';
  hostId: string;
  maxPlayers: number;
  minPlayers: number;
  gameState: {
    chain: string[];
    currentPlayer: string;
    gameOver: boolean;
    scores: { [key: string]: number };
  };
}

// Generate a random room code (6 characters)
const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new room
export const createRoom = async (playerName: string): Promise<{ roomCode: string; playerId: string }> => {
  const roomCode = generateRoomCode();
  const playerId = push(ref(database)).key!;
  
  const roomRef = ref(database, `rooms/${roomCode}`);
  const player: Player = {
    id: playerId,
    name: playerName,
    score: 0,
    isHost: true
  };

  const roomState: RoomState = {
    roomCode,
    players: {
      [playerId]: player
    },
    status: 'waiting',
    hostId: playerId,
    maxPlayers: 5,
    minPlayers: 2,
    gameState: {
      chain: [],
      currentPlayer: '',
      gameOver: false,
      scores: {}
    }
  };

  await set(roomRef, roomState);
  return { roomCode, playerId };
};

// Join an existing room
export const joinRoom = async (roomCode: string, playerName: string): Promise<{ success: boolean; playerId?: string; error?: string }> => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    return { success: false, error: 'Room not found' };
  }

  const roomState = snapshot.val() as RoomState;
  
  if (roomState.status !== 'waiting') {
    return { success: false, error: 'Game already in progress' };
  }

  if (Object.keys(roomState.players).length >= roomState.maxPlayers) {
    return { success: false, error: 'Room is full' };
  }

  const playerId = push(ref(database)).key!;
  const player: Player = {
    id: playerId,
    name: playerName,
    score: 0,
    isHost: false
  };

  await set(ref(database, `rooms/${roomCode}/players/${playerId}`), player);
  return { success: true, playerId };
};

// Subscribe to room updates
export const subscribeToRoom = (roomCode: string, callback: (roomState: RoomState) => void) => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as RoomState);
    }
  });

  // Return unsubscribe function
  return () => off(roomRef);
};

// Start the game
export const startGame = async (roomCode: string, playerId: string): Promise<void> => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  
  if (!snapshot.exists()) {
    throw new Error('Room not found');
  }

  const roomState = snapshot.val() as RoomState;
  const players = Object.keys(roomState.players);

  if (players.length < 2) {
    throw new Error('Not enough players to start');
  }

  if (!roomState.players[playerId]?.isHost) {
    throw new Error('Only the host can start the game');
  }

  const firstPlayer = players[0];
  const initialScores = Object.fromEntries(
    players.map(id => [id, 0])
  );

  const initialGameState = {
    chain: [],
    currentPlayer: firstPlayer,
    gameOver: false,
    scores: initialScores
  };

  await set(ref(database, `rooms/${roomCode}/gameState`), initialGameState);

  // Update room status to playing
  await set(ref(database, `rooms/${roomCode}/status`), 'playing');
};

export const updateGameState = async (roomCode: string, gameState: RoomState['gameState']): Promise<void> => {
  const gameStateRef = ref(database, `rooms/${roomCode}/gameState`);
  await set(gameStateRef, gameState);
};

// Leave the room
export const leaveRoom = async (roomCode: string, playerId: string): Promise<void> => {
  const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
  await set(playerRef, null);

  // Check if room is empty and delete it
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  if (snapshot.exists()) {
    const roomState = snapshot.val() as RoomState;
    if (Object.keys(roomState.players).length === 0) {
      await set(roomRef, null);
    }
  }
}; 