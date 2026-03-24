"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { 
  Check, 
  CheckCheck, 
  Search, 
  Send, 
  Users, 
  MessageSquare, 
  Phone, 
  Mail, 
  MoreVertical,
  ChevronLeft,
  UserCircle,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, db, provider } from "../../../lib/firebase";
import {
  ChatMessage,
  ChatRecord,
  DEFAULT_ADMIN_UID,
  ensureUserProfile,
  formatTimestamp,
  markIncomingAsDelivered,
  markMessagesSeen,
  sendChatMessage,
  subscribeToAdminChats,
  subscribeToMessages,
} from "../../../lib/chat";

function getStatusIcon(status: ChatMessage["status"]) {
  if (status === "seen") {
    return <CheckCheck className="h-3.5 w-3.5 text-green-500" />;
  }
  if (status === "delivered") {
    return <CheckCheck className="h-3.5 w-3.5 text-gray-400" />;
  }
  return <Check className="h-3.5 w-3.5 text-gray-400" />;
}

function formatMessageTime(timestamp: any): string {
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

export default function AdminChatsPage() {
  const [adminUid, setAdminUid] = useState("");
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedChatId, setSelectedChatId] = useState("");
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [needsFirebaseLogin, setNeedsFirebaseLogin] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const hasLegacyAdminSession = () => {
    if (typeof window === "undefined") return false;
    const savedName = localStorage.getItem("adminName");
    const savedPassword = localStorage.getItem("adminPassword");
    return savedName === "Satyam" && savedPassword === "Satyam@9705";
  };

  const handleFirebaseLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      setError("Firebase sign-in failed. Try again.");
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setNeedsFirebaseLogin(true);
        setError("Admin Firebase login required to access chat inbox.");
        setLoading(false);
        return;
      }

      try {
        const profileSnap = await getDoc(doc(db, "users", firebaseUser.uid));
        const role = String(profileSnap.data()?.role || "");
        const isAdmin =
          role === "admin" ||
          firebaseUser.uid === DEFAULT_ADMIN_UID ||
          hasLegacyAdminSession();

        if (!isAdmin) {
          setNeedsFirebaseLogin(false);
          setError("Current Firebase account is not an admin.");
          setLoading(false);
          return;
        }

        await ensureUserProfile({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "Admin",
          mobile: firebaseUser.phoneNumber || "",
          role: "admin",
        });

        setAdminUid(firebaseUser.uid);
        setNeedsFirebaseLogin(false);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Unable to verify admin account.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!adminUid) return;

    const unsubscribe = subscribeToAdminChats(
      adminUid,
      (nextChats) => {
        setChats(nextChats);
        if (!selectedChatId && nextChats.length > 0) {
          setSelectedChatId(nextChats[0].chatId);
        }
      },
      (err) => {
        console.error(err);
        setError("Unable to load admin inbox.");
      }
    );

    return () => unsubscribe();
  }, [adminUid, selectedChatId]);

  useEffect(() => {
    if (!selectedChatId || !adminUid) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(
      selectedChatId,
      async (nextMessages) => {
        setMessages(nextMessages);
        try {
          await markIncomingAsDelivered(selectedChatId, adminUid);
          await markMessagesSeen(selectedChatId, adminUid);
        } catch (err) {
          console.error(err);
        }
      },
      (err) => {
        console.error(err);
        setError("Unable to stream conversation.");
      }
    );

    return () => unsubscribe();
  }, [selectedChatId, adminUid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const filteredChats = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return chats;

    return chats.filter((chat) => {
      return (
        chat.userName?.toLowerCase().includes(value) ||
        chat.userMobile?.toLowerCase().includes(value) ||
        chat.lastMessage?.toLowerCase().includes(value)
      );
    });
  }, [chats, search]);

  const selectedChat = chats.find((item) => item.chatId === selectedChatId);
  const totalUnread = chats.reduce((sum, chat) => sum + Number(chat.unreadCount || 0), 0);

  const handleReply = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText || !selectedChatId || !adminUid || sending) return;

    setSending(true);
    try {
      await sendChatMessage({
        chatId: selectedChatId,
        senderId: adminUid,
        text: trimmedText,
        isFromUser: false,
      });
      setText("");
      inputRef.current?.focus();
      await markMessagesSeen(selectedChatId, adminUid);
    } catch (err) {
      console.error(err);
      setError("Reply failed to send.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply(e);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <nav className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className={`h-5 w-5 transition-transform ${showSidebar ? 'rotate-0' : 'rotate-180'}`} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Support Dashboard</h1>
                <p className="text-sm text-gray-500">Manage customer conversations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{chats.length} Active Chats</span>
              </div>
              <Link
                href="/admin"
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Back to Admin
              </Link>
            </div>
          </div>
        </nav>

        {needsFirebaseLogin ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Authentication Required</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Sign in with your admin Firebase account to access the support dashboard.
                </p>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleFirebaseLogin}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign in with Google
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - Conversations List */}
            <aside className={`
              ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
              lg:translate-x-0
              fixed lg:static
              w-80 lg:w-96
              h-full lg:h-auto
              bg-white border-r border-gray-200
              transition-transform duration-300 ease-in-out
              z-20
            `}>
              <div className="flex flex-col h-full">
                {/* Search Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name, phone, or message..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Unread Badge */}
                {totalUnread > 0 && (
                  <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700 font-medium">Unread messages</span>
                      <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
                        {totalUnread}
                      </span>
                    </div>
                  </div>
                )}

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Loading conversations...</p>
                      </div>
                    </div>
                  ) : filteredChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                      <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500">No conversations found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {search ? 'Try a different search term' : 'Waiting for customers to reach out'}
                      </p>
                    </div>
                  ) : (
                    filteredChats.map((chat) => {
                      const isActive = selectedChatId === chat.chatId;
                      const unreadCount = Number(chat.unreadCount || 0);
                      
                      return (
                        <button
                          key={chat.chatId}
                          onClick={() => {
                            setSelectedChatId(chat.chatId);
                            if (window.innerWidth < 1024) setShowSidebar(false);
                          }}
                          className={`
                            w-full text-left p-4 border-b border-gray-100
                            transition-all duration-200
                            ${isActive 
                              ? 'bg-blue-50 border-l-4 border-l-blue-600' 
                              : 'hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <UserCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {chat.userName || "Anonymous User"}
                                </p>
                                {unreadCount > 0 && (
                                  <span className="flex-shrink-0 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
                                    {unreadCount}
                                  </span>
                                )}
                              </div>
                              {chat.userMobile && (
                                <div className="flex items-center space-x-1 mb-1">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  <p className="text-xs text-gray-500 truncate">{chat.userMobile}</p>
                                </div>
                              )}
                              <p className="text-sm text-gray-600 truncate">
                                {chat.lastMessage || "No messages yet"}
                              </p>
                              {chat.lastMessageTime && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <p className="text-xs text-gray-400">
                                    {formatMessageTime(chat.lastMessageTime)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col bg-gray-50">
              {!selectedChat ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No conversation selected</h3>
                    <p className="text-sm text-gray-500">Choose a chat from the sidebar to start messaging</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {selectedChat.userName || "Anonymous User"}
                        </h2>
                        <div className="flex items-center space-x-3 mt-1">
                          {selectedChat.userMobile && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs text-gray-500">{selectedChat.userMobile}</span>
                            </div>
                          )}
                          {selectedChat.userEmail && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs text-gray-500">{selectedChat.userEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 px-3 py-1 bg-green-50 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-700 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4"
                  >
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">No messages yet</p>
                          <p className="text-xs text-gray-400 mt-1">Send a reply to start the conversation</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const isMine = message.senderId === adminUid;
                        const showDate = index === 0 || formatMessageTime(message.timestamp) !== formatMessageTime(messages[index - 1].timestamp);
                        
                        return (
                          <div key={message.id}>
                            {showDate && (
                              <div className="flex justify-center my-4">
                                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                  {formatMessageTime(message.timestamp)}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`
                                  max-w-[70%] rounded-lg px-4 py-2
                                  ${isMine 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-white text-gray-900 border border-gray-200"
                                  }
                                `}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.text}
                                </p>
                                <div
                                  className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                                    isMine ? "text-blue-100" : "text-gray-400"
                                  }`}
                                >
                                  <span>{formatMessageTime(message.timestamp)}</span>
                                  {isMine && getStatusIcon(message.status)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Input Area */}
                  <form onSubmit={handleReply} className="bg-white border-t border-gray-200 p-4">
                    {error && (
                      <div className="mb-3 p-2 bg-red-50 rounded-lg text-xs text-red-600">
                        {error}
                      </div>
                    )}
                    <div className="flex items-end space-x-2">
                      <textarea
                        ref={inputRef as any}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your reply..."
                        rows={1}
                        className="flex-1 resize-none rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                      />
                      <button
                        type="submit"
                        disabled={!text.trim() || sending}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                        <span className="text-sm font-medium">Send</span>
                      </button>
                    </div>
                   
                  </form>
                </>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}