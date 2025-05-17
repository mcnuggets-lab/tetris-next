import { Grid, Position, Tetromino, Cell } from '../types';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

export const createEmptyGrid = (): Grid => {
  return Array(BOARD_HEIGHT).fill(null).map(() => 
    Array(BOARD_WIDTH).fill({ type: 'empty' } as const)
  );
};

export const checkCollision = (
  grid: Grid,
  tetromino: Tetromino,
  position: Position
): boolean => {
  return tetromino.shape.some((row, i) =>
    row.some((cell, j) => {
      if (cell === 0) return false;
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
      if (cell === 0) return;
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
      Array(BOARD_WIDTH).fill({ type: 'empty' } as const)
    );
    return { newGrid: [...newLines, ...newGridWithoutLines], linesCleared: completedLines.length };
  }
  
  return { newGrid: updatedGrid, linesCleared: 0 };
};

export const calculateScore = (linesCleared: number): number => {
  switch (linesCleared) {
    case 1: return 100;
    case 2: return 300;
    case 3: return 500;
    case 4: return 800;
    default: return 0;
  }
};
