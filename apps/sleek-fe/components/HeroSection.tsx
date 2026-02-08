"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { ShoppingBag, User, Recycle, ArrowRight, Star, Shield, TrendingUp, Users, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Span } from 'next/dist/trace';
import Spotlight from './Spotlight';

export function HeroSection({
  onSearch,
  onCategorySelect,
  specificItems = [
    {
      id: '93',
      image: 'https://sleek9705.s3.ap-south-1.amazonaws.com/a00b9401-4c5d-4ec6-8c27-042e0935a494-1000108138.jpg',
      title: 'Portronics Vader Pro Gaming Mouse',
      category: 'Electronics',
      price: 399,
      badge: 'New',
    },
    {
      id: '90',
      image: 'https://sleek9705.s3.ap-south-1.amazonaws.com/c96ef3f7-6847-4e2f-8dec-ee81e0cc26db-1000108122.jpg',
      title: 'Boat Nirvana ION ANC 32db ',
      category: 'Electronics',
      price: 999,
      badge: 'New',
    },
    {
      id: '79',
      image: 'https://sleek9705.s3.ap-south-1.amazonaws.com/2b5742fc-2904-4774-b44f-8cdd02e15a8e-1000080435.jpg',
      title: 'Ac Milan football jersey ',
      category: 'Fashion',
      price: 199,
      badge: 'New',
    },
    {
      id: '81',
      image: 'https://sleek9705.s3.ap-south-1.amazonaws.com/53eeb25d-c16a-4441-8db5-d205a1a7ea89-1000080442.jpg',
      title: 'Khadlaj island Vanilla dunes EDP',
      category: 'Beauty & Personal Care',
      price: 2399,
      badge: 'New',
    },
    {
      id: '98',
      image: 'https://sleek9705.s3.ap-south-1.amazonaws.com/92aadfec-6770-4d37-aead-9025c88efef4-Screenshot_20260130_210525_Amazon.jpg',
      title: 'Gym set 20kg',
      category: 'Sports & Fitness',
      price: 999,
      badge: 'New',
    },
    
  ], 
}: {
  onSearch: (query: string) => void;
  onCategorySelect: (category: string) => void;
  specificItems?: Array<{ id: string; image: string; title: string; category: string; price: number; badge?: string }>;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [randomItems, setRandomItems] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const touchStartX = useRef(0);
  const [carouselIndex, setCarouselIndex] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const interactionTimeoutRef = useRef<number | null>(null);
  const [itemsToShow, setItemsToShow] = useState(5);

  // Carousel Logic
  const pauseAfterInteraction = () => {
    setIsPaused(true);
    if (interactionTimeoutRef.current) window.clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = window.setTimeout(() => setIsPaused(false), 5000);
  };

  const handleNext = () => {
    const visibleCount = Math.min(itemsToShow, randomItems.length || itemsToShow);
    setCarouselIndex((prev) => (prev + 1) % Math.max(visibleCount, 1));
    pauseAfterInteraction();
  };
  const handlePrev = () => {
    const visibleCount = Math.min(itemsToShow, randomItems.length || itemsToShow);
    setCarouselIndex((prev) => (prev - 1 + Math.max(visibleCount, 1)) % Math.max(visibleCount, 1));
    pauseAfterInteraction();
  };
  const getCarouselPosition = (index: number) => {
    const visibleCount = Math.min(itemsToShow, randomItems.length || itemsToShow);
    const position = (index - carouselIndex + visibleCount) % Math.max(visibleCount, 1);
    if (position > visibleCount / 2) return position - visibleCount;
    return position;
  };

  const handleSearch = () => {
    const categories = [
      'All Categories',
      'Clothes',
      'Shoes',
      'Books',
      'Tech Products',
      'Electronics',
      'Instruments',
      'Services',
      'Others'
    ];

    const matchedCategory = categories.find(
      (category) => category.toLowerCase() === searchQuery.toLowerCase()
    );

    if (matchedCategory) {
      router.push(`/allitems?category=${matchedCategory}`);
    } else {
      onSearch(searchQuery);
    }
  };

  useEffect(() => {
    const fetchRandomItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!base) {
          setError('Backend URL not configured');
          setRandomItems([]);
          setLoading(false);
          return;
        }

        const response = await fetch(`${base}/api/item/all`);
        if (!response.ok) {
          const text = await response.text().catch(() => '');
          setError(`Failed to fetch items: ${response.status} ${text}`);
          setLoading(false);
          return;
        }

        const data = await response.json();
        if (!Array.isArray(data.items)) {
          setError('Unexpected API shape');
          setRandomItems([]);
          setLoading(false);
          return;
        }

        const favorites = typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('favorites') || '[]')
          : [];

        const mappedItems = data.items
          .filter((item) => item && !item.sold) // Exclude sold-out items
          .map((item) => ({
            id: item.id,
            title: item.name,
            price: item.discountedPrice,
            originalPrice: item.actualPrice,
            image: item.images?.[0] || '/placeholder-image.png',
            condition: item.condition || item.itemCondition || 'Good',
            seller: {
              name: item.user?.name || 'Unknown Seller',
              verified: false,
            },
            category: item.category,
            tags: item.tags || [],
            description: item.description || '',
            isFavorited: favorites.includes(item.id),
            badge: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'New Arrival' : 'Sale') : undefined,
          }))
          .sort(() => 0.5 - Math.random());

        setAllItems(mappedItems);
        const shuffled = [...mappedItems].sort(() => 0.5 - Math.random()).slice(0, 12);

        setRandomItems(shuffled);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching random items:', err);
        setError('Error fetching items');
        setLoading(false);
      }
    };

    fetchRandomItems();
  }, []);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setItemsToShow(mobile ? 3 : 5);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Auto-advance carousel when not paused
  useEffect(() => {
    const visibleCount = Math.min(itemsToShow, randomItems.length || itemsToShow);
    if (isPaused || visibleCount <= 1) return;
    const id = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % visibleCount);
    }, 4000);
    return () => clearInterval(id);
  }, [isPaused, itemsToShow, randomItems.length]);

  // Cleanup interaction timeout on unmount
  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) window.clearTimeout(interactionTimeoutRef.current);
    };
  }, []);
  const handleProductClick = (productId: string) => {
    router.push(`/selecteditem?id=${productId}`);
  };

  const addToCart = (item: any) => {
    // You can add actual cart logic here
  };

  const toggleFavorite = (productId: string) => {
    if (typeof window === 'undefined') return;
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isFav = favorites.includes(productId);
    const next = isFav ? favorites.filter((id: string) => id !== productId) : [...favorites, productId];
    localStorage.setItem('favorites', JSON.stringify(next));
    setRandomItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, isFavorited: !isFav } : item
      )
    );
  };

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const isServiceCategory = (category?: string) => {
    const c = (category || '').toLowerCase();
    return c === 'tutoring & services' || c.includes('tutoring') || c.includes('services');
  };

  const isRentalItem = (item: { category?: string; tags?: string[]; description?: string }) => {
    const category = (item.category || '').toLowerCase();
    const tags = (item.tags || []).map((tag) => String(tag).toLowerCase());
    const description = (item.description || '').toLowerCase();
    return (
      category === 'rental' ||
      category === 'rentals' ||
      tags.includes('rental') ||
      tags.includes('rentals') ||
      description.includes('price per day:')
    );
  };

  const trendingItems = randomItems.slice(0, 4);
  const serviceItems = randomItems.filter((item) => isServiceCategory(item.category)).slice(0, 4);
  const rentalItems = allItems.filter((item) => isRentalItem(item)).slice(0, 4);

  const itemsToDisplay = specificItems.length > 0 ? specificItems : randomItems;

  return (
    <div className="min-h-screen bg-[#F4F2F2] font-sans text-gray-700">

      {/* Hero Carousel Section */}
      <div className="relative flex flex-col items-center justify-center pt-10 md:pt-10 mt-0 md:pb-12 overflow-hidden min-h-[60vh]">
        <div className="pointer-events-none absolute -top-24 right-[-10%] h-64 w-64 rounded-full bg-green-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-[-10%] h-64 w-64 rounded-full bg-green-100/60 blur-3xl" />
        {/* <div className="w-full max-w-6xl flex justify-between items-center px-6 md:px-12 mb-2 z-10">
          <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full uppercase tracking-wider">New Drops Daily</span>
          <button 
            onClick={() => router.push('/allitems')}
            className="flex items-center gap-1 bg-[#D8C7CD]/50 backdrop-blur-sm text-gray-800 text-sm font-medium px-5 py-1.5 rounded-full hover:bg-[#D8C7CD] transition-all hover:pr-3"
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div> */}

        <div
          className="mb-12 relative w-full h-[380px] md:h-[500px] flex items-center justify-center perspective-1000 touch-pan-y"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button
            onClick={handlePrev}
            className="flex absolute left-4 lg:left-24 z-30 p-2 bg-white/90 backdrop-blur rounded-full shadow-md hover:shadow-lg hover:scale-105 text-gray-800 border border-gray-100 transition-all"
            aria-label="Previous slide"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePrev();
              }
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={handleNext} className="flex absolute right-4 lg:right-24 z-30 p-2 bg-white/90 backdrop-blur rounded-full shadow-md hover:shadow-lg hover:scale-105 text-gray-800 border border-gray-100 transition-all" aria-label="Next slide" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNext(); } }}>
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
            <AnimatePresence initial={false} mode='popLayout'>
              {loading ? (
                /* simple placeholders while loading */
                [0,1,2].map((i) => (
                  <motion.div key={`skeleton-${i}`} className="absolute rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-100 animate-pulse" style={{ width: '320px', height: '440px' }} />
                ))
              ) : error ? (
                <div className="text-center text-red-500 p-8">{error}</div>
              ) : (
                itemsToDisplay.slice(0, itemsToShow).map((item, index) => {
                const position = getCarouselPosition(index);
                const isCenter = position === 0;
                const visibleCount = Math.min(itemsToShow, itemsToDisplay.length || itemsToShow);
                if (Math.abs(position) > Math.floor(visibleCount / 2)) return null;
                return (
                  <motion.div
                    key={item.id}
                    className={`absolute rounded-[2.5rem] overflow-hidden border-4 border-white bg-white select-none w-[260px] md:w-[320px] h-[360px] md:h-[440px] ${isCenter ? 'shadow-[0_0_80px_rgba(250,204,21,0.65)] ring-2 ring-yellow-300/70' : 'shadow-2xl'} ${item.badge === 'Sold Out' ? 'cursor-not-allowed pointer-events-none opacity-50' : 'cursor-pointer'}`}
                    initial={false}
                    animate={{
                      x: `${position * 95}%`,
                      scale: isCenter ? [1, 1.03, 1] : 0.75,
                      zIndex: 10 - Math.abs(position),
                      opacity: Math.abs(position) >= 2 ? 0.4 : 1,
                      rotateY: position * -4,
                      filter: isCenter ? "blur(0px)" : "blur(7px)",
                    }}
                    transition={
                      isCenter
                        ? {
                            type: "spring",
                            stiffness: 350,
                            damping: 20,
                            scale: {
                              duration: 3.6,
                              repeat: Infinity,
                              ease: "easeInOut",
                            },
                          }
                        : { type: "spring", stiffness: 350, damping: 20 }
                    }
                    style={{ transformStyle: 'preserve-3d' }}
                    onClick={() => item.badge !== 'Sold Out' && handleProductClick(item.id)}
                  >
                    <div className="relative w-full h-full">
                      <img 
                        src={item.image} 
                        alt={item.title || item.category || 'Product image'} 
                        className="w-full h-full object-cover pointer-events-none" 
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 ${isCenter ? 'opacity-100' : ''} transition-opacity duration-500 flex flex-col justify-end p-8`}>
                        <h3 className="text-white text-3xl font-bold tracking-tighter">{item.category}</h3>
                        <p className="text-white/80 text-sm mt-1">{item.title}</p>
                        <p className="text-white font-semibold mt-2">{formatCurrency(item.price)}</p>
                      </div>
                      {!isCenter && <div className="absolute inset-0 bg-white/20" />}
                    </div>
                  </motion.div>
                );
              }) )}
            </AnimatePresence>
          </div>
          
        </div>
        <div>
          <Button
						variant="ghost"
						className="text-green-600 hover:text-green-700 hover:bg-green-50 font-medium "
						onClick={() => router.push('/allitems')}
					>
						View All
						<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
					</Button>
        </div>

      </div>

      {/* Mobile search removed */}

      {/* Featured Categories */}
      <section className="pt-6 px-6 md:px-12 mb-20">
        <div className="flex items-end gap-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black">Trending on Campus</h2>
          <div className="h-1 flex-1 bg-gradient-to-r from-green-800 to-transparent rounded-full mb-2 opacity-60" />
          <button 
            onClick={() => router.push('/allitems')}
            className="text-sm font-semibold text-green-700 hover:text-green-900 mb-1 hidden md:block"
          >
            See All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {trendingItems.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -8 }}
              onClick={() => handleProductClick(item.id)}
              className="flex flex-col gap-3 group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-[2rem] h-[300px] w-full bg-white">
                {isRentalItem(item) && (
                  <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full z-10 uppercase tracking-wide">
                    Rental
                  </span>
                )}
                {item.badge && (
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-black text-xs font-semibold px-3 py-1 rounded-full z-10 uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
                {item.badge === 'Sold Out' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <span className="text-white text-2xl font-bold z-10">SOLD OUT</span>
                  </div>
                )}
                <img 
                  src={item.image} 
                  alt={item.title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    addToCart(item); 
                  }}
                  aria-label="Add to cart"
                  className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-black hover:text-white"
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleFavorite(item.id);
                  }}
                  aria-label="Add to favorites"
                  className="absolute bottom-4 left-4 bg-white text-black p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-red-500 hover:text-white"
                >
                  <Heart className={`w-5 h-5 ${item.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
              <div className="px-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 tracking-tight">{item.title}</h3>
                    
                  </div>
                  <span className="font-semibold text-gray-900 bg-white px-2.5 py-1 rounded-lg shadow-sm border border-gray-100">
                    {formatCurrency(item.price)}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs font-bold text-gray-800">• {item.seller.name}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="px-6 md:px-12 mt-4 mb-20">
        <div className="flex items-end gap-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black">Services on Campus</h2>
          <div className="h-1 flex-1 bg-gradient-to-r from-green-800 to-transparent rounded-full mb-2 opacity-60" />
          <button
            onClick={() => onCategorySelect('Services')}
            className="text-sm font-semibold text-green-700 hover:text-green-900 mb-1 hidden md:block"
          >
            See Services
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {serviceItems.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -8 }}
              onClick={() => handleProductClick(item.id)}
              className="flex flex-col gap-3 group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-[2rem] h-[300px] w-full bg-white">
                {isRentalItem(item) && (
                  <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full z-10 uppercase tracking-wide">
                    Rental
                  </span>
                )}
                {item.badge && (
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-black text-xs font-semibold px-3 py-1 rounded-full z-10 uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
                {item.badge === 'Sold Out' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <span className="text-white text-2xl font-bold z-10">SOLD OUT</span>
                  </div>
                )}
                <img 
                  src={item.image} 
                  alt={item.title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    addToCart(item); 
                  }}
                  aria-label="Add to cart"
                  className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-black hover:text-white"
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
              </div>
              <div className="px-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 tracking-tight">{item.title}</h3>
                    <p className="text-sm  w-fit px-1 text-gray-800">• {item.category} </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-gray-900">{formatCurrency(item.price)}</span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-600 line-through">
                        {formatCurrency(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Rentals Section */}
      <section className="px-6 md:px-12 mt-4 mb-20">
        <div className="flex items-end gap-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black">Rentals</h2>
          <div className="h-1 flex-1 bg-gradient-to-r from-amber-700 to-transparent rounded-full mb-2 opacity-60" />
          <button
            onClick={() => router.push('/rentals')}
            className="text-sm font-semibold text-amber-700 hover:text-amber-900 mb-1 hidden md:block"
          >
            Explore Rentals
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {rentalItems.map((item) => (
            <motion.div
              key={`rental-${item.id}`}
              whileHover={{ y: -8 }}
              onClick={() => handleProductClick(item.id)}
              className="flex flex-col gap-3 group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-[2rem] h-[300px] w-full bg-white">
                {isRentalItem(item) && (
                  <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full z-10 uppercase tracking-wide">
                    Rental
                  </span>
                )}
                {item.badge && (
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-black text-xs font-semibold px-3 py-1 rounded-full z-10 uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
                {item.badge === 'Sold Out' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <span className="text-white text-2xl font-bold z-10">SOLD OUT</span>
                  </div>
                )}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(item);
                  }}
                  aria-label="Add to cart"
                  className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-black hover:text-white"
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
              </div>
              <div className="px-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 tracking-tight">{item.title}</h3>
                    <p className="text-sm w-fit px-1 text-gray-800">• {item.category}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-gray-900">{formatCurrency(item.price)}</span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-600 line-through">
                        {formatCurrency(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {rentalItems.length === 0 && (
          <div className="mt-6 rounded-2xl border border-amber-200/60 bg-amber-50 p-6 text-sm text-amber-800">
            No rentals listed yet. Be the first to add one.
          </div>
        )}

        {/* <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => router.push('/rentals')}
          >
            Explore Rentals
          </Button>
          <Button
            variant="outline"
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
            onClick={() => router.push('/dashboard')}
          >
            List Rental
          </Button>
        </div> */}
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-12 mb-20">
        <div className="bg-black text-white rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-600 rounded-full blur-[100px] opacity-40 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-40 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              {/* <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full mb-4 border border-green-500/30">
                CAMPUS COMMUNITY
              </span> */}
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 leading-tight">
                Connect With <b><span className="text-red-700">LPU's</span> Largest Community.</b>
              </h2>
              <p className="text-gray-400 mb-8">
                Join thousands of students buying, selling, and connecting on SleekRoad. 
                Get the best deals on campus essentials.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => router.push('/allitems')}
                  className="bg-white text-black font-semibold py-4 px-8 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Start Shopping
                </button>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="border border-white/30 text-white font-semibold py-4 px-8 rounded-full hover:bg-white/10 transition-colors"
                >
                  Sell Your Items
                </button>
              </div>
            </div>
            
            <div className="hidden lg:block w-64 h-80 bg-gray-600 rounded-3xl rotate-3 hover:rotate-0 transition-transform duration-500 border-4 border-red-800 overflow-hidden shadow-2xl">
              <img 
                src="./catt.jpg" 
                className="w-full h-full object-cover opacity-80" 
                alt="Campus Marketplace" 
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}