import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";




export default function PhoneFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState("home");
  const [favCount, setFavCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // On mount, set from localStorage or default to home
    const stored = localStorage.getItem("hotdrop_footer_tab");
    setSelected(stored || "home");
    // Get counts
    const updateCounts = () => {
      const favs = JSON.parse(localStorage.getItem("hotdrop_favourites") || "[]");
      const favShops = JSON.parse(localStorage.getItem("hotdrop_favshops") || "[]");
      const favsCount = Array.isArray(favs) ? favs.length : 0;
      const favShopsCount = Array.isArray(favShops) ? favShops.length : 0;
      setFavCount(favsCount + favShopsCount);
      const cart = JSON.parse(localStorage.getItem("hotdrop_cart") || "[]");
      setCartCount(Array.isArray(cart) ? cart.length : 0);
    };
    updateCounts();
    // Listen for storage changes (in case other tabs update)
    const handleStorage = () => updateCounts();
    window.addEventListener("storage", handleStorage);
    // Poll localStorage every 200ms for instant UI update
    const interval = setInterval(updateCounts, 200);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Also update counts when tab is focused (for SPA navigation)
  useEffect(() => {
    const onFocus = () => {
      const favs = JSON.parse(localStorage.getItem("hotdrop_favourites") || "[]");
      const favShops = JSON.parse(localStorage.getItem("hotdrop_favshops") || "[]");
      const favsCount = Array.isArray(favs) ? favs.length : 0;
      const favShopsCount = Array.isArray(favShops) ? favShops.length : 0;
      setFavCount(favsCount + favShopsCount);
      const cart = JSON.parse(localStorage.getItem("hotdrop_cart") || "[]");
      setCartCount(Array.isArray(cart) ? cart.length : 0);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Always highlight correct tab based on current route
  let effectiveSelected = selected;
  if (pathname === "/") effectiveSelected = "home";
  else if (pathname.startsWith("/restaurants")) effectiveSelected = "restaurants";
  else if (pathname.startsWith("/favourites")) effectiveSelected = "favourites";
  else if (pathname.startsWith("/cart")) effectiveSelected = "cart";

  const handleSelect = (tab: string, path: string) => {
    setSelected(tab);
    localStorage.setItem("hotdrop_footer_tab", tab);
    router.push(path);
    // Update counts after navigation
    setTimeout(() => {
      const favs = JSON.parse(localStorage.getItem("hotdrop_favourites") || "[]");
      const favShops = JSON.parse(localStorage.getItem("hotdrop_favshops") || "[]");
      const favsCount = Array.isArray(favs) ? favs.length : 0;
      const favShopsCount = Array.isArray(favShops) ? favShops.length : 0;
      setFavCount(favsCount + favShopsCount);
      const cart = JSON.parse(localStorage.getItem("hotdrop_cart") || "[]");
      setCartCount(Array.isArray(cart) ? cart.length : 0);
    }, 100);
  };
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 border-t border-orange-200 dark:border-gray-700 flex justify-between items-center px-6 py-2 shadow-lg">
      {/* Home Tab */}
      <button
        className={`flex-1 flex flex-col items-center justify-center text-black dark:text-white focus:outline-none`}
        onClick={() => handleSelect("home", "/")}
        aria-label="Home"
      >
        <span className={effectiveSelected === "home" ? "bg-orange-100 dark:bg-gray-800 rounded-xl p-2 transition" : "p-2"}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V21h15V10.5" />
          </svg>
        </span>
      </button>
      {/* Restaurants Tab */}
      <button
        className={`flex-1 flex flex-col items-center justify-center text-black dark:text-white focus:outline-none`}
        onClick={() => handleSelect("restaurants", "/restaurants")}
        aria-label="Restaurants"
      >
        <span className={effectiveSelected === "restaurants" ? "bg-orange-100 dark:bg-gray-800 rounded-xl p-2 transition" : "p-2"}>
          <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
            <path d="M16.84,11.63A3,3,0,0,0,19,10.75l2.83-2.83a1,1,0,0,0,0-1.41,1,1,0,0,0-1.42,0L17.55,9.33a1,1,0,0,1-1.42,0h0L19.67,5.8a1,1,0,1,0-1.42-1.42L14.72,7.92a1,1,0,0,1,0-1.41l2.83-2.83a1,1,0,1,0-1.42-1.42L13.3,5.09a3,3,0,0,0,0,4.24h0L12,10.62,3.73,2.32l-.1-.06a.71.71,0,0,0-.17-.11l-.18-.07L3.16,2H3.09l-.2,0a.57.57,0,0,0-.18,0,.7.7,0,0,0-.17.09l-.16.1-.07,0-.06.1a1,1,0,0,0-.11.17,1.07,1.07,0,0,0-.07.19s0,.07,0,.11a11,11,0,0,0,3.11,9.34l2.64,2.63-5.41,5.4a1,1,0,0,0,0,1.42,1,1,0,0,0,.71.29,1,1,0,0,0,.71-.29L9.9,15.57h0l2.83-2.83h0l2-2A3,3,0,0,0,16.84,11.63ZM9.19,13.45,6.56,10.81A9.06,9.06,0,0,1,4,5.4L10.61,12Zm6.24.57A1,1,0,0,0,14,15.44l6.3,6.3A1,1,0,0,0,21,22a1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.42Z"></path>
          </svg>
        </span>
      </button>
      {/* Favourites Tab */}
      <button
        className={`flex-1 flex flex-col items-center justify-center text-black dark:text-white focus:outline-none relative`}
        onClick={() => handleSelect("favourites", "/favourites")}
        aria-label="Favourites"
      >
        <span className={effectiveSelected === "favourites" ? "bg-orange-100 dark:bg-gray-800 rounded-xl p-2 transition" : "p-2"} style={{position: 'relative', display: 'inline-flex'}}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
          </svg>
          {favCount > 0 && (
            <span className="absolute bg-red-500 text-white text-[11px] font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white z-10" style={{top: '0px', right: '-4px'}}>
              {favCount}
            </span>
          )}
        </span>
      </button>
      {/* Cart Tab */}
      <button
        className={`flex-1 flex flex-col items-center justify-center text-black dark:text-white focus:outline-none relative`}
        onClick={() => handleSelect("cart", "/cart")}
        aria-label="Cart"
      >
        <span className={effectiveSelected === "cart" ? "bg-orange-100 dark:bg-gray-800 rounded-xl p-2 transition" : "p-2"}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
            <path d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          {cartCount > 0 && (
            <span className="absolute bg-red-500 text-white text-[11px] font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white z-10" style={{top: '0px', right: '12px'}}>
              {cartCount}
            </span>
          )}
        </span>
      </button>
    </footer>
  );
}
