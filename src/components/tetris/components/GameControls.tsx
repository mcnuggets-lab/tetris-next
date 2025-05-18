import React, { memo } from 'react';

export interface GameControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onPause: () => void;
  onStart: () => void;
  onReset: () => void;
  isPaused: boolean;
  gameStarted: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onRotate,
  onHardDrop,
  onPause,
  onStart,
  onReset,
  isPaused,
  gameStarted,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-center w-full bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-2 text-white">How to Play</h3>
        <div className="text-base space-y-1 text-gray-200">
          <p>← → : Move Left/Right</p>
          <p>↑ : Hard Drop</p>
          <p>↓ : Soft Drop</p>
          <p>Space : Rotate</p>
          <p>P : Pause</p>
        </div>
      </div>
      
      <div className="flex gap-4 w-full">
        {!gameStarted ? (
          <button
            onClick={onStart}
            className="flex-1 px-6 py-3 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 transition-colors"
          >
            Start Game
          </button>
        ) : (
          <>
            <button
              onClick={onPause}
              className="flex-1 px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition-colors"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={onReset}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
            >
              Reset
            </button>
          </>
        )}
      </div>
      
      {/* Mobile Controls */}
      <div className="md:hidden grid grid-cols-3 gap-2 w-full mt-4">
        <div></div>
        <button
          onClick={onHardDrop}
          className="bg-blue-600 text-white p-4 rounded-lg text-xl font-bold"
        >
          ↑
        </button>
        <div></div>
        
        <button
          onClick={onMoveLeft}
          className="bg-blue-600 text-white p-4 rounded-lg text-xl font-bold"
        >
          ←
        </button>
        <button
          onClick={onRotate}
          className="bg-blue-600 text-white p-4 rounded-lg text-lg font-bold"
        >
          Rotate
        </button>
        <button
          onClick={onMoveRight}
          className="bg-blue-600 text-white p-4 rounded-lg text-xl font-bold"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default memo(GameControls);
