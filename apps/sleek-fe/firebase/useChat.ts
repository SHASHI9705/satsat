import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface ChatMeta {
  productId: string;
  productTitle?: string;
  productImage?: string;
  productPrice?: number;
  buyerId: string;
  sellerId: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string;
  timestamp: any;
  readStatus?: Record<string, boolean>;
}

export function getChatId(buyerId: string, sellerId: string, productId?: string) {
  if (!productId) {
    throw new Error('productId is required to build chat id.');
  }
  return `${productId}_${buyerId}_${sellerId}`;
}

export async function getOrCreateChat(chatId: string, participants: string[], meta?: ChatMeta) {
  const chatRef = doc(db, 'chats', chatId);
  const snap = await getDoc(chatRef);
  if (!snap.exists()) {
    await setDoc(chatRef, {
      chatId,
      productId: meta?.productId || null,
      productTitle: meta?.productTitle || null,
      productImage: meta?.productImage || null,
      productPrice: meta?.productPrice || null,
      buyerId: meta?.buyerId || null,
      sellerId: meta?.sellerId || null,
      participants,
      lastMessage: null,
      lastMessageTime: null,
      createdAt: serverTimestamp(),
      typing: {},
    });
  }
  return chatRef;
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  text?: string
) {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const msgRef = await addDoc(messagesRef, {
    senderId,
    text: text || '',
    timestamp: serverTimestamp(),
    readStatus: { [senderId]: true },
  });

  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text || '',
    lastMessageTime: serverTimestamp(),
  });

  return msgRef;
}

export function subscribeMessages(chatId: string, cb: (msgs: ChatMessage[]) => void) {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snap) => {
    const msgs: ChatMessage[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));
    cb(msgs);
  });
}

export async function markRead(chatId: string, messageId: string, uid: string) {
  const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
  await updateDoc(msgRef, {
    [`readStatus.${uid}`]: true,
  });
}

export function subscribeChats(uid: string, cb: (chats: any[]) => void, onError?: (err: any) => void) {
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', uid));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))),
    (err) => onError?.(err)
  );
}

export async function getUserInfo(uid: string) {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}
