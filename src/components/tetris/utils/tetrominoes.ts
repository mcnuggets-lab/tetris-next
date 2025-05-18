import type { Tetromino, TetrominoKey } from '../types';
import { TETROMINOES, CELL_STATE } from '../constants/tetrominoConstants';

// Helper function to map 0/1 to CELL_STATE
export const mapToCellState = (value: 0 | 1) => 
  value === 1 ? CELL_STATE.FILLED : CELL_STATE.EMPTY;

export const getRandomTetromino = (): Tetromino => {
  const tetrominoNames = Object.keys(TETROMINOES) as TetrominoKey[];
  const randomName = tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
  const tetromino = TETROMINOES[randomName];
  
  // Map the shape from 0/1 to CELL_STATE
  const mappedShape = tetromino.shape.map(row => 
    row.map(cell => mapToCellState(cell as 0 | 1))
  );
  
  return {
    ...tetromino,
    shape: mappedShape
  };
};

export const rotateMatrix = (matrix: number[][]): number[][] => {
  return matrix[0].map((_, i) => 
    matrix.map(row => row[i]).reverse()
  );
};
