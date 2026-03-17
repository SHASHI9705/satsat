"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { MdSecurity } from "react-icons/md";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "../../lib/firebase";

const LoginPage: React.FC = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [googleTermsAccepted, setGoogleTermsAccepted] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    console.log("Retrieved user from localStorage:", user);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
		  name: user.displayName,
  		  photoURL: user.photoURL,
        }),
      });

      const data = await res.json();
      console.log("Backend response user:", data.user);
      if (!res.ok) throw new Error(data.error || "Google sign in failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      setNotification("Welcome");
      setTimeout(() => window.location.href = "/", 1500);
    } catch (err: any) {
      setNotification(err?.message || "Google sign in failed");
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20000ms] hover:scale-110"
        style={{
          backgroundImage: "url('/catt1.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[4px]" />
      </div>

      {notification && (
        <div className="fixed top-8 px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 font-semibold bg-white/90 backdrop-blur-md text-black">
          {notification}
        </div>
      )}

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative z-10">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Satyam Careers"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-slate-900 leading-tight">
                Satyam Careers
              </p>
              <p className="text-xs text-slate-400">
                Financial Recruitment Platform
              </p>
            </div>
          </div>

          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Login
            </span>
            <h1 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in with your Google account to continue</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <MdSecurity size={20} className="text-slate-400" />
              <p className="text-xs text-slate-400">Your information is safe with us</p>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            disabled={googleLoading}
          >
            <FcGoogle size={18} />
            {googleLoading ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
