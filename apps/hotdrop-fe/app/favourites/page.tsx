"use client";

import { useEffect, useState } from "react";
import PhoneFooter from "../../components/PhoneFooter";


export default function FavouritesPage() {
  const [favs, setFavs] = useState<any[]>([]);
  const [favShops, setFavShops] = useState<any[]>([]);
  const [tab, setTab] = useState<'all' | 'food' | 'shops'>('all');

  useEffect(() => {
    try {
      setFavs(JSON.parse(localStorage.getItem("hotdrop_favourites") || "[]"));
    } catch {
      setFavs([]);
    }
    try {
      setFavShops(JSON.parse(localStorage.getItem("hotdrop_favshops") || "[]"));
    } catch {
      setFavShops([]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-orange-100 to-orange-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex flex-col items-center pt-8 px-4 pb-24">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 w-full px-0 md:px-4 py-3 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow border border-orange-200 dark:border-gray-700">
          {/* Back Button (left) */}
          <button
            className="flex items-center px-3 py-1.5 md:px-5 md:py-2  hover:bg-orange-200 dark:hover:bg-gray-600 text-orange-600 dark:text-orange-300 font-semibold rounded-lg shadow transition ml-2"
            title="Back"
            onClick={() => window.history.back()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="#fb923c" className="w-6 h-6 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="hidden md:inline">Back</span>
          </button>
          {/* Centered logo and heading */}
          <div className="flex items-center gap-3 mx-auto">
            
            <h1 className="text-xl md:text-4xl font-bold text-orange-500 drop-shadow-sm whitespace-nowrap">Your Favourites!</h1>
          </div>
          {/* Home Button (right) */}
          <div className="w-[65px]"></div>
        </div>

        {/* Hide paragraph on mobile, show on md+ */}
        <p className="hidden md:block text-base text-gray-700 dark:text-gray-300 mb-10 text-center max-w-2xl mx-auto">Your favourite food item is here for quick access. Add to cart and enjoy instantly!</p>

        {/* Tab section for mobile only */}
        <div className="md:hidden w-full flex justify-center items-center mb-6 mt-2">
          <div className="flex w-full max-w-xs bg-white dark:bg-gray-800 rounded-full shadow border border-orange-200 dark:border-gray-700 overflow-hidden">
            <button
              className={`flex-1 py-2 text-xs font-semibold transition ${tab === 'all' ? 'bg-orange-100 dark:bg-gray-700 text-orange-600 dark:text-orange-300' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300'}`}
              onClick={() => setTab('all')}
            >
              All
            </button>
            <button
              className={`flex-1 py-2 text-xs font-semibold transition ${tab === 'food' ? 'bg-orange-100 dark:bg-gray-700 text-orange-600 dark:text-orange-300' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300'}`}
              onClick={() => setTab('food')}
            >
              Food
            </button>
            <button
              className={`flex-1 py-2 text-xs font-semibold transition ${tab === 'shops' ? 'bg-orange-100 dark:bg-gray-700 text-orange-600 dark:text-orange-300' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300'}`}
              onClick={() => setTab('shops')}
            >
              Shops
            </button>
          </div>
        </div>


        {/* Favourite Items Section (hidden on mobile if using tabs) */}
        <h2 className="hidden md:block text-lg md:text-2xl font-bold text-orange-600 dark:text-orange-300 mb-4 mt-8">Favourite Items</h2>
        {tab !== 'shops' && (
          favs.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-12 text-lg font-semibold md:block hidden">No favourite items yet. Tap the <span className="text-orange-500 dark:text-orange-300">heart</span> on any food card to add it here!</div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-center ${tab === 'all' ? '' : 'md:mb-12'}`}>
              {tab === 'all' || tab === 'food' ? favs.map((fav, idx) => (
                <div key={fav.shop.id + fav.item.name} className="relative bg-white dark:bg-gray-800 rounded-xl shadow p-0 w-11/12 max-w-xs flex flex-col border border-orange-100 dark:border-gray-700 overflow-hidden mx-auto">
                  {/* Remove Button */}
                  <button
                    className="absolute top-2 left-2 z-20 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-300 rounded-full px-2 py-1 text-xs font-bold shadow"
                    title="Remove from favourites"
                    onClick={() => {
                      const newFavs = favs.filter((f, i) => i !== idx);
                      setFavs(newFavs);
                      localStorage.setItem("hotdrop_favourites", JSON.stringify(newFavs));
                    }}
                  >
                    Remove
                  </button>
                  {/* Shop Name */}
                  <div className="absolute top-2 right-4 z-10 bg-white/80 dark:bg-gray-900/80 px-3 py-1 rounded-full text-xs font-semibold text-orange-600 dark:text-orange-300 shadow">{fav.shop.name}</div>
                  {/* Food Image */}
                  <div className="w-full" style={{height: '150px'}}>
                    <img src={fav.item.image || "/pizza.png"} alt={fav.item.name} className="w-full h-full object-cover" style={{minHeight: 120, maxHeight: 150}} />
                  </div>
                  {/* Name, Price & Rating Row */}
                  <div className="flex items-center justify-between w-full mb-0 gap-2 px-3 max-w-full overflow-hidden" style={{ minHeight: 0, paddingBottom: 0 }}>
                    <div className="font-semibold text-lg text-gray-800 dark:text-gray-100 truncate text-left max-w-[50%]">{fav.item.name}</div>
                    <div className="flex items-center gap-2 flex-shrink-0 max-w-[48%]">
                      <span className="text-gray-400 font-medium text-base line-through dark:text-gray-500">
                        ₹{Math.round(fav.item.price * 1.15)}
                      </span>
                      <span className="text-gray-700 dark:text-gray-100 font-medium text-base whitespace-nowrap">
                        ₹{fav.item.price}
                      </span>
                    </div>
                  </div>
                  {/* Add to Cart Button */}
                  <button
                    className="px-0 py-3 bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-700 dark:to-red-700 text-white rounded-b-xl font-semibold text-sm hover:bg-orange-600 dark:hover:bg-orange-800 transition w-full"
                    style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: 0 }}
                    onClick={() => {
                      // Prepare cart item structure as in CartPage
                      const cartItem = {
                        id: fav.item.name + "-" + fav.shop.id, // unique per shop+item
                        name: fav.item.name,
                        price: fav.item.price,
                        image: fav.item.image,
                        quantity: 1,
                        shopId: fav.shop.id,
                        shopName: fav.shop.name,
                        shopImage: fav.shop.image
                      };
                      // Get current cart
                      let cart = [];
                      try {
                        cart = JSON.parse(localStorage.getItem("hotdrop_cart") || "[]");
                      } catch {}
                      // Check if item already in cart (by id)
                      const existing = cart.find((item: any) => item.id === cartItem.id);
                      if (existing) {
                        existing.quantity += 1;
                      } else {
                        cart.push(cartItem);
                      }
                      localStorage.setItem("hotdrop_cart", JSON.stringify(cart));
                      // Also store selected shop info
                      const shopInfo = {
                        id: fav.shop.id,
                        name: fav.shop.name,
                        shopname: fav.shop.name,
                        image: fav.shop.image
                      };
                      localStorage.setItem("hotdrop_selected_shop", JSON.stringify(shopInfo));
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              )) : null}
            </div>
          )
        )}


        {/* Favourite Shops Section (hidden on mobile if using tabs) */}
        <h2 className="hidden md:block text-lg md:text-2xl font-bold text-orange-600 dark:text-orange-300 mb-4 mt-12">Favourite Shops</h2>
        {tab !== 'food' && (
          favShops.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-12 text-lg font-semibold md:block hidden">No favourite shops yet. Tap the <span className="text-orange-500 dark:text-orange-300">heart</span> on any shop card to add it here!</div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-center${tab === 'all' && favs.length > 0 ? ' mt-8' : ''}`}>
              {tab === 'all' || tab === 'shops' ? favShops.map((shop, idx) => (
                <div key={shop.id || idx} className="relative bg-white dark:bg-gray-800 rounded-xl shadow p-0 w-11/12 max-w-xs flex flex-col border border-orange-100 dark:border-gray-700 overflow-hidden mx-auto">
                  {/* Remove Button */}
                  <button
                    className="absolute top-2 left-2 z-20 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-300 rounded-full px-2 py-1 text-xs font-bold shadow"
                    title="Remove from favourite shops"
                    onClick={() => {
                      const newFavShops = favShops.filter((s, i) => i !== idx);
                      setFavShops(newFavShops);
                      localStorage.setItem("hotdrop_favshops", JSON.stringify(newFavShops));
                    }}
                  >
                    Remove
                  </button>
                  {/* Shop Name Label at Top Right */}
                  <div className="absolute top-2 right-4 z-10 bg-white/80 dark:bg-gray-900/80 px-3 py-1 rounded-full text-xs font-semibold text-orange-600 dark:text-orange-300 shadow">{shop.shopname}</div>
                  {/* Shop Image */}
                  <div className="w-full" style={{height: '150px'}}>
                    <img src={shop.shopimage || "/pizza.png"} alt={shop.shopname} className="w-full h-full object-cover" style={{minHeight: 120, maxHeight: 150}} />
                  </div>
                  {/* Spacer for layout */}
                  <div className="flex-1" />
                  {/* View Menu Button */}
                  <button
                    className="px-0 py-3 bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-700 dark:to-red-700 text-white rounded-b-xl font-semibold text-sm hover:bg-orange-600 dark:hover:bg-orange-800 transition w-full"
                    style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: 'auto' }}
                    onClick={() => {
                      // Navigate to allitems page for this shop
                      window.location.href = `/allitems?shop=${encodeURIComponent(shop.shopname || shop.name || shop.id)}`;
                    }}
                  >
                    View Menu
                  </button>
                </div>
              )) : null}
            </div>
          )
        )}
      </div>
      <div className="md:hidden">
        <PhoneFooter />
      </div>
    </div>
  );
}
