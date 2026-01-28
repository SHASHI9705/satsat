"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageCircle, Send, Check, CheckCheck, AlertTriangle, ArrowLeft } from 'lucide-react';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../firebase/AuthProvider';
import { Button } from '../../components/ui/button';
import { getChatId, getOrCreateChat, sendMessage, subscribeMessages } from '../../firebase/useChat';
import { Suspense } from 'react';

interface ItemData {
  id: string;
  name: string;
  discountedPrice?: number;
  actualPrice?: number;
  images?: string[];
  sold?: boolean;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const productId = searchParams.get('productId') || '';
  const sellerIdParam = searchParams.get('sellerId') || '';
  const buyerIdParam = searchParams.get('buyerId') || '';
  const currentUserId = user?.uid || '';
  const isSeller = currentUserId && sellerIdParam && currentUserId === sellerIdParam;
  const buyerId = isSeller ? buyerIdParam : currentUserId;

  const [item, setItem] = useState<ItemData | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  const chatId = useMemo(() => {
    if (!productId || !buyerId || !sellerIdParam) return '';
    return getChatId(buyerId, sellerIdParam, productId);
  }, [productId, buyerId, sellerIdParam]);

  const otherUserId = useMemo(() => {
    if (!buyerId || !sellerIdParam || !currentUserId) return '';
    if (currentUserId === sellerIdParam) return buyerId;
    return sellerIdParam;
  }, [buyerId, sellerIdParam, currentUserId]);

  const chatDisabled = !!item?.sold;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    if (!productId) return;

    const fetchItem = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setItem(data.item || null);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [productId, user]);

  useEffect(() => {
    if (!user || !chatId) return;

    const init = async () => {
      await getOrCreateChat(chatId, [buyerId, sellerIdParam], {
        productId,
        productTitle: item?.name || '',
        productImage: item?.images?.[0] || '',
        productPrice: item?.discountedPrice || item?.actualPrice || 0,
        buyerId,
        sellerId: sellerIdParam,
      });
    };

    init();
  }, [chatId, buyerId, sellerIdParam, item?.name, item?.images, item?.discountedPrice, item?.actualPrice, productId, user]);

  useEffect(() => {
    if (!chatId || !user) return;
    const unsub = subscribeMessages(chatId, (msgs) => {
      setMessages(msgs);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    });
    return () => unsub();
  }, [chatId, user]);

  useEffect(() => {
    if (!chatId || !user) return;
    const chatRef = doc(db, 'chats', chatId);
    const unsub = onSnapshot(chatRef, (snap) => {
      if (snap.exists()) {
        setTypingUsers(snap.data().typing || {});
      }
    });

    return () => unsub();
  }, [chatId, user]);

  useEffect(() => {
    if (!chatId || !user) return;
    const unread = messages.filter(
      (m) => m.senderId !== user.uid && !m.readStatus?.[user.uid]
    );
    if (!unread.length) return;

    const batch = writeBatch(db);
    unread.forEach((m) => {
      const msgRef = doc(db, 'chats', chatId, 'messages', m.id);
      batch.update(msgRef, { [`readStatus.${user.uid}`]: true });
    });
    batch.commit();
  }, [chatId, messages, user]);

  useEffect(() => {
    if (!chatId || !user) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'chats', chatId), {
          [`typing.${user.uid}`]: input.trim().length > 0,
          typingUpdatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Failed to update typing state:', err);
      }
    }, 300);
  }, [chatId, input, user]);

  const formatTime = (ts: any) => {
    try {
      const date = ts?.toDate ? ts.toDate() : null;
      if (!date) return '';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !chatId || !user) return;
    setSending(true);
    try {
      await sendMessage(chatId, user.uid, input.trim());
      if (otherUserId) {
        await addDoc(collection(db, 'notifications'), {
          type: 'chat',
          toUserId: otherUserId,
          fromUserId: user.uid,
          chatId,
          productId,
          buyerId,
          sellerId: sellerIdParam,
          productTitle: item?.name || '',
          productImage: item?.images?.[0] || '',
          message: input.trim(),
          createdAt: serverTimestamp(),
          read: false,
        });
      }
      setInput('');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <MessageCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-gray-900">Sign in to chat</h1>
          <p className="text-gray-600 mt-2">Only authenticated users can message sellers.</p>
          <Button className="mt-6 w-full bg-red-600 hover:bg-red-700" onClick={() => router.push('/signin')}>
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!productId || !sellerIdParam || (isSeller && !buyerIdParam)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center text-gray-600">Missing chat parameters.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-red-100">
          <div className="p-5 md:p-6 border-b border-red-100 bg-white/90">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="h-10 w-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center hover:bg-red-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-red-600" />
              </button>
              <div className="h-14 w-14 rounded-2xl overflow-hidden bg-red-50 border border-red-100 flex items-center justify-center">
                {item?.images?.[0] ? (
                  <img src={item.images[0]} alt={item?.name} className="h-full w-full object-cover" />
                ) : (
                  <MessageCircle className="w-6 h-6 text-red-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">This chat is for product:</p>
                <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">{item?.name || 'Product'}</h2>
                {item?.discountedPrice ? (
                  <p className="text-sm font-semibold text-red-600">₹{item.discountedPrice}</p>
                ) : null}
              </div>
              {chatDisabled ? (
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                  <AlertTriangle className="w-3 h-3" />
                  Sold
                </span>
              ) : null}
            </div>
          </div>

          <div className="h-[62vh] md:h-[70vh] overflow-y-auto px-4 md:px-6 py-6 space-y-4 bg-[radial-gradient(circle_at_top,_#fff,_#fff3f3)]">
            {loading ? (
              <div className="text-center text-gray-500">Loading chat...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500">Start the conversation.</div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderId === user.uid;
                const seen = isMine && otherUserId && msg.readStatus?.[otherUserId];
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                        isMine ? 'bg-red-600 text-white rounded-br-md' : 'bg-white text-gray-900 border border-red-100 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <div className={`mt-2 flex items-center gap-2 text-[11px] ${isMine ? 'text-red-100' : 'text-gray-400'}`}>
                        <span>{formatTime(msg.timestamp)}</span>
                        {isMine ? (
                          <span className="inline-flex items-center gap-1">
                            {seen ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                            {seen ? 'Seen' : 'Delivered'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {otherUserId && typingUsers?.[otherUserId] ? (
              <div className="flex justify-start">
                <div className="bg-white border border-red-100 text-gray-500 rounded-2xl px-4 py-2 text-xs shadow-sm">
                  Typing...
                </div>
              </div>
            ) : null}
            <div ref={scrollRef} />
          </div>

          <div className="p-4 md:p-6 border-t border-red-100 bg-white">
            <div className="flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={chatDisabled ? 'Chat disabled (item sold)' : 'Type a message...'}
                className="flex-1 h-12 rounded-full border border-red-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-50"
                disabled={chatDisabled}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700"
                onClick={handleSend}
                disabled={sending || chatDisabled || !input.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            {chatDisabled ? (
              <p className="text-xs text-red-500 mt-2">This product is marked as sold. Chat is disabled.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
