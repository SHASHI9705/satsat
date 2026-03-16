"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

const Nav = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-4 z-50 
      w-[100%] max-w-7xl mx-auto 
      rounded-2xl border border-slate-200 shadow-md">
      <div className="px-4 sm:px-6 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Satyam logo" className="h-10 w-auto" />
            <div>
              <h1 className="font-bold text-xl tracking-tight">SATYAM</h1>
              <p className="text-xs text-slate-500">Financial Careers</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-lg font-bold text-blue-900 border-b-2 border-blue-900 pb-1">
              Home
            </a>
            <a href="/positions" className="text-lg font-bold text-slate-600 hover:text-slate-900">
              Jobs
            </a>
            <a href="#Categories" className="text-lg font-bold text-slate-600 hover:text-slate-900">
              Categories
            </a>
            <a href="#apply" className="text-lg font-bold text-slate-600 hover:text-slate-900">
              How to apply
            </a>
            
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/apply"
              className="bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-2.5 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Apply Now <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
