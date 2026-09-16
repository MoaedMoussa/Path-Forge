import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, FirestoreError } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0061570296",
  appId: "1:558570290551:web:f2db0abe181a0e24dc7572",
  apiKey: "AIzaSyBA7a6QIHfbt-LyzobAd7_2KSlZIQmoH-E",
  authDomain: "gen-lang-client-0061570296.firebaseapp.com",
  storageBucket: "gen-lang-client-0061570296.firebasestorage.app",
  messagingSenderId: "558570290551",
  measurementId: ""
};

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export enum OperationType {
  LIST = 'list',
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

export function handleFirestoreError(error: unknown, operation: OperationType, path?: string) {
  if (error instanceof Error && ((error as any).code === 'unavailable' || error.message.includes('offline'))) {
    console.warn(`Firestore client is offline, ${operation} unavailable${path ? ` at ${path}` : ''}`);
    return;
  }
  if (error instanceof Error && (error as any).code === 'permission-denied') {
    console.warn(`Firestore ${operation} permission denied${path ? ` at ${path}` : ''}`);
    return;
  }
  console.error(`Firestore ${operation} error${path ? ` at ${path}` : ''}:`, error);
}
