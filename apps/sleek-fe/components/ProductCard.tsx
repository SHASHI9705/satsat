import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Heart, MessageCircle, MapPin, Star, Tag, Eye, ChevronRight, Clock } from 'lucide-react';
import ImageWithFallback from './ui/ImageWithFallback';
import { Badge } from './ui/badge';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  seller: {
    name: string;
    avatar?: string;
    rating?: number;
    verified: boolean;
  };
  location: string;
  postedTime?: string;
  category: string;
  isFavorited?: boolean;
  badge?: 'Trending' | 'Sale' | 'New' | 'Sold Out';
}

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onFavorite?: (productId: string) => void;
  onMessage?: (productId: string) => void;
  onViewDetails?: () => void;
  className?: string;
  showBadge?: boolean;
  showPostedTime?: boolean;
}

export function ProductCard({ product, onFavorite, onMessage, onViewDetails, className, showBadge = true, showPostedTime = true }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorited(favorites.includes(product.id));
  }, [product.id]);

  const handleFavoriteClick = (productId: string) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorites.includes(productId)) {
      const updatedFavorites = favorites.filter((id: string) => id !== productId);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorited(false);
    } else {
      favorites.push(productId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorited(true);
    }
    onFavorite?.(productId);
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      router.push(`/selecteditem?id=${product.id}`);
    }
  };

  /* Removed condition and badge helper functions — badges are no longer shown on product images */

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl rounded-3xl bg-white transition-all duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-t-3xl">
          <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <ImageWithFallback
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* Top badges removed as requested */}
          
          {/* Overlay Actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              size="icon"
              variant="ghost"
              className={`w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg transition-all duration-300 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
              onClick={(e) => {
                e.stopPropagation();
                handleFavoriteClick(product.id);
              }}
            >
              <Heart 
                className={`w-5 h-5 transition-all ${isFavorited ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-700 hover:text-red-500'}`} 
              />
            </Button>
            {onMessage && (
              <Button
                size="icon"
                variant="ghost"
                className={`w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg transition-all duration-300 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage?.(product.id);
                }}
              >
                <MessageCircle className="w-5 h-5 text-gray-700 hover:text-green-600" />
              </Button>
            )}
          </div>

          {/* Quick View Button */}
          <Button
            variant="default"
            className={`absolute bottom-4 right-4 bg-white text-gray-900 border border-gray-200 rounded-full px-4 py-2 gap-2 shadow-lg transition-all duration-300 font-medium ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
          >
            <Eye className="w-4 h-4" />
            Quick View
          </Button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Category */}
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700 uppercase tracking-wide">
              {product.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-green-700 transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Seller Info */}
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 border-2 border-green-100">
                  {product.seller?.avatar ? (
                    <AvatarImage src={product.seller.avatar} alt={product.seller.name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-700 text-white text-sm">
                      {product.seller?.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-900">
                      {product.seller?.name || 'Unknown Seller'}
                    </span>
                    
                      <Badge variant="secondary" className="text-xs px-1 py-0 bg-green-100 text-green-700 border-green-200">
                        ✓ Verified
                      </Badge>
                  </div>

                </div>
              </div>
            </div>

            {/* Location (posted time optional) */}
            <div className="flex items-center text-xs text-gray-500 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{product.location}</span>
              </div>
              {showPostedTime && product.postedTime && (
                <div className="flex items-center gap-1 ml-auto">
                  <Clock className="w-3 h-3" />
                  <span>{product.postedTime}</span>
                </div>
              )}
            </div>

            {/* View Details Button */}
            <Button 
              className="w-full gap-2 py-3 rounded-xl font-medium hover:bg-gray-900 hover:text-white transition-all duration-300 group/btn mt-4"
              variant="outline"
              onClick={handleViewDetails}
            >
              <span>View Details</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}