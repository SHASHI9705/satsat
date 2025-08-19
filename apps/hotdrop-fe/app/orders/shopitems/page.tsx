"use client"



import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Loader from "../../../components/Loader";




interface Item {
  name: string;
  price: number;
  image: string;
  available: boolean | string;
}

function getHeading(foodName: string | null) {
  if (!foodName || typeof foodName !== 'string' || !foodName.trim()) return 'Menu';
  const decoded = decodeURIComponent(foodName).trim();
  return decoded.charAt(0).toUpperCase() + decoded.slice(1);
}

function isAvailable(item: Item) {
  return item.available === true || item.available === "true";
}

export default function ShopItemsPage() {
  const [shopHeading, setShopHeading] = useState('Shop');
  // Set shop heading from URL on client only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shop = new URLSearchParams(window.location.search).get('shop');
      setShopHeading(shop || 'Shop');
    }
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-orange-100 to-orange-300 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex flex-col items-center pt-8 px-4 pb-24">
      {/* Nav Bar with Back, Heading, and Home (no ratings) */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-8 px-0 md:px-4 py-3 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow border border-orange-200 dark:border-gray-700">
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
          
        <h1 className="text-xl md:text-3xl font-bold text-orange-500 dark:text-orange-500 drop-shadow-sm whitespace-nowrap">{shopHeading}</h1>
        </div>
        {/* Home Button (right) */}
        <button
          className="flex items-center px-3 py-1.5 md:px-5 md:py-2  hover:bg-orange-200 dark:hover:bg-gray-600 text-orange-600 dark:text-orange-300 font-semibold rounded-lg shadow transition mr-2"
          title="Home"
          onClick={() => window.location.href = '/'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="#fb923c" className="w-6 h-6 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V21h15V10.5" />
          </svg>
          <span className="hidden md:inline">Home</span>
        </button>
      </div>
      <Suspense fallback={<p>Loading...</p>}>
        <ShopItemsContent />
      </Suspense>
    </div>
  );
}

function ShopItemsContent() {
  const searchParams = useSearchParams();
  const shopname = searchParams.get("shop");
  const foodName = searchParams.get("food");
  const [shop, setShop] = useState<{ id?: string; name: string; image?: string; rating?: number; ratingsCount?: number } | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (!shopname) return;
    // Save selected partner to localStorage for checkout
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/partners-with-items`)
      .then((res) => res.json())
      .then((data) => {
        // Find the partner/shop
        const partner = data.find((p: any) => p.name === shopname);
        if (partner) {
          setShop({
            id: partner.id, // <-- add id to shop state
            name: partner.name,
            image: partner.image,
            rating: partner.rating,
            ratingsCount: partner.ratingsCount,
          });
          // Save selected shop info for checkout compatibility (ensure id is present)
          localStorage.setItem("hotdrop_selected_shop", JSON.stringify({
            id: partner.id, // <-- ensure id is present
            name: partner.name,
            shopname: partner.name, // for cart page compatibility
            image: partner.image,
            rating: partner.rating,
            ratingsCount: partner.ratingsCount,
            // add any other fields needed
          }));
          let filtered = partner.items;
          if (foodName) {
            // Normalize for plural/singular and whitespace
            const foodKey = foodName.toLowerCase().replace(/s$/, '').trim();
            filtered = partner.items.filter((item: any) => {
              if (!item.name) return false;
              const itemKey = item.name.toLowerCase();
              return itemKey.includes(foodKey);
            });
          }
          setItems(filtered); // <-- Fix: set filtered items to state
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [shopname, foodName]);

  useEffect(() => {
    // Load cart from localStorage
    const stored = localStorage.getItem("hotdrop_cart");
    if (stored) {
      try {
        const arr = JSON.parse(stored);
        const obj: Record<string, number> = {};
        arr.forEach((item: any) => { obj[item.name] = item.quantity; });
        setCart(obj);
      } catch {}
    }
  }, [shopname]);

  const updateCart = (item: Item, delta: number) => {
    setCart((prev) => {
      const newQty = Math.max(0, (prev[item.name] || 0) + delta);
      const updated = { ...prev, [item.name]: newQty };
      // Remove from object if qty is 0
      if (newQty === 0) delete updated[item.name];
      // Save to localStorage as array
      const stored = localStorage.getItem("hotdrop_cart");
      let arr = [];
      if (stored) {
        try { arr = JSON.parse(stored); } catch {}
      }
      // Remove this item if exists
      arr = arr.filter((i: any) => i.name !== item.name);
      if (newQty > 0) {
        // Always use current shop info for cart item
        arr.push({
          id: item.name,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: newQty,
          shopId: shop?.id,
          shopName: shop?.name,
          shopImage: shop?.image
        });
      }
      // Always update hotdrop_selected_shop if shop is available
      if (shop && shop.id) {
        localStorage.setItem("hotdrop_selected_shop", JSON.stringify(shop));
      }
      localStorage.setItem("hotdrop_cart", JSON.stringify(arr));
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      {/* ...header removed, replaced by nav above... */}
      <div className="px-4 sm:pl-12 sm:pr-12 pb-28">
        <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6 mt-2 text-center sm:text-left">{getHeading(foodName)}</h2>
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh] w-full">
            <Loader />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-300 py-12 text-base sm:text-lg">No items found for this menu.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 place-items-center">
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`w-full max-w-xs h-72 sm:w-64 sm:h-80 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col border border-orange-100 dark:border-gray-700 overflow-hidden ${!item.available ? 'opacity-50' : ''}`}
              >
                <div className="w-full" style={{ height: '70%' }}>
                  <img
                    src={item.image && typeof item.image === 'string' && item.image.startsWith("/images/") ? `${process.env.NEXT_PUBLIC_BACKEND_API}${item.image}` : item.image || "/logo.png"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-row w-full flex-1 p-3 sm:p-4 items-start justify-between gap-2" style={{ height: '30%' }}>
                  <div className="flex flex-col flex-1">
                    <div className="flex flex-row items-center justify-between">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">{item.name}</h3>
                      <div>
                        <span className="text-gray-400 font-medium text-base line-through dark:text-gray-500">
                        ₹{Math.round(item.price * 1.15)}
                        </span>
                        <span className="text-base sm:text-lg text-orange-500 dark:text-orange-300 font-semibold ml-2">₹{item.price}</span>
                      </div>
                    </div>
                    <div className="flex flex-row items-center mt-1">
                      <span className={`text-xs sm:text-sm font-medium ${isAvailable(item) ? 'text-green-600 dark:text-green-400' : 'text-red-400 dark:text-red-300'}`}>{isAvailable(item) ? 'Available' : 'Out of Stock'}</span>
                      {isAvailable(item) && (
                        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                          <button className="bg-orange-200 dark:bg-gray-700 text-orange-700 dark:text-orange-300 rounded-full w-7 h-7 flex items-center justify-center text-base sm:text-lg font-bold hover:bg-orange-300 dark:hover:bg-gray-600" onClick={() => updateCart(item, -1)}>-</button>
                          <span className="font-semibold text-xs sm:text-base text-gray-700 dark:text-gray-100 min-w-[20px] text-center">{cart[item.name] || 0}</span>
                          <button className="bg-orange-500 dark:bg-orange-700 text-white dark:text-gray-100 rounded-full w-7 h-7 flex items-center justify-center text-base sm:text-lg font-bold hover:bg-orange-600 dark:hover:bg-orange-800" onClick={() => updateCart(item, 1)}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Checkout Footer Button */}
      {Object.values(cart).reduce((sum, qty) => sum + qty, 0) > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-50">
          <button
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:bg-orange-600 dark:hover:bg-orange-800 text-white dark:text-gray-100 font-bold text-sm sm:text-base py-3 rounded-none shadow transition-all duration-200 border-t border-orange-300 dark:border-orange-700"
            style={{ boxShadow: '0 -1px 8px rgba(251, 146, 60, 0.10)' }}
            onClick={() => {
              const user = typeof window !== 'undefined' ? localStorage.getItem('hotdrop_user') : null;
              if (!user) {
                window.location.href = '/signin';
              } else {
                window.location.href = '/cart';
              }
            }}
          >
            <span role="img" aria-label="cart" className="text-lg sm:text-xl">🛒</span>
            Checkout
            <span className="ml-2 bg-white dark:bg-gray-900 text-orange-500 dark:text-orange-300 rounded-full px-2 py-0.5 text-xs sm:text-sm font-bold border border-orange-200 dark:border-orange-700 min-w-[20px] sm:min-w-[24px] text-center">
              {Object.values(cart).reduce((sum, qty) => sum + qty, 0)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
