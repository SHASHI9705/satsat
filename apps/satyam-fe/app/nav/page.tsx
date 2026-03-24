"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FaUserCircle } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { FaClipboardList, FaComments, FaSignOutAlt } from "react-icons/fa";

const Nav = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showApplications, setShowApplications] = useState(false);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutsideApplications = (event) => {
      if (
        showApplications &&
        !event.target.closest(".application-card") &&
        !event.target.closest("button")
      ) {
        setShowApplications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideApplications);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideApplications);
    };
  }, [showApplications]);

  const fetchApplications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/applications?userId=${user.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch applications");

      const data = await response.json();
      setApplications(data);
      setShowApplications(true);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

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
              href={user ? "/apply" : "/signin"}
              className="hidden sm:block bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-2.5 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Apply Now 
            </Link>
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <div
                  className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-white cursor-pointer border-black border"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {user.firstname?.charAt(0).toUpperCase() || "U"}
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <Link
                      href="/chat"
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      <FaComments /> Contact Admin
                    </Link>
                    <button
                      onClick={fetchApplications}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaClipboardList /> My Applications
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("user");
                        window.location.reload();
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {showApplications && (
        <div className="mt-32 fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg relative flex flex-col items-center">
            <button
              onClick={() => setShowApplications(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-center mb-6">
              {user?.firstname ? `${user.firstname}'s Applications` : 'My Applications'}
            </h2>
            {applications.length > 0 ? (
              <ul className="space-y-4 w-full">
                {applications.map((app) => (
                  <li key={app.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                    <p className="text-lg font-semibold">Application ID: {app.applicationId}</p>
                    <p className="text-sm text-gray-600">Status: {app.status}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No applications found.</p>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
