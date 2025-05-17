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
  const [nextTetromino, setNextTetromino] = useState<Tetromino | null>(null);
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
    setIsPaused(false);
    setGameOver(false);
    setScore(0);
    setGrid(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('empty')));
    const firstTetromino = getRandomTetromino();
    const nextTetromino = getRandomTetromino();
    const startX = Math.floor((BOARD_WIDTH - firstTetromino.shape[0].length) / 2);
    setCurrentTetromino(firstTetromino);
    setNextTetromino(nextTetromino);
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
      const newTetromino = nextTetromino || getRandomTetromino();
      const newNextTetromino = getRandomTetromino();
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
      setNextTetromino(newNextTetromino);
      setCurrentPosition({ x: startX, y: -2 });
    }
  }, [currentTetromino, currentPosition, gameOver, gameStarted, getRandomTetromino, grid, isPaused, nextTetromino]);

  // Move the current tetromino
  const moveTetromino = useCallback((dx: number, dy: number): boolean => {
    if (!currentTetromino || gameOver || isPaused || !gameStarted) return false;

    const newX = currentPosition.x + dx;
    const newY = currentPosition.y + dy;

    // Check for collisions
    const collides = currentTetromino.shape.some((row: number[], i: number) =>
      row.some((cell: number, j: number) => {
        if (cell === 0) return false;
        const x = newX + j;
        const y = newY + i;
        return (
          x < 0 ||
          x >= BOARD_WIDTH ||
          y >= BOARD_HEIGHT ||
          (y >= 0 && grid[y] && grid[y][x] === 'filled')
        );
      })
    );

    if (!collides) {
      setCurrentPosition({ x: newX, y: newY });
      return true;
    } else if (dy > 0) {
      // If we can't move down, lock the piece
      lockTetromino();
    }
    return false;
  }, [currentPosition, currentTetromino, gameOver, gameStarted, grid, isPaused, lockTetromino]);

  // Rotate the current tetromino
  const rotateTetromino = useCallback((): void => {
    if (!currentTetromino || gameOver || isPaused || !gameStarted) return;

    // Create a new rotated shape
    const rotatedShape = currentTetromino.shape[0].map((_, i) =>
      currentTetromino.shape.map(row => row[i]).reverse()
    );

    // Check if rotation is valid
    const canRotate = !rotatedShape.some((row: number[], i: number) =>
      row.some((cell: number, j: number) => {
        if (cell === 0) return false;
        const x = currentPosition.x + j;
        const y = currentPosition.y + i;
        return (
          x < 0 ||
          x >= BOARD_WIDTH ||
          y >= BOARD_HEIGHT ||
          (y >= 0 && grid[y] && grid[y][x] === 'filled')
        );
      })
    );

    if (canRotate) {
      setCurrentTetromino({
        ...currentTetromino,
        shape: rotatedShape
      });
    }
  }, [currentPosition, currentTetromino, gameOver, gameStarted, grid, isPaused]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (gameOver || !gameStarted) return;

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
        case ' ':
          rotateTetromino();
          break;
        case 'p':
        case 'P':
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, gameStarted, moveTetromino, rotateTetromino]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused || !gameStarted) return;

    const moveDown = (): void => {
      if (!moveTetromino(0, 1)) {
        lockTetromino();
      }
    };

    const interval = setInterval(moveDown, 500);
    return () => clearInterval(interval);
  }, [currentTetromino, gameOver, isPaused, moveTetromino, lockTetromino, gameStarted]);

  // Start the game when gameStarted changes to true
  useEffect(() => {
    if (gameStarted) {
      startGame();
    }
  }, [gameStarted, startGame]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-start gap-8 h-[600px]">
        {/* Game Board */}
        <div>
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
        </div>
        
        {/* Side Panel */}
        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col gap-8 items-center">
            <div className="text-2xl font-bold">Score: {score}</div>
            <div className="flex flex-col items-center">
              <div className="text-xl font-semibold mb-2">Next Piece</div>
              <div className="border-4 border-gray-600 bg-gray-800 rounded-lg p-4 w-32 h-32 flex items-center justify-center">
                {nextTetromino && (
                  <div className="relative" style={{ width: `${nextTetromino.shape[0].length * 24}px`, height: `${nextTetromino.shape.length * 24}px` }}>
                    {nextTetromino.shape.map((row, i) =>
                      row.map((cell, j) => {
                        if (cell === 0) return null;
                        return (
                          <div
                            key={`next-${i}-${j}`}
                            className={`absolute w-6 h-6 ${nextTetromino.color} border border-gray-700`}
                            style={{
                              left: `${j * 24}px`,
                              top: `${i * 24}px`,
                            }}
                          />
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Game Controls */}
          <div className="flex flex-col items-center gap-4 w-full">
            {!gameStarted ? (
              <button
                onClick={() => setGameStarted(true)}
                className="px-6 py-3 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 transition-colors w-full"
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
                      setIsPaused(prev => !prev);
                    }
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full"
                >
                  {gameOver ? 'Play Again' : (isPaused ? 'Resume' : 'Pause')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisBoard;
