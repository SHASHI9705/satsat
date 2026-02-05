"use client";

import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Plus, TrendingUp, Package, IndianRupee, Home, ShoppingBag, X, Upload } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../firebase/AuthProvider';
import Loader from '../../components/ui/loader';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';

export default function DashboardPage() {
  const router = useRouter();
  
  // State variables for products
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const { user } = useAuth();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState({ submit: false, markAsSold: null });
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [showMissingInfoPopup, setShowMissingInfoPopup] = useState(false);
  
  // State variables for services modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceImage, setServiceImage] = useState<File | null>(null);
  const [serviceTags, setServiceTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Service categories
  const serviceCategories = [
    { value: 'tutor', label: 'Tutor' },
    { value: 'developer', label: 'Developer' },
    { value: 'management', label: 'Management' },
    { value: 'coach', label: 'Coach' },
    { value: 'gamer', label: 'Gamer' },
    { value: 'other', label: 'Other' },
  ];

  // Add Notification component
  const Notification = ({ message, onClose }: { message: string; onClose: () => void }) => (
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

  // Add a popup card for users with missing phone number or address
  const MissingInfoPopup = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">Complete Your Profile</h2>
        <p className="text-sm text-gray-600 mb-4">
          To continue, please add your phone number, address and registraton number to your profile.
        </p>
        <a
          href="/profile"
          className="block w-full text-center bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg"
        >
          Go to Profile
        </a>
      </div>
    </div>
  );



  // Handle service image upload
  const handleServiceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setServiceImage(file);
    }
  };

  // Remove service tag
  const removeTag = (index: number) => {
    setServiceTags(serviceTags.filter((_, i) => i !== index));
  };

  // Handle service submission
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic client-side validation to surface issues early
      if (!serviceName || !serviceCategory) {
        alert('Please provide a service name and select a category.');
        setIsSubmitting(false);
        return;
      }

      // Build FormData to submit to the existing item creation endpoint (services are treated as items with optional images)
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      // Prefer numeric DB user id if available in localStorage
      const dbUserId = localUser?.id ? Number(localUser.id) : NaN;
      if (!dbUserId || Number.isNaN(dbUserId) || dbUserId <= 0) {
        // No numeric DB user id found — cannot create item reliably
        alert('Unable to list service: no numeric user id found. Please sign in via the app so your account is linked.');
        setIsSubmitting(false);
        return;
      }

      const selectedCategoryDefinition = serviceCategories.find((cat) => cat.value === serviceCategory);
      const serviceTypeTag = serviceCategory === 'other'
        ? customCategory.trim()
        : selectedCategoryDefinition?.label || serviceCategory;
      const tagCandidates = [...serviceTags, serviceTypeTag]
        .map((tag) => tag?.trim())
        .filter(Boolean);
      const uniqueTags = Array.from(new Set(tagCandidates));

      const formData = new FormData();
      formData.append('name', serviceName);
      formData.append('category', 'Tutoring & Services');
      formData.append('actualPrice', servicePrice || '0');
      formData.append('discountedPrice', servicePrice || '0');
      formData.append('description', serviceDescription || '');
      formData.append('userId', String(dbUserId));
      formData.append('type', 'service');
      formData.append('tags', JSON.stringify(uniqueTags));

      if (serviceImage) {
        formData.append('images', serviceImage, serviceImage.name);
      }

      // Submit service to backend item endpoint (handles optional images)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/create`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Try to parse error details from backend
        let errorText = `HTTP ${response.status}`;
        try {
          const errBody = await response.json();
          errorText = errBody?.message || JSON.stringify(errBody) || errorText;
        } catch (e) {
          const txt = await response.text();
          if (txt) errorText = txt;
        }
        throw new Error(errorText);
      }

      if (response.ok) {
        alert('Service listed successfully!');
        // Reset form
        setServiceName('');
        setServiceCategory('');
        setCustomCategory('');
        setServicePrice('');
        setServiceDescription('');
        setServiceImage(null);
        setServiceTags([]);
        setTagInput('');
        setIsServiceModalOpen(false);
        
        // Refresh services list or navigate to services page
        router.push('/services');
      } else {
        throw new Error('Failed to list service');
      }
    } catch (error) {
      console.error('Error listing service:', error);
      alert('Failed to list service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update deleteProduct function to send id in the request body
  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
        setNotification("Product deleted successfully");
      } else {
        const errorData = await response.json();
        setNotification(errorData.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setNotification("An error occurred while deleting the product");
    }
  };

  // Update markAsSold function to handle sold status
  const markAsSold = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/update-sold-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, sold: true }),
      });

      if (response.ok) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === id ? { ...product, sold: true } : product
          )
        );
        setNotification("Product marked as sold");
      } else {
        const errorData = await response.json();
        setNotification(errorData.message || "Failed to mark product as sold");
      }
    } catch (error) {
      console.error("Error marking product as sold:", error);
      setNotification("An error occurred while marking the product as sold");
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/fetch?email=${encodeURIComponent(user?.email || '')}`);
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
          if (data && Array.isArray(data.items)) {
            setProducts(data.items);
            // Calculate total earnings
            const earnings = data.items
              .filter((item: any) => item.sold)
              .reduce((sum: number, item: any) => sum + (item.discountedPrice || 0), 0);
            setTotalEarnings(earnings);
            
            // Calculate total sales
            const sales = data.items.filter((item: any) => item.sold).length;
            setTotalSales(sales);
          } else {
            console.error('Fetched items are not an array or undefined:', data.items);
            setProducts([]);
          }
        } else {
          console.error('Failed to fetch items');
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        setProducts([]);
      }
    };

    const checkUserProfile = async () => {
      if (user) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/details?email=${encodeURIComponent(user.email || '')}`);
          if (response.ok) {
            const data = await response.json();
            if (!data.phone || !data.address || !data.regnumber) { // Include regnumber in the validation
              setShowMissingInfoPopup(true);
            }
          } else {
            console.error('Failed to fetch user details');
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    if (user) {
      fetchItems();
      checkUserProfile();
    }
  }, [user]);

  const toggleModal = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/details?email=${encodeURIComponent(user.email || '')}`);
      if (response.ok) {
        const data = await response.json();
        if (!data.phone || !data.address || !data.regnumber) { // Include regnumber in the validation
          setShowMissingInfoPopup(true);
          return;
        }
      } else {
        console.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }

    setIsModalOpen((prev) => !prev);
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2000);
  };

  const handlePaymentAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, submit: true }));

    const formData = new FormData(e.target as HTMLFormElement);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (user && user.id) {
      formData.append('userId', user.id);
    } else {
      console.error('User details not found in local storage');
      setLoading((prev) => ({ ...prev, submit: false }));
      return;
    }

    // Compress images before appending to FormData
    const files = (e.target as HTMLFormElement).elements.namedItem('images') as HTMLInputElement;
    const fileList = files?.files;

    if (fileList && fileList.length > 0) {
      formData.delete('images');

      try {
        for (const file of fileList) {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 0.9,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });

          formData.append('images', compressedFile, compressedFile.name);
        }
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('Failed to compress image. Please try again.');
        setLoading((prev) => ({ ...prev, submit: false }));
        return;
      }
    }

    try {
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
  };


  const handleImageUpload = async (file: File) => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      console.log('Compressed file size:', compressedFile.size / 1024, 'KB');

      const formData = new FormData();
      formData.append('file', compressedFile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/item/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Image uploaded successfully');
      } else {
        console.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error compressing or uploading image:', error);
    }
  };

  const activeListings = products.filter((product) => !product.sold).length;

  return (
    <>
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      {showMissingInfoPopup && <MissingInfoPopup onClose={() => setShowMissingInfoPopup(false)} />}
      <section className="min-h-screen py-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/10 dark:to-red-950/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100">
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-white shadow-md rounded-lg sm:p-4 md:p-3">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-orange-500" />
                <div>
                  <h2 className="sm:text-lg text-md font-bold">Products</h2>
                  <p className="text-gray-600">{activeListings} Active Listings</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white shadow-md rounded-lg sm:p-4 md:p-3">
              <div className="flex items-center gap-3">
                <IndianRupee className="w-8 h-8 text-green-500" />
                <div>
                  <h2 className="text-lg font-bold">Earnings</h2>
                  <p className="text-gray-600">₹{totalEarnings} This Month</p>
                </div>
              </div>
            </Card>

            <Card className="hidden md:block p-4 bg-white shadow-md rounded-lg sm:p-4 md:p-3">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-500" />
                <div>
                  <h2 className="text-lg font-bold">Sales</h2>
                  <p className="text-gray-600">{totalSales} Successful Sales</p>
                </div>
              </div>
            </Card>

            <Card className="hidden md:block p-4 bg-white shadow-md rounded-lg sm:p-4 md:p-3">
              <div className="flex items-center gap-3">
                <Plus className="w-8 h-8 text-purple-500" />
                <div>
                  <h2 className="text-lg font-bold">New Listings</h2>
                  <p className="text-gray-600">5 This Week</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions Section */}
          <div className="flex flex-col md:flex-row items-center gap-4 justify-center mb-12">
            <Button
              className="bg-gradient-to-r from-green-300 to-green-600 hover:from-green-400 hover:to-green-700 text-white h-12 px-6 rounded-xl gap-2 whitespace-nowrap"
              onClick={toggleModal}
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </Button>
            <Button
              onClick={() => setIsServiceModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-12 px-6 rounded-xl gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Sell Services
            </Button>
            <p className="text-sm text-gray-600 text-center md:ml-4">
              Mark the item as sold once it's been sold.
            </p>
          </div>



          {/* Services Modal */}
          {isServiceModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">List Your Service</h3>
                    <button
                      onClick={() => setIsServiceModalOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    {/* Service Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Name
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., Math Tutoring, Web Development"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {serviceCategories.map((category) => (
                          <button
                            key={category.value}
                            type="button"
                            onClick={() => setServiceCategory(category.value)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                              serviceCategory === category.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* If "Other" is selected, show custom category input */}
                    {serviceCategory === 'other' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Service Type
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter your service type..."
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full"
                          required
                        />
                      </div>
                    )}

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={servicePrice}
                          onChange={(e) => setServicePrice(e.target.value)}
                          className="pl-8 w-full"
                          required
                        />
                        
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Describe your service in detail..."
                        value={serviceDescription}
                        onChange={(e) => setServiceDescription(e.target.value)}
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        required
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Image
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleServiceImageUpload}
                          className="hidden"
                          id="service-image"
                        />
                        <label htmlFor="service-image" className="cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {serviceImage ? serviceImage.name : 'Click to upload an image'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG up to 5MB
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skills/Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {serviceTags.map((tag, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(index)}
                              className="ml-1 hover:text-blue-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Add a skill or tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && tagInput.trim()) {
                              e.preventDefault();
                              setServiceTags([...serviceTags, tagInput.trim()]);
                              setTagInput('');
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (tagInput.trim()) {
                              setServiceTags([...serviceTags, tagInput.trim()]);
                              setTagInput('');
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Listing Service...
                          </>
                        ) : (
                          'List My Service'
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

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
                <form onSubmit={handlePaymentAndSubmit} encType="multipart/form-data">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Upload Photos</label>
                    <input
                      type="file"
                      name="images"
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
                      <option>Shoes</option>
                      <option>Fashion</option>
                      <option>Toys & Games</option>
                      <option>Books & Academic</option>
                      <option>Tech Products</option>
                      <option>Beauty & Personal Care</option>
                      <option>Furniture & Living</option>
                      <option>Kitchen & Dining</option>
                      <option>Tutoring & Services</option>
                      <option>Study Supplies</option>
                      <option>Stationery</option>
                      <option>Software & Digital</option>
                      <option>Instruments</option>
                      <option>Sports & Fitness</option>
                      <option>Pet Supplies</option>
                      <option>Vehicles & Transport</option>
                      <option>Accessories</option>
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
                    disabled={loading.submit}
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
                  className={`bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between relative`}
                >
                  {product.sold && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black opacity-50 rounded-xl"></div>
                      <span className="inline-block w-56 h-56 bg-no-repeat bg-center bg-contain rotate-[-1deg] z-10" style={{ backgroundImage: "url('/soldout.png')" }}></span>
                    </div>
                  )}
                  <div className={`${product.sold ? 'opacity-50' : ''}`}>
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
                      className="mt-4 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg"
                      onClick={() => markAsSold(product.id)}
                      disabled={loading.markAsSold === product.id}
                    >
                      {loading.markAsSold === product.id ? <Loader /> : 'Mark as Sold'}
                    </Button>
                  )}
                  <Button
                    className="mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 z-20 py-2 rounded"
                    onClick={() => deleteProduct(product.id)}
                  >
                    Delete
                  </Button>
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