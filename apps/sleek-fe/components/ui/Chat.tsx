"use client"
import React, { useEffect, useRef, useState } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../firebase/AuthProvider";

type Message = {
  id?: string;
  text: string;
  senderId?: string;
  senderName?: string;
  createdAt?: any;
};

export default function Chat({ chatId }: { chatId: string }) {
  const { user, signInWithGoogle } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const msgs: Message[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setMessages(msgs);
      // auto-scroll
      setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
    });
    return () => unsub();
  }, [chatId]);

  const send = async () => {
    if (!text.trim()) return;
    if (!user) {
      await signInWithGoogle();
      return;
    }
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: text.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email || "Unknown",
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "70vh", border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", background: "#fafafa" }}>Chat: {chatId}</div>
      <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{m.senderName}</div>
            <div style={{ background: "#f3f4f6", padding: 8, borderRadius: 6, display: "inline-block" }}>{m.text}</div>
          </div>
        ))}
        <div ref={listRef} />
      </div>

      <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #e5e7eb" }}>
        <input
          aria-label="message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={user ? "Type a message..." : "Sign in to chat (Enter to sign in)"}
          style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }}
        />
        <button onClick={send} style={{ padding: "8px 12px", borderRadius: 6, background: "#111827", color: "#fff" }}>
          Send
        </button>
      </div>
    </div>
  );
}
