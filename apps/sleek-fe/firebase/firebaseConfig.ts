import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyC7n7svNE0bZKqI5oLubUbFNL25oXKOJN4",
  authDomain: "civia-ad50a.firebaseapp.com",
  databaseURL: "https://civia-ad50a-default-rtdb.firebaseio.com",
  projectId: "civia-ad50a",
  storageBucket: "civia-ad50a.firebasestorage.app",
  appId: "1:654111367063:web:bf1a1544339f30624deed2",
  measurementId: "G-5XX5B62M3R"
};

const app = initializeApp(firebaseConfig);
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Export the initialized app
export const firebaseApp = app;

export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Returns initialized Storage instance when available in browser environment.
 * Use `await getStorageAsync()` instead of importing storage directly to avoid SSR issues.
 */
export async function getStorageAsync() {
  try {
    const m = await import('firebase/storage');
    return m.getStorage(app);
  } catch (err) {
    return null;
  }
}

export const provider = new GoogleAuthProvider();
export { analytics };
