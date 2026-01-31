import { arrayRemove, arrayUnion, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db, firebaseApp } from './firebaseConfig';

export async function requestPermissionAndGetToken(vapidKey: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const messagingMod: any = await import('firebase/messaging');
  const isSupported = messagingMod.isSupported || messagingMod.default?.isSupported;
  if (isSupported && !(await isSupported())) return null;

  const getMessaging = messagingMod.getMessaging || messagingMod.default?.getMessaging;
  const getToken = messagingMod.getToken || messagingMod.default?.getToken;
  if (typeof getMessaging !== 'function' || typeof getToken !== 'function') return null;

  const messaging = getMessaging(firebaseApp);
  const token = await getToken(messaging, { vapidKey });
  return token || null;
}

export async function saveTokenForUser(token: string, uid: string) {
  if (!token || !uid) return false;
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { fcmTokens: arrayUnion(token) }, { merge: true });
  return true;
}

export async function removeTokenForUser(token: string, uid: string) {
  if (!token || !uid) return false;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { fcmTokens: arrayRemove(token) });
  return true;
}

export async function requestAndSaveToken(vapidKey: string | undefined, uid: string) {
  if (!vapidKey) return null;
  const token = await requestPermissionAndGetToken(vapidKey);
  if (token) {
    await saveTokenForUser(token, uid);
  }
  return token;
}

export function onMessageListener(cb: (payload: any) => void) {
  if (typeof window === 'undefined') return () => {};
  let unsubscribe = () => {};
  import('firebase/messaging').then((messagingMod: any) => {
    const getMessaging = messagingMod.getMessaging || messagingMod.default?.getMessaging;
    const onMessage = messagingMod.onMessage || messagingMod.default?.onMessage;
    if (typeof getMessaging !== 'function' || typeof onMessage !== 'function') return;
    const messaging = getMessaging(firebaseApp);
    unsubscribe = onMessage(messaging, cb);
  });
  return () => unsubscribe();
}
