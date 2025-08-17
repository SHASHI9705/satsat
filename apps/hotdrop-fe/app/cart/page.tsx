

"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PhoneFooter from "../../components/PhoneFooter";

// Utility to remove null bytes from strings
function sanitizeString(str: string) {
  return typeof str === "string" ? str.replace(/\0/g, "") : str;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  shopId?: string;
  shopName?: string;
  shopImage?: string;
}

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-orange-100 to-orange-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex flex-col items-center pt-8 px-4 pb-24">
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-8 px-0 md:px-4 py-3 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow border border-orange-200 dark:border-gray-700">
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
          <h1 className="text-xl md:text-3xl font-bold text-orange-500 drop-shadow-sm whitespace-nowrap">Your Cart</h1>
        </div>
        {/* Home Button (right) */}
        <div className="w-[65px]"></div>
      </div>
      <Suspense fallback={<div className="text-center text-gray-500 py-12">Loading...</div>}>
        <CartContent />
      </Suspense>
      <div className="md:hidden">
        <PhoneFooter />
      </div>
    </div>
  );
}

function CartContent() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  // Heading is now in nav, so only use foodHeading for accessibility if needed
  // const foodHeading = searchParams.get("food") || "Your Cart";

  useEffect(() => {
    // Example: fetch cart from localStorage or API
    const stored = localStorage.getItem("hotdrop_cart");
    if (stored) {
      setCart(JSON.parse(stored));
      // Auto-restore selected shop if missing and all items are from the same shop
      const selectedShop = localStorage.getItem("hotdrop_selected_shop");
      if (!selectedShop) {
        try {
          const arr = JSON.parse(stored);
          // If all items have the same shopId, restore it
          if (arr.length > 0 && arr[0].shopId) {
            const shopId = arr[0].shopId;
            let shopInfo = null;
            const legacy = localStorage.getItem("hotdrop_partner");
            if (legacy) {
              const legacyObj = JSON.parse(legacy);
              if (legacyObj.id === shopId) shopInfo = legacyObj;
            }
            // If not found, just use the info from the cart item
            if (!shopInfo) {
              shopInfo = {
                id: arr[0].shopId,
                name: arr[0].shopName || arr[0].name,
                shopname: arr[0].shopName || arr[0].name,
                image: arr[0].shopImage,
              };
            }
            localStorage.setItem("hotdrop_selected_shop", JSON.stringify(shopInfo));
          }
        } catch {}
      }
    }
    setLoading(false);
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      );
      localStorage.setItem("hotdrop_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("hotdrop_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Coupon logic
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  // Get user from localStorage
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("hotdrop_user") || "null") : null;
  // Popup state for order status
  const [orderPopup, setOrderPopup] = useState<{ message: string; success: boolean } | null>(null);

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponApplied(false);
    setDiscountPercent(null);
    if (!couponInput.trim() || !user?.id) return;
    try {
      // Check if coupon exists
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/coupons/${couponInput.trim()}`);
      if (!res.ok) {
        setCouponError("Coupon not found or invalid.");
        return;
      }
      const data = await res.json();
      // Check if user already used this coupon (GET route)
      const usageRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/coupons/${couponInput.trim()}/usage?userId=${user.id}`);
      const usageData = await usageRes.json();
      if (!usageRes.ok || (usageData.usage && usageData.usage.used)) {
        setCouponError("You have already used this coupon.");
        return;
      }
      setCouponApplied(true);
      setDiscountPercent(data.offerPercent);
    } catch {
      setCouponError("Error applying coupon.");
    }
  };

  // Calculate discounted total
  const discountedTotal = discountPercent
    ? total + total * 0.03 - ((total + total * 0.03) * (discountPercent / 100))
    : total + total * 0.03;

  return (
    <div className="min-h-screen flex flex-col items-center pt-4 sm:px-4">
      {/* Items Card - visually separate */}
      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">Loading...</div>
      ) : cart.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12 text-lg">Your cart is empty 🛒</div>
      ) : (
        <>
          {/* Check for multiple shops in cart */}
          {(() => {
            const shopIds = Array.from(new Set(cart.map(item => item.shopId)));
            if (shopIds.length > 1) {
              return (
                <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg px-4 py-3 mb-4 text-center font-semibold">
                  You can only add items from one shop at a time. Please remove items from other shops to proceed.
                </div>
              );
            }
            return null;
          })()}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-orange-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-orange-500 mb-4">Your Items</h2>
            <div className="flex flex-col gap-6">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row items-center justify-between gap-4 bg-orange-50 dark:bg-gray-900 rounded-lg p-4 border border-orange-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-4 w-full md:w-1/2">
                    <img src={item.image.startsWith("/images/") ? `${process.env.NEXT_PUBLIC_BACKEND_API}${item.image}` : item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg border border-orange-200 dark:border-gray-700" />
                    <div>
                      {/* Shop name above item name */}
                      <div className="text-xs font-semibold text-orange-400 mb-1">{item.shopName || "Unknown Shop"}</div>
                      <div className="font-bold text-lg text-gray-800 dark:text-gray-100">{item.name}</div>
                      <div className="text-orange-500 dark:text-orange-300 font-semibold text-base">₹{item.price}</div>
                    </div>
                  </div>
                  {/* Controls Row: plus, minus, price, remove */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <button className="bg-orange-200 dark:bg-gray-700 text-orange-700 dark:text-orange-300 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-orange-300 dark:hover:bg-gray-600" onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <span className="font-semibold text-lg text-gray-700 dark:text-gray-100">{item.quantity}</span>
                    <button className="bg-orange-500 dark:bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-orange-600 dark:hover:bg-orange-700" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    <div className="font-bold text-lg text-gray-800 dark:text-gray-100 ml-2">₹{item.price * item.quantity}</div>
                    <button className="text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-400 text-xs font-bold border border-red-200 dark:border-red-700 rounded px-3 py-1 transition-colors duration-200 ml-2" onClick={() => removeItem(item.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Coupon Card - rectangle with heading and SVG */}
      {cart.length > 0 && (
        <div className="w-[20rem] md:w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-orange-200 dark:border-gray-700 flex flex-col gap-2">
          <div className="flex items-center mb-2 justify-between w-full">
            <div className="flex items-center">
              <svg viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" className="w-7 h-7 mr-2 text-black dark:text-white">
                <g id="SVGRepo_bgCarrier" strokeWidth={0}></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.817 16.063V14.721C17.817 14.3887 17.949 14.07 18.184 13.835L19.133 12.886C19.6223 12.3967 19.6223 11.6033 19.133 11.114L18.184 10.165C17.949 9.93001 17.817 9.61131 17.817 9.27899V7.93599C17.817 7.24398 17.256 6.68299 16.564 6.68299H15.221C14.8887 6.68299 14.57 6.55097 14.335 6.31599L13.386 5.36699C12.8967 4.87767 12.1033 4.87767 11.614 5.36699L10.665 6.31599C10.43 6.55097 10.1113 6.68299 9.77899 6.68299H8.43599C8.1035 6.68299 7.78464 6.81514 7.54963 7.05034C7.31462 7.28554 7.18273 7.6045 7.18299 7.93699V9.27899C7.18299 9.61131 7.05097 9.93001 6.81599 10.165L5.86699 11.114C5.37767 11.6033 5.37767 12.3967 5.86699 12.886L6.81599 13.835C7.05097 14.07 7.18299 14.3887 7.18299 14.721V16.063C7.18299 16.755 7.74398 17.316 8.43599 17.316H9.77899C10.1113 17.316 10.43 17.448 10.665 17.683L11.614 18.632C12.1033 19.1213 12.8967 19.1213 13.386 18.632L14.335 17.683C14.57 17.448 14.8887 17.316 15.221 17.316H16.563C16.8955 17.3163 17.2144 17.1844 17.4496 16.9493C17.6848 16.7143 17.817 16.3955 17.817 16.063Z" stroke="#ffffff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.78202 10.641C9.50715 10.3662 9.42492 9.95286 9.57366 9.59375C9.7224 9.23464 10.0728 9.00049 10.4615 9.00049C10.8502 9.00049 11.2006 9.23464 11.3494 9.59375C11.4981 9.95286 11.4159 10.3662 11.141 10.641C10.7657 11.0163 10.1573 11.0163 9.78202 10.641Z" stroke="#ffffff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M13.859 14.718C13.5841 14.4431 13.5019 14.0298 13.6506 13.6707C13.7994 13.3115 14.1498 13.0774 14.5385 13.0774C14.9272 13.0774 15.2776 13.3115 15.4263 13.6707C15.5751 14.0298 15.4928 14.4431 15.218 14.718C14.8427 15.0932 14.2343 15.0932 13.859 14.718Z" stroke="#ffffff" strokeWidth={1.5} strokeLinecap="round"></path>
                  <path d="M15.218 9.28101L9.78101 14.719" stroke="#ffffff" strokeWidth={1.5} strokeLinecap="round"></path>
                </g>
              </svg>
              <h2 className="text-xl font-bold text-orange-500">Offers</h2>
              <span className="text-orange-600 font-semibold text-base ml-2 hidden sm:inline">:Enjoy the meal with less price 🌶️</span>
            </div>
          </div>
          <div className="flex items-center md:w-full">
            <input
              type="text"
              value={couponInput}
              onChange={e => setCouponInput(e.target.value)}
              placeholder="Apply coupon "
              className="flex-1 -ml-2 md:ml-1 px-3 py-2 rounded-lg border border-orange-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-gray-900 dark:text-white"
            />
            <div className="flex-1 flex justify-end">
              <button
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200"
                onClick={handleApplyCoupon}
              >
                Apply
              </button>
            </div>
          </div>
          {couponApplied && (
            <div className="text-green-600 font-semibold mt-2">Applied successfully!</div>
          )}
          {couponError && (
            <div className="text-red-500 font-semibold mt-2">{couponError}</div>
          )}
        </div>
      )}
  {cart.length > 0 && (
    <>
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 pt-2 mb-8 border border-orange-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-orange-500 mb-2">Order Summary</h2>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <div className="flex items-center justify-between w-full">
            <span className="text-gray-700 dark:text-gray-100 font-semibold">Subtotal</span>
            <span className="text-gray-800 dark:text-gray-100 font-bold">₹{total}</span>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-gray-700 dark:text-gray-100 font-semibold">GST (3%)</span>
            <span className="text-gray-800 dark:text-gray-100 font-bold">₹{(total * 0.03).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between w-full ">
            <span className="text-gray-700 dark:text-gray-100 font-semibold">Coupon Applied</span>
            <span className="text-gray-800 dark:text-gray-100 font-bold">{discountPercent ? `${discountPercent}%` : 'None'}</span>
          </div>
          <div className="flex items-center justify-between w-full mt-2 border-t dark:border-gray-700 pt-2">
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">Total</span>
            <div className="flex items-center gap-3">
              {discountPercent && (
                <span className="text-lg text-gray-500 line-through">
                  ₹{(total + total * 0.03).toFixed(2)}
                </span>
              )}
              <span className="text-xl font-bold text-orange-500 dark:text-orange-300">
                ₹{discountedTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-3xl text-center">
        <button
          className="bg-gradient-to-r justify-center w-full text-center w-3xl from-orange-500 to-red-500 dark:from-orange-500 dark:to-red-500 text-white px-8 py-3 rounded text-2xl font-bold shadow hover:bg-orange-600 dark:hover:from-orange-600 dark:hover:to-red-600 transition-colors duration-300 flex items-center gap-2"
          onClick={async () => {
            // Get user info
            const user = JSON.parse(localStorage.getItem("hotdrop_user") || "null");
            if (!user || !user.id) {
              setOrderPopup({ message: "User ID missing. Please log in again to place an order.", success: false });
              setTimeout(() => setOrderPopup(null), 1000);
              return;
            }
            let partner = JSON.parse(localStorage.getItem("hotdrop_selected_shop") || "null");
            if (!partner || !partner.id) {
              partner = JSON.parse(localStorage.getItem("hotdrop_partner") || "null");
            }
            if (!partner || !partner.id) {
              setOrderPopup({ message: "No partner selected for this order. Please go to a shop and add items again.", success: false });
              setTimeout(() => setOrderPopup(null), 1000);
              return;
            }
            // Prepare order data
            const orderData = {
              userId: sanitizeString(user.id),
              partnerId: sanitizeString(partner.id),
              items: sanitizeString(cart.map(item => `${sanitizeString(item.name)} x${item.quantity}`).join(", ")),
              shopName: sanitizeString(partner.name || partner.shopname || ""),
              price: sanitizeString(discountedTotal.toFixed(2))
            };
            // Razorpay integration
            const loadRazorpay = () => {
              return new Promise((resolve) => {
                //@ts-ignore
                if (window.Razorpay) {
                  resolve(true);
                  return;
                }
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.onload = () => resolve(true);
                document.body.appendChild(script);
              });
            };
            await loadRazorpay();
            const options = {
              key: `${process.env.NEXT_PUBLIC_RAZORPAY_KEY}`,
              amount: Math.round(discountedTotal * 100), // Use discounted total amount in paise
              currency: "INR",
              name: "HotDrop",
              description: "Order Payment",
              image: "/logo.png",
              handler: async function (response: any) {
                // On payment success, place order
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/orders/order`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(orderData)
                });
                if (res.ok) {
                  // Get orderId from response
                  const order = await res.json();
                  // Call split API
                  await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/orders/order/split`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orderId: order.id || order.orderId || "", // adapt to your backend response
                      partnerId: orderData.partnerId,
                      amount: Math.round(discountedTotal * 100) // in paise
                    })
                  });
                  // If coupon applied, mark as used for this user
                  if (couponApplied && couponInput.trim() && user?.id) {
                    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/coupons/${couponInput.trim()}/use/user`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: user.id })
                    });
                  }
                  localStorage.removeItem("hotdrop_cart");
                  setCart([]);
                  setOrderPopup({ message: "Order placed successfully!", success: true });
                  setTimeout(() => {
                    setOrderPopup(null);
                    router.push("/myorders");
                  }, 1000);
                } else {
                  const data = await res.json();
                  setOrderPopup({ message: data.error || "Failed to place order", success: false });
                  setTimeout(() => setOrderPopup(null), 1000);
                }
              },
              prefill: {
                name: user.name || "",
                email: user.email || "",
              },
              theme: { color: "#fb923c" },
            };
            // @ts-ignore
            const rzp = new window.Razorpay(options);
            rzp.open();
          }}
        >
            Pay Now
        </button>
        {/* Order status popup */}
        {orderPopup && (
          <div
            className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30 transition-opacity duration-300`}
          >
            <div
              className={`px-8 py-6 rounded-xl shadow-lg text-center font-bold text-lg ${orderPopup.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              style={{ minWidth: 280 }}
            >
              {orderPopup.success ? (
                <svg className="mx-auto mb-2" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="mx-auto mb-2" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
              {orderPopup.message}
            </div>
          </div>
        )}
      </div>
    </>
  )}
      <div>
        <div className="mt-8 flex justify-center">
          <button className="bg-orange-100 dark:bg-gray-700 text-orange-500 dark:text-orange-300 px-6 py-2 rounded-full font-semibold hover:bg-orange-200 dark:hover:bg-gray-600 transition-colors duration-200" onClick={() => router.push("/")}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}
