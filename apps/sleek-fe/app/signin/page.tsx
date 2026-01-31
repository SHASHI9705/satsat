"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { auth, provider } from '../../firebase/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Shield, ChevronLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignInPage({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const [notification, setNotification] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [requiresTerms, setRequiresTerms] = useState(true);
  const [googleTermsAccepted, setGoogleTermsAccepted] = useState(false);

  useEffect(() => {
    const existingUser = localStorage.getItem("user");
    setRequiresTerms(!existingUser);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      if (requiresTerms && !googleTermsAccepted) {
        setNotification("Please accept the terms to continue");
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      setGoogleLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          password: Math.random().toString(36).slice(-8),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google sign in failed");
      
      localStorage.setItem("user", JSON.stringify(data.user));
      setNotification('Welcome');
      setTimeout(() => router.push('/'), 1500);
    } catch (err: any) {
      setNotification(err?.message || 'Google sign in failed');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* CAT BACKGROUND TEMPLATE */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20000ms] hover:scale-110"
        style={{ 
          backgroundImage: "url('/catt1.jpeg')",
        }} 
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[4px]" />
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 font-semibold bg-white/90 backdrop-blur-md text-black"
          >
            {notification.includes('Welcome') ? <Sparkles className="w-5 h-5 text-yellow-500" /> : <Shield className="w-5 h-5 text-red-500" />}
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <Card className="border border-white/30 bg-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[3rem] overflow-hidden">
          <div className="p-10 pt-12 flex flex-col items-center">
            {/* SleekRoad Logo */}
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src="/newone.png"
              alt="SleekRoad"
              className="w-25 h-24 mb-6 drop-shadow-2xl object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />

            <h1 className="text-3xl font-black text-white tracking-tight mb-2">SleekRoad</h1>
            <p className="text-white/80 text-sm font-medium mb-10">Campus marketplace, simplified.</p>

            <div className="w-full space-y-6">
              <Button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full h-14 rounded-2xl bg-white hover:bg-white/90 text-black border-0 shadow-xl transition-all flex items-center justify-center gap-4 group"
              >
                {googleLoading ? (
                  <div className="w-6 h-6 border-3 border-black/10 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg viewBox="0 0 48 48" className="w-6 h-6">
                      <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.2 8 3.1l6-6C34.2 3.2 29.4 1 24 1 14.6 1 6.6 6.8 3.4 15l7 5.4C12.2 13.2 17.6 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.5 24c0-1.6-.2-3.1-.5-4.5H24v9h12.7c-1.1 3.2-3.2 5.9-6 7.7l7 5.4c4.1-3.8 6.8-9.4 6.8-15.6z" />
                      <path fill="#FBBC05" d="M10.4 28.4c-1-3.2-1-6.6 0-9.8l-7-5.4c-2.6 5.2-2.6 11.4 0 16.6l7-5.4z" />
                      <path fill="#34A853" d="M24 46.5c5.4 0 10.2-1.8 13.6-4.9l-7-5.4c-2 1.3-4.5 2.1-6.6 2.1-6.4 0-11.8-3.7-14.4-9.1l-7 5.4c3.2 8.2 11.2 14 21 14z" />
                    </svg>
                    <span className="text-base font-bold">Sign in with Google</span>
                  </>
                )}
              </Button>

              {requiresTerms && (
                <div className="flex items-center justify-center gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={googleTermsAccepted}
                    onChange={(e) => setGoogleTermsAccepted(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-white focus:ring-0 transition-all cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-white/60 cursor-pointer">
                    I accept the <a href="/comp/terms" className="text-white hover:underline underline-offset-4">Terms & Privacy</a>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 border-t border-white/10 py-6 text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">
              Secured Access
            </span>
          </div>
        </Card>

        {onBack && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Go Back</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}