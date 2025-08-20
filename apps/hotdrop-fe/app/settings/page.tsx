
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// --- Push Notification Subscription Logic ---
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function SettingsPage() {
  // Export My Data modal state
  const [showExportForm, setShowExportForm] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState("");
  // Notification toggles state (fix hydration)
  const [orderUpdatesEnabled, setOrderUpdatesEnabled] = useState(true);
  const [promoUpdatesEnabled, setPromoUpdatesEnabled] = useState(true);
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);

  // Subscribe/unsubscribe user to push notifications for order updates
  useEffect(() => {
    async function handlePushSubscription() {
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
      const user = localStorage.getItem("hotdrop_user");
      if (!user) return;
      const parsedUser = JSON.parse(user);
      const userId = parsedUser.id || parsedUser.email;
      const email = parsedUser.email;
      const reg = await navigator.serviceWorker.getRegistration("/sw.js") || await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.getSubscription();
      if (orderUpdatesEnabled) {
        // Enable: request permission and subscribe
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;
        const subscription = sub || await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/push-subscription`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            email,
            subscription: {
              endpoint: subscription.endpoint,
              keys: subscription.toJSON().keys,
            },
          }),
        });
      } else {
        // Disable: unsubscribe and optionally remove from backend
        if (sub) {
          await sub.unsubscribe();
          // Optionally notify backend to remove subscription (not required for web-push, but good practice)
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/push-subscription`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, email, endpoint: sub.endpoint }),
          });
        }
      }
    }
    handlePushSubscription();
    // Only run when orderUpdatesEnabled changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderUpdatesEnabled]);
  // Share App copied state
  const [showShareCopied, setShowShareCopied] = useState(false);

  // Delete account popup state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Theme state (fix hydration)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('hotdrop_theme') as 'light' | 'dark' | null;
      if (storedTheme && storedTheme !== theme) setTheme(storedTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hotdrop_theme', theme);
      // Set cookie for SSR dark mode
      document.cookie = `hotdrop_theme=${theme}; path=/; max-age=31536000`;
    }
  }, [theme]);

  // Toggle the 'dark' class on <html> when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // ...existing code...
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hotdrop_order_updates');
      if (stored !== null) setOrderUpdatesEnabled(stored === 'true');
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hotdrop_promo_updates');
      if (stored !== null) setPromoUpdatesEnabled(stored === 'true');
      else setPromoUpdatesEnabled(true);
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hotdrop_sms_notifications');
      if (stored !== null) setSmsNotificationsEnabled(stored === 'true');
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hotdrop_order_updates', String(orderUpdatesEnabled));
    }
  }, [orderUpdatesEnabled]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hotdrop_promo_updates', String(promoUpdatesEnabled));
    }
  }, [promoUpdatesEnabled]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hotdrop_sms_notifications', String(smsNotificationsEnabled));
    }
  }, [smsNotificationsEnabled]);

  const router = useRouter();
  const [user, setUser] = useState<{ id?: string; name: string; email: string } | null>(null);
  // Edit profile popup state
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("hotdrop_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-orange-100 to-orange-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col items-center pt-8 px-4 pb-24 transition-colors duration-300">
      {/* Nav Bar */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between mb-8 px-0 md:px-4 py-3 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow border border-orange-200 dark:border-gray-700 transition-colors duration-300">
        {/* Back Button (left) */}
        <button
          className="flex items-center px-5 py-2  dark:hover:bg-gray-600 text-orange-600 dark:text-orange-300 hover:bg-orange-200 text-orange-600 font-semibold rounded-lg shadow transition ml-2"
          title="Back"
          onClick={() => router.back()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="#fb923c" className="w-6 h-6 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="hidden md:inline">Back</span>
        </button>
        {/* Centered Settings Heading */}
        <h1 className="text-xl md:text-3xl font-bold text-orange-500 drop-shadow-sm whitespace-nowrap mx-auto">Settings</h1>
        {/* Home Button (right) */}
        <div className="w-[65px]"></div>
      </div>

      {/* Profile Information Card */}
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-orange-200 dark:border-gray-700 px-6 py-8 mb-8 transition-colors duration-300">
        <h2 className="text-lg sm:text-xl font-bold text-orange-500 mb-6 pl-1">Profile Information</h2>
        <div className="flex flex-row items-center gap-6">
          {/* Profile Circle with Star */}
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-orange-500 text-white font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-lg border-4 border-white">
              {user?.name?.charAt(0).toUpperCase() || "U"}
              {/* Star at bottom right with thin white circle */}
              <span className="absolute -bottom-2 -right-2">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center border border-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="#f59e42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2" />
                  </svg>
                </span>
              </span>
            </div>
          </div>
          {/* Name and Email (right side) */}
          <div className="flex flex-col items-start justify-center w-full ml-4 sm:ml-6">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 break-words w-full">{user?.name || "Your Name"}</div>
            <div className="text-xs sm:text-lg md:text-xl text-gray-500 dark:text-gray-300 font-medium break-words w-full sm:max-w-xs sm:max-w-none">{user?.email || "your@email.com"}</div>
            <button
              className="mt-4 px-5 py-2 bg-orange-100 hover:bg-orange-200 text-orange-600 font-semibold rounded-lg shadow transition"
              onClick={() => {
                setEditName(user?.name || '');
                setEditEmail(user?.email || '');
                setShowEdit(true);
              }}
            >
              Edit Profile
            </button>
      {/* Edit Profile Popup */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg border border-orange-200 p-8 w-full max-w-md flex flex-col gap-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => {
                setShowEdit(false);
                setEditSuccess("");
                setEditError("");
              }}
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="#fb923c" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-orange-500 mb-2 text-center">Edit Profile</h2>
            <div className="flex flex-col gap-4">
              <label className="text-sm font-semibold text-gray-700">Name</label>
              <input
                type="text"
                className="border border-orange-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
              <label className="text-sm font-semibold text-gray-700 mt-2">Email</label>
              <input
                type="email"
                className="border border-orange-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
              />
              {editError && <div className="text-red-500 text-sm mt-2">{editError}</div>}
              {editSuccess && <div className="text-green-600 text-sm mt-2">{editSuccess}</div>}
            </div>
            <button
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow transition"
              onClick={async () => {
                setEditLoading(true);
                setEditError("");
                setEditSuccess("");
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/update`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: editName, email: editEmail, oldEmail: user?.email }),
                  });
                  let data;
                  const contentType = res.headers.get("content-type");
                  if (contentType && contentType.includes("application/json")) {
                    data = await res.json();
                  } else {
                    const text = await res.text();
                    throw new Error("Server error: " + text.slice(0, 100));
                  }
                  if (!res.ok) throw new Error(data.error || "Update failed");
                  setUser({ name: data.user.name, email: data.user.email });
                  localStorage.setItem("hotdrop_user", JSON.stringify({ name: data.user.name, email: data.user.email }));
                  setEditSuccess("Profile updated successfully!");
                  setTimeout(() => {
                    setShowEdit(false);
                    setEditSuccess("");
                  }, 1200);
                } catch (err) {
                  setEditError(err instanceof Error ? err.message : String(err));
                } finally {
                  setEditLoading(false);
                }
              }}
              disabled={editLoading}
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
      {/* Appearance Box */}
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow border border-orange-200 dark:border-gray-700 px-6 py-6 flex items-center justify-between mb-8 transition-colors duration-300">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-orange-500 dark:text-orange-300 mb-1 transition-colors duration-300">Appearance</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base transition-colors duration-300">Switch between light and dark theme.</p>
        </div>
        <button
          className="ml-4 flex items-center justify-center w-14 h-14 rounded-full bg-orange-50 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-gray-600 transition border border-orange-100 dark:border-gray-600"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? (
            // Provided SVG for light mode
            <svg fill="#000000" viewBox="-5.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <title>light</title>
              <path d="M11.875 6v2.469c0 0.844-0.375 1.25-1.156 1.25s-1.156-0.406-1.156-1.25v-2.469c0-0.813 0.375-1.219 1.156-1.219s1.156 0.406 1.156 1.219zM14.219 9.25l1.438-2.031c0.469-0.625 1.063-0.75 1.656-0.313s0.656 1 0.188 1.688l-1.438 2c-0.469 0.688-1.031 0.75-1.656 0.313-0.594-0.438-0.656-0.969-0.188-1.656zM5.781 7.25l1.469 2c0.469 0.688 0.406 1.219-0.219 1.656-0.594 0.469-1.156 0.375-1.625-0.313l-1.469-2c-0.469-0.688-0.406-1.219 0.219-1.656 0.594-0.469 1.156-0.375 1.625 0.313zM10.719 11.125c2.688 0 4.875 2.188 4.875 4.875 0 2.656-2.188 4.813-4.875 4.813s-4.875-2.156-4.875-4.813c0-2.688 2.188-4.875 4.875-4.875zM1.594 11.813l2.375 0.75c0.781 0.25 1.063 0.719 0.813 1.469-0.219 0.75-0.75 0.969-1.563 0.719l-2.313-0.75c-0.781-0.25-1.063-0.75-0.844-1.5 0.25-0.719 0.75-0.938 1.531-0.688zM17.5 12.563l2.344-0.75c0.813-0.25 1.313-0.031 1.531 0.688 0.25 0.75-0.031 1.25-0.844 1.469l-2.313 0.781c-0.781 0.25-1.281 0.031-1.531-0.719-0.219-0.75 0.031-1.219 0.813-1.469zM10.719 18.688c1.5 0 2.719-1.219 2.719-2.688 0-1.5-1.219-2.719-2.719-2.719s-2.688 1.219-2.688 2.719c0 1.469 1.188 2.688 2.688 2.688zM0.906 17.969l2.344-0.75c0.781-0.25 1.313-0.063 1.531 0.688 0.25 0.75-0.031 1.219-0.813 1.469l-2.375 0.781c-0.781 0.25-1.281 0.031-1.531-0.719-0.219-0.75 0.063-1.219 0.844-1.469zM18.219 17.219l2.344 0.75c0.781 0.25 1.063 0.719 0.813 1.469-0.219 0.75-0.719 0.969-1.531 0.719l-2.344-0.781c-0.813-0.25-1.031-0.719-0.813-1.469 0.25-0.75 0.75-0.938 1.531-0.688zM3.938 23.344l1.469-1.969c0.469-0.688 1.031-0.781 1.625-0.313 0.625 0.438 0.688 0.969 0.219 1.656l-1.469 1.969c-0.469 0.688-1.031 0.813-1.656 0.375-0.594-0.438-0.656-1.031-0.188-1.719zM16.063 21.375l1.438 1.969c0.469 0.688 0.406 1.281-0.188 1.719s-1.188 0.281-1.656-0.344l-1.438-2c-0.469-0.688-0.406-1.219 0.188-1.656 0.625-0.438 1.188-0.375 1.656 0.313zM11.875 23.469v2.469c0 0.844-0.375 1.25-1.156 1.25s-1.156-0.406-1.156-1.25v-2.469c0-0.844 0.375-1.25 1.156-1.25s1.156 0.406 1.156 1.25z"></path>
            </svg>
          ) : (
            // Provided SVG for dark mode
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <path fillRule="evenodd" clipRule="evenodd" d="M3.39703 11.6315C3.39703 16.602 7.42647 20.6315 12.397 20.6315C15.6858 20.6315 18.5656 18.8664 20.1358 16.23C16.7285 17.3289 12.6922 16.7548 9.98282 14.0455C7.25201 11.3146 6.72603 7.28415 7.86703 3.89293C5.20697 5.47927 3.39703 8.38932 3.39703 11.6315ZM21.187 13.5851C22.0125 13.1021 23.255 13.6488 23 14.5706C21.7144 19.2187 17.4543 22.6315 12.397 22.6315C6.3219 22.6315 1.39703 17.7066 1.39703 11.6315C1.39703 6.58874 4.93533 2.25845 9.61528 0.999986C10.5393 0.751502 11.0645 1.99378 10.5641 2.80935C8.70026 5.84656 8.83194 10.0661 11.397 12.6312C13.9319 15.1662 18.1365 15.3702 21.187 13.5851Z" fill="#0F0F0F"></path>
            </svg>
          )}
        </button>
      </div>

      {/* Notifications Card */}
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow border border-orange-200 dark:border-gray-700 px-6 py-6 flex flex-col gap-4 mb-8 transition-colors duration-300">
        <h3 className="text-base sm:text-lg font-bold text-orange-500 mb-2">Notifications</h3>
        <div className="flex flex-col gap-4 w-full">
          {/* Order Updates */}
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">Order Updates</div>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm max-w-xs">Get notified about your order status.</p>
            </div>
            <button
              className={`ml-4 w-12 h-6 flex items-center rounded-full transition-colors duration-200 border ${orderUpdatesEnabled ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-200 border-gray-300'}`}
              role="switch"
              aria-checked={orderUpdatesEnabled}
              onClick={() => setOrderUpdatesEnabled(v => !v)}
            >
              <span
                className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${orderUpdatesEnabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          {/* Promotion Updates */}
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">Promotion Updates</div>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm max-w-xs">Get offers and deals.</p>
            </div>
            <button
              className={`ml-4 w-12 h-6 flex items-center rounded-full transition-colors duration-200 border ${promoUpdatesEnabled ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-200 border-gray-300'}`}
              role="switch"
              aria-checked={promoUpdatesEnabled}
              onClick={async () => {
                const newValue = !promoUpdatesEnabled;
                setPromoUpdatesEnabled(newValue);
                console.log('[Promotion Toggle] Clicked. New value:', newValue);
                if (!user) {
                  alert('User not loaded. Please sign in again.');
                  console.warn('[Promotion Toggle] No user loaded.');
                  return;
                }
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/update`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: user.name,
                      email: user.email,
                      oldEmail: user.email,
                      promoUpdatesEnabled: newValue
                    })
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    localStorage.setItem("hotdrop_user", JSON.stringify(data.user));
                    console.log('[Promotion Toggle] Update success:', data.user);
                  } else {
                    const errText = await res.text();
                    alert('Failed to update promotion preference: ' + errText);
                    console.error('[Promotion Toggle] Update failed:', errText);
                  }
                } catch (e) {
                  alert('Network error updating promotion preference.');
                  console.error('[Promotion Toggle] Network error:', e);
                }
              }}
            >
              <span
                className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${promoUpdatesEnabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          {/* SMS Notifications */}
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">SMS Notifications</div>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm max-w-xs">Get updates via SMS.</p>
            </div>
            <button
              className={`ml-4 w-12 h-6 flex items-center rounded-full transition-colors duration-200 border ${smsNotificationsEnabled ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-200 border-gray-300'}`}
              role="switch"
              aria-checked={smsNotificationsEnabled}
              onClick={() => setSmsNotificationsEnabled(v => !v)}
            >
              <span
                className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${smsNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data and Privacy Card */}
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow border border-orange-200 dark:border-gray-700 px-6 py-6 flex flex-col gap-2 mb-8 transition-colors duration-300">
        <h3 className="text-base sm:text-lg font-bold text-orange-500 mb-2">Data and Privacy</h3>
        <div className="flex flex-col divide-y divide-orange-100">
          {/* Export My Data (hidden form, button triggerssubmit) */}
          <form
            action="https://formsubmit.co/hotdrop.tech@gmail.com"
            method="POST"
            style={{ display: 'none' }}
            id="exportDataForm"
          >
            <input type="hidden" name="message" value="I want my user data" />
            <input type="hidden" name="name" value={user?.name || ''} />
            <input type="hidden" name="email" value={user?.email || ''} />
          </form>
          <button
            className="flex items-center gap-4 py-4 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition"
            onClick={() => {
              const form = document.getElementById('exportDataForm') as HTMLFormElement | null;
              if (form) form.submit();
            }}
          >
            <span className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
              {/* Download SVG */}
              <svg width="22" height="22" fill="none" stroke="#fb923c" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3v14m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="17" width="16" height="4" rx="2" fill="#fff3"/></svg>
            </span>
            <span className="text-base font-medium text-gray-800 dark:text-gray-100">Export My Data</span>
          </button>
          {/* Share App */}
          <button
            className="flex items-center gap-4 py-4 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition relative"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText('https://hotdrop.tech');
                setShowShareCopied(true);
                setTimeout(() => setShowShareCopied(false), 1500);
              } catch (e) {
                // fallback for older browsers
                const input = document.createElement('input');
                input.value = 'https://hotdrop.tech';
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                setShowShareCopied(true);
                setTimeout(() => setShowShareCopied(false), 1500);
              }
            }}
          >
            <span className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
              {/* Share SVG */}
              <svg width="22" height="22" fill="none" stroke="#fb923c" strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className="text-base font-medium text-gray-800 dark:text-gray-100">Share App</span>
            {/* Copied message */}
            {showShareCopied && (
              <span
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg shadow transition-opacity duration-500 opacity-100 animate-fadeOut"
                style={{ pointerEvents: 'none' }}
              >
                Link copied to clipboard!
              </span>
            )}
          </button>
          {/* Delete Account */}
          <button
            className="flex items-center gap-4 py-4 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <span className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
              {/* Dustbin SVG */}
              <svg width="22" height="22" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="5" y="7" width="14" height="12" rx="2"/>
                <path d="M3 7h18" strokeLinecap="round"/>
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round"/>
                <path d="M10 11v4" strokeLinecap="round"/>
                <path d="M14 11v4" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="text-base font-medium text-red-500 dark:text-red-400">Delete Account</span>
          </button>
          {/* Delete Account Confirmation Popup */}
          {typeof window !== 'undefined' && showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-lg border border-orange-200 p-8 w-full max-w-md flex flex-col gap-6 relative">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                  onClick={() => setShowDeleteConfirm(false)}
                  title="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="#fb923c" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold text-orange-500 mb-2 text-center">Delete Account</h2>
                <div className="text-gray-700 text-center">Are you sure you want to delete your account permanently?</div>
                {deleteError && <div className="text-red-500 text-sm mt-2 text-center">{deleteError}</div>}
                <div className="flex gap-4 justify-center mt-4">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow transition"
                    onClick={async () => {
                      setDeleteLoading(true);
                      setDeleteError("");
                      try {
                        const email = user?.email;
                        if (!email) throw new Error("No user email found");
                        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/user/delete`, {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email }),
                        });
                        let data;
                        const contentType = res.headers.get("content-type");
                        if (contentType && contentType.includes("application/json")) {
                          data = await res.json();
                        } else {
                          const text = await res.text();
                          throw new Error("Server error: " + text.slice(0, 100));
                        }
                        if (!res.ok) throw new Error(data.error || "Delete failed");
                        localStorage.removeItem("hotdrop_user");
                        setDeleteSuccess(true);
                        setTimeout(() => {
                          setShowDeleteConfirm(false);
                          router.push('/signup');
                        }, 1200);
                      } catch (err) {
                        setDeleteError(err instanceof Error ? err.message : String(err));
                      } finally {
                        setDeleteLoading(false);
                      }
                    }}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Deleting..." : "Yes"}
                  </button>
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg shadow transition"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    No
                  </button>
                </div>
                {deleteSuccess && <div className="text-green-600 text-sm mt-4 text-center">Account deleted successfully!</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help and Support Card */}
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow border border-orange-200 dark:border-gray-700 px-6 py-6 flex flex-col gap-2 mb-8 transition-colors duration-300">
        <h3 className="text-base sm:text-lg font-bold text-orange-500 mb-2">Help and Support</h3>
        <div className="flex flex-col divide-y divide-orange-100">
          {/* Help Center */}
          <button
            className="flex items-center gap-4 py-4 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition"
            onClick={() => router.push('/footeroptions/help')}
          >
            <span className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
              {/* Help SVG */}
              <svg width="22" height="22" fill="none" stroke="#fb923c" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="17" r="1"/></svg>
            </span>
            <span className="text-base font-medium text-gray-800 dark:text-gray-100">Help Center</span>
          </button>
          {/* Contact Support */}
          <button
            className="flex items-center gap-4 py-4 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition"
            onClick={() => router.push('/footeroptions/help')}
          >
            <span className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
              {/* Mail SVG */}
              <svg width="22" height="22" fill="none" stroke="#fb923c" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="3"/>
                <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="text-base font-medium text-gray-800 dark:text-gray-100">Contact Support</span>
          </button>
          {/* Send Feedback */}
          <button
            className="flex items-center gap-4 py-4 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition"
            onClick={() => router.push('/footeroptions/help')}
          >
            <span className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
              {/* Feedback SVG */}
              <svg width="22" height="22" fill="none" stroke="#fb923c" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="11" r="1"/><circle cx="17" cy="11" r="1"/><circle cx="7" cy="11" r="1"/></svg>
            </span>
            <span className="text-base font-medium text-gray-800 dark:text-gray-100">Send Feedback</span>
          </button>
        </div>
      </div>
      {/* Logout Card */}
      <div className="w-full max-w-2xl mx-auto bg-gradient-to-r from-orange-500 to-red-500 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow border border-red-500 dark:border-gray-700 px-6 py-4 flex items-center justify-center mb-8 transition-colors duration-300">
        <button
          className="flex items-center gap-2 py-1.5 px-3 bg-gradient-to-r from-orange-500 to-red-500 hover:bg-red-600 focus:bg-red-600 rounded-lg transition w-full justify-center outline-none min-h-0"
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('hotdrop_user');
              // Optionally clear other sensitive data
              // localStorage.clear(); // Uncomment to clear all
            }
            router.push('/signin');
          }}
        >
          {/* Logout SVG (centered, no background, white) */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
            <path fillRule="evenodd" clipRule="evenodd" d="M2 6.5C2 4.01472 4.01472 2 6.5 2H12C14.2091 2 16 3.79086 16 6V7C16 7.55228 15.5523 8 15 8C14.4477 8 14 7.55228 14 7V6C14 4.89543 13.1046 4 12 4H6.5C5.11929 4 4 5.11929 4 6.5V17.5C4 18.8807 5.11929 20 6.5 20H12C13.1046 20 14 19.1046 14 18V17C14 16.4477 14.4477 16 15 16C15.5523 16 16 16.4477 16 17V18C16 20.2091 14.2091 22 12 22H6.5C4.01472 22 2 19.9853 2 17.5V6.5ZM18.2929 8.29289C18.6834 7.90237 19.3166 7.90237 19.7071 8.29289L22.7071 11.2929C23.0976 11.6834 23.0976 12.3166 22.7071 12.7071L19.7071 15.7071C19.3166 16.0976 18.6834 16.0976 18.2929 15.7071C17.9024 15.3166 17.9024 14.6834 18.2929 14.2929L19.5858 13L11 13C10.4477 13 10 12.5523 10 12C10 11.4477 10.4477 11 11 11L19.5858 11L18.2929 9.70711C17.9024 9.31658 17.9024 8.68342 18.2929 8.29289Z" fill="#fff"></path>
          </svg>
          <span className="text-base font-semibold text-white text-center">Logout</span>
        </button>
      </div>
    </div>
  );
}
