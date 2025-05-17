import React, { memo } from 'react';
import { NextPieceProps } from '../types';

const NextPiece: React.FC<NextPieceProps> = ({ tetromino }) => {
  if (!tetromino) return null;
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-xl font-semibold mb-2">Next Piece</div>
      <div className="border-4 border-gray-600 bg-gray-800 rounded-lg p-4 w-32 h-32 flex items-center justify-center">
        <div 
          className="relative" 
          style={{ 
            width: `${tetromino.shape[0].length * 24}px`, 
            height: `${tetromino.shape.length * 24}px` 
          }}
        >
          {tetromino.shape.map((row, i) =>
            row.map((cell, j) => {
              if (cell === 0) return null;
              return (
                <div
                  key={`next-${i}-${j}`}
                  className={`absolute w-6 h-6 ${tetromino.color} border border-gray-700`}
                  style={{
                    left: `${j * 24}px`,
                    top: `${i * 24}px`,
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
