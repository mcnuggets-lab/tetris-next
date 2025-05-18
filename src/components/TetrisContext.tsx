import React, { createContext, useContext, useState, useEffect } from 'react';

interface TetrisContextType {
  score: number;
  setScore: (score: number | ((prevScore: number) => number)) => void;
  highScore: number;
  setHighScore: (highScore: number) => void;
  gameOver: boolean;
  setGameOver: (gameOver: boolean) => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean | ((prevIsPaused: boolean) => boolean)) => void;
}

export const TetrisContext = createContext<TetrisContextType | undefined>(undefined);

export function TetrisProvider({ children }: { children: React.ReactNode }) {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Initialize high score from localStorage after mount
  useEffect(() => {
    const savedHighScore = parseInt(localStorage.getItem('tetrisHighScore') || '0', 10);
    setHighScore(savedHighScore);
  }, []);

  // Update high score when score changes
  React.useEffect(() => {
    if (score > highScore) {
      const newHighScore = score;
      setHighScore(newHighScore);
      if (typeof window !== 'undefined') {
        localStorage.setItem('tetrisHighScore', newHighScore.toString());
      }
    }
  }, [score, highScore]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      score,
      setScore,
      highScore,
      setHighScore,
      gameOver,
      setGameOver,
      isPaused,
      setIsPaused,
    }),
    [score, highScore, gameOver, isPaused]
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
