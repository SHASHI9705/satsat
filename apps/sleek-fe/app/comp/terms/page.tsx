"use client";

import React from "react";
import Link from "next/link";
import { Card } from "../../../components/ui/card";

export default function TermsOfServicePage({ onBack }: { onBack?: () => void }) {
  return (
    <div className="min-h-screen bg-cream-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-black">Terms of Service</h1>
            {onBack && (
              <button
                onClick={onBack}
                className="text-beige-700 hover:underline"
              >
                Back
              </button>
            )}
          </div>

          <Card className="p-6 border-beige-200 bg-white space-y-6">
            {/* Agreement */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-black">
                Agreement to Terms
              </h2>
              <p className="text-beige-800 leading-relaxed">
                Welcome to <strong>SleekRoad</strong>. By accessing or using our
                website, mobile application, or related services (collectively,
                the “Platform”), you agree to be bound by these Terms of Service
                (“Terms”). If you do not agree, you must not use the Platform.
              </p>
              <p className="text-beige-800 leading-relaxed">
                These Terms form a legally binding agreement between you and
                SleekRoad. We may update these Terms from time to time. Continued
                use of the Platform after changes constitutes acceptance of the
                revised Terms.
              </p>
            </section>

            {/* Eligibility */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-black">Eligibility</h2>
              <ul className="list-disc pl-6 text-beige-800 space-y-2">
                <li>You must be at least 18 years old or the legal age in your jurisdiction.</li>
                <li>You must provide accurate and complete account information.</li>
                <li>You are responsible for all activity under your account.</li>
                <li>You may not use SleekRoad if prohibited by law or previously banned.</li>
              </ul>
            </section>

            {/* Acceptable Use */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-black">Acceptable Use</h2>
              <p className="text-beige-800 leading-relaxed">
                You agree to use SleekRoad lawfully and responsibly. You must NOT:
              </p>
              <ul className="list-disc pl-6 text-beige-800 space-y-2">
                <li>Sell or promote illegal, stolen, counterfeit, or prohibited items.</li>
                <li>Engage in fraud, scams, misleading listings, or impersonation.</li>
                <li>Post sexually explicit, pornographic, or exploitative content.</li>
                <li>Upload content involving minors in a harmful or exploitative manner.</li>
                <li>Harass, threaten, abuse, or discriminate against others.</li>
                <li>Spam, phish, or send unsolicited promotional messages.</li>
                <li>Collect or misuse personal data without consent.</li>
                <li>Introduce malware, viruses, or malicious code.</li>
                <li>Attempt to bypass security, access controls, or rate limits.</li>
                <li>Scrape or extract platform data without authorization.</li>
                <li>Violate intellectual property or privacy rights.</li>
              </ul>
            </section>

            {/* User Content */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-black">
                User-Generated Content
              </h2>
              <ul className="list-disc pl-6 text-beige-800 space-y-2">
                <li>You retain ownership of the content you post.</li>
                <li>
                  You grant SleekRoad a non-exclusive, worldwide, royalty-free
                  license to use your content to operate and improve the Platform.
                </li>
                <li>You are responsible for the legality and accuracy of your content.</li>
                <li>We may remove content that violates these Terms without notice.</li>
              </ul>
            </section>

            {/* Transactions */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-black">
                Transactions & Safety
              </h2>
              <ul className="list-disc pl-6 text-beige-800 space-y-2">
                <li>SleekRoad only connects buyers and sellers.</li>
                <li>We are not a party to any transaction.</li>
                <li>Users are responsible for payments, delivery, and disputes.</li>
                <li>Meet in public places and verify items before payment.</li>
                <li>We are not liable for fraud, loss, or damage.</li>
              </ul>
            </section>

            {/* Suspension */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-black">
                Account Suspension & Termination
              </h2>
              <p className="text-beige-800 leading-relaxed">
                We may suspend or terminate accounts that violate these Terms,
                applicable laws, or harm the Platform or users.
              </p>
              <ul className="list-disc pl-6 text-beige-800 space-y-2">
                <li>Warnings or temporary restrictions for minor violations.</li>
                <li>Immediate permanent bans for serious or illegal activity.</li>
                <li>Illegal conduct may be reported to authorities.</li>
              </ul>
            </section>

            {/* Liability */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-black">
                Disclaimers & Limitation of Liability
              </h2>
              <p className="text-beige-800 leading-relaxed font-semibold">
                SleekRoad is provided “AS IS” without warranties of any kind.
              </p>
              <ul className="list-disc pl-6 text-beige-800 space-y-2">
                <li>We do not guarantee uninterrupted or error-free service.</li>
                <li>We do not guarantee the accuracy of listings or user content.</li>
                <li>We are not responsible for user behavior or transactions.</li>
              </ul>
              <p className="text-beige-800 leading-relaxed">
                To the maximum extent permitted by law, SleekRoad shall not be
                liable for indirect, incidental, or consequential damages.
              </p>
            </section>

            {/* IP */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-black">
                Intellectual Property
              </h2>
              <ul className="list-disc pl-6 text-beige-800 space-y-2">
                <li>SleekRoad branding, design, and software are protected by law.</li>
                <li>You may not copy or reverse-engineer any part of the Platform.</li>
                <li>
                  Report IP violations via{" "}
                  <Link href="/comp/help" className="text-green-600 underline">
                    Contact Us
                  </Link>.
                </li>
              </ul>
            </section>

            {/* Modifications */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-black">
                Changes to the Service
              </h2>
              <p className="text-beige-800 leading-relaxed">
                We may modify or discontinue any part of SleekRoad at any time
                without notice or liability.
              </p>
            </section>

            {/* General */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-black">
                General Provisions
              </h2>
              <ul className="list-disc pl-6 text-beige-800 space-y-2">
                <li>These Terms constitute the entire agreement.</li>
                <li>If any provision is invalid, the rest remain enforceable.</li>
                <li>Failure to enforce a right is not a waiver.</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-black">Contact</h2>
              <p className="text-beige-800 leading-relaxed">
                Questions? Contact us via{" "}
                <Link href="/comp/help" className="text-green-600 underline">
                  Contact Us
                </Link>{" "}
                or email <strong>sleekroadhelp@gmail.com</strong>.
              </p>
              <p className="text-xs text-beige-700 mt-2">
                Last Updated: 1 February 2026
              </p>
            </section>
          </Card>
        </div>
      </div>
    </div>
  );
}