"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../firebase/AuthProvider';
import { ArrowLeft, MessageCircle } from 'lucide-react';

export default function InboxPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      items.sort((a, b) => {
        const aTime = a?.lastMessageTime?.toDate ? a.lastMessageTime.toDate().getTime() : 0;
        const bTime = b?.lastMessageTime?.toDate ? b.lastMessageTime.toDate().getTime() : 0;
        return bTime - aTime;
      });
      setChats(items);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

  const handleOpenChat = (chat: any) => {
    const productId = chat.productId || '';
    const sellerId = chat.sellerId || '';
    const buyerId = chat.buyerId || '';
    const params = new URLSearchParams();
    params.set('productId', productId);
    params.set('sellerId', sellerId);
    if (buyerId) params.set('buyerId', buyerId);
    router.push(`/chat?${params.toString()}`);
  };

  const getLastMessagePreview = (chat: any) => {
    const last = chat?.lastMessage;
    if (!last) return 'No messages yet';
    if (typeof last === 'string') return last;
    if (typeof last === 'object') {
      if (typeof last.text === 'string') return last.text;
      return 'New message';
    }
    return String(last);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className=" bg-green-200 p-8 rounded border border-black text-center text-gray-600 font-bold"><a className='bg-blue-400 font-bold rounded p-1 border border-black' href="/signin">Signin</a> to view messages.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center hover:bg-red-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-red-600" />
          </button>
          <div className="h-10 w-10 rounded-2xl bg-red-100 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-red-100 overflow-hidden">
          {loading ? (
            <div className="p-6 text-gray-500">Loading chats...</div>
          ) : chats.length === 0 ? (
            <div className="p-6 text-gray-500">No messages yet.</div>
          ) : (
            <ul className="divide-y divide-red-100">
              {chats.map((chat) => (
                <li key={chat.id}>
                  <button
                    onClick={() => handleOpenChat(chat)}
                    className="w-full text-left p-5 hover:bg-red-50/50 transition-colors flex items-center gap-4"
                  >
                    <div className="h-12 w-12 rounded-2xl overflow-hidden bg-red-50 border border-red-100 flex items-center justify-center">
                      {chat.productImage ? (
                        <img src={chat.productImage} alt={chat.productTitle} className="h-full w-full object-cover" />
                      ) : (
                        <MessageCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">This chat is for:</p>
                      <p className="font-semibold text-gray-900 truncate">{chat.productTitle || 'Product'}</p>
                      <p className="text-sm text-gray-600 truncate mt-1">{getLastMessagePreview(chat)}</p>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">
                      {chat.lastMessageTime?.toDate
                        ? chat.lastMessageTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
