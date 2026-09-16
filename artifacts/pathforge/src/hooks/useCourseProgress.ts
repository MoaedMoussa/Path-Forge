import { useCallback, useEffect, useMemo, useState } from 'react';
import { CourseId } from '@/data/courseContent';
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

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

function loadProgressLocal(): CourseProgress {
  if (typeof window === 'undefined') return {};
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as CourseProgress : {};
  } catch {
    return {};
  }
}

function loadAndCalculateStreakLocal(): StreakState {
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
  const [progress, setProgress] = useState<CourseProgress>(loadProgressLocal());
  const [streak, setStreak] = useState<StreakState>(loadAndCalculateStreakLocal());
  const [user, setUser] = useState(auth.currentUser);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  // Load from Firestore when user logs in
  useEffect(() => {
    if (!user) {
      setIsLoaded(true);
      return;
    }
    
    const docRef = doc(db, 'courseProgress', user.uid);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.progress) setProgress(data.progress);
        
        if (data.streak) {
          // Calculate streak logic based on fetched data
          const today = new Date().toDateString();
          const parsed = data.streak as StreakState;
          if (!parsed.lastActivity || parsed.lastActivity === today) {
             setStreak(parsed.lastActivity ? parsed : { current: 1, lastActivity: today });
          } else {
             const diffDays = Math.round((new Date(today).getTime() - new Date(parsed.lastActivity).getTime()) / (1000 * 60 * 60 * 24));
             if (diffDays === 1) {
                setStreak({ current: parsed.current + 1, lastActivity: today });
             } else {
                setStreak({ current: 1, lastActivity: today });
             }
          }
        }
      } else {
        // If they just logged in and have local progress, save it to cloud
        const localProgress = loadProgressLocal();
        const localStreak = loadAndCalculateStreakLocal();
        if (Object.keys(localProgress).length > 0) {
          setDoc(docRef, {
            progress: localProgress,
            streak: localStreak,
            updatedAt: serverTimestamp()
          }).catch(err => handleFirestoreError(err, OperationType.READ, 'progress/' + user.uid));
        }
      }
      setIsLoaded(true);
    }, (error) => {
      console.warn("Course progress listener:", error.message);
      setIsLoaded(true);
    });
    
    return unsubscribe;
  }, [user]);

  // Sync to local and cloud whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      window.localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
    } catch {}

    if (user) {
      setDoc(doc(db, 'courseProgress', user.uid), {
        progress,
        streak,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'progress/' + auth.currentUser?.uid));
    }
  }, [progress, streak, user, isLoaded]);

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