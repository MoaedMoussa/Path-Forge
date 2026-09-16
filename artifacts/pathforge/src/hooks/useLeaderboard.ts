import { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useCourseProgress } from './useCourseProgress';
import { useDailyMissions } from './useDailyMissions';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  userId: string;
  updatedAt: string;
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<LeaderboardEntry | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const { summary } = useCourseProgress();
  const { missions } = useDailyMissions();
  
  const currentXP = (summary.completed * 100) + (summary.quizPassed * 150) + (summary.streak * 20) + (missions.filter(m => m.completed).length * 30);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthReady(true);
      if (user) {
        // Fetch current profile
        const profileRef = doc(db, 'leaderboard', user.uid);
        getDoc(profileRef).then(docSnap => {
          if (docSnap.exists()) {
            setCurrentUserProfile({ id: docSnap.id, ...docSnap.data() } as LeaderboardEntry);
          }
        }).catch(err => handleFirestoreError(err, OperationType.READ, 'leaderboard/' + user.uid));
      } else {
        setCurrentUserProfile(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries: LeaderboardEntry[] = [];
      snapshot.forEach(doc => {
        entries.push({ id: doc.id, ...doc.data() } as LeaderboardEntry);
      });
      setLeaderboard(entries);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leaderboard');
    });

    return unsubscribe;
  }, [isAuthReady]);

  // Sync XP to database if profile exists and XP has changed
  useEffect(() => {
    if (!currentUserProfile || !auth.currentUser) return;
    if (currentUserProfile.xp !== currentXP) {
      const profileRef = doc(db, 'leaderboard', auth.currentUser.uid);
      setDoc(profileRef, {
        name: currentUserProfile.name,
        xp: currentXP,
        userId: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      }, { merge: true }).then(() => {
        setCurrentUserProfile(prev => prev ? { ...prev, xp: currentXP } : null);
      }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `leaderboard/${auth.currentUser?.uid}`);
      });
    }
  }, [currentXP, currentUserProfile]);

  const registerUser = async (name: string) => {
    let user = auth.currentUser;
    
    if (!user) {
      throw new Error('You must be logged in via the main menu to join the leaderboard.');
    }

    const profileRef = doc(db, 'leaderboard', user.uid);
    try {
      await setDoc(profileRef, {
        name,
        xp: currentXP,
        userId: user.uid,
        updatedAt: serverTimestamp()
      });
      setCurrentUserProfile({
        id: user.uid,
        name,
        xp: currentXP,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `leaderboard/${user.uid}`);
    }
  };

  return { leaderboard, currentUserProfile, currentXP, registerUser, isAuthReady };
}
