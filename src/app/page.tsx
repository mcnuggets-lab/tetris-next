"use client";

import React, { useContext } from 'react';
import TetrisBoard from '@/components/TetrisBoard';
import { TetrisProvider, TetrisContext } from '../components/TetrisContext';

function GameStatus() {
  const context = useContext(TetrisContext);
  
  const getStatusContent = () => {
    if (!context) return null;
    const { gameOver, isPaused } = context;
    
    if (gameOver) {
      return (
        <div className="text-2xl font-bold text-red-500 animate-pulse">
          Game Over!
        </div>
      );
    }
    
    if (isPaused) {
      return (
        <div className="text-2xl font-bold text-yellow-500">
          Paused
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="w-full min-h-[2rem] flex items-center justify-center">
      {getStatusContent()}
    </div>
  );

}

export default function Home() {
  return (
    <TetrisProvider>
      <main className="min-h-screen p-8">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-2 text-center">Tetris</h1>
          <div className="w-full max-w-[600px] text-center min-h-[2rem] mb-4">
            <GameStatus />
          </div>
          <TetrisBoard />
        </div>
      </main>
    </TetrisProvider>
  );
}
