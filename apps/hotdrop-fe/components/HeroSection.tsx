import { motion } from "framer-motion";
import { foodSectionId } from "./FoodSection";
import { useRouter } from "next/navigation";

export default function HeroSection({ user, cartCount }: { user: { name: string; email: string } | null, cartCount: number }) {
  const router = useRouter();
  return (
    <div className="flex flex-col-reverse md:flex-row items-center gap-32 md:gap-48 max-w-6xl mt-20">
      {/* Left: Skip line content (on left for desktop, below for mobile) */}
      <div className="md:w-1/2 md:mr-32 text-center md:text-left -mt-20 md:mt-0 flex flex-col items-center md:items-start">
        <h1 className="text-4xl xs:text-6xl sm:text-7xl md:text-6xl font-extrabold text-gray-900 leading-tight whitespace-nowrap dark:text-white">
          Skip The <span className="text-orange-500 dark:text-orange-400">Line</span><br />
          Grab On <span className="text-orange-500 dark:text-orange-400">Time!</span>
        </h1>
        <div className="flex flex-row items-center mt-6 gap-2 w-full justify-center md:justify-start">
          {user ? (
            <>
              <p className="block md:hidden text-orange-500 font-semibold text-base mr-2">Feeling hungry?</p>
              <button
                onClick={() => {
                  const section = document.getElementById(foodSectionId);
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full hover:bg-orange-600 transition-colors duration-300 text-base font-semibold flex items-center gap-2 min-w-[110px] dark:from-orange-500 dark:to-red-500 dark:text-orange-100 dark:hover:from-orange-800 dark:hover:to-red-800"
              >
                <motion.span
                  role="img"
                  aria-label="rocket"
                  className="text-xl"
                  animate={{ filter: [
                    "drop-shadow(0 0 0px #fbbf24)",
                    "drop-shadow(0 0 8px #fbbf24)",
                    "drop-shadow(0 0 0px #fbbf24)"
                  ] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >🚀</motion.span>
                Quick Order
              </button>
              <button
                className="hidden md:flex bg-white text-orange-500 border border-orange-300 px-4 py-1.5 rounded-full hover:bg-orange-100 transition-colors duration-300 text-base font-semibold items-center gap-2 ml-2 shadow-sm relative min-w-[110px] dark:bg-gray-900 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-950"
                onClick={() => router.push('/cart')}
              >
                <span role="img" aria-label="cart" className="text-xl">🛒</span>
                View Cart
                {cartCount > 0 && (
                  <motion.span
                    className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border border-white"
                    animate={{
                      boxShadow: [
                        "0 0 0px 0px #fbbf24",
                        "0 0 12px 4px #fbbf24",
                        "0 0 0px 0px #fbbf24"
                      ]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >{cartCount}</motion.span>
                )}
              </button>
            </>
          ) : (
            <button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors duration-300 text-lg font-semibold dark:bg-orange-700 dark:hover:bg-orange-800 dark:text-orange-100" onClick={() => window.location.href = '/signup'}>
              Get Started
            </button>
          )}
        </div>
      </div>
      {/* Right: Girl and announcement bar (on right for desktop, top for mobile) */}
      <div className="md:w-1/2 flex flex-col items-center justify-center mb-10 md:mb-0 relative">
        {/* Animated food images in two circles behind the girl */}
        <motion.div
          className="flex absolute inset-0 items-center justify-center z-0"
          style={{ pointerEvents: "none" }}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
        >
          {[ "/burger.png", "/pizza.png", "/cake.png", "/icecream.png", "/momo.png", "/rolls.png", "/cake.png", "/icecream.png", ].map((src, i, arr) => {
            const angle = (360 / arr.length) * i;
            return (
              <img
                key={src + i}
                src={src}
                alt="food"
                className="w-10 h-10 md:w-20 md:h-20 rounded-full absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-140px) rotate(-${angle}deg)`,
                  ...(typeof window !== 'undefined' && window.innerWidth >= 768 ? { transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-240px) rotate(-${angle}deg)` } : {})
                }}
              />
            );
          })}
        </motion.div>
        <motion.div
          className="hidden md:flex absolute inset-0 items-center justify-center z-0"
          style={{ pointerEvents: "none" }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
        >
          {[
            "/burger.png",
            "/pizza.png",
            "/cake.png",
            "/icecream.png",
            "/momo.png",
          ].map((src, i, arr) => {
            const angle = (360 / arr.length) * i;
            return (
              <img
                key={src}
                src={src}
                alt="food"
                className="w-12 h-12 md:w-16 md:h-16 rounded-full absolute"
                style={{
                  left: `calc(50% - 2.5rem)`,
                  top: `calc(50% - 2.5rem)`,
                  transform: `rotate(${angle}deg) translateY(-120px) rotate(-${angle}deg)`
                }}
              />
            );
          })}
        </motion.div>
        <motion.img
          src="/girl2.png"
          alt="Ordering girl illustration"
          className="w-64 md:w-80 z-10 relative mb-0"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <div
          className="absolute left-0 right-0 top-full mt-0 flex justify-center"
          style={{ marginTop: 0 }}
        >
          <div className="w-full max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl flex items-center px-3 md:px-4 py-2 bg-orange-100 rounded-full text-xs md:text-sm font-medium text-red-600 transition-colors duration-300 shadow dark:bg-orange-950 dark:text-orange-300">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            <span className="flex-1 text-center">Now accepting advance orders</span>
          </div>
        </div>
      </div>
    </div>
  );
}
