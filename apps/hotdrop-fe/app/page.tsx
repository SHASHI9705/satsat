"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import Nav from "../components/Nav";
import FoodSection, { foodSectionId } from "../components/FoodSection";
import ReviewsSection from "../components/ReviewsSection";
import Footer from "../components/Footer";
import PhoneFooter from "../components/PhoneFooter";
import PopularRestaurantsSection from "../components/PopularRestaurantsSection";
import Loader from "../components/Loader";
import OfferSection from "../components/OfferSection";
import HeroSection from "../components/HeroSection";





export default function Home() {
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        setShowNotificationPrompt(true);
      }
    }
  }, []);

  async function handleNotificationPermission() {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setShowNotificationPrompt(false);
    if (permission === 'granted') {
      // Register service worker and subscribe to push notifications if needed
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const reg = await navigator.serviceWorker.getRegistration('/sw.js') || await navigator.serviceWorker.register('/sw.js');
        const sub = await reg.pushManager.getSubscription();
        if (!sub) {
          // You can add your push subscription logic here
        }
      }
    }
  }
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [showLoader, setShowLoader] = useState(true);
  const router = useRouter();

  const profileRef = useRef<HTMLButtonElement>(null!);
  const dropdownRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    // Redirect to /partner if logged in as partner
    if (typeof window !== "undefined") {
      const partner = localStorage.getItem("hotdrop_partner");
      if (partner) {
        router.replace("/partner");
        return;
      }
    }
    const stored = localStorage.getItem("hotdrop_user");
    if (stored) setUser(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    // Cart count
    const updateCartCount = () => {
      const stored = localStorage.getItem("hotdrop_cart");
      if (stored) {
        try {
          const arr = JSON.parse(stored);
          setCartCount(arr.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0));
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  useEffect(() => {
    // Close dropdown if clicked outside
    if (showDropdown) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          profileRef.current &&
          !profileRef.current.contains(event.target as Node) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setShowDropdown(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  // Loader logic: show loader until page is fully loaded
  useEffect(() => {
    if (!showLoader) return;
    // If already loaded, skip
    if (document.readyState === "complete") {
      setLoadingPercent(100);
      setTimeout(() => setShowLoader(false), 400);
      return;
    }
    // Animate percent to 90% while loading
    let percent = 0;
    const interval = setInterval(() => {
      if (percent < 90) {
        percent += Math.floor(Math.random() * 7) + 2;
        if (percent > 90) percent = 90;
        setLoadingPercent(percent);
      }
    }, 30);
    // Listen for page load
    const handleLoad = () => {
      setLoadingPercent(100);
      setTimeout(() => setShowLoader(false), 400);
      clearInterval(interval);
    };
    window.addEventListener("load", handleLoad);
    return () => {
      clearInterval(interval);
      window.removeEventListener("load", handleLoad);
    };
  }, [showLoader]);

  if (showLoader) {
    return (
      <>
        <Loader />
        <PhoneFooter />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-red-200 to-blue-50 flex flex-col items-center justify-start overflow-x-hidden dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {showNotificationPrompt && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg px-4 py-4 flex flex-col items-center border border-orange-200 dark:border-orange-700 w-[100vw] max-w-xs sm:max-w-md">
            <span className="text-xs md:text-lg font-semibold text-orange-600 dark:text-orange-300 mb-2">Enable notifications for order updates and offers?</span>
            <button
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-bold text-base shadow hover:bg-orange-600 dark:hover:bg-orange-700 transition mt-2"
              onClick={handleNotificationPermission}
            >
              Allow Notifications
            </button>
          </div>
        </div>
      )}
      {/* Navbar */}
      <Nav
        user={user}
        cartCount={cartCount}
        profileRef={profileRef}
        dropdownRef={dropdownRef}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        setShowEditProfile={setShowEditProfile}
        setEditName={setEditName}
        setEditEmail={setEditEmail}
        router={router}
      />
      <main className="w-full max-w-6xl mx-auto flex flex-col items-center dark:from-gray-900 dark:via-gray-950 dark:to-gray-90">
        <HeroSection user={user} cartCount={cartCount} />
        <OfferSection />
        <FoodSection />
        <PopularRestaurantsSection />
        <ReviewsSection />
      </main>
      <Footer />
      <PhoneFooter />
      {showEditProfile && (
        <EditProfileModal
          name={editName}
          email={editEmail}
          setName={setEditName}
          setEmail={setEditEmail}
          onClose={() => {
            setShowEditProfile(false);
            setEditSuccess("");
            setEditError("");
          }}
          onSave={async () => {
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
                setShowEditProfile(false);
                setEditSuccess("");
              }, 1200);
            } catch (err: any) {
              setEditError(err.message);
            } finally {
              setEditLoading(false);
            }
          }}
          loading={editLoading}
          error={editError}
          success={editSuccess}
        />
      )}
    </div>
  );
}

function EditProfileModal({ name, email, setName, setEmail, onClose, onSave, loading, error, success }: {
  name: string;
  email: string;
  setName: (v: string) => void;
  setEmail: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
  error: string;
  success?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-gray-900 dark:bg-opacity-80">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-md flex flex-col items-center relative dark:bg-gray-900 dark:text-orange-200">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl dark:text-gray-500 dark:hover:text-white" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-6 dark:text-orange-400">Edit Profile</h2>
        <div className="w-full flex flex-col gap-4">
          <label className="text-sm font-semibold text-gray-700 dark:text-orange-200">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border p-2 rounded w-full dark:bg-gray-900 dark:text-orange-200 dark:border-orange-700"
          />
          <label className="text-sm font-semibold text-gray-700 dark:text-orange-200">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 rounded w-full dark:bg-gray-900 dark:text-orange-200 dark:border-orange-700"
          />
          {error && <div className="text-red-500 text-sm dark:text-red-400">{error}</div>}
          {success && <div className="text-green-600 text-sm dark:text-green-400">{success}</div>}
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm hover:bg-orange-600 font-semibold mt-4 dark:bg-orange-700 dark:hover:bg-orange-800 dark:text-orange-100"
            onClick={onSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
