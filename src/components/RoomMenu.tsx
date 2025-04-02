import React, { useState } from 'react';
import styled from 'styled-components';
import { createRoom, joinRoom } from '../firebase/roomService';

const MenuContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  color: #2196F3;
  margin-bottom: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 16px;
  color: #333;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;

  &:focus {
    border-color: #2196F3;
    outline: none;
  }
`;

const Button = styled.button`
  padding: 12px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1976D2;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 14px;
  margin-top: 5px;
`;

interface RoomMenuProps {
  onRoomCreated: (roomCode: string, playerId: string) => void;
  onRoomJoined: (roomCode: string, playerId: string) => void;
}

const RoomMenu: React.FC<RoomMenuProps> = ({ onRoomCreated, onRoomJoined }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const { roomCode, playerId } = await createRoom(playerName);
      onRoomCreated(roomCode, playerId);
    } catch (error) {
      console.error('Failed to create room:', error);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
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

    setIsJoining(true);
    setError(null);

    try {
      const { playerId } = await joinRoom(roomCode, playerName);
      if (playerId) {
        onRoomJoined(roomCode, playerId as string);
      } else {
        throw new Error('Failed to get player ID');
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      setError('Failed to join room. Please check the room code and try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <MenuContainer>
      <Title>Word Chain Reaction</Title>
      <Form>
        <InputGroup>
          <Label htmlFor="playerName">Your Name</Label>
          <Input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            disabled={isCreating || isJoining}
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="roomCode">Room Code (Optional)</Label>
          <Input
            id="roomCode"
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter room code to join"
            disabled={isCreating || isJoining}
          />
        </InputGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Button
          onClick={handleCreateRoom}
          disabled={isCreating || isJoining || !playerName.trim()}
        >
          {isCreating ? 'Creating Room...' : 'Create New Room'}
        </Button>

        <Button
          onClick={handleJoinRoom}
          disabled={isCreating || isJoining || !playerName.trim() || !roomCode.trim()}
        >
          {isJoining ? 'Joining Room...' : 'Join Room'}
        </Button>
      </Form>
    </MenuContainer>
  );
};

export default RoomMenu; 