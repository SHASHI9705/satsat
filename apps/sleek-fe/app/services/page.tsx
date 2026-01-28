"use client";

import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

const serviceCategories = [
  {
    title: 'Tutoring & Academics',
    description: '1:1 help for exams, assignments, and core subjects.',
    tags: ['Math', 'CS', 'Physics', 'Writing'],
  },
  {
    title: 'Design & Creative',
    description: 'Posters, resumes, branding, and portfolio help.',
    tags: ['Graphic Design', 'UI/UX', 'Editing'],
  },
  {
    title: 'Tech Help',
    description: 'Device setup, troubleshooting, and software installs.',
    tags: ['Setup', 'Repair', 'Software'],
  },
  {
    title: 'Campus Services',
    description: 'Move‑in help, laundry, delivery, and quick tasks.',
    tags: ['Move‑in', 'Delivery', 'Errands'],
  },
];

const howItWorks = [
  {
    title: 'Post or Browse',
    description: 'List your service or discover providers on campus.',
  },
  {
    title: 'Chat & Agree',
    description: 'Message the provider, confirm timing and pricing.',
  },
  {
    title: 'Complete Safely',
    description: 'Meet on campus or deliver digitally with confidence.',
  },
];

export default function ServicesPageWrapper() {
  return (
    <Suspense fallback={<div>Loading services...</div>}>
      <ServicesPage />
    </Suspense>
  );
}

function ServicesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-20">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-green-700 bg-green-100 inline-flex px-3 py-1 rounded-full">
                Services on Campus
              </p>
              <h1 className="mt-4 text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                Find trusted student services in minutes
              </h1>
              <p className="mt-4 text-gray-600 text-lg">
                From tutoring and design to tech help and campus errands, SleekRoad makes it easy to connect with verified students.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => router.push('/allitems?category=Tutoring%20%26%20Services')}
                >
                  Explore Services
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 hover:border-gray-400"
                  onClick={() => router.push('/sell')}
                >
                  Offer a Service
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Popular service categories</h2>
                <p className="text-gray-600 mt-2">Browse by what you need right now.</p>
              </div>
              <Button
                variant="ghost"
                className="text-green-700 hover:bg-green-50"
                onClick={() => router.push('/allitems?category=Tutoring%20%26%20Services')}
              >
                View All
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {serviceCategories.map((cat) => (
                <Card key={cat.title} className="p-5 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900">{cat.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{cat.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {cat.tags.map((tag) => (
                      <span key={tag} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {howItWorks.map((step, index) => (
                <Card key={step.title} className="p-6 border border-gray-100 rounded-2xl shadow-sm">
                  <p className="text-sm font-semibold text-green-700">Step {index + 1}</p>
                  <h3 className="text-lg font-semibold text-gray-900 mt-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{step.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="bg-black text-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Offer a service and earn today</h2>
                <p className="text-gray-300 mt-2">Create a listing and reach students across your campus.</p>
              </div>
              <Button
                className="bg-white text-black hover:bg-gray-100"
                onClick={() => router.push('/sell')}
              >
                Start Selling
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
