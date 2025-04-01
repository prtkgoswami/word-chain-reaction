import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { subscribeToRoom, updateGameState, leaveRoom } from '../firebase/roomService';
import { RoomState } from '../firebase/roomService';
import RulesModal from './RulesModal';

const GameContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  background-color: #2196F3;
  color: white;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  border-radius: 8px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.5rem;
`;

const InfoIcon = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const GameArea = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChainDisplay = styled.div`
  min-height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Word = styled.span`
  background-color: #e3f2fd;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 18px;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-direction: column;
`;

const InputRow = styled.div`
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;

  &:focus {
    border-color: #2196F3;
    outline: none;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ScoreDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const PlayerScore = styled.div<{ isCurrentPlayer: boolean }>`
  padding: 5px 10px;
  border-radius: 4px;
  background-color: ${props => props.isCurrentPlayer ? '#e3f2fd' : 'transparent'};
  font-weight: ${props => props.isCurrentPlayer ? 'bold' : 'normal'};
`;

const ResetButton = styled.button`
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;

  &:hover {
    background-color: #da190b;
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 15px 25px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  max-width: 300px;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const GameOverMessage = styled.div`
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin: 20px 0;
  animation: fadeIn 0.5s ease-in;

  h3 {
    margin: 0 0 15px 0;
    font-size: 24px;
    color: #4CAF50;
  }

  .scores {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 15px;
  }

  .score-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 15px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 14px;
  margin-top: 5px;
`;

interface GameProps {
  onReset: () => void;
  roomCode: string;
  playerId: string;
}

interface GameState {
  chain: string[];
  currentPlayer: string;
  gameOver: boolean;
  scores: { [key: string]: number };
}

const Game: React.FC<GameProps> = ({ onReset, roomCode, playerId }) => {
  const [gameState, setGameState] = useState<GameState>({
    chain: [],
    currentPlayer: '',
    gameOver: false,
    scores: {}
  });
  const [input, setInput] = useState('');
  const [scoreBreakdown, setScoreBreakdown] = useState<{
    wordLength: number;
    chainLength: number;
    circleBonus: number;
  } | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomCode, (state) => {
      if (!state) {
        setError('Room not found');
        return;
      }
      if (!state.players) {
        setError('Invalid room state: players not found');
        return;
      }
      setRoomState(state);
      if (state.gameState) {
        setGameState({
          chain: state.gameState.chain || [],
          currentPlayer: state.gameState.currentPlayer || '',
          gameOver: state.gameState.gameOver || false,
          scores: state.gameState.scores || {}
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomCode]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState.currentPlayer]);

  const calculateScore = (word: string): number => {
    if (!word) return 0;
    const wordLength = word.length;
    const chainLength = gameState.chain.length * 2;
    const isCircle = gameState.chain.length >= 2 && 
                    word[0] === gameState.chain[0][0];
    const circleBonus = isCircle ? (gameState.chain.length + 1) * 2 : 0;

    setScoreBreakdown({
      wordLength,
      chainLength,
      circleBonus
    });

    return wordLength + chainLength + circleBonus;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || gameState.gameOver) return;

    const word = input.trim().toLowerCase();
    
    // Add validation for letters only
    if (!/^[a-z]+$/.test(word)) {
      setInputError('Please enter only letters. No numbers or special characters allowed.');
      return;
    }

    const lastWord = gameState.chain[gameState.chain.length - 1];
    const lastLetter = lastWord ? lastWord[lastWord.length - 1] : null;

    if (lastLetter && word[0] !== lastLetter) {
      setInputError('Your word must start with the last letter of the previous word!');
      return;
    }

    if (gameState.chain.includes(word)) {
      setInputError('This word has already been used!');
      return;
    }

    setInputError(null); // Clear any previous errors

    const score = calculateScore(word);
    const newChain = [...gameState.chain, word];
    const newScores = {
      ...gameState.scores,
      [playerId]: (gameState.scores[playerId] || 0) + score
    };

    const isCircle = newChain.length >= 3 && 
                     word[word.length - 1] === newChain[0][0] &&
                     word !== newChain[0];
    const isGameOver = isCircle || newChain.length >= 10;

    const newGameState = {
      chain: newChain,
      currentPlayer: getNextPlayer(),
      gameOver: isGameOver,
      scores: newScores
    };

    try {
      await updateGameState(roomCode, newGameState);
      setInput('');
    } catch (error) {
      console.error('Failed to update game state:', error);
      setError('Failed to submit word. Please try again.');
    }
  };

  const getNextPlayer = () => {
    if (!roomState) return '';
    const players = Object.keys(roomState.players);
    const currentIndex = players.indexOf(gameState.currentPlayer);
    return players[(currentIndex + 1) % players.length];
  };

  const handleReset = async () => {
    try {
      await leaveRoom(roomCode, playerId);
      onReset();
    } catch (error) {
      console.error('Failed to leave room:', error);
      setError('Failed to leave room. Please try again.');
    }
  };

  const isCurrentPlayer = gameState.currentPlayer === playerId;
  const currentPlayerName = roomState?.players?.[gameState.currentPlayer]?.name || '';

  if (error) {
    return (
      <GameContainer>
        <Header>
          <Title>Error</Title>
        </Header>
        <GameArea>
          <div style={{ color: '#f44336', textAlign: 'center', padding: '20px' }}>
            {error}
          </div>
          <ResetButton onClick={handleReset}>Leave Game</ResetButton>
        </GameArea>
      </GameContainer>
    );
  }

  if (!roomState || !roomState.players) {
    return (
      <GameContainer>
        <Header>
          <Title>Loading...</Title>
        </Header>
        <GameArea>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading game state...
          </div>
        </GameArea>
      </GameContainer>
    );
  }

  return (
    <GameContainer>
      <Header>
        <Title>Word Chain Reaction</Title>
        <InfoIcon onClick={() => setIsRulesModalOpen(true)}>ⓘ</InfoIcon>
      </Header>

      <GameArea>
        <ScoreDisplay>
          {Object.entries(gameState.scores).map(([id, score]) => {
            const player = roomState.players[id];
            if (!player) return null;
            return (
              <PlayerScore 
                key={id} 
                isCurrentPlayer={id === playerId}
              >
                {player.name}: {score}
              </PlayerScore>
            );
          })}
        </ScoreDisplay>

        {gameState.gameOver && (
          <GameOverMessage>
            <h3>Game Over!</h3>
            <div>
              {(() => {
                const scores = Object.entries(gameState.scores);
                const maxScore = Math.max(...scores.map(([_, score]) => score));
                const winners = scores.filter(([_, score]) => score === maxScore);
                
                if (winners.length === 1) {
                  const [winnerId] = winners[0];
                  const winner = roomState.players[winnerId];
                  if (!winner) return <div>Error: Winner not found</div>;
                  
                  return (
                    <>
                      <div>{winner.name} wins with {maxScore} points!</div>
                      <div className="scores">
                        {scores.map(([playerId, score]) => {
                          const player = roomState.players[playerId];
                          if (!player) return null;
                          return (
                            <div key={playerId} className="score-item">
                              <span>{player.name}</span>
                              <span>{score} points</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                } else {
                  const winnerNames = winners
                    .map(([id]) => roomState.players[id]?.name)
                    .filter(Boolean)
                    .join(' and ');
                  
                  if (!winnerNames) return <div>Error: No winners found</div>;
                  
                  return (
                    <>
                      <div>It's a tie! {winnerNames} both have {maxScore} points!</div>
                      <div className="scores">
                        {scores.map(([playerId, score]) => {
                          const player = roomState.players[playerId];
                          if (!player) return null;
                          return (
                            <div key={playerId} className="score-item">
                              <span>{player.name}</span>
                              <span>{score} points</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                }
              })()}
            </div>
          </GameOverMessage>
        )}

        <ChainDisplay>
          {gameState.chain.map((word, index) => (
            <Word key={index}>{word}</Word>
          ))}
        </ChainDisplay>

        <InputContainer>
          <InputRow>
            <Input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setInputError(null); // Clear error when user types
              }}
              placeholder={isCurrentPlayer ? "Enter a word..." : `${currentPlayerName}'s turn...`}
              disabled={!isCurrentPlayer || gameState.gameOver}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
            <SubmitButton
              onClick={handleSubmit}
              disabled={!isCurrentPlayer || gameState.gameOver || !input.trim()}
            >
              Submit
            </SubmitButton>
          </InputRow>
          {inputError && <ErrorMessage>{inputError}</ErrorMessage>}
        </InputContainer>

        {gameState.gameOver && (
          <ResetButton onClick={handleReset}>Leave Game</ResetButton>
        )}

        {scoreBreakdown && !gameState.gameOver && (
          <Toast>
            <div>Word Length: {scoreBreakdown.wordLength}</div>
            <div>Chain Length: {scoreBreakdown.chainLength}</div>
            {scoreBreakdown.circleBonus > 0 && (
              <div>Circle Bonus: {scoreBreakdown.circleBonus}</div>
            )}
            <div>Total: {scoreBreakdown.wordLength + scoreBreakdown.chainLength + scoreBreakdown.circleBonus}</div>
          </Toast>
        )}
      </GameArea>

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </GameContainer>
  );
};

export default Game; 