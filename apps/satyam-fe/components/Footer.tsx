"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 grid-cols-1 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Satyam"
                width={36}
                height={36}
                className="rounded"
              />
              <div className="text-2xl font-bold text-white">Satyam</div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Trusted recruitment platform for banking, insurance, and finance roles.
              One application, many opportunities.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link className="hover:text-white transition-colors" href="/apply">
                  Apply Now
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/positions">
                  All Positions
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/about">
                  About Us
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/terms">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Popular Categories
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Banking & Finance</li>
              <li>Insurance Sales</li>
              <li>Loan Processing</li>
              <li>Collection Executive</li>
              <li>Telecalling</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-sm text-slate-400">
          <p>© 2026 Satyam Financial Careers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
