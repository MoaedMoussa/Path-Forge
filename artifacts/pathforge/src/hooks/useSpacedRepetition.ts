import { useState, useEffect } from 'react';
import { FLASHCARDS } from '../data/flashcards';

export interface CardReviewState {
  id: string;
  nextReviewDate: number; // timestamp
  interval: number; // days
  repetition: number;
  easinessFactor: number;
}

export function useSpacedRepetition() {
  const [reviews, setReviews] = useState<Record<string, CardReviewState>>(() => {
    try {
      const saved = localStorage.getItem('pathforge-srs');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('pathforge-srs', JSON.stringify(reviews));
  }, [reviews]);

  const getDueCards = () => {
    const now = Date.now();
    return FLASHCARDS.filter(card => {
      const state = reviews[card.id];
      if (!state) return true; // never reviewed
      return state.nextReviewDate <= now;
    });
  };

  const getStats = () => {
    const total = FLASHCARDS.length;
    const due = getDueCards().length;
    const learning = Object.values(reviews).filter(r => r.repetition < 3).length;
    const mastered = Object.values(reviews).filter(r => r.repetition >= 3).length;
    
    return { total, due, learning, mastered };
  };

  const reviewCard = (id: string, quality: number) => {
    // quality: 0 (blackout), 1 (wrong), 2 (hard), 3 (good), 4 (easy)
    // Map UI rating (0-3) to SM-2 quality (0-5)
    // 0 = Again (quality 0)
    // 1 = Hard (quality 3)
    // 2 = Good (quality 4)
    // 3 = Easy (quality 5)
    
    let sm2Quality = 0;
    if (quality === 0) sm2Quality = 0;
    if (quality === 1) sm2Quality = 3;
    if (quality === 2) sm2Quality = 4;
    if (quality === 3) sm2Quality = 5;

    setReviews(prev => {
      const current = prev[id] || { id, nextReviewDate: 0, interval: 0, repetition: 0, easinessFactor: 2.5 };
      let { interval, repetition, easinessFactor } = current;

      if (sm2Quality < 3) {
        repetition = 0;
        interval = 1;
      } else {
        if (repetition === 0) interval = 1;
        else if (repetition === 1) interval = 6;
        else interval = Math.round(interval * easinessFactor);
        repetition++;
      }

      easinessFactor = easinessFactor + (0.1 - (5 - sm2Quality) * (0.08 + (5 - sm2Quality) * 0.02));
      if (easinessFactor < 1.3) easinessFactor = 1.3;

      // Calculate next review date in milliseconds
      const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

      return { ...prev, [id]: { id, nextReviewDate, interval, repetition, easinessFactor } };
    });
  };

  const resetProgress = () => {
    setReviews({});
  };

  return { reviews, getDueCards, getStats, reviewCard, resetProgress };
}
