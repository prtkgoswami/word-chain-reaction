export interface GameState {
  chain: string[];
  usedWords: Set<string>;
  currentPlayer: 1 | 2;
  scores: {
    1: number;
    2: number;
  };
  gameOver: boolean;
}

export interface GameProps {
  onReset?: () => void;
} 