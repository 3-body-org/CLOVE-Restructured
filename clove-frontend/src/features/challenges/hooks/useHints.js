import { useState } from 'react';

export const useHints = (initialHintsLeft = 3, onHintUsed) => {
  const [hintsLeft, setHintsLeft] = useState(initialHintsLeft);
  const [hintsRevealed, setHintsRevealed] = useState(0);

  const handleHintClick = () => {
    if (hintsLeft > 0) {
      setHintsRevealed((prev) => prev + 1);
      setHintsLeft((prev) => prev - 1);
      if (onHintUsed) {
        onHintUsed();
      }
    } else {
      alert("No hints remaining!");
    }
  };

  const resetHints = (newHintsLeft = initialHintsLeft) => {
    setHintsLeft(newHintsLeft);
    setHintsRevealed(0);
  };

  return {
    hintsLeft,
    hintsRevealed,
    handleHintClick,
    resetHints
  };
}; 