"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MdError, MdCheckCircle, MdClose } from "react-icons/md";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { app } from "../../lib/firebase";

type NotificationType = {
  message: string;
  type: 'success' | 'error' | 'info';
};

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any | null>(null);
  const recaptchaRef = useRef<any>(null);
  const auth = getAuth(app);

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.push("/");
    }
  }, [router]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    if (type !== 'success') {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleUserAuthentication = async (user: any) => {
    try {
      const trimmedName = name.trim();
      const nameParts = trimmedName.split(/\s+/).filter(Boolean);
      const firstname = nameParts[0] || trimmedName;
      const lastname = nameParts.slice(1).join(" ") || "NA";

      const payload: any = {
        firstname,
        lastname,
        phone: user.phoneNumber,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/otp-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: 'include', // allow backend to set HttpOnly cookie
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }

      if (!data.user || !data.user.id) {
        throw new Error("No user data received from backend");
      }

      // Store userId and other user data
      localStorage.setItem("user", JSON.stringify(data.user));

      showNotification("Welcome back! Redirecting...", 'success');

      // Redirect after success
      setTimeout(() => {
        router.push("/");
      }, 1500);

    } catch (error: any) {
      console.error("Backend authentication error:", error);
      showNotification(error.message, 'error');
      throw error;
    }
  };

  const setupRecaptcha = () => {
    // Reuse existing verifier when present
    if (recaptchaRef.current) return recaptchaRef.current;

    // Ensure the container is empty to avoid "already been rendered" errors
    try {
      const container = typeof document !== 'undefined' && document.getElementById('recaptcha-container');
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    } catch (e) {
      // ignore DOM cleanup errors
    }

    recaptchaRef.current = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        }
      }
    );

    return recaptchaRef.current;
  };

  // Clear recaptcha verifier on unmount to avoid duplicate renders
  useEffect(() => {
    return () => {
      if (recaptchaRef.current) {
        try {
          recaptchaRef.current.clear();
        } catch (e) {}
        recaptchaRef.current = null;
      }
    };
  }, []);

  const validatePhoneNumber = (phoneNumber: string) => {
    // Simple validation - check if it starts with + and has digits
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      showNotification('Please enter a valid phone number in international format (e.g., +1234567890)', 'error');
      return false;
    }
    return true;
  };

  const sendOtp = async () => {
    try {
      if (!name.trim()) {
        showNotification('Please enter your name', 'error');
        return;
      }

      if (!validatePhoneNumber(phone)) return;
      
      setSendingOtp(true);
      
      const verifier = setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(confirmation);
      showNotification(`OTP sent to ${phone}`, 'success');
      
      // Reset OTP field
      setOtp("");
    } catch (err: any) {
      console.error('Send OTP error:', err);
      
      let errorMessage = "Failed to send OTP";
      if (err.code === 'auth/invalid-phone-number') {
        errorMessage = "Invalid phone number format";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Too many requests. Please try again later.";
      } else if (err.code === 'auth/quota-exceeded') {
        errorMessage = "SMS quota exceeded. Please try again later.";
      } else {
        errorMessage = err?.message || errorMessage;
      }
      
      showNotification(errorMessage, 'error');
      
      // Clean up recaptcha on error
      if (recaptchaRef.current) {
        try {
          recaptchaRef.current.clear();
        } catch (e) {}
        recaptchaRef.current = null;
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    try {
      if (!confirmationResult) {
        showNotification('Please request OTP first', 'error');
        return;
      }
      
      if (!otp || otp.length !== 6) {
        showNotification('Please enter a valid 6-digit OTP', 'error');
        return;
      }
      
      setVerifyingOtp(true);
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      await handleUserAuthentication(user);
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      
      let errorMessage = "OTP verification failed";
      if (err.code === 'auth/invalid-verification-code') {
        errorMessage = "Invalid OTP code";
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = "Invalid credentials";
      } else if (err.code === 'auth/expired-action-code') {
        errorMessage = "OTP has expired. Please request a new one.";
      } else {
        errorMessage = err?.message || errorMessage;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Background Image with Parallax Effect */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20000ms] hover:scale-110"
        style={{
          backgroundImage: "url('/catt1.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      </div>

      {/* Notification Toast */}
      {notification && (
        <div 
          className={`fixed top-8 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 font-medium animate-slideDown ${
            notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-white/90 backdrop-blur-md text-slate-800'
          }`}
        >
          {notification.type === 'success' && <MdCheckCircle size={20} className="text-green-600" />}
          {notification.type === 'error' && <MdError size={20} className="text-red-600" />}
          {notification.message}
        </div>
      )}

      <div className="relative z-10 w-full max-w-[440px] animate-fadeIn">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full p-8 relative overflow-hidden">
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full -ml-12 -mb-12" />
          
          <button
            onClick={() => {
              setConfirmationResult(null);
              setPhone("+91");
              setOtp("");
            }}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Reset OTP form"
          >
            <MdClose size={20} className="text-slate-500" />
          </button>
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-4 mb-8 relative">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-400 p-0.5 shadow-lg">
              <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Satyam Careers"
                  width={40}
                  height={40}
                  className="w-8 h-8 object-contain"
                  priority
                />
              </div>
            </div>
            <div>
              <p className="font-bold text-xl text-slate-900 leading-tight">
                Satyam Careers
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                Financial Recruitment Platform
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Secure Login
            </span>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome back
            </h1>
            
            <p className="text-sm text-slate-600 mb-4">
              Sign in with your mobile number and OTP
            </p>
            
            {/* <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <MdSecurity size={20} className="text-slate-400 flex-shrink-0" />
              <p className="text-xs text-slate-500">
                Your information is encrypted and securely stored
              </p>
            </div> */}
          </div>

          <>
              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={sendingOtp || verifyingOtp}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Phone Number Input */}
              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  disabled={sendingOtp || verifyingOtp}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
               
              </div>

              <button
                onClick={sendOtp}
                disabled={sendingOtp || !phone}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingOtp ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>

              {/* OTP Input */}
              {confirmationResult && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    disabled={verifyingOtp}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-50 text-center text-lg tracking-widest"
                  />
                  <button
                    onClick={verifyOtp}
                    disabled={verifyingOtp || otp.length !== 6}
                    className="w-full mt-3 h-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyingOtp ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Login"
                    )}
                  </button>
                </div>
              )}
          </>

          {/* reCAPTCHA Container - Invisible */}
          <div id="recaptcha-container" className="hidden" />

          {/* Terms and Privacy */}
          <p className="text-xs text-center text-slate-400 mt-6">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-orange-500 hover:underline font-medium">
              Terms of Service
            </a>{' '}
            .
          </p>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;