import React, { useEffect, useState, useRef } from 'react';
// --- Push Notification Subscription Logic ---
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

interface Order {
  id: string;
  items: string;
  shopName: string;
  price: number;
  dateTime: string;
  status: string;
  userId: string;
}

export default function NotificationSection() {
  // Subscribe partner to push notifications on mount
  useEffect(() => {
    async function subscribePartner() {
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const reg = await navigator.serviceWorker.register("/sw.js");
        const sub = await reg.pushManager.getSubscription() ||
          await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });

        // Get partnerId from localStorage
        const partner = localStorage.getItem("hotdrop_partner");
        if (!partner) return;
        const { id: partnerId } = JSON.parse(partner);

        // Send subscription to backend (for partner)
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/push-subscription`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partnerId,
            subscription: {
              endpoint: sub.endpoint,
              keys: sub.toJSON().keys,
            },
          }),
        });
      } catch (err) {
        // Optionally handle/log errors
      }
    }
    subscribePartner();
  }, []);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef<() => void>(() => {});

  const fetchPendingOrders = () => {
    setLoading(true);
    const partner = localStorage.getItem("hotdrop_partner");
    if (!partner) {
      setPendingOrders([]);
      setLoading(false);
      return;
    }
    const { id, shopname } = JSON.parse(partner);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/orders/orders?partnerId=${encodeURIComponent(id)}`)
      .then(res => res.json())
      .then(data => {
        const orders = (data.orders || []).filter((order: Order) =>
          order.shopName === shopname &&
          (order.status === 'pending' || /^\d+min$/.test(order.status))
        );
        setPendingOrders(orders);
      })
      .finally(() => setLoading(false));
  };
  fetchRef.current = fetchPendingOrders;

  useEffect(() => {
    fetchRef.current();
    const interval = setInterval(() => {
      fetchRef.current();
    }, 60000); // 30 seconds
    return () => clearInterval(interval);
  }, []);


  const markAsDelivered = async (orderId: string) => {
    setLoading(true);
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/orders/order/${orderId}/delivered`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'taken' })
    });
    fetchPendingOrders();
  };

  // Cancel order handler
  const cancelOrder = async (orderId: string) => {
    setLoading(true);
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/orders/order/${orderId}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    });
    // Store cancel flag in localStorage for this order
    localStorage.setItem(`hotdrop_cancelled_${orderId}`, 'cancelled');
    fetchPendingOrders();
  };

  return (
    <div id="notification-section" className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
      <div className="font-bold text-lg text-gray-700 dark:text-gray-100 mb-4">Latest Order Notification</div>
      {loading ? (
        <div className="text-gray-500 dark:text-gray-300">Loading...</div>
      ) : pendingOrders.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-300">No pending orders.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {pendingOrders.map(order => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 bg-orange-50 dark:bg-gray-900 border border-orange-200 dark:border-gray-700 rounded-xl p-4"
            >
              <div className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-full font-semibold w-fit">New Order</div>
              <div className="text-gray-700 dark:text-gray-100 flex-1 min-w-0">
                Order #{order.id.slice(-4)} for <span className="font-bold">₹{order.price}</span> - <span className="text-yellow-600 dark:text-yellow-300">{
                  order.status === 'taken' ? 'Taken'
                  : order.status === 'cancelled' ? 'Cancelled'
                  : order.status === 'pending' ? 'Pending'
                  : /^\d+min$/.test(order.status) ? `Ready in ${order.status.replace('min', '')} min`
                  : order.status
                }</span>
                <div className="text-xs text-gray-500 dark:text-gray-300 mt-1 ">Items: {order.items}</div>
                <div className="text-xs text-gray-400 dark:text-gray-300">Placed: {new Date(order.dateTime).toLocaleString()}</div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full sm:w-auto">
                <button
                  className="px-4 py-2 bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800 text-white dark:text-gray-100 rounded-xl font-semibold text-sm shadow"
                  onClick={() => markAsDelivered(order.id)}
                >
                  Mark as Delivered
                </button>
                <div className="flex flex-row gap-2">
                  <div className="relative">
                    <TimerDropdown orderId={order.id} disabled={/^\d+min$/.test(order.status)} initialValue={/^\d+min$/.test(order.status) ? order.status : undefined} />
                  </div>
                  <button
                    className="px-4 py-2 bg-red-500 dark:bg-red-700 hover:bg-red-600 dark:hover:bg-red-800 text-white dark:text-gray-100 rounded-xl font-semibold text-sm shadow"
                    onClick={() => cancelOrder(order.id)}
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// TimerDropdown component (should be outside NotificationSection)
// TimerDropdown now takes an orderId prop to persist selection per order
interface TimerDropdownProps {
  orderId: string;
  disabled?: boolean;
  initialValue?: string;
}

function TimerDropdown({ orderId, disabled = false, initialValue }: TimerDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(initialValue || null);
  const options = [5, 10, 15, 20, 30];

  const handleSelect = async (opt: number) => {
    const timerValue = `${opt}min`;
    setSelected(timerValue);
    setOpen(false);
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/orders/order/${orderId}/timer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timer: timerValue }),
    });
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className={`px-4 py-2 ${selected || disabled ? 'bg-orange-300 dark:bg-orange-900 cursor-not-allowed' : 'bg-orange-200 dark:bg-orange-900 hover:bg-orange-300 dark:hover:bg-orange-800'} text-orange-700 dark:text-orange-300 rounded-xl font-semibold text-sm shadow flex items-center gap-1`}
        onClick={() => { if (!selected && !disabled) setOpen(o => !o); }}
        disabled={!!selected || disabled}
      >
        {selected ? selected : "Set Timer"}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {!selected && !disabled && open && (
        <div className="absolute right-0 mt-2 w-28 bg-white dark:bg-gray-900 border border-orange-200 dark:border-gray-700 rounded-xl shadow-lg z-10">
          {options.map((opt) => (
            <button
              key={opt}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-orange-100 dark:hover:bg-orange-800 text-gray-900 dark:text-gray-100`}
              onClick={() => handleSelect(opt)}
            >
              {opt} min
            </button>
          ))}
        </div>
      )}
    </div>
  );
}