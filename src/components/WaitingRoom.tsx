import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Player, RoomState, subscribeToRoom, startGame, leaveRoom } from '../firebase/roomService';

const WaitingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f0f0;
  padding: 20px;
`;

const RoomInfo = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
`;

const RoomCode = styled.div`
  background-color: #e3f2fd;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #1976D2;
`;

const PlayerList = styled.div`
  margin: 20px 0;
`;

const PlayerItem = styled.div<{ isHost: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 5px 0;
  background-color: ${props => props.isHost ? '#e3f2fd' : '#f5f5f5'};
  border-radius: 4px;
`;

const PlayerName = styled.span<{ $isHost: boolean }>`
  font-weight: ${props => props.$isHost ? 'bold' : 'normal'};
`;

const HostBadge = styled.span`
  background-color: #2196F3;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 8px;
`;

const StartButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 20px 40px;
  display: block;
  width: calc(100% - 80px);

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const LeaveButton = styled.button`
  background-color: #f44336;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 20px 40px;
  display: block;
  width: calc(100% - 80px);

  &:hover {
    background-color: #da190b;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  margin-top: 8px;
  font-size: 14px;
`;

const WaitingMessage = styled.div`
  text-align: center;
  margin: 20px 0;
  font-size: 16px;
  color: #666;
`;

interface WaitingRoomProps {
  roomCode: string;
  playerId: string;
  onGameStart: () => void;
  onLeave: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  roomCode,
  playerId,
  onGameStart,
  onLeave
}) => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomCode, (state) => {
      setRoomState(state);
      if (state.status === 'playing') {
        onGameStart();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomCode, onGameStart]);

  const handleStartGame = async () => {
    if (!roomState) return;
    
    setIsLoading(true);
    setError('');

    try {
      await startGame(roomCode, playerId);
      onGameStart();
    } catch (err) {
      setError('Failed to start game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = async () => {
    setIsLoading(true);
    setError('');

    try {
      await leaveRoom(roomCode, playerId);
      onLeave();
    } catch (err) {
      setError('Failed to leave room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!roomState) {
    return <div>Loading...</div>;
  }

  const currentPlayer = roomState.players[playerId];
  const isHost = currentPlayer?.isHost || false;
  const canStart = isHost && Object.keys(roomState.players).length >= 2;

  return (
    <WaitingContainer>
      <RoomInfo>
        <h2>Waiting Room</h2>
        <RoomCode>{roomCode}</RoomCode>
        
        <PlayerList>
          {Object.entries(roomState.players).map(([id, player]) => (
            <PlayerItem key={id} isHost={player.isHost}>
              <div>
                <PlayerName $isHost={player.isHost}>
                  {player.name}
                  {player.isHost && <HostBadge>Host</HostBadge>}
                </PlayerName>
              </div>
            </PlayerItem>
          ))}
        </PlayerList>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {isHost ? (
          <>
            <StartButton
              onClick={handleStartGame}
              disabled={!canStart || isLoading}
            >
              Start Game
            </StartButton>
            <LeaveButton
              onClick={handleLeave}
              disabled={isLoading}
            >
              Leave Room
            </LeaveButton>
          </>
        ) : (
          <>
            <WaitingMessage>Waiting for host to start the game...</WaitingMessage>
            <LeaveButton
              onClick={handleLeave}
              disabled={isLoading}
            >
              Leave Room
            </LeaveButton>
          </>
        )}
      </RoomInfo>
    </WaitingContainer>
  );
};

export default WaitingRoom; 