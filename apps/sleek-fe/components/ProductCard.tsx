import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Heart, MessageCircle, MapPin, Clock } from 'lucide-react';
import ImageWithFallback from './ui/ImageWithFallback';
import { Badge } from './ui/badge';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    rating: number;
    verified: boolean;
  };
  location: string;
  postedTime: string;
  category: string;
  isFavorited?: boolean;
}

interface ProductCardProps {
  product: Product;
  onFavorite?: (productId: string) => void;
  onMessage?: (productId: string) => void;
}

export function ProductCard({ product, onFavorite, onMessage }: ProductCardProps) {
  // Added state to track if the product is favorited
  const [isFavorited, setIsFavorited] = useState(false);
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
    router.push('/selecteditem');
  };

  return (
    <Card className="group overflow-hidden card-hover border-0 shadow-soft hover:shadow-strong rounded-2xl bg-white">
      <div className="relative">
        <div className="aspect-square overflow-hidden bg-gray-50">
          <ImageWithFallback
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        
        {/* Overlay Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white backdrop-blur-md shadow-lg hover:scale-110 transition-all duration-200"
            onClick={() => handleFavoriteClick(product.id)}
          >
            <Heart 
              className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
            />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-2"> {/* Reduced spacing */}
        {/* Title and Category */}
        <div>
          <h3 className="font-bold truncate text-base line-clamp-2 group-hover:text-green-700 transition-colors leading-snug">
            {product.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">{product.category}</p> {/* Adjusted margin */}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {/* Seller Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5">
              <AvatarImage src={product.seller.avatar} />
              <AvatarFallback className="text-xs">
                {product.seller.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">{product.seller.name}</span>
              {product.seller.verified && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  ✓
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">★</span>
            <span className="text-xs font-medium">{product.seller.rating}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full gap-2 py-2" 
          variant="outline"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}