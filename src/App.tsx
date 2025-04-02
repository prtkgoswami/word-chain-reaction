import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Game from './components/Game';
import RulesModal from './components/RulesModal';
import RoomMenu from './components/RoomMenu';
import WaitingRoom from './components/WaitingRoom';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f0f0f0;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  padding: 20px;
  text-align: center;
  background-color: #ffebee;
  margin: 20px;
  border-radius: 4px;
`;

interface GameState {
  roomCode: string;
  playerId: string;
  isInGame: boolean;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('App mounted, current game state:', gameState);
  }, [gameState]);

  const handleRoomCreated = (roomCode: string, playerId: string) => {
    console.log('Room created:', { roomCode, playerId });
    setGameState({ roomCode, playerId, isInGame: false });
  };

  const handleRoomJoined = (roomCode: string, playerId: string) => {
    console.log('Room joined:', { roomCode, playerId });
    setGameState({ roomCode, playerId, isInGame: false });
  };

  const handleGameStart = () => {
    console.log('Game starting');
    if (gameState) {
      setGameState({ ...gameState, isInGame: true });
    }
  };

  const handleLeaveRoom = () => {
    console.log('Leaving room');
    setGameState(null);
  };

  const handleReset = () => {
    console.log('Resetting game');
    setGameState(null);
  };

  if (error) {
    return (
      <AppContainer>
        <ErrorMessage>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Try Again</button>
        </ErrorMessage>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      {!gameState ? (
        <RoomMenu
          onRoomCreated={handleRoomCreated}
          onRoomJoined={handleRoomJoined}
        />
      ) : !gameState.isInGame ? (
        <WaitingRoom
          roomCode={gameState.roomCode}
          playerId={gameState.playerId}
          onGameStart={handleGameStart}
          onLeave={handleLeaveRoom}
        />
      ) : (
        <Game
          onReset={handleReset}
          roomCode={gameState.roomCode}
          playerId={gameState.playerId}
        />
      )}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </AppContainer>
  );
};

export default App; 