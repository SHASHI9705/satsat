"use client"

import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { CategoryGrid } from '../components/CategoryGrid';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AuthProvider, useAuth } from '../firebase/AuthProvider';
import Link from 'next/link';
import { Footer } from '../components/Footer';
import { FeatureCardsCTA } from '../components/FeatureCardsCTA';

import { 
  Shield, 
  MessageCircle, 
  TrendingUp, 
  Users,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Student Verified',
    description: 'All users verified with .edu emails for a safe community',
    gradient: 'bg-brand'
  },
  {
    icon: MessageCircle,
    title: 'In-App Messaging',
    description: 'Secure communication with buyers and sellers',
    gradient: 'bg-brand'
  },
  {
    icon: TrendingUp,
    title: 'Smart Pricing',
    description: 'AI-powered price suggestions based on market data',
    gradient: 'bg-brand'
  },
  {
    icon: Users,
    title: 'Campus Community',
    description: 'Connect with students from your university',
    gradient: 'bg-brand'
  }
];

const testimonials = [
  {
    name: 'Jessica Park',
    role: 'Computer Science Student',
    content: 'Sold my old textbooks for next semester\'s tuition. The platform makes it so easy to connect with other students!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612e605?w=40&h=40&fit=crop&crop=face'
  },
  {
    name: 'Michael Chen',
    role: 'Business Major',
    content: 'Found the perfect desk for my dorm room at half the retail price. Love supporting fellow students!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
  },
  {
    name: 'Amanda Rodriguez',
    role: 'Engineering Student',
    content: 'The tutoring marketplace helped me find a great math tutor. My grades improved significantly!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
  }
];

export default function App() {
  return (
      <AppContent />
  );
}

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { user } = useAuth();

  // Use effect to automatically move to dashboard when user signs in
  useEffect(() => {
    if (user) {
      // Redirect to dashboard or perform any other action
    } else {
      // if user signed out, return to home or perform any other action
    }
  }, [user]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    console.log('Selected category:', categoryId);
  };

  const handleFavorite = (productId: string) => {
    console.log('Favorited product:', productId);
  };

  const handleMessage = (productId: string) => {
    console.log('Message seller for product:', productId);
  };

  return (
    <div className="min-h-screen bg-background background-catty">
      <Header 
        notificationCount={3}
      />

    <main>
      {/* Hero Section */}
      <HeroSection 
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
      />

      {/* Featured Products */}
      <FeaturedProducts 
        onFavorite={handleFavorite}
        onMessage={handleMessage}
      />

      {/* Category Grid */}
      <CategoryGrid onCategorySelect={handleCategorySelect} />

      

      {/* Feature cards + CTA: only show to unauthenticated users on home */}
      {!user && <FeatureCardsCTA />}
    </main>

    {/* Footer */}
    <Footer />
    </div>
  );
}