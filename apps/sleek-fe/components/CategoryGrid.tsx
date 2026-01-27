"use client"

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Laptop, 
  BookOpen, 
  Shirt, 
  Armchair, 
  Code, 
  GraduationCap,
  Headphones,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: Laptop,
    count: '284+ items',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Latest tech gadgets & devices',
    items: ['Laptops', 'Phones', 'Accessories', 'Smartwatches', 'Headphones']
  },
  {
    id: 'books & Academic' ,
    name: 'Books & Academic',
    icon: BookOpen,
    count: '512+ items',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Textbooks, study guides & notes',
    items: ['Textbooks', 'Study Guides', 'Notebooks', 'Reference Books']
  },
  {
    id: 'fashion ',
    name: 'Fashion & Style',
    icon: Shirt,
    count: '196+ items',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Clothing, shoes & accessories',
    items: ['Clothing', 'Shoes', 'Accessories', 'Bags', 'Watches', 'Jackets']
  },
  {
    id: 'furniture & living',
    name: 'Furniture & Living',
    icon: Armchair,
    count: '147+ items',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Campus living essentials',
    items: ['Desks', 'Chairs', 'Storage', 'Shelves', 'Tables', 'Cabinets']
  },
  {
    id: 'software',
    name: 'Software & Digital',
    icon: Code,
    count: '89+ items',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Licenses, tools & resources',
    items: ['Licenses', 'Tools', 'Resources', 'Templates', 'Plugins', 'APIs']
  },
  {
    id: 'tutoring',
    name: 'Tutoring & Services',
    icon: GraduationCap,
    count: '156+ items',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Academic help & services',
    items: ['Math', 'Science', 'Languages', 'Geography', 'Computer Science']
  },
  {
    id: 'instruments',
    name: 'Audio & Music',
    icon: Headphones,
    count: '73+ items',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Sound equipment & instruments',
    items: ['Headphones', 'Speakers', 'Instruments', 'Microphones']
  },
  {
    id: 'study supplies',
    name: 'Study Supplies',
    icon: Calculator,
    count: '201+ items',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Study essentials & stationery',
    items: ['Calculators', 'Stationery', 'Tech', 'Gadgets', 'Printers', 'Software']
  }
];

const featuredCategories = [
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    count: '100+ items',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Fresh listings on campus',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'trending',
    name: 'Trending Now',
    count: '45+ items',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'What everyone\'s buying',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 'budget',
    name: 'Budget Finds',
    count: '120+ items',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    description: 'Under ₹1000 deals',
    gradient: 'from-green-500 to-teal-500'
  }
];

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryGrid({ onCategorySelect }: CategoryGridProps) {
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    // Featured cards use a 'filter' param (keeps existing behavior)
    if (categoryId === 'new-arrivals' || categoryId === 'trending' || categoryId === 'budget') {
      router.push(`/allitems?filter=${encodeURIComponent(categoryId)}`);
      return;
    }

    // Default: route by category name
    router.push(`/allitems?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="py-12 bg-gradient-to-b from-[#F4F2F2] to-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Browse Categories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 mb-4">
            Shop Campus Essentials
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Discover everything you need for campus life from fellow students
          </p>
        </div>

        {/* Featured Categories - 3 Cards Wide */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {featuredCategories.map((category) => (
            <div 
              key={category.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              onClick={() => handleCategoryClick(category.id, category.name)}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 relative">
                
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
                
                
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  
                
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5">
                    <span className="text-sm font-semibold text-gray-900">{category.count}</span>
                  </div>
                  
                  
                  <div className={`absolute bottom-4 left-4 bg-gradient-to-r ${category.gradient} text-white px-4 py-2 rounded-full`}>
                    <span className="text-sm font-bold uppercase tracking-wider">Featured</span>
                  </div>
                </div>

               
                <div className="p-6 relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                      {category.name}
                    </h3>
                    <ArrowRight className={`w-5 h-5 text-gray-400 group-hover:text-gray-900 transform transition-transform duration-300 ${hoveredCategory === category.id ? 'translate-x-2' : ''}`} />
                  </div>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  
                  
                  <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center justify-center group/btn">
                    <span>Explore Now</span>
                    <svg 
                      className={`w-4 h-4 ml-2 transform transition-transform duration-300 ${hoveredCategory === category.id ? 'translate-x-2' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div> */}

        {/* Main Categories Grid - 4 Cards Wide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            
            return (
              <div 
                key={category.id}
                className="group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                onClick={() => handleCategoryClick(category.id, category.name)}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  
                  {/* Image Container */}
                  <div className="relative h-40 overflow-hidden flex-shrink-0">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent"></div>
                    

                    
                    {/* Icon */}
                    <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 flex-1">{category.description}</p>
                    
                    {/* Items Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {category.items.slice(0, 3).map((item, index) => (
                        <span 
                          key={index}
                          className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {item}
                        </span>
                      ))}
                      {category.items.length > 3 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          +{category.items.length - 3}
                        </span>
                      )}
                    </div>
                    
                    {/* Explore Button */}
                    <button onClick={() => handleCategoryClick(category.id, category.name)} className="w-full border-2 border-gray-900 text-gray-900 py-2.5 rounded-xl font-medium hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center justify-center group/btn2">
                      <span>Browse</span>
                      <ArrowRight className={`w-4 h-4 ml-2 transform transition-transform duration-300 ${hoveredCategory === category.id ? 'translate-x-2' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => router.push('/allitems')}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}