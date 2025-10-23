"use client";

import { Button } from '../../components/ui/button';
import { Star, Package, Home, ArrowLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ProductCard } from '../../components/ProductCard';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams

export default function SelectedItemPage() {
	const searchParams = useSearchParams();
	const itemId = searchParams.get('id'); // Get the item ID from query parameters

	const [item, setItem] = useState(null);
	const [relatedProducts, setRelatedProducts] = useState([]);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const images = []; // Removed dummy image URLs

	const [products, setProducts] = useState(relatedProducts);
	const [page, setPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [sellerDetails, setSellerDetails] = useState(null); // State to store seller details
	const [isFavorited, setIsFavorited] = useState(false); // State to track if the item is favorited

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

	const handleGetContactDetails = async () => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/seller/${item.userId}`);
			if (response.ok) {
				const data = await response.json();
				setSellerDetails(data.seller); // Store seller details in state
				setIsModalOpen(true);
			} else {
				console.error('Failed to fetch seller details');
			}
		} catch (error) {
			console.error('Error fetching seller details:', error);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	useEffect(() => {
		const fetchItemDetails = async () => {
			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/${itemId}`);
				if (response.ok) {
					const data = await response.json();
					setItem(data.item);
					setRelatedProducts(data.relatedProducts || []); // Assuming related products are included
				} else {
					console.error('Failed to fetch item details');
				}
			} catch (error) {
				console.error('Error fetching item details:', error);
			}
		};

		if (itemId) {
			fetchItemDetails();
		}
	}, [itemId]);

	useEffect(() => {
		const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
		setIsFavorited(favorites.includes(itemId));
	}, [itemId]);

	const handleFavoriteClick = () => {
		const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
		if (favorites.includes(itemId)) {
			const updatedFavorites = favorites.filter((id) => id !== itemId);
			localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
			setIsFavorited(false);
		} else {
			favorites.push(itemId);
			localStorage.setItem('favorites', JSON.stringify(favorites));
			setIsFavorited(true);
		}
	};

	if (!item) {
		return <p>Loading...</p>; // Show a loading state while fetching data
	}

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
						<div className="relative w-full max-w-lg overflow-hidden rounded-lg">
							<img
								src={item.images?.[0] || '/placeholder-image.png'}
								alt={item.name}
								className="rounded-lg shadow-md w-full h-96 object-contain mx-auto"
							/>
						</div>
					</div>

					{/* Details Section */}
					<div>
						<div className="flex items-center gap-2 mb-4">
							<h1 className="text-4xl font-bold mb-4 line-clamp-2">{item.name}</h1>
						</div>
						<p className="text-lg font-semibold text-green-600 mb-2">
							₹{item.discountedPrice}
							<span className="line-through text-gray-500 ml-2">
								₹{item.actualPrice}
							</span>
						</p>
						<p className="text-muted-foreground mb-6">{item.description}</p>

						<div className="flex items-center gap-2 mb-4">
							<Star className="w-5 h-5 text-yellow-500" />
							<span className="text-sm font-medium">
								{item.rating || '4.5'} (Verified Seller)
							</span>
						</div>

						<div className="flex gap-4">
							<Button 
							  className="bg-gradient-to-r from-green-300 to-green-600 hover:from-green-400 hover:to-green-700"
							  onClick={handleGetContactDetails}
							>
								Get Contact Details
							</Button>
							<Button 
							  className={`border ${isFavorited ? 'bg-red-500 text-white' : 'bg-white text-red-500'} hover:bg-red-100`} 
							  onClick={handleFavoriteClick}
							>
								{isFavorited ? 'Favorited' : 'Add to Favorites'}
							</Button>
						</div>
					</div>
				</div>

				{/* Related Products Section */}
				<div className="mt-12">
					<div className="flex items-center gap-3 mb-4">
						<Package className="w-6 h-6 text-gray-700" />
						<h2 className="text-3xl font-extrabold">More in {item.category}</h2>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
						{relatedProducts.map((product) => (
							<div key={product.id} className="mb-4">
								<ProductCard product={product} />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Modal for Contact Details */}
			{isModalOpen && sellerDetails && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
					<div className="bg-white rounded-lg shadow-lg p-6 w-96">
						<h2 className="text-xl font-bold mb-4">Contact Details</h2>
						<p className="mb-2"><strong>Name:</strong> {sellerDetails.name}</p>
						<p className="mb-2"><strong>Email:</strong> {sellerDetails.email}</p>
						<p className="mb-2"><strong>Phone:</strong> {sellerDetails.phone}</p>
						<p className="mb-4"><strong>Address:</strong> {sellerDetails.address}</p>
						<button
							onClick={() => setIsModalOpen(false)}
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