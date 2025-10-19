"use client";

import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Star, Package, Home, ArrowLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ProductCard } from '../../components/ProductCard';

export default function SelectedItemPage() {
	const item = {
		title: 'MacBook Pro 13" M2 - Excellent Condition',
		price: 899,
		originalPrice: 1299,
		image:
			'https://images.unsplash.com/photo-1643290369779-c6bec760cf18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMGVsZWN0cm9uaWNzfGVufDF8fHx8MTc1OTQxNjgyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
		condition: 'Like New',
		seller: {
			name: 'Sarah Chen',
			rating: 4.9,
			verified: true
		},
		location: 'Main Campus',
		postedTime: '2h ago',
		category: 'Electronics',
		description:
			"This MacBook Pro is in excellent condition and has been used sparingly. It's perfect for students and professionals alike. Comes with the original charger and box."
	};

	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const images = [
		'https://images.unsplash.com/photo-1643290369779-c6bec760cf18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMGVsZWN0cm9uaWNzfGVufDF8fHx8MTc1OTQxNjgyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
		'https://images.unsplash.com/photo-1633707392225-d883c8cd3e99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwdGV4dGJvb2slMjBzdGFja3xlbnwxfHx8fDE3NTk0OTA2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
		'https://images.unsplash.com/photo-1634133118577-d70216e68eae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZmFzaGlvbiUyMGNsb3RoZXN8ZW58MXx8fHwxNzU5NDkwNjIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
	];

	const relatedProducts = [
		{
			id: '1',
			title: 'MacBook Pro 13" M2 - Excellent Condition',
			price: 899,
			originalPrice: 1299,
			image:
				'https://images.unsplash.com/photo-1643290369779-c6bec760cf18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMGVsZWN0cm9uaWNzfGVufDF8fHx8MTc1OTQxNjgyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
			condition: 'Like New' as const,
			seller: {
				name: 'Sarah Chen',
				avatar:
					'https://images.unsplash.com/photo-1494790108755-2616b612e605?w=32&h=32&fit=crop&crop=face',
				rating: 4.9,
				verified: true
			},
			location: 'Main Campus',
			postedTime: '2h ago',
			category: 'Electronics',
			isFavorited: false
		},
		{
			id: '2',
			title: 'Calculus & Physics Textbook Bundle',
			price: 120,
			originalPrice: 400,
			image:
				'https://images.unsplash.com/photo-1633707392225-d883c8cd3e99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwdGV4dGJvb2slMjBzdGFja3xlbnwxfHx8fDE3NTk0OTA2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
			condition: 'Good' as const,
			seller: {
				name: 'Marcus Lee',
				avatar:
					'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
				rating: 4.7,
				verified: true
			},
			location: 'North Dorms',
			postedTime: '5h ago',
			category: 'Books & Academic',
			isFavorited: true
		},
		{
			id: '3',
			title: 'Vintage Band T-Shirt Collection',
			price: 45,
			originalPrice: 60,
			image:
				'https://images.unsplash.com/photo-1634133118577-d70216e68eae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZmFzaGlvbiUyMGNsb3RoZXN8ZW58MXx8fHwxNzU5NDkwNjIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
			condition: 'Good' as const,
			seller: {
				name: 'Alex Rivera',
				avatar:
					'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
				rating: 4.5,
				verified: false
			},
			location: 'South Campus',
			postedTime: '1d ago',
			category: 'Fashion & Style',
			isFavorited: false
		},
		{
			id: '4',
			title: 'Study Desk with Storage - Perfect for Dorms',
			price: 85,
			originalPrice: 150,
			image:
				'https://images.unsplash.com/photo-1699831112447-9c8c803f584b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb3JtJTIwZnVybml0dXJlJTIwZGVza3xlbnwxfHx8fDE3NTk0OTA2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
			condition: 'Good' as const,
			seller: {
				name: 'Emma Watson',
				avatar:
					'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
				rating: 4.8,
				verified: true
			},
			location: 'West Hall',
			postedTime: '1d ago',
			category: 'Furniture & Living',
			isFavorited: false
		}
		// Add more products as needed
	];

	const [products, setProducts] = useState(relatedProducts);
	const [page, setPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const getRandomProductFromRelated = () => {
		const randomIndex = Math.floor(Math.random() * relatedProducts.length);
		const randomProduct = relatedProducts[randomIndex];
		return {
			...randomProduct,
			id: (Math.random() * 100000).toFixed(0) // Ensure unique ID for each new product
		};
	};

	const loadMoreProducts = () => {
		const newProducts = Array.from({ length: 4 }, () => getRandomProductFromRelated());
		setProducts((prev) => [...prev, ...newProducts]);
		setPage((prev) => prev + 1);
	};

	useEffect(() => {
		const handleScroll = () => {
			if (
				window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - 100
			) {
				loadMoreProducts();
			}
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const touchStartX = useRef(0);

	const handleTouchStart = (e) => {
		touchStartX.current = e.touches[0].clientX;
	};

	const handleTouchEnd = (e) => {
		const touchEndX = e.changedTouches[0].clientX;
		if (touchStartX.current - touchEndX > 50) {
			handleSwipe('left');
		} else if (touchEndX - touchStartX.current > 50) {
			handleSwipe('right');
		}
	};

	const handleSwipe = (direction) => {
		if (direction === 'left') {
			setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
		} else if (direction === 'right') {
			setCurrentImageIndex((prevIndex) =>
				prevIndex === 0 ? images.length - 1 : prevIndex - 1
			);
		}
	};

	const handleGetContactDetails = () => {
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	return (
		<section className="min-h-screen py-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/10 dark:to-red-950/10">
			<div className="container mx-auto px-4">
				{/* Header with Back and Home Buttons */}
				<div className="flex items-center justify-between p-4 border-gray-300">
					<button
						onClick={() => window.history.back()}
						className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md text-black hover:bg-gray-100"
					>
						<ArrowLeft className="w-5 h-5 text-black" />
						<span className="text-sm font-medium">Back</span>
					</button>
					<a
						href="/"
						className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md text-black hover:bg-gray-100"
					>
						<Home className="w-5 h-5 text-black" />
						<span className="text-sm font-medium">Home</span>
					</a>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Image Section */}
					<div className="flex justify-center items-center relative">
						<div
							className="relative w-full max-w-lg overflow-hidden rounded-lg"
							onTouchStart={handleTouchStart}
							onTouchEnd={handleTouchEnd}
						>
							<img
								src={images[currentImageIndex]}
								alt={`Product Image ${currentImageIndex + 1}`}
								className="rounded-lg shadow-md w-full h-96 object-contain mx-auto"
							/>
							<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
								{images.map((_, index) => (
									<div
										key={index}
										className={`w-3 h-3 rounded-full ${
											index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'
										}`}
									></div>
								))}
							</div>
						</div>
					</div>

					{/* Details Section */}
					<div>
						<h1 className="text-4xl font-bold mb-4">{item.title}</h1>
						<p className="text-lg font-semibold text-green-600 mb-2">
							₹{item.price}
							<span className="line-through text-gray-500 ml-2">
								₹{item.originalPrice}
							</span>
						</p>
						<p className="text-muted-foreground mb-6">{item.description}</p>

						<div className="flex items-center gap-2 mb-4">
							<Star className="w-5 h-5 text-yellow-500" />
							<span className="text-sm font-medium">
								{item.seller.rating} ({item.seller.verified ? 'Verified Seller' : 'Unverified'})
							</span>
						</div>

						<p className="text-sm text-muted-foreground mb-4">
							Location: {item.location} | Posted: {item.postedTime}
						</p>

						<div className="flex gap-4">
							<Button 
							  className="bg-gradient-to-r from-green-300 to-green-600 hover:from-green-400 hover:to-green-700"
							  onClick={handleGetContactDetails}
							>
								Get Contact Details
							</Button>
							<Button variant="outline">Add to Favorites</Button>
						</div>
					</div>
				</div>

				{/* Related Products Section */}
				<div className="mt-12">
					<div className="flex items-center gap-3 mb-4">
						<div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
							<Package className="w-6 h-6 text-white" />
						</div>
						<h2 className="text-3xl font-extrabold">More in {item.category}</h2>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
						{products.map((product) => (
							<div key={product.id} className="mb-4">
								<ProductCard product={product} />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Modal for Contact Details */}
			{isModalOpen && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
					<div className="bg-white rounded-lg shadow-lg p-6 w-96">
						<h2 className="text-xl font-bold mb-4">Contact Details</h2>
						<p className="mb-2"><strong>Name:</strong> Sarah Chen</p>
						<p className="mb-2"><strong>Email:</strong> sarah.chen@example.com</p>
						<p className="mb-2"><strong>Phone:</strong> +1 234 567 890</p>
						<p className="mb-4"><strong>Address:</strong> 123 Main Campus, City, Country</p>
						<button
							onClick={handleCloseModal}
							className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
						>
							Close
						</button>
					</div>
				</div>
			)}
		</section>
	);
}