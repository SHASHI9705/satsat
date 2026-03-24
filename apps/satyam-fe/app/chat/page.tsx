"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { Send } from "lucide-react";
import { auth } from "../../lib/firebase";
import {
  DEFAULT_ADMIN_UID,
  ChatMessage,
  ensureChatRecord,
  ensureUserProfile,
  formatTimestamp,
  markIncomingAsDelivered,
  subscribeToMessages,
  sendChatMessage,
} from "../../lib/chat";

type LocalUser = {
  id?: string;
  firstname?: string;
  lastname?: string;
  name?: string;
  phone?: string;
  contact?: string;
};

function MessageStatus({ status }: { status: ChatMessage["status"] }) {
  if (status === "seen") {
    return <span className="text-xs text-blue-500">Seen</span>;
  }
  if (status === "delivered") {
    return <span className="text-xs text-gray-400">Delivered</span>;
  }
  return <span className="text-xs text-gray-400">Sent</span>;
}

function formatTime(timestamp: any): string {
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function UserChatPage() {
  const [uid, setUid] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const localUser = useMemo<LocalUser | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setLoading(false);
        setError("Please sign in to start chatting with support.");
        return;
      }

      try {
        const resolvedName =
          [localUser?.firstname, localUser?.lastname].filter(Boolean).join(" ") ||
          localUser?.name ||
          firebaseUser.displayName ||
          "User";
        const resolvedPhone = localUser?.phone || localUser?.contact || firebaseUser.phoneNumber || "";

        setUserName(resolvedName);

        await ensureUserProfile({
          uid: firebaseUser.uid,
          name: resolvedName,
          mobile: resolvedPhone,
          role: "user",
        });

        const ensuredChatId = await ensureChatRecord({
          userId: firebaseUser.uid,
          adminId: DEFAULT_ADMIN_UID,
          userName: resolvedName,
          userMobile: resolvedPhone,
        });

        setUid(firebaseUser.uid);
        setChatId(ensuredChatId);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Unable to initialize chat. Please try again.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [localUser]);

  useEffect(() => {
    if (!chatId || !uid) return;

    const unsubscribe = subscribeToMessages(
      chatId,
      async (nextMessages) => {
        setMessages(nextMessages);
        try {
          await markIncomingAsDelivered(chatId, uid);
        } catch (err) {
          console.error(err);
        }
      },
      (err) => {
        console.error(err);
        setError("Failed to load messages. Please refresh the page.");
      }
    );

    return () => unsubscribe();
  }, [chatId, uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText || !chatId || !uid || sending) return;

    setSending(true);
    try {
      await sendChatMessage({
        chatId,
        senderId: uid,
        text: trimmedText,
        isFromUser: true,
      });
      setText("");
      inputRef.current?.focus();
    } catch (err) {
      console.error(err);
      setError("Failed to send message. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-80 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Support Chat</h2>
            <p className="text-sm text-gray-500">Get help from our team</p>
          </div>
          <div className="flex-1 p-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Support Team</p>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-white">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 lg:hidden">
                <span className="text-sm font-medium text-blue-600">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900 lg:text-base">
                  Support Team
                </h1>
            
              </div>
            </div>
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              Back
            </Link>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-gray-50 p-4"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                <p className="text-sm text-gray-500">Loading conversation...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-500">No messages yet</p>
                <p className="text-xs text-gray-400">Send a message to start the conversation</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isMine = message.senderId === uid;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-2 ${
                        isMine
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900 shadow-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                      <div
                        className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                          isMine ? "text-blue-100" : "text-gray-400"
                        }`}
                      >
                        <span>{formatTime(message.timestamp)}</span>
                        {isMine && <MessageStatus status={message.status} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="border-t border-gray-200 bg-white p-4">
          {error && (
            <div className="mb-3 rounded-md bg-red-50 p-2 text-xs text-red-600">
              {error}
            </div>
          )}
          <div className="flex items-end gap-2">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={!chatId || sending}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={!text.trim() || !chatId || sending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span className="text-sm font-medium">Send</span>
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}