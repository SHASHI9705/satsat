"use client"
import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  ArrowLeft, Edit3, Mail, Phone, MapPin, LogOut, Edit, 
  LayoutDashboard, FileText, Trash2, ArrowRight, Loader2,
  AlertCircle, Settings
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useAuth } from '../../firebase/AuthProvider';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '../../components/ui/alert';

// Define types for user details
interface UserDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editDetails, setEditDetails] = useState<UserDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      fetchUserDetails();
    }
  }, [user]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/details?email=${encodeURIComponent(user!.email!)}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load profile information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditDetails(userDetails);
    setIsEditing(true);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleClosePopup = () => {
    setIsEditing(false);
    setEditDetails(userDetails);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editDetails,
          email: user?.email // Keep original email as identifier
        }),
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }

      const updatedData = await response.json();
      setUserDetails(updatedData.user || updatedData);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating user details:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user?.email }),
      });

      if (!response.ok) {
        throw new Error(`Deletion failed: ${response.statusText}`);
      }

      alert('Your account has been deleted successfully.');
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
    }
  };

  if (loading && !userDetails.email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <section className="min-h-screen py-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/10 dark:to-red-950/10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Alerts for feedback */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Header Section */}
        <div className="flex items-center justify-between mb-4 max-w-4xl mx-auto">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.back()}
            disabled={loading}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Profile</h1>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleEditClick}
            disabled={loading}
          >
            <Edit3 className="w-5 h-5" />
            Edit
          </Button>
        </div>

        {/* Profile Card */}
        <div className="max-w-4xl mx-auto bg-gray-100 dark:bg-gray-900 shadow-lg rounded-lg p-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-6">
            {/* Left Side: Profile Photo and Name */}
            <div className="flex flex-col items-center sm:items-start gap-4">
              <div className="relative w-24 h-24 border-4 border-black rounded-full overflow-hidden sm:w-32 sm:h-32">
                <Avatar className="w-full h-full">
                  {user?.photoURL ? (
                    <AvatarImage src={user.photoURL} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-2xl">
                      {userDetails.name?.charAt(0).toUpperCase() || userDetails.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              <p className="text-xl sm:text-2xl font-extrabold text-white bg-gradient-to-r from-green-300 to-green-600 rounded-md px-4 py-2 text-center sm:text-left">
                {userDetails.name || 'No name set'}
              </p>
            </div>

            {/* Right Side: Profile Details */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300 flex-shrink-0" />
                <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">Email:</span>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-all">
                  {userDetails.email || 'No email set'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300 flex-shrink-0" />
                <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">Phone:</span>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-all">
                  {userDetails.phone || 'No phone set'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300 flex-shrink-0 mt-1" />
                <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">Address:</span>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words flex-1">
                  {userDetails.address || 'No address set'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Popup */}
        {isEditing && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleClosePopup}
          >
            <div 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={editDetails.name}
                    onChange={handleInputChange}
                    className="w-full"
                    required
                  />
                </div>
                
                {/* Email should be read-only if it's the primary key */}
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email (cannot be changed)
                  </label>
                  <Input
                    id="email"
                    name="email"
                    value={editDetails.email}
                    className="w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={editDetails.phone}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="address" className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={editDetails.address}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    onClick={handleClosePopup} 
                    variant="outline"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="min-w-[80px]"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Options Section */}
        <div className="mt-8 space-y-4 max-w-4xl mx-auto">
          {[
            {
              label: 'Edit Profile',
              icon: Edit,
              onClick: handleEditClick,
              disabled: loading
            },
            {
              label: 'Dashboard',
              icon: LayoutDashboard,
              onClick: () => router.push('/dashboard'),
              disabled: loading
            },
            {
              label: 'Terms and Conditions',
              icon: FileText,
              onClick: () => router.push('/terms'),
              disabled: loading
            },
            {
              label: 'Settings',
              icon: Settings,
              onClick: () => router.push('/settings'),
              disabled: loading
            },
            {
              label: 'Delete Account',
              icon: Trash2,
              onClick: handleDeleteAccount,
              disabled: loading,
              className: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
            }
          ].map((option) => (
            <button
              key={option.label}
              onClick={option.onClick}
              disabled={option.disabled}
              className={`flex items-center justify-between w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-md shadow-md hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${option.className || ''}`}
            >
              <div className="flex items-center gap-4">
                <option.icon className="w-6 h-6" />
                <span className="text-lg">{option.label}</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>
          ))}

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 p-6 rounded-md shadow-md"
          >
            <LogOut className="w-6 h-6 text-white mr-2" />
            <span className="text-lg text-white">Logout</span>
          </Button>
        </div>
      </div>
    </section>
  );
}