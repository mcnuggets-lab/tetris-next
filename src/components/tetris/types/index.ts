// Basic types
export type Cell = { type: 'empty' } | { type: 'filled'; color: string };
export type Grid = Cell[][];

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
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

// Game actions
export type GameAction =
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'MOVE_DOWN' }
  | { type: 'HARD_DROP' }
  | { type: 'ROTATE' }
  | { type: 'PAUSE' }
  | { type: 'START_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'TICK' };

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
