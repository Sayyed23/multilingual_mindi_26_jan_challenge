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
export const analytics = getAnalytics(app);

// Initialize Firebase Cloud Messaging (FCM) if supported
let messaging: any = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

export { messaging };

// Development mode emulator connections
if (import.meta.env.DEV) {
  // Connect to Firebase emulators in development
  try {
    // Auth emulator - check if already connected
    const authConfig = auth.config as any;
    if (!authConfig.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }

    // Firestore emulator - check if already connected
    const dbConfig = db as any;
    if (!dbConfig._delegate?._databaseId?.projectId?.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }

    // Functions emulator
    if (!functions.app.options.projectId?.includes('localhost')) {
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }
  } catch (error) {
    // Emulators might already be connected or not available
    console.log('Firebase emulators connection status:', error);
  }
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