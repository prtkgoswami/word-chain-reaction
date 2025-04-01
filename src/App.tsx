import React, { useState } from 'react';
import styled from 'styled-components';
import Game from './components/Game';
import RulesModal from './components/RulesModal';
import RoomMenu from './components/RoomMenu';
import WaitingRoom from './components/WaitingRoom';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f0f0f0;
`;

interface GameState {
  roomCode: string;
  playerId: string;
  isInGame: boolean;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const handleRoomCreated = (roomCode: string, playerId: string) => {
    setGameState({ roomCode, playerId, isInGame: false });
  };

  const handleRoomJoined = (roomCode: string, playerId: string) => {
    setGameState({ roomCode, playerId, isInGame: false });
  };

  const handleGameStart = () => {
    if (gameState) {
      setGameState({ ...gameState, isInGame: true });
    }
  };

  const handleLeaveRoom = () => {
    setGameState(null);
  };

  const handleReset = () => {
    setGameState(null);
  };

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