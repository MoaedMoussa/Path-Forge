import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CourseId } from '@/data/courseContent';

export interface LessonProgress {
  bestQuizScore: number;
  quizPassed: boolean;
  puzzleSolved: boolean;
  completed: boolean;
  lastUpdatedAt: string;
}

export type CourseProgress = Partial<Record<CourseId, LessonProgress>>;

const STORAGE_KEY = 'pathforge-academy-progress-v1';
const STREAK_KEY = 'pathforge-academy-streak-v1';

interface StreakState {
  current: number;
  lastActivity: string | null;
}

function loadProgress(): CourseProgress {
  if (typeof window === 'undefined') return {};

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as CourseProgress : {};
  } catch {
    return {};
  }
}

function loadAndCalculateStreak(): StreakState {
  if (typeof window === 'undefined') return { current: 0, lastActivity: null };
  const today = new Date().toDateString();
  
  try {
    const stored = window.localStorage.getItem(STREAK_KEY);
    const parsed = stored ? JSON.parse(stored) as StreakState : { current: 0, lastActivity: null };
    
    if (!parsed.lastActivity) {
      return { current: 1, lastActivity: today };
    }
    
    if (parsed.lastActivity === today) {
      return parsed;
    }
    
    const lastDate = new Date(parsed.lastActivity);
    const currentDate = new Date(today);
    const diffTime = currentDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return { current: parsed.current + 1, lastActivity: today };
    } else {
      return { current: 1, lastActivity: today };
    }
  } catch {
    return { current: 1, lastActivity: today };
  }
}

function createEntry(existing?: LessonProgress): LessonProgress {
  return existing ?? {
    bestQuizScore: 0,
    quizPassed: false,
    puzzleSolved: false,
    completed: false,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function useCourseProgress() {
  const [progress, setProgress] = useState<CourseProgress>(() => loadProgress());
  const [streak, setStreak] = useState<StreakState>(() => loadAndCalculateStreak());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Progress remains available during this session if localStorage is unavailable.
    }
  }, [progress]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
    } catch {
      // Ignore
    }
  }, [streak]);

  const updateLesson = useCallback((lessonId: CourseId, updater: (current: LessonProgress) => LessonProgress) => {
    setProgress(current => {
      const previous = createEntry(current[lessonId]);
      const next = updater(previous);
      const completed = next.quizPassed && next.puzzleSolved;
      return {
        ...current,
        [lessonId]: {
          ...next,
          completed,
          lastUpdatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const recordQuiz = useCallback((lessonId: CourseId, score: number, total: number) => {
    updateLesson(lessonId, current => ({
      ...current,
      bestQuizScore: Math.max(current.bestQuizScore, score),
      quizPassed: current.quizPassed || score === total,
    }));
  }, [updateLesson]);

  const markPuzzleSolved = useCallback((lessonId: CourseId) => {
    updateLesson(lessonId, current => ({ ...current, puzzleSolved: true }));
  }, [updateLesson]);

  const resetProgress = useCallback(() => {
    setProgress({});
    setStreak({ current: 1, lastActivity: new Date().toDateString() });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.setItem(STREAK_KEY, JSON.stringify({ current: 1, lastActivity: new Date().toDateString() }));
    } catch {
      // Ignore
    }
  }, []);

  const summary = useMemo(() => {
    const entries = Object.values(progress);
    return {
      quizPassed: entries.filter(entry => entry?.quizPassed).length,
      puzzlesSolved: entries.filter(entry => entry?.puzzleSolved).length,
      completed: entries.filter(entry => entry?.completed).length,
      streak: streak.current,
    };
  }, [progress, streak]);

  return { progress, summary, recordQuiz, markPuzzleSolved, resetProgress };
}