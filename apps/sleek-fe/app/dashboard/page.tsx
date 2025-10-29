"use client";

import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Plus, TrendingUp, Package, IndianRupee, Home, ShoppingBag, X } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../firebase/AuthProvider';
import Loader from '../../components/ui/loader'; // Corrected loader import
import { useRouter } from 'next/navigation'; // Import useRouter
import Razorpay from 'razorpay';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Add Notification component
const Notification = ({ message, onClose }) => (
  <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
    {message}
    <button
      onClick={onClose}
      className="ml-4 text-sm underline hover:text-gray-200"
    >
      Close
    </button>
  </div>
);

export default function DashboardPage() {
  const router = useRouter(); // Initialize router
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const { user } = useAuth();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState({ submit: false, markAsSold: null }); // Add loading state
  const [totalEarnings, setTotalEarnings] = useState(0); // Initialize total earnings
  const [totalSales, setTotalSales] = useState(0); // Initialize total sales

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/fetch`);
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data); // Log the API response
          if (data && Array.isArray(data.items)) {
            setProducts(data.items);
          } else {
            console.error('Fetched items are not an array or undefined:', data.items);
            setProducts([]); // Set to an empty array if the response is invalid
          }
        } else {
          console.error('Failed to fetch items');
          setProducts([]); // Set to an empty array on fetch failure
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        setProducts([]); // Set to an empty array on error
      }
    };

    fetchItems();
  }, []);

  const toggleModal = () => {
    if (!user) {
      router.push('/signin'); // Redirect to signup page if user is not signed in
      return;
    }
    setIsModalOpen((prev) => !prev);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2000); // Auto-hide after 2 seconds
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentAndSubmit = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, submit: true }));

    const formData = new FormData(e.target);
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.id) {
      formData.append('userId', user.id);
    } else {
      console.error('User details not found in local storage');
      setLoading((prev) => ({ ...prev, submit: false }));
      return;
    }

    const isRazorpayLoaded = await loadRazorpayScript();

    if (!isRazorpayLoaded) {
      alert('Failed to load Razorpay. Please try again.');
      setLoading((prev) => ({ ...prev, submit: false }));
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: 700, // Amount in paise (7 INR)
      currency: 'INR',
      name: 'SleekRoad',
      description: 'Add Item Fee',
      handler: async (response) => {
        try {
          const paymentId = response.razorpay_payment_id;
          console.log('Payment successful:', paymentId);

          const createResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/create`, {
            method: 'POST',
            body: formData,
          });

          if (!createResponse.ok) {
            console.error('Failed to create item');
            alert('Failed to create item. Please try again.');
            return;
          }

          const data = await createResponse.json();
          console.log('Item created successfully:', data);
          setProducts((prev) => [...prev, data.item]);
          toggleModal();
          showNotification('Item created successfully!');
        } catch (error) {
          console.error('Error creating item:', error);
          alert('An error occurred while creating the item. Please try again.');
        } finally {
          setLoading((prev) => ({ ...prev, submit: false }));
        }
      },
      prefill: {
        name: user.name,
        email: user.email,
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      console.error('Payment failed:', response.error);
      alert('Payment failed. Please try again.');
      setLoading((prev) => ({ ...prev, submit: false }));
    });

    rzp.open();
  };

  const handleMarkAsSold = async (id) => {
    const product = products.find((product) => product.id === id); // Find the product being marked as sold
    setLoading((prev) => ({ ...prev, markAsSold: id })); // Set loading for mark as sold

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/delete/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts((prev) => prev.filter((product) => product.id !== id));
        if (product) {
          setTotalSales((prev) => prev + 1); // Increment total sales by 1
        }
        showNotification('Item deleted successfully!');
      } else {
        console.error('Failed to delete item');
        alert('Failed to delete item. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('An error occurred while deleting the item. Please try again.');
    } finally {
      setLoading((prev) => ({ ...prev, markAsSold: null })); // Reset loading for mark as sold
    }
  };

  const activeListings = products.filter((product) => !product.sold).length; // Calculate active listings dynamically

  return (
    <>
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <section className="min-h-screen py-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/10 dark:to-red-950/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                Seller Dashboard
              </h1>
            </div>
            <a
              href="/"
              className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md text-black hover:bg-gray-100"
            >
              <Home className="w-5 h-5 text-black" />
              <span className="text-sm font-medium">Home</span>
            </a>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="p-6 bg-white shadow-md rounded-lg">
              <div className="flex items-center gap-4">
                <Package className="w-10 h-10 text-orange-500" />
                <div>
                  <h2 className="text-xl font-bold">Products</h2>
                  <p className="text-gray-600">{activeListings} Active Listings</p> {/* Use dynamic count */}
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-md rounded-lg">
              <div className="flex items-center gap-4">
                <IndianRupee className="w-10 h-10 text-green-500" />
                <div>
                  <h2 className="text-xl font-bold">Earnings</h2>
                  <p className="text-gray-600">₹{totalEarnings} This Month</p> {/* Use dynamic earnings */}
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-md rounded-lg">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-10 h-10 text-blue-500" />
                <div>
                  <h2 className="text-xl font-bold">Sales</h2>
                  <p className="text-gray-600">{totalSales} Successful Sales</p> {/* Use dynamic sales count */}
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-md rounded-lg">
              <div className="flex items-center gap-4">
                <Plus className="w-10 h-10 text-purple-500" />
                <div>
                  <h2 className="text-xl font-bold">New Listings</h2>
                  <p className="text-gray-600">5 This Week</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions Section */}
          <div className="flex flex-col items-center gap-4 mb-12">
            <Button
              className="bg-gradient-to-r from-green-300 to-green-600 hover:from-green-400 hover:to-green-700"
              onClick={toggleModal}
            >
              Add New Product
            </Button>
            <p className="text-sm text-gray-600 text-center">
             Remember to mark the item as sold once it’s been sold.
            </p>
          </div>

          {/* Modal for Adding New Product */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
                <button
                  onClick={toggleModal}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold mb-4">Add New Product</h2>
                <form onSubmit={handlePaymentAndSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Upload Photos</label>
                    <input
                      type="file"
                      name="images" // Changed from 'photos' to 'images'
                      accept="image/*"
                      multiple
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload 1 to 3 photos.</p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Item Name</label>
                    <Input name="name" placeholder="Enter item name" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      name="category"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option>Electronics</option>
                      <option>Textbooks</option>
                      <option>Tech Products</option>
                      <option>Clothes</option>
                      <option>Shoes</option>
                      <option>Books</option>
                      <option>Instruments</option>
                      <option>Tutoring & Services</option>
                      <option>Others</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Actual Price</label>
                    <Input name="actualPrice" type="number" placeholder="Enter actual price" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Discounted Price</label>
                    <Input name="discountedPrice" type="number" placeholder="Enter discounted price" />
                  </div>
                  {/* New description input field */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      name="description"
                      placeholder="Enter item description"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    ></textarea>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-300 to-green-600 hover:from-green-400 hover:to-green-700"
                    disabled={loading.submit} // Disable button while loading
                  >
                    {loading.submit ? <Loader /> : 'Submit'}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Display Products as Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className={`bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between ${
                    product.sold ? 'opacity-50' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl truncate font-bold text-gray-800">{product.name}</h3>
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                        {product.category}
                      </span>
                    </div>
                    <div className="flex items-center truncate justify-between text-sm text-gray-600 mb-4">
                      <p>Actual Price: ₹{product.actualPrice}</p>
                      <p>Discounted Price: ₹{product.discountedPrice}</p>
                    </div>
                    {/* New description display */}
                    <div className="text-sm truncate text-gray-600 mb-4">
                      <p>{product.description}</p>
                    </div>
                    <div className="flex gap-3 overflow-x-auto">
                      {Array.isArray(product.images) && product.images.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt="Product"
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                  {!product.sold && (
                    <Button
                      className="mt-4 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg"
                      onClick={() => handleMarkAsSold(product.id)}
                      disabled={loading.markAsSold === product.id} // Disable button while loading
                    >
                      {loading.markAsSold === product.id ? <Loader /> : 'Mark as Sold'}
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600">No products available.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}