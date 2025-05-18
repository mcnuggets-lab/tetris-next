import React, { memo } from 'react';
import { NextPieceProps } from '../types';
import { CELL_STATE } from '../constants/tetrominoConstants';

// Next piece display constants
const PIECE_CELL_SIZE = 24; // Size of each cell in the next piece display
const NEXT_PIECE_CONTAINER_SIZE = '8rem'; // Size of the next piece container (w-32 h-32 = 8rem)

const NextPiece: React.FC<NextPieceProps> = ({ tetromino }) => {
  if (!tetromino) return null;
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-xl font-semibold mb-2">Next Piece</div>
      <div 
        className="border-4 border-gray-600 bg-gray-800 rounded-lg p-4 flex items-center justify-center"
        style={{ width: NEXT_PIECE_CONTAINER_SIZE, height: NEXT_PIECE_CONTAINER_SIZE }}
      >
        <div 
          className="relative" 
          style={{ 
            width: `${tetromino.shape[0].length * PIECE_CELL_SIZE}px`, 
            height: `${tetromino.shape.length * PIECE_CELL_SIZE}px` 
          }}
        >
          {tetromino.shape.map((row, i) =>
            row.map((cell, j) => {
              if (cell === CELL_STATE.EMPTY) return null;
              return (
                <div
                  key={`next-${i}-${j}`}
                  className={`absolute ${tetromino.color} border border-gray-700`}
                  style={{
                    width: `${PIECE_CELL_SIZE}px`,
                    height: `${PIECE_CELL_SIZE}px`,
                    left: `${j * PIECE_CELL_SIZE}px`,
                    top: `${i * PIECE_CELL_SIZE}px`,
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(NextPiece);
