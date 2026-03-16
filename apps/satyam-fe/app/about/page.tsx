"use client"

import React, { useState } from "react";
import Link from "next/link";

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section with Full Background Image */}
      <div className="relative h-[70vh] min-h-[600px] w-full">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content Overlay */}
        <div className="relative h-full max-w-7xl mx-auto px-8 flex flex-col justify-center">
          <Link
            href="/"
            className="absolute top-8 right-8 text-white/90 hover:text-white font-semibold text-sm tracking-wide"
          >
            ← Back to Home
          </Link>
          
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              About Satyam
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              We help candidates grow careers in finance, credit, and insurance 
              with clear pathways and reliable support.
            </p>
          </div>
        </div>
      </div>

      {/* Stats/Values Section */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
              Our Mission
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Build confidence through transparent hiring, training, and 
              real-world opportunities that prepare candidates for lasting success.
            </p>
            <div className="w-16 h-1 bg-blue-600 mt-6 group-hover:w-24 transition-all" />
          </div>

          <div className="group">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
              Our Values
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Integrity, clarity, and long-term growth for every applicant 
              we support. We believe in building relationships, not just placements.
            </p>
            <div className="w-16 h-1 bg-blue-600 mt-6 group-hover:w-24 transition-all" />
          </div>

          <div className="group">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
              Our Reach
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Trusted by thousands of applicants and partners across India, 
              helping shape the future of finance professionals nationwide.
            </p>
            <div className="w-16 h-1 bg-blue-600 mt-6 group-hover:w-24 transition-all" />
          </div>
        </div>
      </section>

      {/* Optional: Additional Content Section */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Your Partner in Professional Growth
              </h2>
              <p className="text-slate-600 mb-4">
                With years of experience in the finance and insurance sector, 
                we understand what it takes to build a successful career. 
                Our approach combines industry expertise with personalized guidance.
              </p>
              <p className="text-slate-600">
                Whether you're just starting out or looking to advance, 
                we're here to provide the resources, connections, and support 
                you need to achieve your goals.
              </p>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-bold text-blue-600">10K+</div>
                  <div className="text-sm text-slate-600">Candidates Placed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">95%</div>
                  <div className="text-sm text-slate-600">Success Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">200+</div>
                  <div className="text-sm text-slate-600">Partner Companies</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">15+</div>
                  <div className="text-sm text-slate-600">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
