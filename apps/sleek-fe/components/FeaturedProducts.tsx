import * as React from 'react';
import { ProductCard } from './ProductCard';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Flame, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter,useSearchParams } from 'next/navigation';

interface FeaturedProductsProps {
	onFavorite?: (productId: string) => void;
	onMessage?: (productId: string) => void;
}

export function FeaturedProducts({ onFavorite, onMessage }: FeaturedProductsProps) {
	const [selectedCategory, setSelectedCategory] = useState('All Categories');
	const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
	const router = useRouter();


	useEffect(() => {
		const fetchFeaturedProducts = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/all`
				);
				if (response.ok) {
					const data = await response.json();
					if (Array.isArray(data.items)) {
						const randomItems = data.items
							.filter((item) => item) // Ensure item is defined
							.map((item) => ({
								id: item.id,
								title: item.name,
								price: item.discountedPrice,
								originalPrice: item.actualPrice,
								image: item.images?.[0] || '/placeholder-image.png', // Fallback image
								seller: {
									name: item.user?.name || 'Unknown Seller',
									rating: (Math.random() * (5 - 4) + 4).toFixed(1), // Random rating between 4 and 5
									verified: false // Static verified status for now
								},
								category: item.category,
								isFavorited: false // Static favorite status for now
							}))
							.sort(() => 0.5 - Math.random())
							.slice(0, 8); // Get up to 8 random items
						setFeaturedProducts(randomItems);
					} else {
						console.error('API response does not contain a valid items array:', data);
					}
				} else {
					console.error('Failed to fetch featured products');
				}
			} catch (error) {
				console.error('Error fetching featured products:', error);
			}
		};

		fetchFeaturedProducts();
	}, []);

	const filteredProducts =
		selectedCategory === 'All Categories'
			? featuredProducts
			: featuredProducts.filter((product) => product.category === selectedCategory);

	const handleViewDetails = (productId) => {
		router.push(`/selecteditem?id=${productId}`);
	};

	return (
		<section className="py-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/10 dark:to-red-950/10">
			<div className="container mx-auto px-4">
				{/* Section Header */}
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
							<Flame className="w-6 h-6 text-white" />
						</div>
						<div>
							<h2 className="text-3xl font-bold">Trending Now</h2>
							<p className="text-muted-foreground hidden sm:block">
								Hot picks from the campus community
							</p>
						</div>
					</div>
					<a href="/allitems" className="hidden sm:block">
                        <Button variant="outline" className="gap-2 group">
                            View All
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </a>
				</div>

				{/* Categories Line */}
				<div className="flex py-2 gap-3 overflow-x-auto pb-4 justify-start pl-6">
					{[
						'All Categories',
						'Clothes',
						'Shoes',
						'Books',
						'Tech Products',
						'Electronics',
						'Instruments',
						'Others'
					].map((category, index) => (
						<button
							key={index}
							onClick={() => setSelectedCategory(category)}
							className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap ${
								selectedCategory === category
									? 'bg-gradient-to-r from-[var(--brand-1)] to-[rgba(166,124,82,0.2)] text-[var(--brand-3)]'
									: 'bg-gray-100 text-black'
							} hover:bg-gradient-to-r hover:from-[var(--brand-1)] hover:to-[rgba(166,124,82,0.2)] hover:text-[var(--brand-3)] transition`}
						>
							{category}
						</button>
					))}
				</div>

				{/* Products Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
					{filteredProducts.map((product) => (
						<div key={product.id} className="mb-4">
							<ProductCard
								product={{
									...product,
									rating: product.rating || 4.5, // Ensure a fallback value for rating
								}}
								onViewDetails={() => handleViewDetails(product.id)}
								onFavorite={onFavorite}
								onMessage={onMessage}
							/>
						</div>
					))}
				</div>

				<div className="width-100% mt-6 items-center justify-center flex">
					<div className="">
						<a href="/allitems">
							<Button variant="outline" className="gap-2 group">
								View All
								<ChevronRight className=" w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</Button>
						</a>
					</div>
				</div>

				{/* CTA Section */}
				<div className="text-center mt-12">
					<div className="bg-white rounded-2xl p-8 shadow-sm border max-w-2xl mx-auto">
						<h3 className="text-2xl font-bold mb-2">
							Ready to start selling?
						</h3>
						<p className="text-muted-foreground mb-6 hidden sm:block">
							Join thousands of students earning money by selling items they no
							longer need.
						</p>
						<a href="/dashboard">
							<Button className="gap-2 bg-gradient-to-r from-green-300 to-green-600 hover:from-green-400 hover:to-green-700">
								List Your First Item
								<ChevronRight className="w-4 h-4" />
							</Button>
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}