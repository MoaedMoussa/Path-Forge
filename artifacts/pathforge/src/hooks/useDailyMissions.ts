import { useState, useEffect, useCallback } from 'react';

const MISSIONS_KEY = 'pathforge-daily-missions-v1';

export interface DailyMission {
  id: string;
  title: string;
  progress: number;
  target: number;
  reward: string;
  completed: boolean;
}

interface MissionsState {
  date: string;
  missions: DailyMission[];
}

const defaultMissions = (): DailyMission[] => [
  { id: 'run_algo', title: 'Simulate an Algorithm', progress: 0, target: 3, reward: '+50 XP', completed: false },
  { id: 'random_grid', title: 'Generate Random Grids', progress: 0, target: 5, reward: '+30 XP', completed: false },
  { id: 'share_level', title: 'Share a Custom Lab', progress: 0, target: 1, reward: 'Creator Badge', completed: false },
];

function loadDailyMissions(): MissionsState {
  if (typeof window === 'undefined') return { date: new Date().toDateString(), missions: defaultMissions() };
  
  const today = new Date().toDateString();
  try {
    const stored = window.localStorage.getItem(MISSIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as MissionsState;
      if (parsed.date === today) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore error
  }
  
  return { date: today, missions: defaultMissions() };
}

export function useDailyMissions() {
  const [state, setState] = useState<MissionsState>(() => loadDailyMissions());

  useEffect(() => {
    try {
      window.localStorage.setItem(MISSIONS_KEY, JSON.stringify(state));
    } catch {
      // Ignore
    }
  }, [state]);

  const incrementMission = useCallback((id: string, amount: number = 1) => {
    setState(current => {
      // Ensure we are still on the same day, reset if not
      const today = new Date().toDateString();
      let activeState = current;
      if (current.date !== today) {
        activeState = { date: today, missions: defaultMissions() };
      }

      const updatedMissions = activeState.missions.map(mission => {
        if (mission.id === id && !mission.completed) {
          const newProgress = Math.min(mission.progress + amount, mission.target);
          return {
            ...mission,
            progress: newProgress,
            completed: newProgress >= mission.target
          };
        }
        return mission;
      });

      return { ...activeState, missions: updatedMissions };
    });
  }, []);

  return { 
    missions: state.missions,
    incrementMission
  };
}
