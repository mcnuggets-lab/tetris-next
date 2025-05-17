"use client";

import React, { useContext } from 'react';
import TetrisBoard from '@/components/TetrisBoard';
import { TetrisProvider, TetrisContext } from '../components/TetrisContext';

function GameStatus() {
  const context = useContext(TetrisContext);
  
  if (!context) return null;
  
  const { gameOver, isPaused } = context;
  
  if (gameOver) {
    return (
      <div className="text-2xl font-bold text-red-500 mb-4 animate-pulse">
        Game Over!
      </div>
    );
  }
  
  if (isPaused) {
    return (
      <div className="text-2xl font-bold text-yellow-500 mb-4">
        Paused
      </div>
    );
  }
  
  return <div className="h-8"></div>;
}

export default function Home() {
  return (
    <TetrisProvider>
      <main className="flex min-h-screen flex-col items-center p-8">
        <h1 className="text-4xl font-bold mb-2">Tetris</h1>
        <GameStatus />
        <TetrisBoard />
      </main>
    </TetrisProvider>
  );
}
