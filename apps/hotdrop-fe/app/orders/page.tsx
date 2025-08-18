"use client"


import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Loader from "../../components/Loader";


// Define types for partner and item
interface Item {
  name: string;
}
interface Partner {
  name: string;
  image?: string;
  rating?: number;
  ratingsCount?: number;
  shopAddress?: string;
  items: Item[];
}

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-orange-100 to-orange-300 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex flex-col pt-8 px-4 pb-24">
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
          
        <h1 className="text-xl md:text-3xl font-bold text-orange-500 dark:text-orange-500 drop-shadow-sm whitespace-nowrap">HotDrop Orders</h1>
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
        <OrdersContent />
      </Suspense>
    </div>
  );
}


function OrdersContent() {
  const searchParams = useSearchParams();
  const itemName = searchParams.get("food") || "Burgers";
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/partners-with-items`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPartners(data);
        } else if (data && Array.isArray(data.partners)) {
          setPartners(data.partners);
        } else {
          setPartners([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [itemName]);

  // More robust filter: ignore case, whitespace, and plural/singular
  const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').replace(/s$/, '');
  const foodKey = normalize(itemName);
  const foodPartners = partners.filter((partner) =>
    partner.items && partner.items.some((item) => normalize(item.name).includes(foodKey))
  );

  function getFoodTagline(itemName: string) {
    const key = itemName.toLowerCase();
    if (key.includes("cake")) return "Craving for something sweet?";
    if (key.includes("dosa")) return "Want to taste the best from South?";
    if (key.includes("pizza")) return "Slice into cheesy goodness!";
    if (key.includes("burger")) return "Bite into juicy perfection!";
    if (key.includes("roll")) return "Roll into flavor town!";
    if (key.includes("momo")) return "Steaming hot momos await!";
    if (key.includes("icecream")) return "Cool down with a sweet treat!";
    if (key.includes("sandwich")) return "Stacked with taste, just for you!";
    if (key.includes("chinese")) return "Savor the best of Indo-Chinese!";
    if (key.includes("shake")) return "Sip on something special!";
    if (key.includes("chole")) return "Spice up your day, Punjabi style!";
    if (key.includes("manchurian")) return "Crispy, saucy, and irresistible!";
    if (key.includes("cake")) return "Craving for something sweet?";
    if (key.includes("sandwich")) return "Stacked with taste, just for you!";
    if (key.includes("roll")) return "Roll into flavor town!";
    if (key.includes("icecream")) return "Cool down with a sweet treat!";
    if (key.includes("south")) return "Want to taste the best from South?";
    return `Taste the delicious ${itemName.toLowerCase()} today`;
  }

  return (
    <div className="min-h-screen flex flex-col items-stretch dark:bg-gray-900">
      <div className="w-full">
        <h2 className="text-3xl ml-4 font-extrabold text-black/80 dark:text-gray-100 mb-2 drop-shadow-sm text-left w-full">{itemName.toUpperCase()}</h2>
        <p className="text-lg ml-4 text-gray-700 dark:text-gray-300 mb-8 text-left w-full">{getFoodTagline(itemName)}</p>
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh] w-full">
            <Loader />
          </div>
        ) : foodPartners.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-2xl font-bold text-orange-400 dark:text-orange-300 w-full">Coming soon...</div>
        ) : (
          <div className="flex ml-4 flex-col md:flex-row md:flex-nowrap gap-6 mb-10 md:overflow-x-auto md:overflow-y-visible md:pr-12 md:items-start md:justify-start w-full">
            {foodPartners.map((partner, idx) => {
              const specialItem = partner.items.find((item) => normalize(item.name).includes(foodKey));
              return (
                <a
                  key={idx}
                  href={`/orders/shopitems?shop=${encodeURIComponent(partner.name)}&food=${encodeURIComponent(itemName)}`}
                  className="w-[80vw] md:w-64 h-64 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col border border-orange-200 dark:border-gray-700 flex-shrink-0 transition-transform hover:scale-105 focus:outline-none overflow-hidden md:ml-0 text-left"
                  style={{ textDecoration: 'none' }}
                >
                  <img
                    src={partner.image && partner.image !== '/logo.png' ? partner.image.startsWith('http') ? partner.image : `${process.env.NEXT_PUBLIC_BACKEND_API}${partner.image}` : '/logo.png'}
                    alt="Shop Logo"
                    className="w-full"
                    style={{ height: '65%', objectFit: 'cover' }}
                  />
                  <div className="flex flex-col justify-between h-[35%] w-full p-3">
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{partner.name}</h3>
                        {partner.shopAddress && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{partner.shopAddress}</span>
                        )}
                      </div>
                      <div className="flex items-center ml-2">
                        <span className="text-yellow-400 dark:text-yellow-300 text-lg mr-1">★</span>
                        <span className="text-base font-semibold text-gray-800 dark:text-gray-200">{partner.rating || "4.5"}</span>
                      </div>
                    </div>
                    <span className="text-orange-500 dark:text-orange-300 font-medium text-sm">Special: {specialItem?.name}</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
