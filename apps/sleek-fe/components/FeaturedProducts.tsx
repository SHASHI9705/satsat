"use client"

import * as React from 'react';
import { ProductCard } from './ProductCard';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronRight, Zap, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface FeaturedProductsProps {
	onFavorite?: (productId: string) => void;
	onMessage?: (productId: string) => void;
}

export function FeaturedProducts({ onFavorite, onMessage }: FeaturedProductsProps) {
	const [selectedCategory, setSelectedCategory] = useState('All Categories');
	const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	const categories = [
		'All Categories',
		'Electronics',
		'Fashion',
		'Books',
		'Tech Products',
		'Furniture',
		'Instruments',
		'Sports',
		'Accessories',
		'Others'
	];

	useEffect(() => {
		const fetchFeaturedProducts = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/all`
				);
				if (response.ok) {
					const data = await response.json();
					if (Array.isArray(data.items)) {
						const randomItems = data.items
							.filter((item) => item && !item.sold)
							.map((item, index) => ({
								id: item.id,
								title: item.name,
								price: item.discountedPrice,
								originalPrice: item.actualPrice,
								image: item.images?.[0] || '/placeholder-image.png',
								condition: ['New', 'Like New', 'Good', 'Fair'][Math.floor(Math.random() * 4)],
								seller: {
									name: item.user?.name || 'Unknown Seller',
									rating: parseFloat((Math.random() * (5 - 4) + 4).toFixed(1)),
									verified: Math.random() > 0.5
								},
								location: 'Campus Area',
								category: item.category,
								isFavorited: false,
								badge: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'New Arrival' : 'Sale') : undefined,
							}))
							.sort(() => 0.5 - Math.random())
							.slice(0, 8);
						setFeaturedProducts(randomItems);
					} else {
						console.error('API response does not contain a valid items array:', data);
					}
				} else {
					console.error('Failed to fetch featured products');
				}
			} catch (error) {
				console.error('Error fetching featured products:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchFeaturedProducts();
	}, []);

	const filteredProducts =
		selectedCategory === 'All Categories'
			? featuredProducts
			: featuredProducts.filter((product) => 
				product.category?.toLowerCase().includes(selectedCategory.toLowerCase())
			);

	const handleViewDetails = (productId: string) => {
		router.push(`/selecteditem?id=${productId}`);
	};

	if (isLoading) {
		return (
			<section className="py-16 bg-gradient-to-b from-white to-gray-50">
				<div className="max-w-7xl mx-auto px-4">
					<div className="flex items-center justify-center h-64">
						<div className="text-center">
							<div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
							<p className="text-gray-600">Loading trending products...</p>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="py-16 bg-gradient-to-b from-white to-gray-50">
			<div className="max-w-7xl mx-auto px-4 md:px-8">
				{/* Section Header */}
				<div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
					<div className="mb-6 md:mb-0">
						<div className="flex items-center gap-3">
							<div>
								{/* <Badge className="bg-green-100 text-green-700 border-green-200 font-medium mb-2">
									Hot This Week
								</Badge> */}
								<h2 id="trending" className="text-3xl md:text-4xl font-bold text-gray-900">
									Trending on Campus
								</h2>
							</div>
						</div>
						<p className="hidden md:block text-gray-600 max-w-2xl">
							Discover the most popular items and deals from students across campus.
						</p>
					</div>
					
					<Button
						variant="ghost"
						className="text-green-600 hover:text-green-700 hover:bg-green-50 font-medium "
						onClick={() => router.push('/allitems')}
					>
						View All
						<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
					</Button>
				</div>

				{/* Categories Filter */}
				<div className="mb-12">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900">Browse by Category</h3>
						<span className="text-yellow-500 text-lg">✨</span>
					</div>
					<div className="flex overflow-x-auto scrollbar-hide pb-2 gap-2">
						{categories.map((category) => (
							<motion.button
								key={category}
								whileTap={{ scale: 0.95 }}
								onClick={() => setSelectedCategory(category)}
								className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
									selectedCategory === category
										? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}`}
							>
								{category}
							</motion.button>
						))}
					</div>
				</div>

				{/* Products Grid */}
				<AnimatePresence mode="wait">
					<motion.div
						key={selectedCategory}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
					>
						{filteredProducts.map((product) => (
							<ProductCard
								key={product.id}
								product={product}
								onViewDetails={() => handleViewDetails(product.id)}
								showPostedTime={false}
								onFavorite={onFavorite}
								onMessage={onMessage}
								className="h-full"
							/>
						))}
					</motion.div>
				</AnimatePresence>

				{/* No Results State */}
				{filteredProducts.length === 0 && (
					<div className="text-center py-12">
						<div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full" />
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							No products found in this category
						</h3>
						<p className="text-gray-600 mb-6">
							Try selecting a different category or check back later
						</p>
						<Button
							variant="outline"
							onClick={() => setSelectedCategory('All Categories')}
							className="border-gray-300 hover:border-gray-400"
						>
							View All Categories
						</Button>
					</div>
				)}

				{/* CTA Section */}
				{/* <div className="mt-20">
					<div className="relative rounded-3xl overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10"></div>
						<div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-200">
							<div className="flex flex-col md:flex-row items-center justify-between gap-8">
								<div className="max-w-2xl">
									<div className="flex items-center gap-3 mb-4">
										<div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
											<Zap className="w-6 h-6 text-white" />
										</div>
										<h3 className="text-2xl md:text-3xl font-bold text-gray-900">
											Ready to sell on campus?
										</h3>
									</div>
									<p className="text-gray-600 mb-6">
										Join thousands of students earning money by selling items they no longer need.
										List your first item in minutes and reach buyers across campus.
									</p>
									<div className="flex flex-col sm:flex-row gap-4">
										<Button
											size="lg"
											className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all"
											onClick={() => router.push('/dashboard')}
										>
											List Your First Item
											<ChevronRight className="w-4 h-4 ml-2" />
										</Button>
										<Button
											size="lg"
											variant="outline"
											className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
											onClick={() => router.push('/how-it-works')}
										>
											Learn How It Works
										</Button>
									</div>
								</div>
								
								<div className="hidden lg:block">
									<div className="relative">
										<div className="w-64 h-64 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-3xl rotate-6"></div>
										<div className="absolute -top-4 -right-4 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl -rotate-6"></div>
									</div>
								</div>
							</div>
							
							<div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-gray-900">5000+</div>
									<div className="text-sm text-gray-600">Active Sellers</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-gray-900">98%</div>
									<div className="text-sm text-gray-600">Happy Customers</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-gray-900">₹50L+</div>
									<div className="text-sm text-gray-600">Total Sales</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-gray-900">24/7</div>
									<div className="text-sm text-gray-600">Support</div>
								</div>
							</div>
						</div>
					</div>
				</div> */}

				{/* View All Button for Mobile */}
				<div className="text-center mt-8 md:hidden">
					<Button
						variant="outline"
						className="border-gray-300 hover:border-gray-400 w-full max-w-xs"
						onClick={() => router.push('/allitems')}
					>
						View All Products
						<ArrowRight className="w-4 h-4 ml-2" />
					</Button>
				</div>
			</div>
		</section>
	);
}