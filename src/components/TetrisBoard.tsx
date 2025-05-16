"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";

// Types
type Cell = 'empty' | 'filled';
type Grid = Cell[][];

interface Position {
  x: number;
  y: number;
}

interface Tetromino {
  shape: number[][];
  color: string;
}

// Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Tetromino shapes and colors
const TETROMINOES: Record<string, Tetromino> = {
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

type TetrominoKey = keyof typeof TETROMINOES;

const TetrisBoard: React.FC = () => {
  // Game state
  const [grid, setGrid] = useState<Grid>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('empty'))
  );
  const [currentTetromino, setCurrentTetromino] = useState<Tetromino | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  
  // Memoize the grid to prevent unnecessary re-renders
  const memoizedGrid = useMemo(() => grid, [grid]);

  // Helper functions
  const getRandomTetromino = useCallback((): Tetromino => {
    const tetrominoNames = Object.keys(TETROMINOES) as TetrominoKey[];
    const randomName = tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
    return { ...TETROMINOES[randomName] };
  }, []);

  // Initialize the game
  const startGame = useCallback((): void => {
    setIsPaused(false); // Ensure game is not paused when starting
    setGameOver(false);
    setScore(0);
    setGrid(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('empty')));
    const newTetromino = getRandomTetromino();
    const startX = Math.floor((BOARD_WIDTH - newTetromino.shape[0].length) / 2);
    setCurrentTetromino(newTetromino);
    setCurrentPosition({ x: startX, y: -2 });
    setIsPaused(false);
  }, [getRandomTetromino]);

  // Lock the current tetromino in place
  const lockTetromino = useCallback((): void => {
    if (!currentTetromino || gameOver || isPaused || !gameStarted) return;

    // Create a new grid with the current piece locked in place
    const newGrid = grid.map(row => [...row]);
    let pieceLocked = false;
    let gameShouldEnd = false;

    currentTetromino.shape.forEach((row: number[], i: number) => {
      row.forEach((cell: number, j: number) => {
        if (cell === 1) {
          const x = currentPosition.x + j;
          const y = currentPosition.y + i;
          
          // Check if piece is going out of bounds (game over)
          if (y < 0) {
            gameShouldEnd = true;
            return;
          }
          
          // Lock the piece in the grid
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
            if (!newGrid[y]) newGrid[y] = Array(BOARD_WIDTH).fill('empty');
            newGrid[y] = [...newGrid[y]];
            newGrid[y][x] = 'filled';
            pieceLocked = true;
          }
        }
      });
    });

    if (gameShouldEnd) {
      setGameOver(true);
      return;
    }

    if (pieceLocked) {
      // Check for complete lines
      const completedLines: number[] = [];
      const updatedGrid = [...newGrid];
      
      for (let y = 0; y < updatedGrid.length; y++) {
        if (updatedGrid[y] && updatedGrid[y].every(cell => cell === 'filled')) {
          completedLines.push(y);
        }
      }
      
      // Update score based on number of completed lines
      if (completedLines.length > 0) {
        setScore(prev => prev + completedLines.length * 100);
        
        // Remove completed lines and add new empty ones at the top
        const newGridWithoutLines = updatedGrid.filter((_, index) => !completedLines.includes(index));
        const newLines = Array(completedLines.length).fill(null).map(() => Array(BOARD_WIDTH).fill('empty'));
        setGrid([...newLines, ...newGridWithoutLines]);
      } else {
        setGrid(updatedGrid);
      }
      
      // Spawn new tetromino
      const newTetromino = getRandomTetromino();
      const startX = Math.floor((BOARD_WIDTH - newTetromino.shape[0].length) / 2);
      
      // Check if game over (new piece would collide immediately)
      const wouldCollide = newTetromino.shape.some((row: number[], i: number) =>
        row.some((cell: number, j: number) => {
          if (cell === 0) return false;
          const x = startX + j;
          const y = i; // Start at y=0 for collision check
          return y >= 0 && updatedGrid[y] && updatedGrid[y][x] === 'filled';
        })
      );
      
      if (wouldCollide) {
        setGameOver(true);
        return;
      }
      
      setCurrentTetromino(newTetromino);
      setCurrentPosition({ x: startX, y: -2 });
    }
  }, [currentTetromino, currentPosition, grid, getRandomTetromino, gameOver, isPaused]);

  // Move tetromino function
  const moveTetromino = useCallback((dx: number, dy: number, isHardDrop: boolean = false): boolean => {
    if (!currentTetromino || gameOver || isPaused || !gameStarted) return false;

    const newX = currentPosition.x + dx;
    const newY = currentPosition.y + dy;

    // Check if new position is valid
    const isValid = currentTetromino.shape.every((row: number[], i: number) =>
      row.every((cell: number, j: number) => {
        if (cell === 0) return true;
        const x = newX + j;
        const y = newY + i;
        return y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH && (y < 0 || !grid[y] || grid[y][x] === 'empty');
      })
    );

    if (isValid) {
      setCurrentPosition({ x: newX, y: newY });
      return true;
    } else if (dy > 0) {
      // If we can't move down, lock the piece
      lockTetromino();
      return false;
    }
    return false;
  }, [currentTetromino, currentPosition, grid, gameOver, isPaused, lockTetromino]);

  // Rotate tetromino function
  const rotateTetromino = useCallback((): void => {
    if (!currentTetromino || gameOver || isPaused || !gameStarted) return;

    const { shape } = currentTetromino;
    const newShape = shape[0].map((_, colIndex) =>
      shape.map(row => row[colIndex]).reverse()
    );

    // Check if rotation is valid
    const isValid = newShape.every((row: number[], i: number) =>
      row.every((cell: number, j: number) => {
        if (cell === 0) return true;
        const x = currentPosition.x + j;
        const y = currentPosition.y + i;
        // Allow pieces to rotate above the grid
        return y < BOARD_HEIGHT && 
               x >= 0 && 
               x < BOARD_WIDTH && 
               (y < 0 || !grid[y] || grid[y][x] === 'empty');
      })
    );

    if (isValid) {
      // Adjust position if needed after rotation
      const shapeWidth = newShape[0].length;
      
      // Ensure piece stays within bounds
      let newX = currentPosition.x;
      let newY = currentPosition.y;
      
      // Adjust X position if piece would go out of bounds
      if (newX + shapeWidth > BOARD_WIDTH) {
        newX = BOARD_WIDTH - shapeWidth;
      } else if (newX < 0) {
        newX = 0;
      }
      
      // Adjust Y position if piece would go out of bounds
      if (newY < -2) {
        newY = -2;
      }
      
      setCurrentPosition({ x: newX, y: newY });
      setCurrentTetromino({ ...currentTetromino, shape: newShape });
    }
  }, [currentTetromino, currentPosition, grid, gameOver, isPaused]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused || !gameStarted) return;

    const moveDown = () => {
      if (!currentTetromino) return;
      moveTetromino(0, 1);
    };

    const interval = setInterval(moveDown, 500);
    return () => clearInterval(interval);
  }, [currentTetromino, gameOver, isPaused, moveTetromino]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Allow pausing/resuming even when game is over
    if (e.key.toLowerCase() === 'p') {
      if (gameStarted) {
        setIsPaused(prev => !prev);
      }
      return;
    }

    // Block other inputs if game is not active
    if (gameOver || isPaused || !gameStarted) return;

    switch (e.key) {
      case 'ArrowLeft':
        moveTetromino(-1, 0);
        break;
      case 'ArrowRight':
        moveTetromino(1, 0);
        break;
      case 'ArrowDown':
        moveTetromino(0, 1);
        break;
      case 'ArrowUp':
        rotateTetromino();
        break;
      // Removed hard drop functionality
      default:
        break;
    }
  }, [gameOver, isPaused, moveTetromino, rotateTetromino]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Start game when gameStarted changes to true
  useEffect(() => {
    if (gameStarted) {
      startGame();
    }
  }, [gameStarted, startGame]); // Added startGame to dependency array

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-3xl font-bold">Tetris</h1>
      <div className="text-xl">Score: {score}</div>
      
      <div 
        className="border-4 border-gray-700 bg-gray-900 relative"
        style={{
          width: `${BOARD_WIDTH * 30}px`,
          height: `${BOARD_HEIGHT * 30}px`,
          opacity: gameStarted ? 1 : 0.5,
          transition: 'opacity 0.3s',
        }}
      >
        {/* Render grid cells */}
        {memoizedGrid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={`absolute w-[30px] h-[30px] border border-gray-800 ${
                cell === 'filled' ? 'bg-gray-600' : 'bg-gray-800'
              }`}
              style={{
                left: `${x * 30}px`,
                top: `${y * 30}px`,
              }}
            />
          ))
        )}

        {/* Render current tetromino */}
        {currentTetromino &&
          currentTetromino.shape.map((row, i) =>
            row.map((cell, j) => {
              if (cell === 0) return null;
              const x = currentPosition.x + j;
              const y = currentPosition.y + i;
              
              // Don't render if outside the visible grid
              if (y < 0 || y >= BOARD_HEIGHT || x < 0 || x >= BOARD_WIDTH) {
                return null;
              }
              
              return (
                <div
                  key={`tetromino-${i}-${j}`}
                  className={`absolute w-[30px] h-[30px] border border-gray-800 ${currentTetromino.color}`}
                  style={{
                    left: `${x * 30}px`,
                    top: `${y * 30}px`,
                  }}
                />
              );
            })
          )}
      </div>
      

      
      {/* Game status */}
      {!gameStarted ? (
        <button
          onClick={() => setGameStarted(true)}
          className="px-6 py-3 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 transition-colors"
        >
          Start Game
        </button>
      ) : (
        <>
          {gameOver && (
            <div className="text-2xl font-bold text-red-500">Game Over!</div>
          )}
          {isPaused && !gameOver && (
            <div className="text-2xl font-bold text-yellow-500">Paused</div>
          )}
          <button
            onClick={() => {
              if (gameOver) {
                setGameStarted(false);
                setTimeout(() => setGameStarted(true), 100);
              } else {
                // Toggle pause/play
                setIsPaused(prev => !prev);
              }
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {gameOver ? 'Play Again' : (isPaused ? 'Resume' : 'Pause')}
          </button>
        </>
      )}
    </div>
  );
};

export default TetrisBoard;
