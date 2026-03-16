"use client"
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search, FileText, Users, Briefcase, Star,
  ChevronRight, CheckCircle, Award, Shield,
  TrendingUp, Clock, MapPin, Filter,
  Building2, Landmark, Car, Factory, ShieldCheck,
  Wallet, Truck, Headset, Sparkles, ArrowRight,
  CircleCheck, BadgeCheck, Zap, Target, Layers
} from "lucide-react";

interface JobCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
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

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const SatyamLandingPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const jobCategories: JobCategory[] = [
    { 
      id: "banking", 
      label: "Banking", 
      icon: <Landmark size={20} />, 
      count: 250
    },
    { 
      id: "insurance", 
      label: "Insurance", 
      icon: <ShieldCheck size={20} />, 
      count: 502
    },
    { 
      id: "vehicle-loan", 
      label: "Vehicle Loan", 
      icon: <Car size={20} />, 
      count: 528
    },
    { 
      id: "msme-loan", 
      label: "MSME Loan", 
      icon: <Factory size={20} />, 
      count: 502
    },
    { 
      id: "credit", 
      label: "Credit/Cashier", 
      icon: <Wallet size={20} />, 
      count: 251
    },
    { 
      id: "collection", 
      label: "Collection", 
      icon: <Truck size={20} />, 
      count: 251
    },
    { 
      id: "telecalling", 
      label: "Telecalling (Female Only)", 
      icon: <Headset size={20} />, 
      count: 502
    },
    { 
      id: "branch", 
      label: "Branch Incharge", 
      icon: <Building2 size={20} />, 
      count: 500
    }
  ];

  const featuredJobs: FeaturedJob[] = [
    {
      id: "1",
      title: "Branch Incharge",
      salary: "₹4 - 6 LPA",
      type: "Full-time",
      posted: "2 days ago",
      category: "branch",
      positions: 205,
      company: "Satyam careers",
      location: "Multiple districts",
      featured: true
    },
    {
      id: "2",
      title: "Credit/Cashier",
      salary: "₹2.5 - 4 LPA",
      type: "Full-time",
      posted: "1 day ago",
      category: "credit",
      positions: 251,
      company: "Satyam Credit",
      location: "Multiple districts"
    },
    {
      id: "3",
      title: "Sales Executive - Vehicle Loan",
      salary: "₹3 - 5 LPA + Incentives",
      type: "Full-time",
      posted: "3 days ago",
      category: "vehicle-loan",
      positions: 512,
      company: "Satyam Finance",
      location: "Multiple districts"
    },
    {
      id: "4",
      title: "Sales Executive - MSME Loan",
      salary: "₹3.5 - 6 LPA",
      type: "Full-time",
      posted: "4 days ago",
      category: "msme-loan",
      positions: 502,
      company: "Satyam Business",
      location: "Multiple districts"
    },
    {
      id: "5",
      title: "Sales Executive - Insurance",
      salary: "₹2.8 - 5 LPA + Commission",
      type: "Full-time",
      posted: "2 days ago",
      category: "insurance",
      positions: 500,
      company: "Satyam Insurance",
      location: "Multiple districts"
    },
    {
      id: "6",
      title: "Collection Executive",
      salary: "₹2.5 - 4 LPA",
      type: "Full-time",
      posted: "1 day ago",
      category: "collection",
      positions: 251,
      company: "Satyam Collections",
      location: "Multiple districts"
    },
    {
      id: "7",
      title: "Telecalling Executive (Female Only)",
      salary: "₹2 - 3.5 LPA + Incentives",
      type: "Remote",
      posted: "5 days ago",
      category: "telecalling",
      positions: 502,
      company: "Satyam Services",
      location: "Work from Home"
    }
  ];

  const filteredJobs = activeCategory === "all"
    ? featuredJobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : featuredJobs.filter((job) => 
        job.category === activeCategory &&
        (job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         job.company?.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const benefits: Benefit[] = [
    {
      icon: <BadgeCheck className="w-6 h-6" />, 
      title: 'Verified Employers', 
      description: 'All companies are thoroughly vetted and verified'
    },
    {
      icon: <Shield className="w-6 h-6" />, 
      title: 'Free Application', 
      description: 'No hidden charges or subscription fees'
    },
    {
      icon: <Zap className="w-6 h-6" />, 
      title: 'Quick Processing', 
      description: 'Get your cv select faster then anyone '
    },
    {
      icon: <Target className="w-6 h-6" />, 
      title: 'Right Matches', 
      description: 'AI-powered job recommendations'
    }
  ];

  const steps: Step[] = [
    {
      number: '01',
      title: 'Fill Application',
      description: 'Complete your form',
      icon: <FileText className="w-6 h-6" />
    },
    {
      number: '02',
      title: 'Upload Documents',
      description: 'Upload your documents',
      icon: <Layers className="w-6 h-6" />
    },
    {
      number: '03',
      title: 'Pay Application Fee',
      description: 'One-time fee for all positions',
      icon: <Wallet className="w-6 h-6" />
    },
    {
      number: '04',
      title: 'Get Shortlisted',
      description: 'Receive interview letter if selected',
      icon: <Sparkles className="w-6 h-6" />
    }
  ];

  const stats = [
    { icon: <Users />, value: '5000+', label: 'Applications Received' },
    { icon: <Briefcase />, value: '1500+', label: 'Seat Available' },
    { icon: <FileText />, value: '2,500+', label: 'Candidates Shortlisted' },
    { icon: <Star />, value: '4.5/5', label: 'User Rating' }
  ];

  return (
    <div className="min-h-screen -mt-20 bg-slate-50 font-sans antialiased">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob pointer-events-none" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000 pointer-events-none" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-6 lg:space-y-8 order-2 lg:order-1 text-center lg:text-left">
              {/* <div className="hidden sm:inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-white/90">250+ Active Jobs • Updated Daily</span>
              </div> */}
              
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  Your Gateway to 
                  <span className="block bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                    Financial Careers
                  </span>
                </h1>
                
                <p className="text-lg text-blue-100/90 max-w-lg lg:max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  One application, multiple opportunities in Banking, Insurance, 
                  Loans, and more. Start your journey with India's trusted recruitment platform.
                </p>
              </div>

              {/* Search Box */}
              <div className="bg-white/5 backdrop-blur-sm p-1 rounded-2xl border border-white/10">
                <div className="bg-white rounded-xl p-1 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-2 px-4">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search for jobs, companies, or roles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                    />
                  </div>
                  <Link
                    href="/apply"
                    className="relative z-40 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 font-semibold px-8 py-3 rounded-lg hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 text-center inline-flex items-center justify-center gap-2 group"
                  >
                    Apply Now
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-6 text-sm text-blue-100/80">
                <div className="flex items-center gap-2">
                  <CircleCheck size={16} className="text-slate-400" />
                  <span>No prior experience required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CircleCheck size={16} className="text-slate-200" />
                  <span>Quick process and shortlisting</span>
                </div>
              </div>
            </div>

            {/* Right Panel - Hero Image */}
            <div className="relative z-10 flex justify-center sm:justify-end lg:justify-end lg:-ml-16 mt-2 lg:mt-4 order-1 lg:order-2">
              <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-4xl sm:translate-x-6 lg:translate-x-24 lg translate-y-12">
                <div className="absolute -z-10 left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/40 blur-3xl" />
                <div className="absolute -z-10 left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300/20 blur-[80px]" />
                <img
                  src="/hero1.png"
                  alt="Career Opportunities"
                  className="w-full h-auto object-contain drop-shadow-2xl lg:scale-[1.2]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-yellow-400">
                {React.cloneElement(stat.icon, { size: 24 })}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section id="Categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Categories</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-4">Browse by Department</h2>
          <p className="text-lg text-slate-600">
            Explore opportunities across various financial sectors
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* <button
            onClick={() => setActiveCategory("all")}
            className={`p-6 rounded-xl border-2 transition-all duration-300 group ${
              activeCategory === "all" 
                ? "border-slate-400 bg-slate-50 shadow-lg" 
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-yellow-400 mb-3 group-hover:scale-110 transition-transform">
              <Filter size={20} />
            </div>
            <p className="font-semibold text-slate-900">
              All Positions
            </p>
            <p className="text-sm text-slate-500 mt-1">{featuredJobs.length} jobs</p>
          </button> */}

          {jobCategories.map((category) => (
            <Link
              key={category.id}
              href="/apply"
              className={`p-6 flex items-center gap-6 rounded-xl border-2 transition-all duration-300 group ${
                activeCategory === category.id 
                  ? "border-slate-400 bg-slate-50 shadow-lg" 
                  : "border-slate-200 bg-white hover:border-slate-700 hover:shadow-md"
              }`}
            >
              <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center border border-black/50 text-yellow-400 group-hover:scale-110 transition-transform">
                {category.icon}
              </div>

              <div>
                <p className="font-bold text-xl text-slate-900">
                  {category.label}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {category.count} jobs
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Opportunities</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">Featured Positions</h2>
          </div>
          <Link 
            href="/positions"
            className="text-slate-700 font-medium hover:text-slate-900 flex items-center gap-2 group"
          >
            View All
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-slate-500" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.slice(0, 6).map((job) => (
            <div 
              key={job.id} 
              className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    {job.featured && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full flex items-center gap-1">
                        <Sparkles size={10} className="text-slate-500" />
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{job.company}</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
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
                href="#apply"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-medium py-2.5 rounded-lg hover:bg-slate-800 transition-all duration-200 hover:shadow-lg group-hover:shadow-lg"
              >
                Apply Now
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </section> */}

      {/* How It Works */}
      <section id="apply" className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Process</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-4">How to Apply</h2>
            <p className="text-lg text-slate-600">
              Complete your application in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-6 border border-slate-200 text-center group hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-yellow-400 group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-slate-300 w-5 h-5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-4">Benefits of Applying Through Satyam</h2>
            <p className="text-lg text-slate-600">
              We make your job search easier and more effective
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-yellow-400 mb-4 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-500">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Fee Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '30px 30px'
            }} />
          </div>
          
          <div className="relative grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">Simple One-Time Fee</h3>
              <p className="text-blue-200 mb-8 text-lg">
                Apply for all positions
              </p>
              
              <div className="space-y-4">
                {[
                  "Apply for multiple positions with one form",
                  "Upload photo, signature & resume once",
                  "Get interview letter if shortlisted",
                  "Secure payment via UPI, Card, NetBanking"
                ].map((text, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                      <CheckCircle size={12} className="text-yellow-400" />
                    </div>
                    <span className="text-blue-100">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="text-center mb-6">
                <span className="text-sm text-blue-200">Application Fee</span>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-4xl font-bold">₹299</span>
                  <span className="text-blue-200">one-time</span>
                </div>
              </div>

              <Link
                href="#apply"
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 font-semibold py-4 rounded-xl hover:shadow-xl hover:shadow-yellow-500/25 transition-all duration-300 block text-center group"
              >
                Apply Now
                <ArrowRight size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <p className="text-xs text-center text-blue-200/80 mt-4">
                *Non-refundable as per terms & conditions
              </p>
            </div> */}
          </div>
        </div>
      </section>

      {/* Important Notice */}
      {/* <section className="bg-amber-50 py-6 border-y border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-100 rounded-full shrink-0">
              <FileText className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-sm text-amber-800">
              <span className="font-semibold">Important Information:</span> Application fee is non-refundable. Job selection based on interview performance. Interview letter sent after shortlisting. Final decision rests with company management.
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-lg text-slate-800 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who found their dream jobs through Satyam
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#apply"
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-all duration-300 hover:shadow-xl inline-flex items-center gap-10 group"
            >
              Apply Now     
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/positions"
              className="bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300 hover:shadow-xl"
            >
              Browse All Positions
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default SatyamLandingPage;