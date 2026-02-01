"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Heart } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>; 
};

const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
};

const isAndroid = () => {
  if (typeof window === 'undefined') return false;
  return /android/i.test(window.navigator.userAgent);
};

const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
};

export function Footer() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [email, setEmail] = useState('');
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    setInstalled(isStandalone());

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }

    if (isStandalone()) {
      return;
    }

    if (isIOS()) {
      return;
    }

    if (isAndroid()) {
      return;
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      console.log('Newsletter signup:', email);
      alert('Thanks for subscribing!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-gray-700 rounded-full flex items-center justify-center shadow-lg">
                <img src="/logo.svg" alt="SleekRoad Logo" className="w-8 h-8 invert" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">SleekRoad</h2>
                {/* <p className="text-sm text-green-600 font-medium">Campus Marketplace</p> */}
              </div>
            </div>
            
            <p className="text-gray-600 text-lg font-bold leading-relaxed">
             <b>Buy.Sell.Connect</b>
            </p>
            
            {/* <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-green-100 hover:text-green-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-pink-100 hover:text-pink-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div> */}
          </div>

          <div className='grid grid-cols-2 w-full'>
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Marketplace</h3>
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/allitems" 
                    className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-green-500"></span>
                    Browse Items
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-green-500"></span>
                    Sell Items
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/allitems?category=Services" 
                    className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-green-500"></span>
                    Services
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/comp/help" 
                    className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-green-500"></span>
                    Help & Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Company</h3>
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/comp/about" 
                    className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-green-500"></span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/comp/privacy" 
                    className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-green-500"></span>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/comp/terms" 
                    className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-red-500"></span>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/comp/careers" 
                    className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-red-500"></span>
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

          </div>
          {/* Newsletter & Contact */}
          <div className="space-y-6">
            {/* <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stay Updated</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get the latest deals and campus marketplace updates.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            </div> */}

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">sleekroadhelp@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-600 text-sm">
              <p>
                &copy; {new Date().getFullYear()} SleekRoad. All rights reserved. Made with <Heart className="w-4 h-4 inline fill-red-500 text-red-500" /> for campus communities.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <button
                onClick={handleInstallClick}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-medium shadow-sm hover:from-green-600 hover:to-green-700 transition-all hover:shadow-md"
              >
                Download App
              </button>
              
              {/* <div className="flex gap-4 text-sm text-gray-600">
                <Link href="/comp/cookies" className="hover:text-green-600 transition-colors">
                  Cookies
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="/comp/sitemap" className="hover:text-green-600 transition-colors">
                  Sitemap
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}