import React, { useState, useEffect } from "react";

export default function PopularRestaurantsSection() {
  const [cards, setCards] = useState<any[]>([]); // [{type, data, fav}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const foodTypes = [
	{ type: "burger", label: "Burger" },
	{ type: "pizza", label: "Pizza" },
	{ type: "momo", label: "Momos" },
	{ type: "chinese", label: "Chinese" }
  ];

  useEffect(() => {
	setLoading(true);
	fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/partner/all`)
	  .then((res) => res.json())
	  .then((data) => {
		const partners = data.partners || [];
		const favs = (() => {
		  try {
			return JSON.parse(localStorage.getItem("hotdrop_favourites") || "[]");
		  } catch { return []; }
		})();
		const foundCards = foodTypes.map(({ type, label }) => {
		  const partner = partners.find((p: any) =>
			p.items.some((item: any) => item.name && item.name.toLowerCase().includes(type))
		  );
		  if (!partner) return null;
		  const item = partner.items.find((item: any) => item.name && item.name.toLowerCase().includes(type));
		  const cardData = {
			type,
			label,
			shop: {
			  id: partner.id,
			  name: partner.shopname,
			  image: partner.shopimage?.url || null
			},
			item: {
			  name: item.name,
			  price: item.price,
			  image: item.image
			},
			fav: favs.some((f: any) => f.shop && f.shop.id === partner.id)
		  };
		  return cardData;
		}).filter(Boolean);
		setCards(foundCards);
		setLoading(false);
	  })
	  .catch(() => {
		setError("Failed to load shops");
		setLoading(false);
	  });
  }, []);

  return (
   <section className="my-16 w-full max-w-6xl mx-auto dark:from-gray-900 dark:via-gray-950 dark:to-gray-90">
	<h2 className="-mt-12 text-3xl font-bold text-black mb-8 text-left pl-2 ml-2 dark:text-white">
	  Popular near <span className="text-orange-600 dark:text-orange-400">you</span>!
	</h2>
	<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
	  {loading ? (
		<div className="flex items-center justify-center h-full w-full py-16 text-gray-400 dark:text-gray-500">Loading...</div>
	  ) : error ? (
		<div className="flex items-center justify-center h-full w-full py-16 text-red-400 dark:text-red-500">{error}</div>
	  ) : cards.length === 0 ? (
		<div className="flex items-center justify-center h-full w-full py-16 text-gray-400 dark:text-gray-500">No shops found</div>
	  ) : (
		cards.map((card, idx) => (
		  <div key={card.type} className="relative bg-white rounded-xl shadow p-0 w-11/12 max-w-xs flex flex-col border border-orange-100 overflow-hidden mx-auto dark:bg-gray-900 dark:border-gray-800">
			{/* Shop Name */}
			<div className="absolute top-2 right-4 z-10 bg-white/80 px-3 py-1 rounded-full text-xs font-semibold text-orange-600 shadow dark:bg-gray-900/80 dark:text-orange-300">{card.shop.name}</div>
			{/* Favorite Heart Button */}
			<button
			  className={`absolute top-2 left-2 rounded-full p-2 shadow transition ${card.fav ? "bg-red-500 dark:bg-red-600" : "bg-white hover:bg-orange-100 dark:bg-gray-900 dark:hover:bg-orange-950"}`}
			  onClick={() => {
				try {
				  let favs = [];
				  try {
					favs = JSON.parse(localStorage.getItem("hotdrop_favourites") || "[]");
				  } catch {}
				  if (!card.fav) {
					// Add to favourites
					favs.push(card);
					localStorage.setItem("hotdrop_favourites", JSON.stringify(favs));
				  } else {
					// Remove from favourites
					favs = favs.filter((f: any) => f.shop && f.shop.id !== card.shop.id);
					localStorage.setItem("hotdrop_favourites", JSON.stringify(favs));
				  }
				  // Update UI
				  setCards((prev) => prev.map((c, i) => i === idx ? { ...c, fav: !c.fav } : c));
				} catch {}
			  }}
			  aria-label="Add to favorites"
			>
			  <svg
				xmlns="http://www.w3.org/2000/svg"
				fill={card.fav ? "#fff" : "none"}
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke={card.fav ? "#fff" : "#f97316"}
				className="w-5 h-5"
			  >
				<path
				  strokeLinecap="round"
				  strokeLinejoin="round"
				  d="M16.5 3.75a5.25 5.25 0 00-4.5 2.472A5.25 5.25 0 007.5 3.75C5.014 3.75 3 5.764 3 8.25c0 7.25 9 12 9 12s9-4.75 9-12c0-2.486-2.014-4.5-4.5-4.5z"
				/>
			  </svg>
			</button>
			{/* Food Image */}
			<div className="w-full" style={{height: '150px'}}>
			  <img src={card.item.image || "/pizza.png"} alt={card.item.name} className="w-full h-full object-cover" style={{minHeight: 120, maxHeight: 150}} />
			</div>
			{/* Name & Price Row (no rating) */}
			<div className="flex items-center justify-between w-full mb-0 gap-2 px-3 max-w-full overflow-hidden" style={{ minHeight: 0, paddingBottom: 0 }}>
				<div className="font-semibold text-lg text-gray-800 truncate text-left max-w-[50%] dark:text-orange-200">{card.item.name}</div>
				<div className="flex items-center gap-2">
					<span className="text-gray-400 font-medium text-base line-through dark:text-gray-500">
						₹{Math.round(card.item.price * 1.15)}
					</span>
					<span className="text-gray-700 font-medium text-base whitespace-nowrap dark:text-orange-200">
						₹{card.item.price}
					</span>
				</div>
			</div>
			{/* Add to Cart Button */}
			<button
			  className="px-0 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-b-xl font-semibold text-sm hover:bg-orange-600 transition w-full dark:from-orange-500 dark:to-red-500 dark:text-orange-100 dark:hover:from-orange-800 dark:hover:to-red-800"
			  style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: 0 }}
			  onClick={() => {
				// Prepare cart item structure as in CartPage
				const cartItem = {
				  id: card.item.name + "-" + card.shop.id, // unique per shop+item
				  name: card.item.name,
				  price: card.item.price,
				  image: card.item.image,
				  quantity: 1,
				  shopId: card.shop.id,
				  shopName: card.shop.name,
				  shopImage: card.shop.image
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
				  id: card.shop.id,
				  name: card.shop.name,
				  shopname: card.shop.name,
				  image: card.shop.image
				};
				localStorage.setItem("hotdrop_selected_shop", JSON.stringify(shopInfo));
			  }}
			>
			  Add to Cart
			</button>
		  </div>
		))
	  )}
	  </div>
	</section>
  );
}