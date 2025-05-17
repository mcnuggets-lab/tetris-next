"use client";

import React from 'react';
import TetrisBoard from '@/components/TetrisBoard';
import { TetrisProvider } from '../components/TetrisContext';

export default function Home() {
  return (
    <TetrisProvider>
      <main className="flex min-h-screen flex-col items-center p-8">
        <h1 className="text-4xl font-bold mb-8">Tetris</h1>
        <TetrisBoard />
      </main>
    </TetrisProvider>
  );
}
