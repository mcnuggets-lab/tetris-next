// Game board dimensions
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const BOARD_CELL_EMPTY = { type: 'empty' } as const;

// Game scoring
export const SCORE_PER_LINE = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800
} as const;

// Game speed (in milliseconds)
export const INITIAL_DROP_SPEED = 500; // ms
// Speed increases by this amount for every 800 points
// (This is used in the speed calculation: Math.max(200, 500 - Math.floor(score / 800) * 20))
export const SPEED_INCREASE_THRESHOLD = 800;
export const SPEED_INCREASE_AMOUNT = 20;
export const MIN_DROP_SPEED = 200;

// Movement and rotation

export const MOVE_LEFT = -1;
export const MOVE_RIGHT = 1;
export const MOVE_DOWN = 1;
// Wall kick values for rotation
// [x, y] offsets to try when a rotation would cause a collision
export const WALL_KICKS = [
  { x: 1, y: 0 },   // Try right
  { x: -1, y: 0 },  // Try left
  { x: 2, y: 0 },   // Try right 2
  { x: -2, y: 0 },  // Try left 2
] as const;

// Action type constants
export const ACTION_TYPES = {
  MOVE_LEFT: 'MOVE_LEFT',
  MOVE_RIGHT: 'MOVE_RIGHT',
  MOVE_DOWN: 'MOVE_DOWN',
  HARD_DROP: 'HARD_DROP',
  ROTATE: 'ROTATE',
  PAUSE: 'PAUSE',
  START_GAME: 'START_GAME',
  RESET_GAME: 'RESET_GAME',
  TICK: 'TICK'
} as const;

// Direction constants
export const DIRECTION = {
  LEFT: ACTION_TYPES.MOVE_LEFT,
  RIGHT: ACTION_TYPES.MOVE_RIGHT,
  DOWN: ACTION_TYPES.MOVE_DOWN,
  ROTATE: ACTION_TYPES.ROTATE
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  HIGH_SCORE: 'tetrisHighScore'
} as const;
