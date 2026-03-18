"use client";

import React from "react";
import { Info } from "lucide-react";

type JobNotificationProps = {
  onAccept?: () => void;
};

const districtRows = [
  { district: "Ajmer", bm: 10, sales: 20, creditCom: 10, collection: 10, telecaller: 20 },
  { district: "Alwar", bm: 12, sales: 24, creditCom: 12, collection: 12, telecaller: 24 },
  { district: "Banswara", bm: 5, sales: 10, creditCom: 5, collection: 5, telecaller: 10 },
  { district: "Baran", bm: 8, sales: 16, creditCom: 8, collection: 8, telecaller: 16 },
  { district: "Barmer", bm: 8, sales: 16, creditCom: 8, collection: 8, telecaller: 16 },
  { district: "Bharatpur", bm: 10, sales: 20, creditCom: 10, collection: 10, telecaller: 20 },
  { district: "Bhilwara", bm: 13, sales: 26, creditCom: 13, collection: 13, telecaller: 26 },
  { district: "Bikaner", bm: 8, sales: 16, creditCom: 8, collection: 8, telecaller: 16 },
  { district: "Bundi", bm: 5, sales: 10, creditCom: 5, collection: 5, telecaller: 10 },
  { district: "Chittaurgarh", bm: 13, sales: 26, creditCom: 13, collection: 13, telecaller: 26 },
  { district: "Churu", bm: 7, sales: 14, creditCom: 7, collection: 7, telecaller: 14 },
  { district: "Dausa", bm: 5, sales: 10, creditCom: 5, collection: 5, telecaller: 10 },
  { district: "Dhaulpur", bm: 5, sales: 10, creditCom: 5, collection: 5, telecaller: 10 },
  { district: "Dungarpur", bm: 4, sales: 8, creditCom: 4, collection: 4, telecaller: 8 },
  { district: "Ganganagar", bm: 9, sales: 18, creditCom: 9, collection: 9, telecaller: 18 },
  { district: "Hanumangarh", bm: 7, sales: 14, creditCom: 7, collection: 7, telecaller: 14 },
  { district: "Jaipur", bm: 13, sales: 26, creditCom: 13, collection: 13, telecaller: 26 },
  { district: "Jaisalmer", bm: 3, sales: 6, creditCom: 3, collection: 3, telecaller: 6 },
  { district: "Jalor", bm: 7, sales: 14, creditCom: 7, collection: 7, telecaller: 14 },
  { district: "Jhalawar", bm: 7, sales: 14, creditCom: 7, collection: 7, telecaller: 14 },
  { district: "Jhunjhunun", bm: 6, sales: 12, creditCom: 6, collection: 6, telecaller: 12 },
  { district: "Jodhpur", bm: 8, sales: 16, creditCom: 8, collection: 8, telecaller: 16 },
  { district: "Karauli", bm: 6, sales: 12, creditCom: 6, collection: 6, telecaller: 12 },
  { district: "Kota", bm: 5, sales: 10, creditCom: 5, collection: 5, telecaller: 10 },
  { district: "Nagaur", bm: 11, sales: 22, creditCom: 11, collection: 11, telecaller: 22 },
  { district: "Pali", bm: 9, sales: 18, creditCom: 9, collection: 9, telecaller: 18 },
  { district: "Pratapgarh", bm: 5, sales: 10, creditCom: 5, collection: 5, telecaller: 10 },
  { district: "Rajsamand", bm: 7, sales: 14, creditCom: 7, collection: 7, telecaller: 14 },
  { district: "Sawai Madhopur", bm: 7, sales: 14, creditCom: 7, collection: 7, telecaller: 14 },
  { district: "Sikar", bm: 6, sales: 12, creditCom: 6, collection: 6, telecaller: 12 },
  { district: "Sirohi", bm: 5, sales: 10, creditCom: 5, collection: 5, telecaller: 10 },
  { district: "Tonk", bm: 7, sales: 14, creditCom: 7, collection: 7, telecaller: 14 },
  { district: "Udaipur", bm: 10, sales: 20, creditCom: 10, collection: 10, telecaller: 20 },
];

export default function JobNotification({ onAccept }: JobNotificationProps) {
  const totals = {
    bm: districtRows.reduce((sum, row) => sum + row.bm, 0),
    sales: districtRows.reduce((sum, row) => sum + row.sales, 0),
    creditCom: districtRows.reduce((sum, row) => sum + row.creditCom, 0),
    collection: districtRows.reduce((sum, row) => sum + row.collection, 0),
    telecaller: districtRows.reduce((sum, row) => sum + row.telecaller, 0),
  };

  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header with blue gradient */}
        <div className="flex items-center p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg">
          <div>
            <h2 className="text-2xl font-semibold text-white">District Recruitment Notification</h2>
            <p className="text-sm text-blue-100 mt-1">Position requirements by district</p>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6 px-6 py-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-base font-semibold text-blue-900 mb-2">Welcome to Satyam Careers.</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              This portal provides information about current recruitment opportunities available in different districts. Candidates are requested to carefully review the job positions, salary details, and important notices before proceeding with the application process.
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-blue-900">District</th>
                  <th className="text-right py-3 px-4 font-medium text-blue-900">BM</th>
                  <th className="text-right py-3 px-4 font-medium text-blue-900">Sales</th>
                  <th className="text-right py-3 px-4 font-medium text-blue-900">Credit/Com</th>
                  <th className="text-right py-3 px-4 font-medium text-blue-900">Collection</th>
                  <th className="text-right py-3 px-4 font-medium text-blue-900">Telecaller</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {districtRows.map((row, index) => (
                  <tr 
                    key={row.district} 
                    className={`hover:bg-blue-50/50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <td className="py-2 px-4 text-gray-900 font-medium">{row.district}</td>
                    <td className="py-2 px-4 text-right text-gray-700">{row.bm}</td>
                    <td className="py-2 px-4 text-right text-gray-700">{row.sales}</td>
                    <td className="py-2 px-4 text-right text-gray-700">{row.creditCom}</td>
                    <td className="py-2 px-4 text-right text-gray-700">{row.collection}</td>
                    <td className="py-2 px-4 text-right text-gray-700">{row.telecaller}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-blue-50 border-t border-blue-200 font-medium">
                <tr>
                  <td className="py-3 px-4 text-blue-900 font-semibold">Total Positions</td>
                  <td className="py-3 px-4 text-right text-blue-900 font-semibold">{totals.bm}</td>
                  <td className="py-3 px-4 text-right text-blue-900 font-semibold">{totals.sales}</td>
                  <td className="py-3 px-4 text-right text-blue-900 font-semibold">{totals.creditCom}</td>
                  <td className="py-3 px-4 text-right text-blue-900 font-semibold">{totals.collection}</td>
                  <td className="py-3 px-4 text-right text-blue-900 font-semibold">{totals.telecaller}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-6 border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-blue-900">Post</th>
                  <th className="text-left py-3 px-4 font-medium text-blue-900">Salary</th>
                  <th className="text-left py-3 px-4 font-medium text-blue-900">Incentive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-white">
                  <td className="py-3 px-4 text-gray-900 font-medium">BRANCH MANAGER</td>
                  <td className="py-3 px-4 text-gray-700">25000-30000 PER MONTH</td>
                  <td className="py-3 px-4 text-gray-700">AS PER POLICY</td>
                </tr>
                <tr className="bg-gray-50/30">
                  <td className="py-3 px-4 text-gray-900 font-medium">SALES (MSME/ VEHICLE/INSURANCE) & COLLECTION</td>
                  <td className="py-3 px-4 text-gray-700">15000-20000</td>
                  <td className="py-3 px-4 text-gray-700">AS PER POLICY</td>
                </tr>
                <tr className="bg-white">
                  <td className="py-3 px-4 text-gray-900 font-medium">CREDIT / COM & TELECALLER WORK FROM HOME</td>
                  <td className="py-3 px-4 text-gray-700">15000-18000</td>
                  <td className="py-3 px-4 text-gray-700">AS PER POLICY</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Important Notice - Yellow theme */}
          <div className="mt-6 px-6 py-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Info className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Notice</h3>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>This is a private sector opportunity, not a government job</li>
                  <li>Final selection is interview-based</li>
                  <li>Incentives are as per company policy and may vary by position</li>
                  <li>Interview dates will be announced after May 30, 2026</li>
                  <li>Interview locations will be in the respective districts</li>
                  <li>Number of positions may be adjusted based on requirements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with blue buttons */}
        <div className="p-6 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-md transition-all shadow-sm hover:shadow"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}