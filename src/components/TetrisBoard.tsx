"use client";

import React, { useCallback, useEffect, useState, useMemo, useContext } from "react";
import { useTetris } from "./TetrisContext";

// Types
type Cell = { type: 'empty' } | { type: 'filled'; color: string };
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
    Array(BOARD_HEIGHT).fill(null).map(() => 
      Array(BOARD_WIDTH).fill({ type: 'empty' } as const)
    )
  );
  const [currentTetromino, setCurrentTetromino] = useState<Tetromino | null>(null);
  const [nextTetromino, setNextTetromino] = useState<Tetromino | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 0, y: 0 });
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  
  // Get game state from context
  const { 
    score, 
    setScore, 
    gameOver, 
    setGameOver, 
    isPaused, 
    setIsPaused 
  } = useTetris();
  
  // Memoize the grid to prevent unnecessary re-renders
  const memoizedGrid = useMemo(() => grid, [grid]);

  // Helper functions
  const getRandomTetromino = useCallback((): Tetromino => {
    const tetrominoNames = Object.keys(TETROMINOES) as TetrominoKey[];
    const randomName = tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
    return { ...TETROMINOES[randomName] };
  }, []);

  const createEmptyGrid = useCallback(() => {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill({ type: 'empty' } as const));
  }, []);

  const handlePause = useCallback(() => {
    if (gameOver) return;
    setIsPaused(prevIsPaused => !prevIsPaused);
  }, [gameOver, setIsPaused]);

  const spawnTetromino = useCallback(() => {
    const firstTetromino = getRandomTetromino();
    const nextTetromino = getRandomTetromino();
    const startX = Math.floor((BOARD_WIDTH - firstTetromino.shape[0].length) / 2);
    setCurrentTetromino(firstTetromino);
    setNextTetromino(nextTetromino);
    setCurrentPosition({ x: startX, y: 0 });
  }, [getRandomTetromino, setIsPaused, setGameOver, setScore]);

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
            if (!newGrid[y]) newGrid[y] = Array(BOARD_WIDTH).fill({ type: 'empty' } as const);
            newGrid[y] = [...newGrid[y]];
            newGrid[y][x] = { type: 'filled', color: currentTetromino.color };
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
        if (updatedGrid[y] && updatedGrid[y].every(cell => cell.type === 'filled')) {
          completedLines.push(y);
        }
      }
      
      // Update score based on number of completed lines (Tetris scoring system)
      if (completedLines.length > 0) {
        let points = 0;
        switch (completedLines.length) {
          case 1:
            points = 100;  // 1 line = 100 points
            break;
          case 2:
            points = 300;  // 2 lines = 300 points (150 per line)
            break;
          case 3:
            points = 500;  // 3 lines = 500 points (~166 per line)
            break;
          case 4:
            points = 800;  // 4 lines = 800 points (200 per line - Tetris!)
            break;
          default:
            points = completedLines.length * 100;  // Fallback for any unexpected cases
        }
        if (setScore && typeof score === 'number') {
          setScore(score + points);
        }
        
        // Remove completed lines and add new empty ones at the top
        const newGridWithoutLines = updatedGrid.filter((_, index) => !completedLines.includes(index));
        const newLines = Array(completedLines.length).fill(null).map(() => Array(BOARD_WIDTH).fill({ type: 'empty' } as const));
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
          return y >= 0 && updatedGrid[y] && updatedGrid[y][x].type === 'filled';
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
          (y >= 0 && grid[y] && grid[y][x].type === 'filled')
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
          (y >= 0 && grid[y] && grid[y][x].type === 'filled')
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
          if (setIsPaused) {
            setIsPaused(!isPaused);
          }
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

  // Initialize the game
  useEffect(() => {
    if (gameStarted) {
      setGameOver(false);
      setScore(0);
      setGrid(createEmptyGrid());
      setIsPaused(false);
      
      const firstTetromino = getRandomTetromino();
      const nextTetromino = getRandomTetromino();
      const startX = Math.floor((BOARD_WIDTH - firstTetromino.shape[0].length) / 2);
      setCurrentTetromino(firstTetromino);
      setNextTetromino(nextTetromino);
      setCurrentPosition({ x: startX, y: 0 });
    }
  }, [gameStarted, setGameOver, setScore, setIsPaused, createEmptyGrid, getRandomTetromino]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-start gap-8 h-[600px]">
        {/* Game Board */}
        <div>
          <div 
            className="relative bg-gray-900"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(75, 85, 99, 0.5) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(75, 85, 99, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px',
              width: `${BOARD_WIDTH * 30}px`,
              height: `${BOARD_HEIGHT * 30}px`,
              opacity: gameStarted ? 1 : 0.5,
              transition: 'opacity 0.3s',
              border: '2px solid #4B5563',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              backgroundPosition: '-0.5px -0.5px'  // Adjust grid alignment
            }}
          >
            {/* Render placed pieces */}
            {memoizedGrid.map((row, y) =>
              row.map((cell, x) => {
                if (cell.type === 'empty') return null;
                return (
                  <div
                    key={`${y}-${x}`}
                    className="absolute bg-gray-500 border border-opacity-20 border-white"
                    style={{
                      width: '30px',
                      height: '30px',
                      left: `${x * 30}px`,
                      top: `${y * 30}px`,
                      boxSizing: 'border-box',
                      pointerEvents: 'none',
                      transform: 'translateZ(0)'
                    }}
                  />
                );
              })
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
                      className={`absolute ${currentTetromino.color} border border-opacity-20 border-white`}
                      style={{
                        width: '30px',
                        height: '30px',
                        left: `${x * 30}px`,
                        top: `${y * 30}px`,
                        boxSizing: 'border-box',
                        pointerEvents: 'none',
                        transform: 'translateZ(0)'
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
            <div className="text-center w-full bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-2 text-white">How to Play</h3>
              <div className="text-base space-y-1 text-gray-200">
                <p>← → : Move Left/Right</p>
                <p>↑ : Rotate</p>
                <p>↓ : Soft Drop</p>
                <p>Space : Hard Drop</p>
                <p>P : Pause</p>
              </div>
            </div>
            {!gameStarted && (
              <button
                onClick={() => setGameStarted(true)}
                className="px-6 py-3 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 transition-colors w-full"
              >
                Start Game
              </button>
            )}
            {gameStarted && (
              <button
                onClick={() => {
                  if (gameOver) {
                    setGameOver(false);
                    setScore(0);
                    setGrid(createEmptyGrid());
                    setGameStarted(false);
                    setIsPaused(false);
                  } else {
                    handlePause();
                  }
                }}
                className={`px-6 py-3 text-white text-xl font-bold rounded-lg transition-colors w-full ${
                  gameOver ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {gameOver ? 'New Game' : isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisBoard;
