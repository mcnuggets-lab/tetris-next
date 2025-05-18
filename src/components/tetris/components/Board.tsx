import React, { memo } from 'react';
import { BoardProps } from '../types';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants/gameConstants';
import { CELL_STATE } from '../constants/tetrominoConstants';

// Board styling constants
const CELL_SIZE = 30; // Size of each cell in pixels
const GRID_OPACITY = 0.3; // Opacity of the grid lines
const GRID_LINE_COLOR = `rgba(200, 200, 200, ${GRID_OPACITY})`; // Color of the grid lines
const BORDER_COLOR = '#6B7280'; // Color of the board border
const INACTIVE_OPACITY = 0.5; // Opacity when game is not started or is over
const PAUSED_OPACITY = 0.7; // Opacity when game is paused

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
          linear-gradient(to right, ${GRID_LINE_COLOR} 1px, transparent 1px),
          linear-gradient(to bottom, ${GRID_LINE_COLOR} 1px, transparent 1px)
        `,
        backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
        width: `${BOARD_WIDTH * CELL_SIZE}px`,
        height: `${BOARD_HEIGHT * CELL_SIZE}px`,
        opacity: (!gameStarted || gameOver) ? INACTIVE_OPACITY : (isPaused ? PAUSED_OPACITY : 1),
        transition: 'opacity 0.3s ease-in-out',
        border: `2px solid ${BORDER_COLOR}`,
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
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`,
                left: `${x * CELL_SIZE}px`,
                top: `${y * CELL_SIZE}px`,
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
            if (cell === CELL_STATE.EMPTY) return null;
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
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                  left: `${x * CELL_SIZE}px`,
                  top: `${y * CELL_SIZE}px`,
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
