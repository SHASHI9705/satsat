import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-white border border-black flex items-center justify-center">
                <img src="/logo.svg" alt="SleekRoad Logo" className="w-10 h-10 object-contain" />
              </div>
              <span className="font-bold text-xl">SleekRoad</span>
            </div>
            <p className="text-gray-400 text-sm">
              A modern marketplace connecting college students and communities.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer">
                <Link href="/allitems">Browse Items</Link>
              </li>
              <li className="hover:text-white cursor-pointer">
                <Link href="/dashboard">Sell Items</Link>
              </li>
              <li className="hover:text-white cursor-pointer">
                <Link href="/allitems">Services</Link>
              </li>
              <li className="hover:text-white cursor-pointer">
                <Link href="/allitems">Tutoring</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer">
                <Link href="/help">Help Center</Link>
              </li>
              <li className="hover:text-white cursor-pointer">
                <Link href="/safety">Safety Tips</Link>
              </li>
              <li className="hover:text-white cursor-pointer">
                <Link href="/contact">Contact Us</Link>
              </li>
              <li className="hover:text-white cursor-pointer">
                <Link href="/report">Report Issue</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer">
                <Link href="/about">About Us</Link>
              </li>
              <li className="hover:text-white cursor-pointer">
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li className="hover:text-white cursor-pointer">
                <Link href="/terms">Terms of Service</Link>
              </li>
              <li className="hover:text-white cursor-pointer">
                <Link href="/careers">Careers</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2024 SleekRoad. All rights reserved. Made for local communities.</p>
        </div>
      </div>
    </footer>
  );
}