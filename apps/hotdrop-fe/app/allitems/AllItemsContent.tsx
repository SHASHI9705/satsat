"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Loader from "../../components/Loader";

interface Item {
  name: string;
  price: number;
  image: string;
  available: boolean | string;
}

function getInitialCart() {
  if (typeof window === 'undefined') return {};
  try {
    const arr = JSON.parse(localStorage.getItem("hotdrop_cart") || "[]");
    const obj: Record<string, number> = {};
    arr.forEach((item: any) => { obj[item.name] = item.quantity; });
    return obj;
  } catch {
    return {};
  }
}


function ItemCard({ item, cart, updateCart }: { item: Item, cart: Record<string, number>, updateCart: (item: Item, delta: number) => void }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-0 flex flex-col border border-orange-100 dark:border-gray-700 overflow-hidden relative" style={{ minHeight: 180 }}>
      {/* Image with overlays */}
      <div className="w-full relative" style={{height: '150px'}}>
        <img
          src={item.image || "/pizza.png"}
          alt={item.name}
          className="w-full h-full object-cover"
          style={{minHeight: 120, maxHeight: 150}}
        />
        {/* Name label top-left */}
        <span className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 text-orange-500 dark:text-orange-300 font-bold text-xs sm:text-sm rounded-full px-3 py-1 shadow max-w-[70%] truncate border border-orange-100 dark:border-gray-700">
          {item.name}
        </span>
        {/* Price top-right with strikethrough price */}
        <span className="absolute top-2 right-2 flex items-center gap-2">
          <span className="bg-orange-100 dark:bg-gray-700 text-black dark:text-white font-semibold text-xs sm:text-sm rounded-full px-3 py-1 shadow border border-orange-200 dark:border-gray-700 line-through">
            ₹{Math.round(item.price * 1.15)}
          </span>
          <span className="bg-orange-100 dark:bg-gray-700 text-orange-600 dark:text-orange-300 font-semibold text-xs sm:text-sm rounded-full px-3 py-1 shadow border border-orange-200 dark:border-gray-700">
            ₹{item.price}
          </span>
        </span>
      </div>
      {/* Row below image: available (left), plus/minus (right) */}
      <div className="flex items-end justify-between w-full px-4 pb-3 pt-2 mt-auto">
        <span className={`text-xs font-medium rounded-full px-3 py-1 shadow bg-white/90 dark:bg-gray-900/90 border ${item.available === true || item.available === "true" ? 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-700' : 'text-red-400 dark:text-red-300 border-red-200 dark:border-red-700'}`}>
          {item.available === true || item.available === "true" ? 'Available' : 'Out of Stock'}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="bg-orange-200 dark:bg-gray-700 text-orange-700 dark:text-orange-300 rounded-full w-7 h-7 flex items-center justify-center text-base font-bold hover:bg-orange-300 dark:hover:bg-gray-600 disabled:opacity-50"
            onClick={() => updateCart(item, -1)}
            disabled={!((cart[item.name] ?? 0) > 0)}
          >-</button>
          <span className="font-semibold text-xs sm:text-base text-gray-700 dark:text-gray-100 min-w-[20px] text-center">{cart[item.name] || 0}</span>
          <button
            className="bg-orange-500 dark:bg-orange-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-base font-bold hover:bg-orange-600 dark:hover:bg-orange-700 disabled:opacity-50"
            onClick={() => updateCart(item, 1)}
            disabled={item.available !== true && item.available !== "true"}
          >+</button>
        </div>
      </div>
    </div>
  );
}

export default function AllItemsContent() {
  const searchParams = useSearchParams();
  const shopname = searchParams.get("shop");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<{ name: string; image?: string } | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});

  // Load cart from localStorage on mount
  useEffect(() => {
    setCart(getInitialCart());
  }, []);

  useEffect(() => {
    if (!shopname) return;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/partners-with-items`)
      .then((res) => res.json())
      .then((data) => {
        const partner = data.find((p: any) => p.name === shopname);
        if (partner) {
          setShop({ name: partner.name, image: partner.image });
          setItems(partner.items || []);
        } else {
          setItems([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [shopname]);

  // Update cart in localStorage and state
  const updateCart = (item: Item, delta: number) => {
    setCart((prev) => {
      const newQty = Math.max(0, (prev[item.name] || 0) + delta);
      const updated = { ...prev, [item.name]: newQty };
      if (newQty === 0) delete updated[item.name];
      // Save to localStorage as array, including shop details
      let arr = [];
      try { arr = JSON.parse(localStorage.getItem("hotdrop_cart") || "[]"); } catch {}
      arr = arr.filter((i: any) => i.name !== item.name);
      if (newQty > 0) {
        arr.push({
          id: item.name,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: newQty,
          shopId: shop?.name || shopname || "",
          shopName: shop?.name || shopname || "",
          shopImage: shop?.image || ""
        });
      }
      localStorage.setItem("hotdrop_cart", JSON.stringify(arr));
      return updated;
    });
  };

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-orange-100 to-orange-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex flex-col items-center pt-8 px-4 pb-24">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4 w-full px-0 md:px-4 py-3 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow border border-orange-200 dark:border-gray-700">
          {/* Back Button (left) */}
          <button
            className="flex items-center px-3 py-1.5 md:px-5 md:py-2  hover:bg-orange-200  dark:hover:bg-gray-600 text-orange-600 dark:text-orange-300 font-semibold rounded-lg shadow transition ml-2"
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
            
            <h1 className="text-xl md:text-3xl font-bold text-orange-500 dark:text-orange-500 drop-shadow-sm whitespace-nowrap">{shop?.name || "All Items"}</h1>
          </div>
          {/* Home Button (right) */}
          <button
            className="flex items-center px-3 py-1.5 md:px-5 md:py-2 bg-orange-100 hover:bg-orange-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-orange-600 dark:text-orange-300 font-semibold rounded-lg shadow transition mr-2"
            title="Home"
            onClick={() => window.location.href = '/'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="#fb923c" className="w-6 h-6 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V21h15V10.5" />
            </svg>
            <span className="hidden md:inline">Home</span>
          </button>
        </div>
        {loading ? (
          <Loader />
        ) : items.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-24 text-xl font-semibold">No items found for this shop.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-center mt-8">
            {items.map((item, idx) => (
              <ItemCard key={idx} item={item} cart={cart} updateCart={updateCart} />
            ))}
          </div>
        )}
      </div>
    {/* Checkout Footer Button */}
    {cartCount > 0 && (
      <div className="fixed bottom-0 left-0 w-full z-50">
        <button
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500  hover:bg-orange-600 dark:hover:bg-orange-800 text-white dark:text-gray-100 font-bold text-sm sm:text-base py-3 rounded-none shadow transition-all duration-200 border-t border-orange-300 dark:border-orange-700"
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
            {cartCount}
          </span>
        </button>
      </div>
    )}
  </div>
  );
}
