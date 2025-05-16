import React, { createContext, useContext, useState } from 'react';

interface TetrisContextType {
  score: number;
  setScore: (score: number) => void;
}

const TetrisContext = createContext<TetrisContextType | undefined>(undefined);

export function TetrisProvider({ children }: { children: React.ReactNode }) {
  const [score, setScore] = useState(0);

  return (
    <TetrisContext.Provider value={{ score, setScore }}>
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
