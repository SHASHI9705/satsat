"use client";

import { Button } from '../../components/ui/button';
import { Star, Package, Home, ArrowLeft, Heart, Share2, MapPin, Clock, ChevronLeft, ChevronRight, MessageCircle, Shield, Truck, ArrowRight, CheckCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ProductCard } from '../../components/ProductCard';
import { useRouter, useSearchParams } from 'next/navigation';
import Loader from '../../components/Loader';
import { useAuth } from '../../firebase/AuthProvider';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

import { Badge } from '../../components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function SelectedItemPage() {
  const searchParams = useSearchParams();
  const itemId = searchParams.get('id');
  
  const router = useRouter();
  const { user } = useAuth();
  
  const [item, setItem] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sellerDetails, setSellerDetails] = useState<any>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  const getRandomProductFromRelated = () => {
    const randomIndex = Math.floor(Math.random() * relatedProducts.length);
    const randomProduct = relatedProducts[randomIndex];
    return {
      ...randomProduct,
      id: (Math.random() * 100000).toFixed(0)
    };
  };

  const loadMoreProducts = () => {
    const newProducts = Array.from({ length: 4 }, () => getRandomProductFromRelated());
    setProducts((prev) => [...prev, ...newProducts]);
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100
      ) {
        loadMoreProducts();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const touchStartX = useRef(0);

  const handleTouchStart = (e: any) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: any) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchStartX.current - touchEndX > 50) {
      handleSwipe('left');
    } else if (touchEndX - touchStartX.current > 50) {
      handleSwipe('right');
    }
  };

  const handleSwipe = (direction: string) => {
    if (direction === 'left') {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    } else if (direction === 'right') {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleGetContactDetails = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    let fetchedSeller = null;
    if (backendUrl) {
      try {
        const response = await fetch(`${backendUrl}/api/seller/${item.userId}`);
        if (response.ok) {
          const data = await response.json();
          fetchedSeller = data.seller;
        } else {
          console.warn('Failed to fetch seller details from backend, status:', response.status);
        }
      } catch (error) {
        console.warn('Error fetching seller details from backend:', error);
      }
    }

    if (!fetchedSeller && item?.user) {
      fetchedSeller = {
        name: item.user.name || item.user.username || 'Seller',
        email: item.user.email || '',
        phone: item.user.phone || '',
        avatar: item.user.avatar || '',
        address: item.user.address || ''
      };
    }

    if (fetchedSeller) {
      setSellerDetails(fetchedSeller);
      setIsModalOpen(true);
    } else {
      alert('Seller contact details are not available at the moment.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  async function handleMessageSeller() {
    if (!user) {
      router.push('/signin');
      return;
    }
    if (item?.sold) {
      alert('This item is marked as sold. Chat is disabled.');
      return;
    }

    let sellerUid = String(item?.user?.uid || item?.user?.firebaseUid || '');

    if (!sellerUid) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (backendUrl && item?.userId) {
        try {
          const response = await fetch(`${backendUrl}/api/seller/${item.userId}`);
          if (response.ok) {
            const data = await response.json();
            const sellerEmail = data?.seller?.email;
            if (sellerEmail) {
              const q = query(collection(db, 'users'), where('email', '==', sellerEmail));
              const snap = await getDocs(q);
              const docSnap = snap.docs[0];
              sellerUid = docSnap?.id || '';
            }
          }
        } catch (error) {
          console.warn('Error resolving seller uid:', error);
        }
      }
    }

    if (!sellerUid) {
      alert('Seller chat is not available yet. Ask the seller to sign in once.');
      return;
    }

    if (sellerUid === user.uid) {
      alert('You are the seller for this item.');
      return;
    }
    router.push(`/chat?productId=${encodeURIComponent(String(itemId || ''))}&sellerId=${encodeURIComponent(sellerUid)}`);
  }

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/${itemId}`);
        if (response.ok) {
          const data = await response.json();
          setItem(data.item);
          setRelatedProducts(data.relatedProducts || []);
          setProducts(data.relatedProducts || []);
        } else {
          console.error('Failed to fetch item details');
        }
      } catch (error) {
        console.error('Error fetching item details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (itemId) {
      fetchItemDetails();
    }
  }, [itemId]);

  useEffect(() => {
    if (item?.images) {
      setImages(item.images);
    }
  }, [item]);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorited(favorites.includes(itemId));
  }, [itemId]);

  const handleFavoriteClick = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorites.includes(itemId)) {
      const updatedFavorites = favorites.filter((id: string) => id !== itemId);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorited(false);
    } else {
      favorites.push(itemId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorited(true);
    }
  };

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item?.name,
          text: `Check out ${item?.name} on SleekRoad!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isServiceCategory = (category?: string) => {
    if (item?.type === 'service') return true;
    const c = (category || '').toLowerCase();
    return (
      c.includes('service') ||
      c.includes('tutoring') ||
      ['tutor', 'developer', 'management', 'coach', 'gamer'].some((k) => c.includes(k))
    );
  };

  const formatPriceWithUnit = (price?: number) => {
    if (price == null) return '';
    return `${formatPrice(price)}${isServiceCategory(item?.category) ? ' /hr' : ''}`;
  };

  const serviceTags = (() => {
    const tags = (item?.tags || item?.skills || item?.serviceTags || []) as any;
    if (Array.isArray(tags)) return tags.filter(Boolean);
    if (typeof tags === 'string') return tags.split(',').map((t) => t.trim()).filter(Boolean);
    return [] as string[];
  })();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <Loader />
      </div>
    );
  }

  const handleViewDetails = (productId: string) => {
    router.push(`/selecteditem?id=${productId}`);
  };

  const calculateDiscount = () => {
    if (!item?.actualPrice || !item?.discountedPrice) return 0;
    return Math.round((1 - item.discountedPrice / item.actualPrice) * 100);
  };

  // ...existing code...

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F2F2] to-white">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleShareClick}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Home"
              >
                <Home className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="aspect-square relative">
                <img
                  src={images[currentImageIndex] || '/placeholder-image.png'}
                  alt={item?.name}
                  className={`w-full h-full object-contain transition-transform duration-500 ${isZoomed ? 'scale-150' : 'scale-100'}`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
                
                {/* Discount Badge */}
                {calculateDiscount() > 0 && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    {calculateDiscount()}% OFF
                  </div>
                )}
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 flex gap-3 overflow-x-auto scrollbar-hide">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${index === currentImageIndex ? 'border-green-500 shadow-md' : 'border-gray-200'}`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Image Indicators for Mobile */}
            <div className="flex justify-center gap-2 lg:hidden">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${index === currentImageIndex ? 'bg-green-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-green-100 text-green-700 border-green-200 font-medium">
                  {item?.category}
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
                  Campus Verified
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {item?.name}
              </h1>
              
              <div className="flex items-baseline gap-4">
                <span className="text-3xl md:text-4xl font-bold text-gray-900">
                  {formatPriceWithUnit(item?.discountedPrice)}
                </span>
                {item?.actualPrice && item.actualPrice > item.discountedPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPriceWithUnit(item.actualPrice)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {item?.description}
              </p>
            </div>

            {isServiceCategory(item?.category) && serviceTags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {serviceTags.map((tag: string, index: number) => (
                    <span
                      key={`${tag}-${index}`}
                      className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {/* <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Features</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-500">100% protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Campus Delivery</p>
                    <p className="text-xs text-gray-500">Free on campus</p>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Seller Info */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Seller Information</h3>
                {/* <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{item?.rating || '4.5'}</span>
                </div> */}
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {item?.user?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item?.user?.name || 'Verified Seller'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Verified Student</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  size="lg"
                  className="h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all"
                  onClick={handleMessageSeller}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat with Seller
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-2 hover:bg-gray-50 transition-colors"
                  onClick={handleGetContactDetails}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact Seller
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-2 hover:bg-gray-50 transition-colors"
                  onClick={handleFavoriteClick}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorited ? 'Favorited' : 'Add to Favorites'}
                </Button>
              </div>
              
              <Button
                size="lg"
                className="w-full h-14 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                onClick={() => window.open(`https://wa.me/?text=Check out ${item?.name} on SleekRoad: ${window.location.href}`, '_blank')}
              >
                Share on WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Related Products</h2>
                </div>
                <p className="text-gray-600">More items you might like</p>
              </div>
              <Button
                variant="ghost"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => router.push(`/allitems?category=${item?.category}`)}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    title: product.name,
                    price: product.discountedPrice,
                    originalPrice: product.actualPrice,
                    image: product.images?.[0] || '/placeholder-image.png',
                    condition: 'Good',
                    seller: {
                      name: product.user?.name || 'Unknown Seller',
                      rating: parseFloat((Math.random() * (5 - 4) + 4).toFixed(1)),
                      verified: false
                    },
                    location: product.category,
                    postedTime: 'Just now',
                    category: product.category,
                    isFavorited: false,
                    badge: calculateDiscount() > 20 ? 'Sale' : 'Trending'
                  }}
                  onViewDetails={() => handleViewDetails(product.id)}
                />
              ))}
            </div>

            {products.length < relatedProducts.length * 2 && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  className="px-8 py-3 border-gray-300 hover:border-gray-400"
                  onClick={loadMoreProducts}
                >
                  Load More Products
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <AnimatePresence>
        {isModalOpen && sellerDetails && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-green-100">
                      {sellerDetails.avatar ? (
                        <img src={sellerDetails.avatar} alt={sellerDetails.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-2xl font-bold">
                          {sellerDetails.name?.charAt(0) || 'S'}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{sellerDetails.name}</h3>
                    <p className="text-gray-600 mt-1">Verified Seller</p>
                  </div>

                  <div className="space-y-4">
                    {sellerDetails.email && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="font-medium text-gray-900">{sellerDetails.email}</p>
                      </div>
                    )}
                    
                    {sellerDetails.phone && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Phone</p>
                        <p className="font-medium text-gray-900">{sellerDetails.phone}</p>
                      </div>
                    )}
                    
                    {sellerDetails.address && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Location</p>
                        <p className="font-medium text-gray-900">{sellerDetails.address}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button
                      className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
                      onClick={() => {
                        navigator.clipboard.writeText(sellerDetails.email || '');
                        alert('Email copied to clipboard!');
                      }}
                    >
                      Copy Email
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      onClick={() => {
                        if (sellerDetails?.email) {
                          window.location.href = `mailto:${sellerDetails.email}`;
                        } else {
                          handleGetContactDetails();
                        }
                      }}
                    >
                      Contact
                    </Button>
                  </div>
                </div>
                
                <button
                  onClick={handleCloseModal}
                  className="w-full py-4 text-gray-500 hover:text-gray-700 border-t border-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}