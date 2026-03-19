"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Car,
  ChevronRight,
  Clock,
  Factory,
  Headset,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Truck,
  Wallet,
  MapPin,
  Briefcase,
  Users
} from "lucide-react";

interface JobCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  gradient: string;
}

interface FeaturedJob {
  id: string;
  title: string;
  salary: string;
  type: string;
  posted: string;
  category: string;
  positions: number;
  company?: string;
  location?: string;
  featured?: boolean;
}

const PositionsPage = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);

  const jobCategories: JobCategory[] = [
    { 
      id: "banking", 
      label: "Banking", 
      icon: <Landmark size={20} />, 
      count: 250, 
      gradient: "from-blue-500 to-blue-600" 
    },
    { 
      id: "insurance", 
      label: "Insurance", 
      icon: <ShieldCheck size={20} />, 
      count: 200, 
      gradient: "from-emerald-500 to-emerald-600" 
    },
    { 
      id: "vehicle-loan", 
      label: "Vehicle Loan", 
      icon: <Car size={20} />, 
      count: 220, 
      gradient: "from-amber-500 to-amber-600" 
    },
    { 
      id: "msme-loan", 
      label: "MSME Loan", 
      icon: <Factory size={20} />, 
      count: 190, 
      gradient: "from-purple-500 to-purple-600" 
    },
    { 
      id: "credit", 
      label: "Credit/Cashier", 
      icon: <Wallet size={20} />, 
      count: 250, 
      gradient: "from-rose-500 to-rose-600" 
    },
    { 
      id: "collection", 
      label: "Collection", 
      icon: <Truck size={20} />, 
      count: 15, 
      gradient: "from-indigo-500 to-indigo-600" 
    },
    { 
      id: "telecalling", 
      label: "Telecalling (Female Only)", 
      icon: <Headset size={20} />, 
      count: 251, 
      gradient: "from-pink-500 to-pink-600" 
    },
    { 
      id: "branch", 
      label: "Branch Incharge", 
      icon: <Building2 size={20} />, 
      count: 120, 
      gradient: "from-cyan-500 to-cyan-600" 
    }
  ];

  const featuredJobs: FeaturedJob[] = [
    {
      id: "1",
      title: "Branch Incharge",
      salary: "₹4 - 7 LPA",
      type: "Full-time",
      posted: "2 days ago",
      category: "branch",
      positions: 40,
      company: "Satyam Bank",
      featured: true
    },
    {
      id: "2",
      title: "Credit/Cashier",
      salary: "₹2.5 - 4 LPA",
      type: "Full-time",
      posted: "1 day ago",
      category: "credit",
      positions: 100,
      company: "Satyam Credit",
      
    },
    {
      id: "3",
      title: "Sales Executive - Vehicle Loan",
      salary: "₹3 - 5 LPA + Incentives",
      type: "Full-time",
      posted: "3 days ago",
      category: "vehicle-loan",
      positions: 120,
      company: "Satyam Finance",
      
    },
    {
      id: "4",
      title: "Sales Executive - MSME Loan",
      salary: "₹3.5 - 6 LPA",
      type: "Full-time",
      posted: "4 days ago",
      category: "msme-loan",
      positions: 60,
      company: "Satyam Business",
     
    },
    {
      id: "5",
      title: "Sales Executive - Insurance",
      salary: "₹2.8 - 5 LPA + Commission",
      type: "Full-time",
      posted: "2 days ago",
      category: "insurance",
      positions: 150,
      company: "Satyam Insurance",
     
    },
    {
      id: "6",
      title: "Collection Executive",
      salary: "₹2.5 - 4 LPA",
      type: "Full-time",
      posted: "1 day ago",
      category: "collection",
      positions: 100,
      company: "Satyam Collections",
    
    },
    {
      id: "7",
      title: "Telecalling Executive (Female Only)",
      salary: "₹2 - 3.5 LPA + Incentives",
      type: "Remote",
      posted: "5 days ago",
      category: "telecalling",
      positions: 200,
      company: "Satyam Services",
    
    }
  ];

  const filteredJobs = activeCategory === "all"
    ? featuredJobs
    : featuredJobs.filter((job) => job.category === activeCategory);

  const totalJobs = featuredJobs.length;
  const activeCategoryData = jobCategories.find(c => c.id === activeCategory);
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-wide text-blue-600 mb-2">
                Open Roles
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Available Positions
              </h1>
              <p className="text-slate-600 max-w-2xl mt-2">
                Select your preferred role from {totalJobs}+ opportunities and take the next step in your career.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={user ? "/apply" : "/signin"}
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                Apply Now
                <ChevronRight size={16} className="ml-1" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Browse by Category</h2>
            {activeCategory !== "all" && activeCategoryData && (
              <button
                onClick={() => setActiveCategory("all")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Categories →
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <button
              onClick={() => setActiveCategory("all")}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${activeCategory === "all" 
                  ? "border-blue-600 bg-blue-50 shadow-md" 
                  : "border-slate-100 hover:border-blue-200 bg-white hover:shadow-md"
                }
              `}
            >
              <Briefcase size={24} className={activeCategory === "all" ? "text-blue-600" : "text-slate-400"} />
              <p className={`font-medium mt-2 ${activeCategory === "all" ? "text-blue-600" : "text-slate-900"}`}>
                All Positions
              </p>
            </button>

            {jobCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200 group
                  ${activeCategory === category.id 
                    ? `border-${category.gradient.split('-')[1]}-600 bg-${category.gradient.split('-')[1]}-50 shadow-md` 
                    : "border-slate-100 hover:border-slate-200 bg-white hover:shadow-md"
                  }
                `}
              >
                <div className={`
                  transition-colors duration-200
                  ${activeCategory === category.id 
                    ? `text-${category.gradient.split('-')[1]}-600` 
                    : "text-slate-400 group-hover:text-slate-600"
                  }
                `}>
                  {category.icon}
                </div>
                <p className={`font-medium mt-2 ${activeCategory === category.id ? `text-${category.gradient.split('-')[1]}-600` : "text-slate-900"}`}>
                  {category.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {activeCategory === "all" 
                ? "Latest Opportunities" 
                : `${jobCategories.find(c => c.id === activeCategory)?.label} Positions`
              }
            </h2>
            <p className="text-sm text-slate-500">
              Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
            </p>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onMouseEnter={() => setHoveredJob(job.id)}
                  onMouseLeave={() => setHoveredJob(null)}
                  className={`
                    group bg-white rounded-xl border border-slate-200 p-6 
                    transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                    ${hoveredJob === job.id ? "shadow-xl border-blue-200" : ""}
                  `}
                >
                  {/* {job.featured && (
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-semibold rounded-full mb-4">
                      Featured
                    </span>
                  )} */}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      {job.company && (
                        <p className="text-sm text-slate-500 mt-1">{job.company}</p>
                      )}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                      <Users size={12} className="mr-1" />
                      {job.positions} open
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {job.location && (
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400" />
                        {job.location}
                      </p>
                    )}
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <TrendingUp size={14} className="text-slate-400" />
                      {job.salary}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <Clock size={12} />
                      Posted {job.posted}
                    </p>
                  </div>

                  <Link
                    href={user ? "/apply" : "/signin"}
                    className={`
                      w-full inline-flex items-center justify-center gap-2 
                      bg-blue-600 text-white font-medium py-2.5 rounded-lg 
                      transition-all duration-200
                      hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200
                      group-hover:shadow-lg
                    `}
                  >
                    Apply Now
                    <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No positions found</h3>
              <p className="text-slate-500 mb-4">No jobs available in this category at the moment.</p>
              <button
                onClick={() => setActiveCategory("all")}
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                View all positions →
              </button>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join our team and build a rewarding career with opportunities for growth and success.
            </p>
            <Link
              href={user ? "/apply" : "/signin"}
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Apply Now
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PositionsPage;