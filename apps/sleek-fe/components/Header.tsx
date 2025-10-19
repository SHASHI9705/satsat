import { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '../firebase/AuthProvider';
import { 
  Search, 
  Plus, 
  Menu,
  ShoppingBag,
  Zap
} from 'lucide-react';

export function Header({ notificationCount = 0 }: { notificationCount?: number; }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  return (
    <header className="sticky py-2 top-0 z-50 w-full backdrop-blur-lg supports-[backdrop-filter]:bg-white ">
      <div className="container mx-auto px-4">
        <div className="flex h-18 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">SR</span>
              </div>
              <span className="brand-title text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                SleekRoad
              </span>
            </div>
            <Badge variant="secondary" className="hidden sm:flex gap-1.5 px-3 py-1 bg-green-50 text-green-700 border-green-200">
              <Zap className="w-3.5 h-3.5" />
              Verified
            </Badge>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-6 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-gray-600 transition-colors" />
              <Input
                placeholder="Search electronics, books, furniture, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-11 w-full bg-gray-50 border-gray-200 rounded-xl hover:bg-gray-100 focus:bg-white transition-all duration-200 text-base"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/sell">
              <Button type="button" aria-label="Sell an item" variant="black" className="gap-2 px-6 py-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline font-semibold">Sell Item</span>
              </Button>
            </Link>

            <div className="hidden sm:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-4">
                  <Avatar className="w-9 h-9 border border-black">
                    {user.photoURL ? <AvatarImage src={user.photoURL} alt="avatar" /> : <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>}
                  </Avatar>
                </div>
              ) : (
                <>
                  <Link href="/signin">
                    <Button variant="outline" className="font-semibold border-2 hover:bg-gray-900 hover:text-white transition-all duration-200">Login</Button>
                  </Link>
                </>
              )}
            </div>

            <Link href="/browse">
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="pb-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search marketplace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
}