import React from 'react';
import { useTetrisGame } from './hooks/useTetrisGame';
import Board from './components/Board';
import NextPiece from './components/NextPiece';
import GameControls from './components/GameControls';
import { ScoreDisplay } from '../ScoreDisplay';

const TetrisGame: React.FC = () => {
  const {
    // State
    grid,
    currentTetromino,
    nextTetromino,
    currentPosition,
    gameStarted,
    gameOver,
    isPaused,
    score,
    
    // Actions
    startGame,
    resetGame,
    moveLeft,
    moveRight,
    moveDown,
    hardDrop,
    rotate,
    togglePause,
  } = useTetrisGame();

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-start gap-8 h-[600px]">
        {/* Game Board */}
        <div>
          <Board
            grid={grid}
            currentTetromino={currentTetromino}
            currentPosition={currentPosition}
            gameOver={gameOver}
            isPaused={isPaused}
            gameStarted={gameStarted}
          />
        </div>
        
        {/* Side Panel */}
        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col gap-8 items-center">
            <ScoreDisplay />
            <NextPiece tetromino={nextTetromino} />
          </div>
          
          {/* Game Controls */}
          <GameControls
            onMoveLeft={moveLeft}
            onMoveRight={moveRight}
            onRotate={rotate}
            onHardDrop={hardDrop}
            onPause={togglePause}
            onStart={startGame}
            onReset={resetGame}
            gameOver={gameOver}
            isPaused={isPaused}
            gameStarted={gameStarted}
          />
        </div>
      </div>
      
      {/* Game Over Overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Game Over!</h2>
            <p className="text-xl text-white mb-6">Your score: {score}</p>
            <button
              onClick={() => {
                resetGame();
                startGame();
              }}
              className="px-6 py-3 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TetrisGame;
