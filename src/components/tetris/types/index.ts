// Basic types
export type Cell = { type: 'empty' } | { type: 'filled'; color: string };
export type Grid = Cell[][];

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoKey;
  shape: number[][];
  color: string;
}

export type TetrominoKey = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

// Game state
export interface GameState {
  grid: Grid;
  currentTetromino: Tetromino | null;
  nextTetromino: Tetromino | null;
  currentPosition: Position;
  gameStarted: boolean;
  gameOver: boolean;
  isPaused: boolean;
  score: number;
}

import { ACTION_TYPES } from '../constants/gameConstants';

// Game actions
type ActionType = typeof ACTION_TYPES;
type ActionTypeValue = ActionType[keyof ActionType];

export type GameAction = {
  type: ActionTypeValue;
  payload?: any; // Optional payload for actions that need to pass data
};

// Props for components
export interface BoardProps {
  grid: Grid;
  currentTetromino: Tetromino | null;
  currentPosition: Position;
  gameOver: boolean;
  isPaused: boolean;
  gameStarted: boolean;
}

export interface NextPieceProps {
  tetromino: Tetromino | null;
}

export interface GameControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onPause: () => void;
  onStart: () => void;
  onReset: () => void;
  gameOver: boolean;
  isPaused: boolean;
  gameStarted: boolean;
}
