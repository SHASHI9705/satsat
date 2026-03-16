"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react'; // Optional: Install lucide-react for a better icon

const TermsPage = () => {
  const router = useRouter();

  const sections = [
    {
      title: "1. Non-Refundable Application Fee",
      content: "The application/form fee is strictly non-refundable. By submitting an application, the candidate acknowledges that they waive any right to claim a refund under any circumstances."
    },
    {
      title: "2. Selection & Shortlisting Process",
      content: "Shortlisting is based solely on resume evaluation. Selection and formal onboarding are finalized only upon successful completion of the interview process. The Company reserves the right to modify selection criteria without prior notice."
    },
    {
      title: "3. No Liability for Non-Selection",
      content: "Candidates who are not shortlisted for an interview shall have no grounds for claims, demands, or grievances against the Company."
    },
    {
      title: "4. Final Authority & Legal Indemnity",
      content: "The Company’s decisions regarding recruitment are final and binding. Applicants agree to indemnify the Company against any legal claims arising during the recruitment or interview process."
    },
    {
      title: "5. Operational Flexibility & Remote Work",
      content: "All placements are subject to management approval. In the event of office unavailability or operational delays, the Company reserves the right to mandate a 'Work from Home' policy, which the applicant must adhere to."
    },
    {
      title: "6. Single Registration Policy",
      content: "Upon initial fee payment, candidates are registered in our database. Future recruitment cycles will not require additional fees, and registered applicants will receive priority consideration for subsequent openings."
    },
    {
      title: "7. Probationary (Off-Roll) Period",
      content: "Successful candidates will serve a 12-month off-roll period. Eligibility for on-roll conversion is contingent upon performance. Enrollment in a Performance Improvement Plan (PIP) at any point during this period disqualifies the candidate from on-roll consideration."
    },
    {
      title: "8. Remuneration & Performance Incentives",
      content: "During the initial 12 months, full salary and incentives are disbursed upon 100% target achievement. Sub-target performance will result in incentive payouts strictly governed by Company policy. Incentive structures are non-justiciable."
    },
    {
      title: "9. On-Roll Conversion Benefits",
      content: "Upon successful conversion to on-roll status, employees shall receive a fixed monthly salary. Performance-based incentives will continue to apply as per the prevailing Company targets."
    },
    {
      title: "10. Expense Reimbursement",
      content: "The Company will not reimburse or bear any official or personal expenses incurred by the candidate during the 12-month off-roll period."
    },
    {
      title: "11. Binding Declaration",
      content: "By proceeding, the applicant declares they have read, understood, and voluntarily accepted these terms. The applicant agrees that the Company's decision is final and waives all future claims."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Application
        </button>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 sm:p-12">
          <header className="border-b border-slate-100 pb-8 mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Terms and Conditions
            </h1>
            {/* <p className="mt-2 text-slate-500 text-sm">
              Last updated: October 2023
            </p> */}
          </header>

          <div className="space-y-10">
            {sections.map((section, index) => (
              <section key={index} className="group">
                <h2 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {section.title}
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  {section.content}
                </p>
              </section>
            ))}
          </div>

          <footer className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              By submitting your application, you agree to be bound by the terms listed above.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;