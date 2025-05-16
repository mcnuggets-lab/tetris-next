import React from 'react';
import { useTetris } from './TetrisContext';

export function ScoreDisplay() {
  const { score } = useTetris();

  return (
    <div className="flex flex-col items-center gap-2">
      <h2 className="text-xl font-semibold">Score</h2>
      <div className="text-3xl font-bold">{score}</div>
    </div>
  );
}
