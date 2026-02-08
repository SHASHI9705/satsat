"use client";

import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
  Calendar,
  DollarSign,
  Shield,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

const howItWorks = [
  {
    title: 'List or Find',
    description: 'Post your rental items or explore what\'s available nearby on campus.',
    icon: <TrendingUp className="w-8 h-8" />
  },
  {
    title: 'Agree on Terms',
    description: 'Confirm price, duration, and pickup details securely through chat.',
    icon: <Calendar className="w-8 h-8" />
  },
  {
    title: 'Rent with Care',
    description: 'Meet safely on campus, enjoy the item, and return on time.',
    icon: <Shield className="w-8 h-8" />
  },
];


export default function RentalsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <RentalsPage />
    </Suspense>
  );
}

function RentalsPage() {
  const router = useRouter();

  const [serviceItems, setServiceItems] = useState<any[]>([]);
  const [serviceLoading, setServiceLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!base) {
          setServiceItems([]);
          setServiceLoading(false);
          return;
        }

        const response = await fetch(`${base}/api/item/all`);
        if (!response.ok) {
          setServiceItems([]);
          setServiceLoading(false);
          return;
        }

        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];
        const services = items
          .filter((item) => item && !item.sold)
          .filter((item) => {
            const category = String(item.category || '').toLowerCase();
            return category === 'tutoring & services' || category.includes('tutoring') || category.includes('services');
          })
          .slice(0, 4);

        setServiceItems(services);
        setServiceLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServiceItems([]);
        setServiceLoading(false);
      }
    };

    fetchServices();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/bro.png')] bg-cover bg-right bg-no-repeat opacity-100  "></div>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/5 to-purple-500/10"></div>
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              {/* <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none mb-6">
                <Sparkles className="w-3 h-3 mr-2" />
                Campus Rentals
              </Badge> */}
              
              <h1 className="mt-4 text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
                Rent what you need,<br />
                <span className="bg-gradient-to-r from-green-700 to-blue-500 bg-clip-text text-transparent">
                  {' '}when you need it
                </span>
              </h1>
              
              <p className="mt-6 text-gray-600 text-lg leading-relaxed max-w-2xl">
                From creator gear to dorm essentials, find affordable rentals from verified students in minutes. 
                Save money, reduce waste, and connect with your campus community.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all gap-2 group"
                  onClick={() => router.push('/allitems?category=Rentals')}
                >
                  Explore Rentals
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 text-white md:text-black font-bold px-8 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                  onClick={() => router.push('/dashboard')}
                >
                  List a Rental
                </Button>
              </div>
            </motion.div>

          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              {/* <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">
                Simple & Secure
              </Badge> */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                How it works
              </h2>
              <p className="text-gray-600 mt-4">
                Renting on SleekRoad is easy, safe, and built for campus life
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all h-full">
                    <div className="flex flex-col items-center text-center">
                      {/* Step Number */}
                      {/* <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center text-lg font-bold mb-4">
                        {index + 1}
                      </div> */}
                      
                      {/* Icon */}
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-100 to-blue-100 p-4 text-green-600 mb-4">
                        {step.icon}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured services</h2>
                <p className="text-gray-600 mt-2">Find help from verified students while you rent.</p>
              </div>
              <Button
                variant="ghost"
                className="text-amber-700 hover:bg-amber-50"
                onClick={() => router.push('/services')}
              >
                View Services
              </Button>
            </div>

            {serviceLoading ? (
              <div className="text-gray-500">Loading services...</div>
            ) : serviceItems.length === 0 ? (
              <div className="text-gray-500">No services available yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {serviceItems.map((item) => (
                  <Card key={item.id} className="p-4 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={item.images?.[0] || '/placeholder-image.png'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mt-4 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {item.description || 'Service listing'}
                    </p>
                    <div className="mt-3 font-semibold text-gray-900">
                      {`₹${item.discountedPrice ?? item.actualPrice ?? 0}`}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-3xl overflow-hidden"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-green-700 opacity-90"></div>
              
              {/* Pattern Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
              
              <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-white max-w-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-none">
                      Earn Extra Income
                    </Badge>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    List your rental and earn more
                  </h2>
                  
                  <p className="text-white/80 text-lg">
                    Upload your items once and rent them out on your own schedule.
                  </p>
                </div>
                
                <Button
                  size="lg"
                  className="h-14 px-8 bg-white text-gray-900 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all group whitespace-nowrap"
                  onClick={() => router.push('/dashboard')}
                >
                  Start Renting Out
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}