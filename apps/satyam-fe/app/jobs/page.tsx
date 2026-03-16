"use client"

import React, { useState } from "react";
import Link from "next/link";

const Jobs = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="max-w-5xl mx-auto px-8 py-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Job Openings</h1>
          <p className="text-slate-600 mt-2">
            Explore roles in sales, credit, and insurance across multiple locations.
          </p>
        </div>
        <Link
          href="/apply"
          className="bg-blue-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold"
        >
          Apply Now
        </Link>
      </header>

      <section className="max-w-5xl mx-auto px-8 pb-16 space-y-4">
        {[
          "Relationship Manager",
          "Field Sales Executive",
          "Credit Analyst",
          "Customer Support Associate"
        ].map((role) => (
          <div
            key={role}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between"
          >
            <div>
              <p className="text-lg font-bold">{role}</p>
              <p className="text-sm text-slate-500">Full-time · Multiple cities</p>
            </div>
            <Link href="/apply" className="text-sm font-semibold text-blue-900">
              Apply
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Jobs;