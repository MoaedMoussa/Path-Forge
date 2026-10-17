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

/** Turn common Firebase sign-in failures into actionable messages for the UI. */
export function getAuthErrorMessage(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code ?? '')
      : '';

  switch (code) {
    case 'auth/unauthorized-domain':
      return 'Google sign-in is blocked for this website domain. In Firebase Console, open Authentication → Settings → Authorized domains and add path-forge.pages.dev.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled for this Firebase project. Enable Google under Authentication → Sign-in method.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Allow popups for this site, then try again.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in window was closed before sign-in finished. Try again and complete the Google prompt.';
    case 'auth/cancelled-popup-request':
      return 'A sign-in popup is already in progress. Finish it or wait a moment before trying again.';
    case 'auth/network-request-failed':
      return 'Google sign-in could not reach Firebase. Check your connection and try again.';
    default:
      return code
        ? `Google sign-in failed (${code}). Check Firebase Authentication settings and the browser console.`
        : 'Google sign-in failed. Check Firebase Authentication settings and try again.';
  }
}

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
