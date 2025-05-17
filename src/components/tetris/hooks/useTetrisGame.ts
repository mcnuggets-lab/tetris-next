import { useState, useCallback, useEffect, useReducer, useContext } from 'react';
import { GameState, GameAction, Position } from '../types';
import { getRandomTetromino, rotateMatrix } from '../utils/tetrominoes';
import { 
  createEmptyGrid, 
  checkCollision, 
  mergeTetrominoWithGrid, 
  clearCompletedLines, 
  calculateScore
} from '../utils/board';
import { useTetris } from '../../TetrisContext';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const initialState: GameState = {
  grid: createEmptyGrid(),
  currentTetromino: null,
  nextTetromino: null,
  currentPosition: { x: 0, y: 0 },
  gameStarted: false,
  gameOver: false,
  isPaused: false,
  score: 0,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      const firstTetromino = getRandomTetromino();
      const nextTetromino = getRandomTetromino();
      const startX = Math.floor((BOARD_WIDTH - firstTetromino.shape[0].length) / 2);
      
      return {
        ...initialState,
        gameStarted: true,
        currentTetromino: firstTetromino,
        nextTetromino,
        currentPosition: { x: startX, y: 0 },
      };
      
    case 'RESET_GAME':
      return { ...initialState };
      
    case 'PAUSE':
      return { ...state, isPaused: !state.isPaused };
      
    case 'TICK':
      if (state.gameOver || state.isPaused || !state.gameStarted || !state.currentTetromino) {
        return state;
      }
      
      // Try to move down
      const newPosition = { ...state.currentPosition, y: state.currentPosition.y + 1 };
      
      if (!checkCollision(state.grid, state.currentTetromino, newPosition)) {
        // Can move down
        return { ...state, currentPosition: newPosition };
      } else {
        // Can't move down, lock the piece
        const newGrid = mergeTetrominoWithGrid(state.grid, state.currentTetromino, state.currentPosition);
        const { newGrid: clearedGrid, linesCleared } = clearCompletedLines(newGrid);
        const scoreIncrement = calculateScore(linesCleared);
        
        // Check if game over (new piece would collide immediately)
        const nextTetromino = state.nextTetromino || getRandomTetromino();
        const newNextTetromino = getRandomTetromino();
        const startX = Math.floor((BOARD_WIDTH - nextTetromino.shape[0].length) / 2);
        
        const wouldCollide = checkCollision(
          clearedGrid,
          nextTetromino,
          { x: startX, y: 0 }
        );
        
        if (wouldCollide) {
          // Game over
          const highScore = Math.max(
            state.score + scoreIncrement,
            parseInt(localStorage.getItem('tetrisHighScore') || '0', 10)
          );
          localStorage.setItem('tetrisHighScore', highScore.toString());
          
          return { ...state, gameOver: true };
        }
        
        // Continue with next piece
        return {
          ...state,
          grid: clearedGrid,
          currentTetromino: nextTetromino,
          nextTetromino: newNextTetromino,
          currentPosition: { x: startX, y: 0 },
          score: state.score + scoreIncrement,
        };
      }
      
    case 'MOVE_LEFT':
    case 'MOVE_RIGHT':
      if (state.gameOver || state.isPaused || !state.gameStarted || !state.currentTetromino) {
        return state;
      }
      
      const dx = action.type === 'MOVE_LEFT' ? -1 : 1;
      const newX = state.currentPosition.x + dx;
      
      if (!checkCollision(state.grid, state.currentTetromino, { 
        ...state.currentPosition, 
        x: newX 
      })) {
        return { ...state, currentPosition: { ...state.currentPosition, x: newX } };
      }
      return state;
      
    case 'MOVE_DOWN':
      if (state.gameOver || state.isPaused || !state.gameStarted || !state.currentTetromino) {
        return state;
      }
      
      const newY = state.currentPosition.y + 1;
      
      if (!checkCollision(state.grid, state.currentTetromino, { 
        ...state.currentPosition, 
        y: newY 
      })) {
        return { ...state, currentPosition: { ...state.currentPosition, y: newY } };
      }
      
      // If we can't move down, lock the piece (similar to TICK action)
      const lockedGrid = mergeTetrominoWithGrid(state.grid, state.currentTetromino, state.currentPosition);
      const { newGrid: clearedGridAfterDrop, linesCleared: linesClearedAfterDrop } = clearCompletedLines(lockedGrid);
      const dropScoreIncrement = calculateScore(linesClearedAfterDrop);
      
      const nextTetrominoAfterDrop = state.nextTetromino || getRandomTetromino();
      const newNextTetrominoAfterDrop = getRandomTetromino();
      const startXAfterDrop = Math.floor((BOARD_WIDTH - nextTetrominoAfterDrop.shape[0].length) / 2);
      
      const wouldCollideAfterDrop = checkCollision(
        clearedGridAfterDrop,
        nextTetrominoAfterDrop,
        { x: startXAfterDrop, y: 0 }
      );
      
      if (wouldCollideAfterDrop) {
        // Game over
        const highScore = Math.max(
          state.score + dropScoreIncrement,
          parseInt(localStorage.getItem('tetrisHighScore') || '0', 10)
        );
        localStorage.setItem('tetrisHighScore', highScore.toString());
        
        return { 
          ...state, 
          grid: clearedGridAfterDrop,
          gameOver: true,
          score: state.score + dropScoreIncrement,
        };
      }
      
      return {
        ...state,
        grid: clearedGridAfterDrop,
        currentTetromino: nextTetrominoAfterDrop,
        nextTetromino: newNextTetrominoAfterDrop,
        currentPosition: { x: startXAfterDrop, y: 0 },
        score: state.score + dropScoreIncrement,
      };
      
    case 'HARD_DROP':
      if (state.gameOver || state.isPaused || !state.gameStarted || !state.currentTetromino) {
        return state;
      }
      
      // Find the lowest possible Y position
      let dropY = state.currentPosition.y;
      findLowestPosition: for (let yTest = state.currentPosition.y; yTest <= BOARD_HEIGHT; yTest++) {
        if (checkCollision(state.grid, state.currentTetromino, { 
          ...state.currentPosition, 
          y: yTest 
        })) {
          dropY = yTest - 1;
          break findLowestPosition;
        }
      }
      
      // Lock the piece at the final position
      const hardDropPosition = { ...state.currentPosition, y: dropY };
      const hardDropGrid = mergeTetrominoWithGrid(state.grid, state.currentTetromino, hardDropPosition);
      const { newGrid: clearedHardDropGrid, linesCleared: hardDropLinesCleared } = clearCompletedLines(hardDropGrid);
      const hardDropScoreIncrement = calculateScore(hardDropLinesCleared);
      
      // Spawn new tetromino
      const nextHardDropTetromino = state.nextTetromino || getRandomTetromino();
      const newNextHardDropTetromino = getRandomTetromino();
      const hardDropStartX = Math.floor((BOARD_WIDTH - nextHardDropTetromino.shape[0].length) / 2);
      
      // Check if game over (new piece would collide immediately)
      const wouldHardDropCollide = checkCollision(
        clearedHardDropGrid,
        nextHardDropTetromino,
        { x: hardDropStartX, y: 0 }
      );
      
      if (wouldHardDropCollide) {
        // Game over
        const highScore = Math.max(
          state.score + hardDropScoreIncrement,
          parseInt(localStorage.getItem('tetrisHighScore') || '0', 10)
        );
        localStorage.setItem('tetrisHighScore', highScore.toString());
        
        return { 
          ...state, 
          grid: clearedHardDropGrid,
          gameOver: true,
          score: state.score + hardDropScoreIncrement,
        };
      }
      
      return {
        ...state,
        grid: clearedHardDropGrid,
        currentTetromino: nextHardDropTetromino,
        nextTetromino: newNextHardDropTetromino,
        currentPosition: { x: hardDropStartX, y: 0 },
        score: state.score + hardDropScoreIncrement,
      };
      
    case 'ROTATE':
      if (state.gameOver || state.isPaused || !state.gameStarted || !state.currentTetromino) {
        return state;
      }
      
      const rotatedShape = rotateMatrix(state.currentTetromino.shape);
      const rotatedTetromino = { ...state.currentTetromino, shape: rotatedShape };
      
      // Check if rotation is valid
      if (!checkCollision(state.grid, rotatedTetromino, state.currentPosition)) {
        return { ...state, currentTetromino: rotatedTetromino };
      }
      
      // Try wall kicks (simple version - just try moving left/right one space)
      const kicks = [
        { x: 1, y: 0 },  // Try right
        { x: -1, y: 0 }, // Try left
        { x: 2, y: 0 },  // Try right 2
        { x: -2, y: 0 }, // Try left 2
      ];
      
      for (const kick of kicks) {
        const kickedPosition = {
          x: state.currentPosition.x + kick.x,
          y: state.currentPosition.y + kick.y,
        };
        
        if (!checkCollision(state.grid, rotatedTetromino, kickedPosition)) {
          return { 
            ...state, 
            currentTetromino: rotatedTetromino, 
            currentPosition: kickedPosition 
          };
        }
      }
      
      return state;
      
    default:
      return state;
  }
};

export const useTetrisGame = () => {
  const { score, setScore, gameOver: contextGameOver, setGameOver, isPaused: contextIsPaused, setIsPaused } = useTetris();
  
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    score,
    gameOver: contextGameOver,
    isPaused: contextIsPaused
  });
  
  const [dropTime, setDropTime] = useState<number | null>(null);
  
  // Sync local state with context
  useEffect(() => {
    if (state.gameOver !== contextGameOver) {
      setGameOver(state.gameOver);
    }
    if (state.isPaused !== contextIsPaused) {
      setIsPaused(state.isPaused);
    }
    if (state.score !== score) {
      setScore(state.score);
    }
  }, [state, contextGameOver, contextIsPaused, score, setGameOver, setIsPaused, setScore]);
  
  // Game loop
  useEffect(() => {
    // Clear any existing interval when game over, paused, or not started
    const shouldPause = contextGameOver || contextIsPaused || !state.gameStarted;
    
    if (shouldPause) {
      if (dropTime !== null) {
        window.clearInterval(dropTime);
        setDropTime(null);
      }
      return;
    }

    // Calculate speed based on score
    const speed = Math.max(200, 500 - Math.floor(state.score / 800) * 20);
    
    // Set up the drop interval
    const id = window.setInterval(() => {
      dispatch({ type: 'TICK' });
    }, speed);
    
    setDropTime(id);
    
    // Cleanup function
    return () => {
      window.clearInterval(id);
    };
  }, [contextGameOver, contextIsPaused, state.gameStarted, state.score]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (state.gameOver || !state.gameStarted) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          dispatch({ type: 'MOVE_LEFT' });
          break;
        case 'ArrowRight':
          e.preventDefault();
          dispatch({ type: 'MOVE_RIGHT' });
          break;
        case 'ArrowDown':
          e.preventDefault();
          dispatch({ type: 'MOVE_DOWN' });
          break;
        case 'ArrowUp':
          e.preventDefault();
          dispatch({ type: 'HARD_DROP' });
          break;
        case ' ':
          e.preventDefault();
          dispatch({ type: 'ROTATE' });
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          dispatch({ type: 'PAUSE' });
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.gameOver, state.gameStarted]);
  
  // Public API
  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);
  
  // Reset game
  const resetGame = useCallback(() => {
    // Clear any existing interval before resetting
    if (dropTime !== null) {
      window.clearInterval(dropTime);
      setDropTime(null);
    }
    dispatch({ type: 'RESET_GAME' });
  }, [dropTime]);
  
  const moveLeft = useCallback(() => {
    dispatch({ type: 'MOVE_LEFT' });
  }, []);
  
  const moveRight = useCallback(() => {
    dispatch({ type: 'MOVE_RIGHT' });
  }, []);
  
  const moveDown = useCallback(() => {
    dispatch({ type: 'MOVE_DOWN' });
  }, []);
  
  const hardDrop = useCallback(() => {
    dispatch({ type: 'HARD_DROP' });
  }, []);
  
  const rotate = useCallback(() => {
    dispatch({ type: 'ROTATE' });
  }, []);
  
  const togglePause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, []);
  
  return {
    // State
    grid: state.grid,
    currentTetromino: state.currentTetromino,
    nextTetromino: state.nextTetromino,
    currentPosition: state.currentPosition,
    gameStarted: state.gameStarted,
    gameOver: state.gameOver,
    isPaused: state.isPaused,
    score: state.score,
    
    // Actions
    startGame,
    resetGame,
    moveLeft,
    moveRight,
    moveDown,
    hardDrop,
    rotate,
    togglePause,
  };
};
