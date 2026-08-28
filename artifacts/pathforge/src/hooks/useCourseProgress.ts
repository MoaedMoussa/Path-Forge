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

function loadProgress(): CourseProgress {
  if (typeof window === 'undefined') return {};

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as CourseProgress : {};
  } catch {
    return {};
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

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Progress remains available during this session if localStorage is unavailable.
    }
  }, [progress]);

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
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // A clear session state is still useful when storage is restricted.
    }
  }, []);

  const summary = useMemo(() => {
    const entries = Object.values(progress);
    return {
      quizPassed: entries.filter(entry => entry?.quizPassed).length,
      puzzlesSolved: entries.filter(entry => entry?.puzzleSolved).length,
      completed: entries.filter(entry => entry?.completed).length,
    };
  }, [progress]);

  return { progress, summary, recordQuiz, markPuzzleSolved, resetProgress };
}