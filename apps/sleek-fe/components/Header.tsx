"use client"

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '../firebase/AuthProvider';
import { 
  Search, 
  Plus, 
  ShoppingBag,
  Zap,
  Bell,
  Home,
  Tag,
  Users,
  Heart,
  Settings,
  LogOut,
  ChevronDown,
  Package,
  BarChart3,
  User,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export function Header({ notificationCount = 0 }: { notificationCount?: number; }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOutUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(notificationCount);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSearch = (e?: any) => {
    if (e?.preventDefault) e.preventDefault();

    const categories = [
      'All Categories',
      'Clothes',
      'Shoes',
      'Books',
      'Tech Products',
      'Electronics',
      'Instruments',
      'Tutoring & Services',
      'Others'
    ];

    const matchedCategory = categories.find(
      (category) => category.toLowerCase() === searchQuery.toLowerCase()
    );

    if (matchedCategory) {
      router.push(`/allitems?category=${encodeURIComponent(matchedCategory)}`);
    } else if (searchQuery.trim()) {
      router.push(`/allitems?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/allitems');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(target)) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Close search on mobile when clicking outside
  useEffect(() => {
    if (isSearchExpanded) {
      const handleClickOutsideSearch = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('.search-container') && !target.closest('.search-toggle')) {
          setIsSearchExpanded(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutsideSearch);
      return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
    }
  }, [isSearchExpanded]);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/allitems') return pathname.startsWith('/allitems');
    return pathname === href;
  };

  // Sync header search with /allitems query param
  useEffect(() => {
    if (pathname?.startsWith('/allitems')) {
      const s = searchParams.get('search') || '';
      setSearchQuery(s);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(notificationCount);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('toUserId', '==', user.uid),
      where('read', '==', false)
    );

    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    });

    return () => unsub();
  }, [user?.uid, notificationCount]);
  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex h-14 md:h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-green-800 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <img 
                  src="/logo.svg" 
                  alt="SleekRoad Logo" 
                  className="w-6 h-6 md:w-8 md:h-8 invert" 
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                SleekRoad
              </span>
              <span className="text-xs text-green-600 font-medium hidden md:block">
                Campus Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation & Search */}
          <div className="hidden md:flex items-center gap-8 flex-1 max-w-2xl mx-8">
            <nav className="flex items-center gap-6">
              <Link 
                href="/allitems" 
                className={`text-sm font-medium transition-colors ${isActive('/allitems') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}`}
              >
                Browse
              </Link>
              <Link 
                href="/trending" 
                className={`text-sm font-medium transition-colors ${isActive('/trending') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}`}
              >
                Trending
              </Link>
              <div
                ref={categoriesRef}
                onMouseEnter={() => {
                  if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
                  setIsCategoriesOpen(true);
                }}
                onMouseLeave={() => {
                  closeTimeoutRef.current = window.setTimeout(() => setIsCategoriesOpen(false), 250);
                }}
                onFocus={() => {
                  if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
                  setIsCategoriesOpen(true);
                }}
                onBlur={() => {
                  closeTimeoutRef.current = window.setTimeout(() => setIsCategoriesOpen(false), 250);
                }}
                className="relative"
              >
                <button
                  onClick={() => setIsCategoriesOpen((s) => !s)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setIsCategoriesOpen(false); }}
                  className={`text-sm font-medium transition-colors flex items-center gap-1 ${isCategoriesOpen ? 'text-green-600' : 'text-gray-700 hover:text-green-600'}`}
                >
                  Categories
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isCategoriesOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg p-2 z-50">
                    {[
                      'All Categories',
                      'Clothes',
                      'Shoes',
                      'Books',
                      'Tech Products',
                      'Electronics',
                      'Instruments',
                      'Tutoring & Services',
                      'Others'
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setIsCategoriesOpen(false);
                          router.push(`/allitems?category=${encodeURIComponent(cat)}`);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search electronics, books, fashion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 pr-4 h-11 bg-gray-50/50 border-gray-200 rounded-xl hover:bg-gray-100/50 focus:bg-white transition-all text-sm"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Search Toggle */}
            <button
              className="md:hidden search-toggle p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Sell Button */}
            {user && (
              <Link href="/dashboard">
                <Button 
                  className="gap-2 px-4 md:px-6 h-10 bg-green-100 hover:bg-green-500 text-green-800 shadow-sm hover:shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline font-semibold">Sell</span>
                </Button>
              </Link>
            )}

            {/* Notification Badge */}
            <button
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => router.push('/inbox')}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Avatar className="w-8 h-8 border-2 border-green-500/20">
                    {user.photoURL ? (
                      <AvatarImage src={user.photoURL} alt="avatar" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-700 text-white font-semibold">
                        {userInitial}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            {user.photoURL ? (
                              <AvatarImage src={user.photoURL} alt="avatar" />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-700 text-white text-lg">
                                {userInitial}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900">{user.displayName || user.email}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link href="/inbox">
                          <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">Inbox</span>
                          </div>
                        </Link>
                        <Link href="/profile">
                          <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <User className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">My Profile</span>
                          </div>
                        </Link>
                        <Link href="/dashboard">
                          <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <BarChart3 className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">Dashboard</span>
                          </div>
                        </Link>
                        <Link href="/wishlist">
                          <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <Heart className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">Wishlist</span>
                          </div>
                        </Link>
                        {/* <Link href="/settings">
                          <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <Settings className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">Settings</span>
                          </div>
                        </Link> */}
                      </div>

                      <div className="p-4 border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
                        >
                          <LogOut className="w-5 h-5" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/signin">
                <Button 
                  variant="outline" 
                  className="font-semibold border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            {/* Mobile menu removed - using header actions only */}
          </div>
        </div>

        {/* Mobile Expanded Search */}
        <AnimatePresence>
          {isSearchExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden search-container overflow-hidden"
            >
              <div className="py-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search for anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-12 pr-4 h-12 bg-gray-50 border-gray-200 rounded-xl text-base"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile sliding menu removed - navigation is accessible via header links */}
    </header>
  );
}