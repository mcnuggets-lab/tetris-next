"use client";

import React from 'react';
import TetrisBoard from '@/components/TetrisBoard';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { TetrisProvider } from '../components/TetrisContext';

export default function Home() {
  return (
    <TetrisProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-4xl font-bold">Tetris</h1>
          <div className="flex gap-8">
            <TetrisBoard />
            <ScoreDisplay />
          </div>
        </div>
      </main>
    </TetrisProvider>
  );
}
