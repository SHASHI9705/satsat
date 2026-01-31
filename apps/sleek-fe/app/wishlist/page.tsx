"use client"

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '../../components/Loader';
import { ProductCard } from '../../components/ProductCard';
import { Button } from '../../components/ui/button';
import { Package } from 'lucide-react';

export default function WishlistPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(Array.isArray(favs) ? favs : []);
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/all`);
        if (!res.ok) {
          setItems([]);
          return;
        }
        const data = await res.json();
        // Filter to favorites
        const favItems = (data.items || []).filter((it: any) => favorites.includes(it.id));
        // Add helper fields for ProductCard
        const mapped = favItems.map((item: any) => ({
          ...item,
        }));
        setItems(mapped);
      } catch (err) {
        console.error('Error fetching wishlist items', err);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have favorites
    if (favorites.length > 0) fetchItems();
    else setIsLoading(false);
  }, [favorites]);

  const handleViewDetails = (id: string) => {
    router.push(`/selecteditem?id=${id}`);
  };

  const handleFavoriteToggle = (productId: string) => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    const updated = Array.isArray(favs) ? favs.filter((id: string) => id !== productId) : [];
    localStorage.setItem('favorites', JSON.stringify(updated));
    setFavorites(updated);
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F2F2] to-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Your Wishlist</h1>
            <p className="text-gray-600">Items you have liked — {items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <div>
            <Button onClick={() => router.push('/allitems')} className="bg-white border border-gray-200">Browse items</Button>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No favorites yet</h3>
            <p className="text-gray-600 mb-6">Tap the heart icon on any item to save it to your wishlist.</p>
            <Button onClick={() => router.push('/allitems')} className="bg-green-600 hover:bg-green-700 text-white">Browse items</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id}>
                <ProductCard
                  product={{
                    id: item.id,
                    title: item.name,
                    price: item.discountedPrice,
                    originalPrice: item.actualPrice,
                    image: item.images?.[0] || '/placeholder-image.png',
                    condition: item.condition,
                    seller: item.seller,
                    location: item.location || 'Campus Area',
                    category: item.category,
                    isFavorited: true,
                  }}
                  onViewDetails={() => handleViewDetails(item.id)}
                  onFavorite={handleFavoriteToggle}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
