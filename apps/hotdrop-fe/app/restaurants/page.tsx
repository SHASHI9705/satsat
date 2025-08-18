"use client"


import { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import PhoneFooter from "../../components/PhoneFooter";
// Heart button component for toggling favourite shops
function RestaurantFavButton({ shop }: { shop: any }) {
  const [isFav, setIsFav] = useState(false);
  useEffect(() => {
    // Check if shop is in localStorage favourites
    const favs = JSON.parse(localStorage.getItem("hotdrop_favshops") || "[]");
    setIsFav(favs.some((s: any) => s.id === shop.id));
  }, [shop.id]);

  const toggleFav = () => {
    let favs = [];
    try {
      favs = JSON.parse(localStorage.getItem("hotdrop_favshops") || "[]");
    } catch {}
    const exists = favs.find((s: any) => s.id === shop.id);
    let newFavs;
    if (exists) {
      newFavs = favs.filter((s: any) => s.id !== shop.id);
      setIsFav(false);
    } else {
      newFavs = [...favs, { id: shop.id, shopname: shop.shopname, shopimage: shop.shopimage && shop.shopimage.url ? shop.shopimage.url : null }];
      setIsFav(true);
    }
    localStorage.setItem("hotdrop_favshops", JSON.stringify(newFavs));
  };

  return (
    <button
      className="absolute top-2 right-3 z-20 bg-white/80 hover:bg-orange-100 rounded-full p-2 shadow transition"
      title={isFav ? "Remove from favourite shops" : "Add to favourite shops"}
      onClick={toggleFav}
      style={{ lineHeight: 0 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={isFav ? "#fb923c" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={2.2}
        stroke="#fb923c"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
        />
      </svg>
    </button>
  );
}



export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    // Fetch all restaurants from backend
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/partner/all`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRestaurants(data);
          setFilteredRestaurants(data);
        } else if (data && Array.isArray(data.partners)) {
          setRestaurants(data.partners);
          setFilteredRestaurants(data.partners);
        } else if (data && Array.isArray(data.data)) {
          setRestaurants(data.data);
          setFilteredRestaurants(data.data);
        } else {
          setRestaurants([]);
          setFilteredRestaurants([]);
        }
      })
      .catch(() => setRestaurants([]));
  }, []);

  // Filter restaurants when category changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredRestaurants(restaurants);
    } else {
      // Filter restaurants that have at least one item with the category in its name
      setFilteredRestaurants(
        restaurants.filter(rest =>
          Array.isArray(rest.items)
            ? rest.items.some((item: any) =>
                typeof item.name === 'string' && item.name.toLowerCase().includes(selectedCategory.toLowerCase())
              )
            : false
        )
      );
    }
  }, [selectedCategory, restaurants]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-orange-100 to-orange-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex flex-col items-center pt-8 px-4 pb-24">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 w-full px-0 md:px-4 py-3 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow border border-orange-200 dark:border-gray-700">
          {/* Back Button (left) */}
          <button
            className="flex items-center px-5 py-2  dark:hover:bg-gray-600 text-orange-600 dark:text-orange-300 font-semibold rounded-lg shadow transition ml-2"
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
            
            <h1 className="text-xl md:text-4xl font-bold text-orange-500 dark:text-orange-500 drop-shadow-sm whitespace-nowrap">Restaurants</h1>
          </div>
          {/* Home Button (right) */}
          <div className="w-[65px]"></div>
        </div>
        <p className="text-base text-gray-700 dark:text-gray-200 mb-10 text-center max-w-2xl mx-auto hidden sm:block">Find top local spots, pre-order your favorites, and grab your food on the go!</p>
        {/* Category Slider under nav */}
        <div className="w-full max-w-5xl mx-auto">
          <div className="w-full mt-2 mb-4 relative">
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex flex-row gap-2 py-3 min-w-full justify-start md:justify-center" style={{ position: 'relative' }}>
                {['All', 'Burger', 'Pizza', 'Ice cream', 'Momos', 'Cake', 'Dosa', 'Noodle'].map((cat, idx) => (
                  <button
                    key={cat}
                    className={`px-2 py-2 text-sm font-semibold rounded-full bg-white dark:bg-gray-900 text-orange-500 dark:text-orange-300 border border-orange-200 dark:border-orange-700 shadow hover:bg-orange-50 dark:hover:bg-gray-800 transition whitespace-nowrap ${selectedCategory === cat ? 'ring-1 ring-orange-400 dark:ring-orange-500' : ''}`}
                    style={{ minWidth: '80px' }}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {filteredRestaurants.length === 0 ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {filteredRestaurants.map((rest, idx) => (
              <div key={rest.id || idx} className="relative bg-white dark:bg-gray-800 rounded-xl shadow p-0 w-11/12 max-w-xs md:max-w-md lg:max-w-2xl flex flex-col border border-orange-100 dark:border-gray-700 overflow-hidden mx-auto">
                {/* Heart Favourite Button */}
                <RestaurantFavButton shop={rest} />
                {/* Restaurant Image */}
                <div className="w-full" style={{height: '150px'}}>
                  <img
                    src={
                      (rest.shopimage && typeof rest.shopimage === 'object' && rest.shopimage.url)
                        ? rest.shopimage.url
                        : "/pizza.png"
                    }
                    alt={rest.shopname}
                    className="w-full h-full object-cover"
                    style={{minHeight: 120, maxHeight: 150}}
                  />
                </div>
                {/* Name, Avg Time & Rating Row */}
                <div className="flex items-center justify-between w-full mb-0 gap-2 px-3 max-w-full overflow-hidden py-3">
                  <div className="flex flex-col min-w-0 max-w-[50%] text-left">
                    <span className="font-semibold text-lg text-gray-800 dark:text-gray-100 truncate">{rest.shopname}</span>
                    {rest.shopAddress && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{rest.shopAddress}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Avg Time Label */}
                    <span className="bg-orange-100 dark:bg-gray-700 text-orange-600 dark:text-orange-300 text-xs font-semibold rounded-full px-2 py-0.5 mr-1 whitespace-nowrap">{idx % 2 === 0 ? "10-20 min" : "25-30 min"}</span>
                    {/* Rating */}
                    <div className="flex items-center gap-1 text-orange-500 dark:text-orange-300 text-sm whitespace-nowrap">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-4 h-4">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                      </svg>
                      <span>4.3</span>
                    </div>
                  </div>
                </div>
                {/* View Menu Button */}
                <button
                  className="px-0 py-3 bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-500 dark:to-red-600 text-white rounded-b-xl font-semibold text-sm hover:bg-orange-600 dark:hover:bg-orange-700 transition w-full"
                  style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: 'auto' }}
                  onClick={() => window.location.href = `/allitems?shop=${encodeURIComponent(rest.shopname)}`}
                >
                  View Menu
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="md:hidden">
        <PhoneFooter />
      </div>
    </div>
  );
}
