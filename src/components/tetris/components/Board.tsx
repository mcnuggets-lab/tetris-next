import React, { memo } from 'react';
import { BoardProps } from '../types';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const Board: React.FC<BoardProps> = ({
  grid,
  currentTetromino,
  currentPosition,
  gameOver,
  isPaused,
  gameStarted,
}) => {
  return (
    <div className="relative bg-gray-900"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(200, 200, 200, 0.3) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(200, 200, 200, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
        width: `${BOARD_WIDTH * 30}px`,
        height: `${BOARD_HEIGHT * 30}px`,
        opacity: (!gameStarted || gameOver) ? 0.5 : (isPaused ? 0.7 : 1),
        transition: 'opacity 0.3s ease-in-out',
        border: '2px solid #6B7280',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Render placed pieces */}
      {grid.map((row, y) =>
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
  );
};

export default memo(Board);
