import { Tetromino, TetrominoKey } from '../types';

// Tetromino shapes and colors
export const TETROMINOES: Record<TetrominoKey, Tetromino> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 'bg-cyan-500'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-blue-700'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-orange-500'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: 'bg-yellow-400'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: 'bg-green-500'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-purple-600'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-red-500'
  }
};

export const getRandomTetromino = (): Tetromino => {
  const tetrominoNames = Object.keys(TETROMINOES) as TetrominoKey[];
  const randomName = tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
  return { ...TETROMINOES[randomName] };
};

export const rotateMatrix = (matrix: number[][]): number[][] => {
  return matrix[0].map((_, i) => 
    matrix.map(row => row[i]).reverse()
  );
};
