'use client';

import React from 'react';
import { useTetris } from './TetrisContext';

export function ScoreDisplay() {
  const { score, highScore } = useTetris();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-lg font-medium text-gray-700">High Score: {highScore}</div>
      <div className="h-px w-full bg-gray-600 my-1"></div>
      <h2 className="text-xl font-semibold">Score</h2>
      <div className="text-3xl font-bold">{score}</div>
    </div>
  );
}
