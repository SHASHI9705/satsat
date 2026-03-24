"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, UserCheck } from "lucide-react";

const AUTH_KEY = "satyam_auth";

export default function Welcome() {
  const router = useRouter();
  const [user, setUser] = useState<{ contact: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) {
        router.push("/signin");
        return;
      }
      const parsed = JSON.parse(raw);
      setUser(parsed.user || null);
    } catch (e) {
      router.push("/signin");
    }
  }, [router]);

  function handleLogout() {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (e) {}
    router.push("/signin");
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="text-white">Redirecting...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Hero / Welcome */}
          <div className="md:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white/10 p-3 text-white">
                  <UserCheck className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Welcome — you are successfully logged in.</h1>
                  <p className="mt-1 text-sm text-blue-100/90">Logged in as <strong className="text-white">{user.contact}</strong></p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/apply" className="rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow">
                  Apply Now
                </Link>
                <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white p-4 text-slate-800">
                <h3 className="font-semibold">Profile</h3>
                <p className="mt-1 text-sm text-slate-600">Complete your application profile to improve matches.</p>
              </div>
              <div className="rounded-xl bg-white p-4 text-slate-800">
                <h3 className="font-semibold">Applications</h3>
                <p className="mt-1 text-sm text-slate-600">Track submitted applications and interview updates.</p>
              </div>
              <div className="rounded-xl bg-white p-4 text-slate-800">
                <h3 className="font-semibold">Support</h3>
                <p className="mt-1 text-sm text-slate-600">Contact us for help with your account or applications.</p>
                <Link href="/chat" className="mt-3 inline-flex rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                  Contact Support
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white p-4">
                <h3 className="font-semibold text-slate-800">Salary Slab</h3>
                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  <div className="flex items-start justify-between">
                    <div>Branch Manager</div>
                    <div className="font-semibold">₹25,000 - ₹30,000 / month</div>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>Sales (MSME/Vehicle/Insurance) & Collection</div>
                    <div className="font-semibold">₹15,000 - ₹20,000</div>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>Credit / COM & Telecaller (Work from home)</div>
                    <div className="font-semibold">₹15,000 - ₹18,000</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-4">
                <h3 className="font-semibold text-slate-800">Recruitment Note</h3>
                <div className="mt-3 text-sm text-slate-600 max-h-40 overflow-auto">
                  <p>
                    NOTE: Incentive as per policy and policy decided as per post and work. This policy may change monthly. Telecaller team incentive is per lead created. We will provide tab for call and data entry. All posts are as per number of tehsil in same district. We inform only selected candidates; unselected are not authorized for appeal. Final selection is interview-based. Interview dates decided after 30 May 2026. Interview location: same district. Number of posts can be changed as per requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vacancy table panel */}
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white">Vacancy Breakdown</h2>
            <p className="mt-1 text-sm text-blue-100/80">Overview by district — download CSV to view or edit full data.</p>

            <div className="mt-4">
              <div className="overflow-auto rounded-md border border-white/10 bg-white p-2">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500">
                      <th className="px-2 py-2">District</th>
                      <th className="px-2 py-2">BM</th>
                      <th className="px-2 py-2">Sales</th>
                      <th className="px-2 py-2">Credit</th>
                      <th className="px-2 py-2">Collection</th>
                      <th className="px-2 py-2">Telecaller</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Placeholder/example rows — replace by CSV import for full dataset */}
                    <tr className="border-t border-slate-100/10">
                      <td className="px-2 py-2 text-slate-800">Ajmer</td>
                      <td className="px-2 py-2">10</td>
                      <td className="px-2 py-2">20</td>
                      <td className="px-2 py-2">10</td>
                      <td className="px-2 py-2">10</td>
                      <td className="px-2 py-2">20</td>
                    </tr>
                    <tr className="border-t border-slate-100/10">
                      <td className="px-2 py-2 text-slate-800">Alwar</td>
                      <td className="px-2 py-2">12</td>
                      <td className="px-2 py-2">24</td>
                      <td className="px-2 py-2">12</td>
                      <td className="px-2 py-2">12</td>
                      <td className="px-2 py-2">24</td>
                    </tr>
                    <tr className="border-t border-slate-100/10">
                      <td className="px-2 py-2 text-slate-800">Bhilwara</td>
                      <td className="px-2 py-2">13</td>
                      <td className="px-2 py-2">26</td>
                      <td className="px-2 py-2">13</td>
                      <td className="px-2 py-2">13</td>
                      <td className="px-2 py-2">26</td>
                    </tr>
                    <tr className="border-t border-slate-100/10">
                      <td className="px-2 py-2 text-slate-800">Jaipur</td>
                      <td className="px-2 py-2">13</td>
                      <td className="px-2 py-2">26</td>
                      <td className="px-2 py-2">13</td>
                      <td className="px-2 py-2">13</td>
                      <td className="px-2 py-2">26</td>
                    </tr>
                    <tr className="border-t border-slate-100/10">
                      <td className="px-2 py-2 text-slate-800">Churu</td>
                      <td className="px-2 py-2">7</td>
                      <td className="px-2 py-2">14</td>
                      <td className="px-2 py-2">7</td>
                      <td className="px-2 py-2">7</td>
                      <td className="px-2 py-2">14</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <a href="/data/vacancies-sample.csv" download className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow">
                  Download CSV
                </a>
                <label className="text-sm text-blue-100/80">Or upload CSV to replace data</label>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
