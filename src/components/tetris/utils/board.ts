import { Grid, Position, Tetromino } from '../types';
import { 
  BOARD_WIDTH, 
  BOARD_HEIGHT, 
  BOARD_CELL_EMPTY 
} from '../constants/gameConstants';
import { CELL_STATE } from '../constants/tetrominoConstants';

export const createEmptyGrid = (): Grid => {
  return Array(BOARD_HEIGHT).fill(null).map(() => 
    Array(BOARD_WIDTH).fill(BOARD_CELL_EMPTY)
  );
};

export const checkCollision = (
  grid: Grid,
  tetromino: Tetromino,
  position: Position
): boolean => {
  return tetromino.shape.some((row, i) =>
    row.some((cell, j) => {
      if (cell === CELL_STATE.EMPTY) return false;
      const x = position.x + j;
      const y = position.y + i;
      return (
        x < 0 ||
        x >= BOARD_WIDTH ||
        y >= BOARD_HEIGHT ||
        (y >= 0 && grid[y] && grid[y][x]?.type === 'filled')
      );
    })
  );
};

export const mergeTetrominoWithGrid = (
  grid: Grid,
  tetromino: Tetromino,
  position: Position
): Grid => {
  const newGrid = grid.map(row => [...row]);
  
  tetromino.shape.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === CELL_STATE.EMPTY) return;
      const x = position.x + j;
      const y = position.y + i;
      
      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
        newGrid[y][x] = { type: 'filled', color: tetromino.color };
      }
    });
  });
  
  return newGrid;
};

export const clearCompletedLines = (grid: Grid): { newGrid: Grid; linesCleared: number } => {
  const completedLines: number[] = [];
  const updatedGrid = [...grid];
  
  for (let y = 0; y < updatedGrid.length; y++) {
    if (updatedGrid[y] && updatedGrid[y].every(cell => cell.type === 'filled')) {
      completedLines.push(y);
    }
  }
  
  if (completedLines.length > 0) {
    const newGridWithoutLines = updatedGrid.filter((_, index) => !completedLines.includes(index));
    const newLines = Array(completedLines.length).fill(null).map(() => 
      Array(BOARD_WIDTH).fill(BOARD_CELL_EMPTY)
    );
    return { newGrid: [...newLines, ...newGridWithoutLines], linesCleared: completedLines.length };
  }
  
  return { newGrid: updatedGrid, linesCleared: 0 };
};

import { SCORE_PER_LINE } from '../constants/gameConstants';

// Score calculation based on the number of lines cleared
export const calculateScore = (linesCleared: number): number => {
  // Create a mapping of line counts to score values
  const lineScores = {
    1: SCORE_PER_LINE.SINGLE,
    2: SCORE_PER_LINE.DOUBLE,
    3: SCORE_PER_LINE.TRIPLE,
    4: SCORE_PER_LINE.TETRIS,
  } as const;

  // Return the score for the number of lines cleared, or 0 if not found
  return lineScores[linesCleared as keyof typeof lineScores] || 0;
};
