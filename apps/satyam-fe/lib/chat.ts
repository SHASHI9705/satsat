import {
  Timestamp,
  collection,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

export type UserRole = "user" | "admin";

export type ChatUser = {
  uid: string;
  name: string;
  mobile: string;
  role: UserRole;
};

export type ChatRecord = {
  chatId: string;
  userId: string;
  adminId: string;
  userName?: string;
  userMobile?: string;
  lastMessage: string;
  lastMessageTime: Timestamp | null;
  unreadCount: number;
};

export type ChatMessageStatus = "sent" | "delivered" | "seen";

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp | null;
  status: ChatMessageStatus;
};

export const DEFAULT_ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || "admin";

export const getChatId = (userId: string, adminId: string) => `${userId}_${adminId}`;

function getAdminIdCandidates(adminId: string) {
  return Array.from(new Set([adminId, DEFAULT_ADMIN_UID].filter(Boolean)));
}

export const formatTimestamp = (value: Timestamp | null | undefined) => {
  if (!value) return "";
  return value.toDate().toLocaleString();
};

export async function ensureUserProfile(user: ChatUser) {
  const userRef = doc(db, "users", user.uid);

  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(userRef);
    if (!existing.exists()) {
      transaction.set(userRef, {
        uid: user.uid,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
      });
      return;
    }

    const existingData = existing.data() as Partial<ChatUser>;
    if (
      existingData.name !== user.name ||
      existingData.mobile !== user.mobile ||
      existingData.role !== user.role
    ) {
      transaction.update(userRef, {
        name: user.name,
        mobile: user.mobile,
        role: user.role,
      });
    }
  });
}

export async function ensureChatRecord(input: {
  userId: string;
  adminId: string;
  userName: string;
  userMobile: string;
}) {
  const chatId = getChatId(input.userId, input.adminId);
  const chatRef = doc(db, "chats", chatId);

  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(chatRef);
    if (!existing.exists()) {
      transaction.set(chatRef, {
        chatId,
        userId: input.userId,
        adminId: input.adminId,
        userName: input.userName,
        userMobile: input.userMobile,
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
      });
    }
  });

  return chatId;
}

export async function sendChatMessage(input: {
  chatId: string;
  senderId: string;
  text: string;
  isFromUser: boolean;
}) {
  const trimmedText = input.text.trim();
  if (!trimmedText) return;

  const chatRef = doc(db, "chats", input.chatId);
  const messagesRef = collection(db, "chats", input.chatId, "messages");
  const newMessageRef = doc(messagesRef);

  await runTransaction(db, async (transaction) => {
    const chatSnap = await transaction.get(chatRef);
    if (!chatSnap.exists()) {
      throw new Error("Chat not found");
    }

    const currentUnread = Number(chatSnap.data().unreadCount || 0);

    transaction.set(newMessageRef, {
      senderId: input.senderId,
      text: trimmedText,
      timestamp: serverTimestamp(),
      status: "sent",
    });

    transaction.update(chatRef, {
      lastMessage: trimmedText,
      lastMessageTime: serverTimestamp(),
      unreadCount: input.isFromUser ? currentUnread + 1 : 0,
    });
  });
}

export function subscribeToMessages(
  chatId: string,
  onData: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((item) => {
        const data = item.data() as Omit<ChatMessage, "id">;
        return {
          id: item.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp || null,
          status: data.status || "sent",
        };
      });
      onData(messages);
    },
    (error) => {
      if (onError) onError(error as Error);
    }
  );
}

export function subscribeToAdminChats(
  adminId: string,
  onData: (chats: ChatRecord[]) => void,
  onError?: (error: Error) => void
) {
  const chatsRef = collection(db, "chats");
  const candidates = getAdminIdCandidates(adminId);
  const q =
    candidates.length === 1
      ? query(chatsRef, where("adminId", "==", candidates[0]))
      : query(chatsRef, where("adminId", "in", candidates));

  return onSnapshot(
    q,
    (snapshot) => {
      const chats = snapshot.docs
        .map((item) => {
        const data = item.data() as Omit<ChatRecord, "chatId">;
        return {
          chatId: item.id,
          userId: data.userId,
          adminId: data.adminId,
          userName: data.userName,
          userMobile: data.userMobile,
          lastMessage: data.lastMessage || "",
          lastMessageTime: data.lastMessageTime || null,
          unreadCount: Number(data.unreadCount || 0),
        };
        })
        .sort((a, b) => {
          const aTime = a.lastMessageTime?.toMillis?.() || 0;
          const bTime = b.lastMessageTime?.toMillis?.() || 0;
          return bTime - aTime;
        });
      onData(chats);
    },
    (error) => {
      if (onError) onError(error as Error);
    }
  );
}

export function subscribeToUnreadCount(
  adminId: string,
  onData: (count: number) => void,
  onError?: (error: Error) => void
) {
  const chatsRef = collection(db, "chats");
  const candidates = getAdminIdCandidates(adminId);
  const q =
    candidates.length === 1
      ? query(chatsRef, where("adminId", "==", candidates[0]), where("unreadCount", ">", 0))
      : query(chatsRef, where("adminId", "in", candidates), where("unreadCount", ">", 0));

  return onSnapshot(
    q,
    (snapshot) => {
      const total = snapshot.docs.reduce((sum, item) => {
        const data = item.data() as Partial<ChatRecord>;
        return sum + Number(data.unreadCount || 0);
      }, 0);
      onData(total);
    },
    (error) => {
      if (onError) onError(error as Error);
    }
  );
}

export async function markIncomingAsDelivered(chatId: string, receiverId: string) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, where("status", "==", "sent"), orderBy("timestamp", "asc"), limit(30));
  const pendingSnap = await getDocs(q);
  const pending = pendingSnap.docs
    .map((item) => ({
      id: item.id,
      senderId: String(item.data().senderId || ""),
    }))
    .filter((item) => item.senderId !== receiverId);

  await Promise.all(
    pending.map((item) =>
      updateDoc(doc(db, "chats", chatId, "messages", item.id), {
        status: "delivered",
      })
    )
  );
}

export async function markMessagesSeen(chatId: string, viewerId: string) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(
    messagesRef,
    where("status", "in", ["sent", "delivered"]),
    orderBy("timestamp", "asc"),
    limit(50)
  );

  const toMarkSnap = await getDocs(q);
  const toMark = toMarkSnap.docs
    .map((item) => ({
      id: item.id,
      senderId: String(item.data().senderId || ""),
    }))
    .filter((item) => item.senderId !== viewerId);

  await Promise.all(
    toMark.map((item) =>
      updateDoc(doc(db, "chats", chatId, "messages", item.id), {
        status: "seen",
      })
    )
  );

  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);
  if (chatSnap.exists()) {
    const data = chatSnap.data() as Partial<ChatRecord>;
    if ((data.unreadCount || 0) > 0) {
      await updateDoc(chatRef, { unreadCount: 0 });
    }
  }
}
