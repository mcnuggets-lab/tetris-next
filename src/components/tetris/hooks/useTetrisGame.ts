import { useEffect, useReducer, useCallback, useRef } from 'react';
import { GameState, GameAction } from '../types';
import { getRandomTetromino, rotateMatrix } from '../utils/tetrominoes';
import { CELL_STATE, TETROMINO_SIZES, STARTING_POSITION } from '../constants/tetrominoConstants';
import { 
  createEmptyGrid, 
  checkCollision, 
  mergeTetrominoWithGrid, 
  clearCompletedLines, 
  calculateScore
} from '../utils/board';
import { useTetris } from '../../TetrisContext';
import { 
  BOARD_WIDTH, 
  BOARD_HEIGHT, 
  STORAGE_KEYS,
  INITIAL_DROP_SPEED,
  SPEED_INCREASE_THRESHOLD,
  SPEED_INCREASE_AMOUNT,
  MIN_DROP_SPEED,
  WALL_KICKS,
  MOVE_LEFT,
  MOVE_RIGHT,
  MOVE_DOWN,
  DIRECTION,
  ACTION_TYPES
} from '../constants/gameConstants';
import { TETROMINOES } from '../constants/tetrominoConstants';

const initialState: GameState = {
  grid: createEmptyGrid(),
  currentTetromino: null,
  nextTetromino: null,
  currentPosition: { x: 0, y: 0 },
  gameOver: false,
  gameStarted: false,
  isPaused: false,
  score: 0,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  const { type } = action;
  
  switch (type) {
    case ACTION_TYPES.START_GAME: {
      const firstTetromino = getRandomTetromino();
      const startX = STARTING_POSITION.getCenterX(firstTetromino.shape[0].length);
      
      return {
        ...initialState,
        gameStarted: true,
        currentTetromino: firstTetromino,
        nextTetromino: getRandomTetromino(),
        currentPosition: { x: startX, y: STARTING_POSITION.y },
      };
    }
      
    case ACTION_TYPES.RESET_GAME:
      return { ...initialState };
      
    case ACTION_TYPES.PAUSE:
      return { ...state, isPaused: !state.isPaused };
      
    case ACTION_TYPES.TICK:
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
        
        // Get the next tetromino and prepare the one after that
        const nextTetromino = state.nextTetromino || getRandomTetromino();
        const newNextTetromino = getRandomTetromino();
        const tetrominoType = nextTetromino.type as keyof typeof TETROMINO_SIZES;
        const startX = STARTING_POSITION.getCenterX(TETROMINO_SIZES[tetrominoType].width);
        
        // Check if game over (new piece would collide immediately)
        const wouldCollide = checkCollision(
          clearedGrid,
          nextTetromino,
          { x: startX, y: 0 }
        );
        
        if (wouldCollide) {
          // Game over
          const highScore = Math.max(
            state.score + scoreIncrement,
            parseInt(localStorage.getItem(STORAGE_KEYS.HIGH_SCORE) || '0', 10)
          );
          localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, highScore.toString());
          
          return { ...state, gameOver: true };
        }
        
        // Continue with next piece
        return {
          ...state,
          grid: clearedGrid,
          currentTetromino: nextTetromino,
          nextTetromino: newNextTetromino,
          currentPosition: { x: startX, y: STARTING_POSITION.y },
          score: state.score + scoreIncrement,
        };
      }
      
    case ACTION_TYPES.MOVE_LEFT:
    case ACTION_TYPES.MOVE_RIGHT:
      if (state.gameOver || state.isPaused || !state.gameStarted || !state.currentTetromino) {
        return state;
      }
      
      const dx = action.type === ACTION_TYPES.MOVE_LEFT ? MOVE_LEFT : MOVE_RIGHT;
      const newX = state.currentPosition.x + dx;
      
      if (!checkCollision(state.grid, state.currentTetromino, { 
        ...state.currentPosition, 
        x: newX 
      })) {
        return { ...state, currentPosition: { ...state.currentPosition, x: newX } };
      }
      return state;
      
    case ACTION_TYPES.MOVE_DOWN:
      if (state.gameOver || state.isPaused || !state.gameStarted || !state.currentTetromino) {
        return state;
      }
      
      const newY = state.currentPosition.y + MOVE_DOWN;
      
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
      const startXAfterDrop = STARTING_POSITION.getCenterX(nextTetrominoAfterDrop.shape[0].length);
      
      const wouldCollideAfterDrop = checkCollision(
        clearedGridAfterDrop,
        nextTetrominoAfterDrop,
        { x: startXAfterDrop, y: STARTING_POSITION.y }
      );
      
      if (wouldCollideAfterDrop) {
        // Game over
        const highScore = Math.max(
          state.score + dropScoreIncrement,
          parseInt(localStorage.getItem(STORAGE_KEYS.HIGH_SCORE) || '0', 10)
        );
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, highScore.toString());
        
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
        currentPosition: { x: startXAfterDrop, y: STARTING_POSITION.y },
        score: state.score + dropScoreIncrement,
      };
      
    case ACTION_TYPES.HARD_DROP:
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
      const nextTetromino = state.nextTetromino || getRandomTetromino();
      const newNextTetromino = getRandomTetromino();
      const startX = STARTING_POSITION.getCenterX(nextTetromino.shape[0].length);
      
      // Check if game over (new piece would collide immediately)
      const wouldCollide = checkCollision(
        clearedHardDropGrid,
        nextTetromino,
        { x: startX, y: STARTING_POSITION.y }
      );
      
      if (wouldCollide) {
        // Game over
        const highScore = Math.max(
          state.score + hardDropScoreIncrement,
          parseInt(localStorage.getItem(STORAGE_KEYS.HIGH_SCORE) || '0', 10)
        );
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, highScore.toString());
        
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
        currentTetromino: nextTetromino,
        nextTetromino: newNextTetromino,
        currentPosition: { x: startX, y: STARTING_POSITION.y },
        score: state.score + hardDropScoreIncrement,
      };
      
    case ACTION_TYPES.ROTATE:
      if (state.gameOver || state.isPaused || !state.gameStarted || !state.currentTetromino) {
        return state;
      }
      
      const rotatedShape = rotateMatrix(state.currentTetromino.shape);
      const rotatedTetromino = { ...state.currentTetromino, shape: rotatedShape };
      
      // Check if rotation is valid
      if (!checkCollision(state.grid, rotatedTetromino, state.currentPosition)) {
        return { ...state, currentTetromino: rotatedTetromino };
      }
      
      // Try wall kicks (offsets to try when rotation causes collision)
      for (const kick of WALL_KICKS) {
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
  
  const dropTimeRef = useRef<number | null>(null);
  
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
  
  // Public API
  const startGame = useCallback(() => {
    dispatch({ type: ACTION_TYPES.START_GAME });
  }, []);
  
  // Reset game
  const resetGame = useCallback(() => {
    // Clear any existing interval before resetting
    if (dropTimeRef.current !== null) {
      window.clearInterval(dropTimeRef.current);
      dropTimeRef.current = null;
    }
    dispatch({ type: ACTION_TYPES.RESET_GAME });
  }, []);
  
  const moveLeft = useCallback(() => {
    dispatch({ type: ACTION_TYPES.MOVE_LEFT });
  }, []);
  
  const moveRight = useCallback(() => {
    dispatch({ type: ACTION_TYPES.MOVE_RIGHT });
  }, []);
  
  const moveDown = useCallback(() => {
    dispatch({ type: ACTION_TYPES.MOVE_DOWN });
  }, []);
  
  const hardDrop = useCallback(() => {
    dispatch({ type: ACTION_TYPES.HARD_DROP });
  }, []);
  
  const rotate = useCallback(() => {
    dispatch({ type: ACTION_TYPES.ROTATE });
  }, []);
  
  const togglePause = useCallback(() => {
    dispatch({ type: ACTION_TYPES.PAUSE });
  }, []);

  // Game loop
  useEffect(() => {
    // Clear any existing interval when game over, paused, or not started
    const shouldPause = contextGameOver || contextIsPaused || !state.gameStarted;
    
    // Clear any existing interval
    if (dropTimeRef.current !== null) {
      window.clearInterval(dropTimeRef.current);
      dropTimeRef.current = null;
    }

    if (shouldPause) {
      return;
    }

    // Calculate speed based on score
    const speed = Math.max(
      MIN_DROP_SPEED, 
      INITIAL_DROP_SPEED - Math.floor(state.score / SPEED_INCREASE_THRESHOLD) * SPEED_INCREASE_AMOUNT
    );
    
    // Set up the drop interval
    dropTimeRef.current = window.setInterval(() => {
      dispatch({ type: ACTION_TYPES.TICK });
    }, speed);
    
    // Cleanup function
    return () => {
      if (dropTimeRef.current !== null) {
        window.clearInterval(dropTimeRef.current);
        dropTimeRef.current = null;
      }
    };
  }, [contextGameOver, contextIsPaused, state.gameStarted, state.score]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (state.gameOver || !state.gameStarted) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          hardDrop();
          break;
        case ' ':
          e.preventDefault();
          rotate();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.gameOver, state.gameStarted, moveLeft, moveRight, moveDown, hardDrop, rotate, togglePause]);
  
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
