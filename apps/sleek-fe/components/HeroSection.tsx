"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Search, TrendingUp, Users, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Card } from './ui/card';



const stats: { label: string; value: string; icon: React.ComponentType<any>; }[] = [];

export function HeroSection({ onSearch, onCategorySelect }: { onSearch: (query: string) => void; onCategorySelect: (category: string) => void; }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [randomItems, setRandomItems] = useState<{ title: string; description: string }[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter(); // Initialize useRouter
  const touchStartX = useRef(0);

  // deterministic seeded RNG (persisted to localStorage) to keep decorations stable across reloads
  function mulberry32(seed: number) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const catTransforms = useMemo(() => {
    const count = 10;
    // try to reuse a seed from localStorage so the layout is stable
    let seed = Date.now() & 0xffffffff;
    try {
      const stored = localStorage.getItem('sleekhub-hero-seed');
      if (stored) seed = Number(stored) || seed;
      else localStorage.setItem('sleekhub-hero-seed', String(seed));
    } catch (e) {
      // localStorage may be unavailable in some environments; fall back to Date.now()
    }
    const randBase = mulberry32(seed);
    const rand = (min: number, max: number) => randBase() * (max - min) + min;
    const positions: { left: number; top: number; angle: number; scale: number }[] = [];
    const minDist = 8; // minimum distance (in percent) between cats
    const centerRect = { left: 25, right: 75, top: 15, bottom: 55 }; // avoid center area

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      while (attempts < 200) {
        const left = Number(rand(2, 98).toFixed(2));
        const top = Number(rand(2, 88).toFixed(2));

        // skip positions that fall inside the central text area
        if (left > centerRect.left && left < centerRect.right && top > centerRect.top && top < centerRect.bottom) {
          attempts++;
          continue;
        }

        // ensure minimum spacing from existing cats
        let ok = true;
        for (const p of positions) {
          const dx = Math.abs(p.left - left);
          const dy = Math.abs(p.top - top);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            ok = false;
            break;
          }
        }

        if (ok) {
          positions.push({ left, top, angle: Math.round(rand(-30, 30)), scale: Number(rand(0.85, 1.15).toFixed(2)) });
          break;
        }

        attempts++;
      }

      // fallback if we couldn't find a spaced position
      if (positions.length <= i) {
        positions.push({ left: Number(rand(2, 98).toFixed(2)), top: Number(rand(2, 88).toFixed(2)), angle: Math.round(rand(-20, 20)), scale: 1 });
      }
    }

    return positions;
  }, []);

  const handleSearch = () => {
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
      router.push(`/allitems?category=${matchedCategory}`);
    } else {
      alert('No category found');
    }
  };

  useEffect(() => {
    const fetchRandomItems = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/all`
        );
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.items)) {
            const randomItems = data.items
              .filter((item) => item) // Ensure item is defined
              .map((item) => ({
                id: item.id,
                title: item.name,
                price: item.discountedPrice,
                originalPrice: item.actualPrice,
                image: item.images?.[0] || '/placeholder-image.png', // Fallback image
                seller: {
                  name: item.user?.name || 'Unknown Seller',
                  rating: (Math.random() * (5 - 4) + 4).toFixed(1), // Random rating between 4 and 5
                  verified: false // Static verified status for now
                },
                category: item.category,
                isFavorited: false // Static favorite status for now
              }))
              .sort(() => 0.5 - Math.random())
              .slice(0, 4); // Get up to 3 random items
            setRandomItems(randomItems);
          } else {
            console.error('API response does not contain a valid items array:', data);
          }
        } else {
          console.error('Failed to fetch random items');
        }
      } catch (error) {
        console.error('Error fetching random items:', error);
      }
    };

    fetchRandomItems();
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchStartX.current - touchEndX > 50) {
      handleSwipe('left');
    } else if (touchEndX - touchStartX.current > 50) {
      handleSwipe('right');
    }
  };

  const handleSwipe = (direction) => {
    if (direction === 'left') {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % randomItems.length);
    } else if (direction === 'right') {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? randomItems.length - 1 : prevIndex - 1
      );
    }
  };

  const handleProductClick = (productId) => {
    router.push(`/selecteditem?id=${productId}`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % randomItems.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [randomItems.length]);

  return (
    <section className=" relative py-4 md:py-12 lg:py-12 overflow-hidden bg-black md:bg-white">

      {/* Existing Hero Section for larger screens */}
      <div className="hidden sm:block container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <Badge className="badge-brand text-black px-4 py-2 text-sm font-medium">
              Campus Marketplace
            </Badge><br></br>

            <h1 className="text-4xl lg:text-7xl font-charlsworth leading-tight mt-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-700">SleekRoad</span> <br></br>
              <span className="text-black">Buy • Connect • Sell</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
               A curated local marketplace for students and campus communities
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
                <div className="flex gap-1 p-2 bg-brand-soft rounded-2xl shadow-lg border">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search for textbooks, laptops, furniture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 border-0 text-lg h-12 focus-visible:ring-0"
                />
              </div>
              <Button 
                type="button"
                aria-label="Search marketplace"
                onClick={handleSearch}
                variant="black"
                className="px-8 h-12 hero-cta"
              >
                Search
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* New Section for phone screens */}
      <div className="block px-4 sm:hidden w-full overflow-hidden">
        
        <h1 className="text-4xl lg:text-7xl font-charlsworth text-center leading-tight mb-4">
          <span className="text-white">Buy • Connect • Sell</span>
        </h1>
        <div className="max-w-2xl mb-4 mx-auto">
                <div className="flex gap-1 p-2 bg-brand-soft rounded-2xl shadow-lg border">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search for textbooks, laptops, furniture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 border-0 text-lg h-12 focus-visible:ring-0"
                />
              </div>
              <Button 
                type="button"
                aria-label="Search marketplace"
                onClick={handleSearch}
                variant="black"
                className="px-8 h-12 hero-cta"
              >
                Search
              </Button>
            </div>
          </div>
        <div
          className="relative w-90 h-96 overflow-hidden rounded-lg"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {randomItems.map((item, index) => (
            <img
              key={index}
              src={item.image}
              alt={item.title}
              onClick={() => handleProductClick(item.id)}
              className={`absolute inset-0 rounded-lg shadow-md w-full h-96 object-fit border border-white transition-opacity duration-300 cursor-pointer ${
                index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />
          ))}
        </div>

        <div className="flex justify-center mt-4 gap-2">
          {randomItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentImageIndex ? 'bg-blue-400' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-one-by-one {
          0% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-100%);
          }
          45% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(-200%);
          }
          70% {
            transform: translateX(-200%);
          }
          75% {
            transform: translateX(-300%);
          }
          95% {
            transform: translateX(-300%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-slide-one-by-one {
          animation: slide-one-by-one 12s infinite;
        }
      `}</style>
    </section>
  );
}