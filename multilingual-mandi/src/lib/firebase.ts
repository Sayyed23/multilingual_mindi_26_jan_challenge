// Firebase Configuration and Initialization
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
// Initialize Firebase Cloud Messaging (FCM) if supported
import type { Messaging } from 'firebase/messaging';

let messagingInstance: Messaging | null = null;

export const getMessagingInstance = async (): Promise<Messaging | null> => {
  if (messagingInstance) return messagingInstance;
  const supported = await isSupported();
  if (supported) {
    messagingInstance = getMessaging(app);
  }
  return messagingInstance;
};
// Development mode emulator connections
const USING_EMULATORS = import.meta.env.VITE_USE_EMULATORS === 'true';

console.info(`[Firebase] Initializing. Emulator mode: ${USING_EMULATORS}`);

if (USING_EMULATORS) {
  try {
    console.warn('[Firebase] Attempting to connect to local emulators...');
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.info('[Firebase] Successfully connected to Firebase emulators');
  } catch (error) {
    console.error('[Firebase] Failed to connect to Firebase emulators:', error);
  }
} else {
  console.info('[Firebase] Connecting to cloud project:', firebaseConfig.projectId);
}

// Export the Firebase app instance
export default app;

// Firebase service status checker
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Simple connectivity check by attempting to get current user
    await auth.authStateReady();
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error);
    return false;
  }
};

// Firebase initialization status
export const isFirebaseInitialized = (): boolean => {
  return !!app && !!auth && !!db;
};