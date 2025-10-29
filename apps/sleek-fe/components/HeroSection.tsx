import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Search, TrendingUp, Users, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter
// import catImage from '../cat.png';



const stats: { label: string; value: string; icon: React.ComponentType<any>; }[] = [];

export function HeroSection({ onSearch, onCategorySelect }: { onSearch: (query: string) => void; onCategorySelect: (category: string) => void; }) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter(); // Initialize useRouter

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

  return (
    <section className="relative py-12 lg:py-12 overflow-hidden bg-white">

      <div className="container mx-auto px-4 relative z-10">
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
    </section>
  );
}