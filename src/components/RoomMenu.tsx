import React, { useState } from 'react';
import styled from 'styled-components';
import { createRoom, joinRoom } from '../firebase/roomService';

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f0f0;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  color: #2196F3;
  margin-bottom: 40px;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    border-color: #2196F3;
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  margin-top: 8px;
  font-size: 14px;
`;

const RoomCode = styled.div`
  background-color: #e3f2fd;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #1976D2;
`;

interface RoomMenuProps {
  onRoomCreated: (roomCode: string, playerId: string) => void;
  onRoomJoined: (roomCode: string, playerId: string) => void;
}

const RoomMenu: React.FC<RoomMenuProps> = ({ onRoomCreated, onRoomJoined }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState('');

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { roomCode, playerId } = await createRoom(playerName);
      setCreatedRoomCode(roomCode);
      onRoomCreated(roomCode, playerId);
    } catch (err) {
      setError('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await joinRoom(roomCode.toUpperCase(), playerName);
      if (result.success && result.playerId) {
        onRoomJoined(roomCode.toUpperCase(), result.playerId);
      } else {
        setError(result.error || 'Failed to join room');
      }
    } catch (err) {
      setError('Failed to join room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MenuContainer>
      <Title>Word Chain Reaction</Title>
      
      {createdRoomCode ? (
        <Form>
          <h2>Room Created!</h2>
          <RoomCode>{createdRoomCode}</RoomCode>
          <p>Share this code with other players to join the game.</p>
          <p>Waiting for players to join...</p>
        </Form>
      ) : (
        <Form>
          <Input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={isLoading}
          />
          <div style={{padding: '20px 0'}} />
          <Button 
            onClick={handleCreateRoom}
            disabled={isLoading}
          >
            Create Room
          </Button>

          <div style={{ margin: '8px 0', textAlign: 'center' }}>
            OR
          </div>

          <Input
            type="text"
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            disabled={isLoading}
          />
          
          <Button 
            onClick={handleJoinRoom}
            disabled={isLoading}
          >
            Join Room
          </Button>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      )}
    </MenuContainer>
  );
};

export default RoomMenu; 