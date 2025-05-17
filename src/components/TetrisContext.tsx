import React, { createContext, useContext, useState, useCallback } from 'react';

interface TetrisContextType {
  score: number;
  setScore: (score: number | ((prevScore: number) => number)) => void;
  gameOver: boolean;
  setGameOver: (gameOver: boolean) => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean | ((prevIsPaused: boolean) => boolean)) => void;
}

export const TetrisContext = createContext<TetrisContextType | undefined>(undefined);

export function TetrisProvider({ children }: { children: React.ReactNode }) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      score,
      setScore,
      gameOver,
      setGameOver,
      isPaused,
      setIsPaused,
    }),
    [score, gameOver, isPaused]
  );

  return (
    <TetrisContext.Provider value={contextValue}>
      {children}
    </TetrisContext.Provider>
  );
}

export function useTetris() {
  const context = useContext(TetrisContext);
  if (context === undefined) {
    throw new Error('useTetris must be used within a TetrisProvider');
  }
  return context;
}
