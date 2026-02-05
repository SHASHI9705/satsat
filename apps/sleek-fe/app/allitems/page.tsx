"use client"

import * as React from 'react';
import { ProductCard } from '../../components/ProductCard';
import { useState, useEffect } from 'react';
import { Package, Home, Filter, Grid, List, ChevronDown, Search, TrendingUp, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Loader from '../../components/Loader';
import { Suspense } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function AllItemsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    }>
      <AllItemsPage />
    </Suspense>
  );
}

function AllItemsPage() {
	const [products, setProducts] = useState<any[]>([]);
	const [selectedCategory, setSelectedCategory] = useState("All Categories");
	const [isLoading, setIsLoading] = useState(true);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState('random');
	const [showFilters, setShowFilters] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	const categories = [
		"All Categories",
		"Electronics",
		"Shoes",
		"Fashion",
		"Toys & Games",
		"Books & Academic",
		"Tech Products",
		"Beauty & Personal Care",
		"Furniture & Living",
		"Kitchen & Dining",
		"Tutoring & Services",
		"Study Supplies",
		"Stationery",
		"Software & Digital",
		"Instruments",
		"Sports & Fitness",
		"Pet Supplies",
		"Vehicles & Transport",
		"Accessories",
		"Others"
	];

	useEffect(() => {
		const categoryFromQuery = searchParams.get('category');
		const searchFromQuery = searchParams.get('search');
		
		if (categoryFromQuery) {
			setSelectedCategory(categoryFromQuery);
		}
		if (searchFromQuery) {
			setSearchQuery(decodeURIComponent(searchFromQuery));
		}
	}, [searchParams]);

	useEffect(() => {
		const fetchItems = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/all`
				);
				if (response.ok) {
					const data = await response.json();
					const itemsWithRatings = data.items.map((item: any) => ({
						...item,
						rating: parseFloat((Math.random() * (5 - 4) + 4).toFixed(1)),
						condition: ['New', 'Like New', 'Good', 'Fair'][Math.floor(Math.random() * 4)],
						seller: {
							name: item.user?.name || 'Unknown Seller',
							rating: parseFloat((Math.random() * (5 - 4) + 4).toFixed(1)),
							verified: Math.random() > 0.5,
							avatar: item.user?.avatar || ''
						},
						location: 'Campus Area',
						postedTime: ['Just now', '1 hour ago', 'Today', 'Yesterday'][Math.floor(Math.random() * 4)],
						badge: item.sold ? 'Sold Out' : Math.random() > 0.7 ? (Math.random() > 0.5 ? 'Trending' : 'Sale') : undefined
					}));
					setProducts(shuffleArray(itemsWithRatings));
				} else {
					console.error('Failed to fetch items');
				}
			} catch (error) {
				console.error('Error fetching items:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchItems();
	}, []);

	useEffect(() => {
		// Set default view and sort controls for mobile view
		const isMobile = window.innerWidth <= 768;
		if (isMobile) {
			setViewMode('list');
			setSortBy('random');
		}
	}, []);

	const handleCategoryClick = (category: string) => {
		setSelectedCategory(category);
		router.push(`/allitems?category=${encodeURIComponent(category)}`);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/allitems?search=${encodeURIComponent(searchQuery.trim())}`);
		}
	};

	const serviceKeywords = ['service', 'tutor', 'tutoring', 'developer', 'management', 'coach', 'gamer'];

	const isServiceProduct = (product: any) => {
		if (!product) return false;
		const typeMatches = (product.type || '').toString().toLowerCase();
		if (typeMatches === 'service') return true;

		const examine = [
			(product.category || '').toString().toLowerCase(),
			...((product.tags || []) as string[]).map((tag) => tag?.toString().toLowerCase() || ''),
		];

		return examine.some((value) =>
			serviceKeywords.some((keyword) => value.includes(keyword))
		);
	};

	// Helper: decide whether a product belongs to the selected category
	const matchesCategory = (product: any, selectedCategory: string) => {
		if (selectedCategory === "All Categories") return true;
		if (selectedCategory === "Tutoring & Services") return isServiceProduct(product);
		const prodCat = (product.category || '').toLowerCase();
		const sel = (selectedCategory || '').toLowerCase();
		// direct contains checks (both directions)
		if (prodCat.includes(sel) || sel.includes(prodCat)) return true;
		// match by tags (if present)
		const tags: string[] = (product.tags || []).map((t: string) => t.toLowerCase());
		if (tags.some(t => sel.includes(t) || t.includes(sel) || sel.split(/\W+/).includes(t))) return true;
		// common alias: 'sports' matches 'sports & fitness'
		if (prodCat === 'sports' && sel.includes('sports')) return true;
		return false;
	};

	const filteredProducts = products
		.filter(product => matchesCategory(product, selectedCategory))
		.filter(product =>
			searchQuery === '' ||
			product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			product.description?.toLowerCase().includes(searchQuery.toLowerCase())
		);

	// Apply sorting
	const sortedProducts = [...filteredProducts].sort((a, b) => {
		if (a.sold && b.sold) return -1;
		switch (sortBy) {
			case 'price-low':
				return a.discountedPrice - b.discountedPrice;
			case 'price-high':
				return b.discountedPrice - a.discountedPrice;
			case 'newest':
				return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
			case 'rating':
				return (b.rating || 0) - (a.rating || 0);
			case 'random':
				return Math.random() - 0.5; // Random sorting logic
			default:
				return 0;
		}
	});

	// Pagination: control how many items are visible and avoid duplicating products
	const [visibleCount, setVisibleCount] = useState(12);

	// Reset visible count when filters/search/sort change
	useEffect(() => {
		setVisibleCount(12);
	}, [selectedCategory, searchQuery, sortBy]);

	const visibleProducts = sortedProducts.slice(0, visibleCount);

	const handleViewDetails = (productId: string) => {
		router.push(`/selecteditem?id=${productId}`);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
				<Loader />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-[#F4F2F2] to-white">
			{/* Navigation */}
			<div className="sticky top-0 z-40 bg-gray-200/50 backdrop-blur-md border-b border-gray-200/50">
				<div className="max-w-7xl mx-auto px-4 md:px-2 py-2">
					<div className="flex items-center justify-between">
						<button
							onClick={() => router.back()}
							className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
						>
							<ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
							<span className="font-medium">Back</span>
						</button>
				
						
						<button
							onClick={() => router.push('/')}
							className="p-2 rounded-full hover:bg-gray-100 transition-colors"
						>
							<Home className="w-5 h-5 text-gray-600" />
						</button>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					{/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
						<div>
							<div className="flex items-center gap-3 mb-4">
								<div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
									<Package className="w-6 h-6 text-white" />
								</div>
								<div>
									<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
										Campus Marketplace
									</h1>
									<p className="text-gray-600">
										Discover everything you need from fellow students
									</p>
								</div>
							</div>
							
							 <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
								{sortedProducts.length} items available
							</Badge> 
						</div>
					</div> */}

					{/* Search Bar */}
				<div className="mb-6">
					<form onSubmit={handleSearch} className="relative w-full max-w-4xl mx-auto">
						<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
						<Input
							type="search"
							placeholder="Search for electronics, books, fashion, furniture..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-12 pr-4 h-12 bg-white border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-500"
						/>
						<Button
							type="submit"
							className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4"
						>
							Search
						</Button>
					</form>
				</div>
					{/* Controls */}
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
						{/* Categories */}
						<div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
							{categories.map((category) => (
								<button
									key={category}
									onClick={() => handleCategoryClick(category)}
									className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
										selectedCategory === category
											? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									{category}
								</button>
							))}
						</div>

						{/* View & Sort Controls */}
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
								<button
									onClick={() => setViewMode('grid')}
									className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
								>
									<Grid className="w-4 h-4 text-gray-600" />
								</button>
								<button
									onClick={() => setViewMode('list')}
									className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
								>
									<List className="w-4 h-4 text-gray-600" />
								</button>
							</div>

							{/* <button
								onClick={() => setShowFilters(!showFilters)}
								className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
							>
								<Filter className="w-4 h-4" />
								<span className="text-sm font-medium">Filters</span>
								<ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
							</button> */}

							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
							>
								<option value="newest">Newest First</option>
								<option value="price-low">Price: Low to High</option>
								<option value="price-high">Price: High to Low</option>
								<option value="rating">Highest Rated</option>
								<option value="random">Select filter</option> {/* New option added */}
							</select>
						</div>
					</div>

					{/* Filters Panel */}
					<AnimatePresence>
						{showFilters && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: 'auto', opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								className="mb-6 overflow-hidden"
							>
								<div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										<div>
											<h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
											<div className="space-y-2">
												<label className="flex items-center gap-2">
													<input type="radio" name="price" className="text-green-600" />
													<span className="text-sm text-gray-700">Under ₹500</span>
												</label>
												<label className="flex items-center gap-2">
													<input type="radio" name="price" className="text-green-600" />
													<span className="text-sm text-gray-700">₹500 - ₹2000</span>
												</label>
												<label className="flex items-center gap-2">
													<input type="radio" name="price" className="text-green-600" />
													<span className="text-sm text-gray-700">₹2000 - ₹5000</span>
												</label>
												<label className="flex items-center gap-2">
													<input type="radio" name="price" className="text-green-600" />
													<span className="text-sm text-gray-700">₹5000+</span>
												</label>
											</div>
										</div>
										<div>
											<h4 className="font-medium text-gray-900 mb-3">Condition</h4>
											<div className="space-y-2">
												{['New', 'Like New', 'Good', 'Fair'].map(condition => (
													<label key={condition} className="flex items-center gap-2">
														<input type="checkbox" className="text-green-600 rounded" />
														<span className="text-sm text-gray-700">{condition}</span>
													</label>
												))}
											</div>
										</div>
										<div>
											<h4 className="font-medium text-gray-900 mb-3">Location</h4>
											<div className="space-y-2">
												<label className="flex items-center gap-2">
													<input type="checkbox" className="text-green-600 rounded" />
													<span className="text-sm text-gray-700">On Campus</span>
												</label>
												<label className="flex items-center gap-2">
													<input type="checkbox" className="text-green-600 rounded" />
													<span className="text-sm text-gray-700">Near Campus</span>
												</label>
												<label className="flex items-center gap-2">
													<input type="checkbox" className="text-green-600 rounded" />
													<span className="text-sm text-gray-700">Delivery Available</span>
												</label>
											</div>
										</div>
									</div>
									<div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
										<Button
											variant="outline"
											className="border-gray-300 hover:border-gray-400"
											onClick={() => setShowFilters(false)}
										>
											Cancel
										</Button>
										<Button className="bg-green-600 hover:bg-green-700">
											Apply Filters
										</Button>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Products Grid/List */}
				<AnimatePresence mode="wait">
					<motion.div
						key={`${selectedCategory}-${viewMode}`}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-6'}
					>
						{visibleProducts.length > 0 ? (
							visibleProducts.map((product) => (
								viewMode === 'grid' ? (
										<div key={product.id}>
										<ProductCard

											product={{
											id: product.id,
											title: product.name,
											price: product.discountedPrice,
											originalPrice: product.actualPrice,
											image: product.images?.[0] || '/placeholder-image.png',
											condition: product.condition,
											seller: product.seller,
											location: product.location,
											category: product.category,
											isFavorited: false,
											badge: product.sold ? 'Sold Out' : 'New',
											
										}}
										onViewDetails={() => handleViewDetails(product.id)}
										className="h-full"
									/>
									</div>
								) : (
									// List View
									<div
										key={product.id}
										className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden group ${product.sold ? 'cursor-not-allowed' : 'cursor-pointer'}`}
										onClick={!product.sold ? () => handleViewDetails(product.id) : undefined}
									>
										{product.sold && (
											<div className=" cursor-event-none absolute inset-0 flex items-center justify-center">
												<div className=" w-full absolute inset-0 bg-black opacity-50 rounded-xl"></div>
												<span
													className="inline-block w-56 h-56 bg-no-repeat bg-center bg-contain rotate-[-1deg] z-10"
													style={{ backgroundImage: "url('/soldout.png')" }}
												></span>
											</div>
										)}
										<div className="flex flex-col md:flex-row">
											<div className="md:w-48 h-48 md:h-30 overflow-hidden">
												<img
													src={product.images?.[0] || '/placeholder-image.png'}
													alt={product.name}
													className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
												/>
											</div>
											<div className="flex-1 p-6">
												<div className="flex justify-between items-start mb-2">
													<h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
														{product.name}
													</h3>
													{product.sold && (
														<Badge className="bg-red-100 text-red-700">Sold Out</Badge>
													)}
												</div>
												<p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
												<div className="flex items-center justify-between">
													<div>
														<p className="text-2xl font-bold text-gray-900">
															₹{product.discountedPrice}
														</p>
														{product.actualPrice && product.actualPrice > product.discountedPrice && (
															<p className="text-sm text-gray-400 line-through">
																₹{product.actualPrice}
															</p>
														)}
													</div>
													<div className="text-right">
														<p className="text-sm text-gray-700">{product.category}</p>

													</div>
												</div>
											</div>
										</div>
									</div>
								)
							))
						) : (
							<div className="col-span-full text-center py-12">
								<div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
									<Package className="w-12 h-12 text-gray-400" />
								</div>
								<h3 className="text-2xl font-semibold text-gray-900 mb-3">
									No items found
								</h3>
								<p className="text-gray-600 max-w-md mx-auto mb-6">
									{searchQuery 
										? `No results for "${searchQuery}" in ${selectedCategory}`
										: `No items available in ${selectedCategory} right now. Check back soon!`}
								</p>
								<Button
									variant="outline"
									className="border-gray-300 hover:border-gray-400"
									onClick={() => {
										setSelectedCategory('All Categories');
										setSearchQuery('');
									}}
								>
									Clear Filters
								</Button>
							</div>
						)}
					</motion.div>
				</AnimatePresence>

				{/* Load More */}
				{sortedProducts.length > visibleCount && (
					<div className="text-center mt-12">
						<Button
							variant="outline"
							className="px-8 py-3 border-gray-300 hover:border-gray-400"
							onClick={() => setVisibleCount((v) => v + 12)}
						>
							Load More Items
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}