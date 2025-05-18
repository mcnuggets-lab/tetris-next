
// Tetromino cell states
export const CELL_STATE = {
  EMPTY: 0,
  FILLED: 1
} as const;

// Tetromino shape dimensions
export const TETROMINO_SIZES = {
  I: { width: 4, height: 4 },
  J: { width: 3, height: 3 },
  L: { width: 3, height: 3 },
  O: { width: 2, height: 2 },
  S: { width: 3, height: 3 },
  T: { width: 3, height: 3 },
  Z: { width: 3, height: 3 }
} as const;

// Tetromino shapes and colors
// Tetromino shapes defined with 0 (empty) and 1 (filled) for better readability
// These will be mapped to CELL_STATE in the getRandomTetromino function
export const TETROMINOES = {
  I: {
    type: 'I',
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 'bg-cyan-500'
  },
  J: {
    type: 'J',
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-blue-700'
  },
  L: {
    type: 'L',
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-orange-500'
  },
  O: {
    type: 'O',
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: 'bg-yellow-400'
  },
  S: {
    type: 'S',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: 'bg-green-500'
  },
  T: {
    type: 'T',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-purple-600'
  },
  Z: {
    type: 'Z',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-red-500'
  }
} as const;

// Tetromino starting positions
export const STARTING_POSITION = {
  x: 4,  // Starting x position (centered horizontally)
  y: 0,  // Starting y position (just above the visible board)
  getCenterX: (width: number) => Math.floor((10 - width) / 2) // Center tetromino on the board
} as const;
