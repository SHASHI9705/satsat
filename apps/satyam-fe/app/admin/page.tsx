"use client";

import React, { useState, useEffect } from "react";
import NextImage from "next/image";
import Link from 'next/link';
import { 
  Home, Users, LogOut, Download, Search, Filter, 
  Eye, Trash2, X, ChevronDown, UserCircle, DollarSign, Image as ImageIcon,
  FileText, Mail, Phone, MapPin, Briefcase,
  Award, Calendar, CheckCircle, XCircle, Loader2,
  Menu, Bell, Settings, PieChart, TrendingUp
} from 'lucide-react';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [togglingPayment, setTogglingPayment] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    recent: 0
  });

  useEffect(() => {
    const savedName = localStorage.getItem("adminName");
    const savedPassword = localStorage.getItem("adminPassword");

    if (savedName === "Satyam" && savedPassword === "Satyam@9705") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (name === "Satyam" && password === "Satyam@9705") {
      localStorage.setItem("adminName", name);
      localStorage.setItem("adminPassword", password);
      setIsAuthenticated(true);
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminPassword");
    setIsAuthenticated(false);
    setUsers([]);
  };

  const handleViewDetails = async (email) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${email}`);
      if (!response.ok) throw new Error("Failed to fetch user details");
      const userDetails = await response.json();
      setSelectedUser(userDetails);
    } catch (error) {
      console.error("Failed to fetch user details", error);
      alert("Failed to load user details.");
    }
  };

  const closePopup = () => {
    setSelectedUser(null);
  };

  const handleExportData = () => {
    import("xlsx").then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(users);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Users");
      xlsx.writeFile(workbook, "users_data.xlsx");
    }).catch((error) => {
      console.error("Failed to export data:", error);
    });
  };

  const handleDeleteUser = async (email) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${email}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user');
    }
  };

  const handleTogglePayment = async (email: string, currentPaid: boolean) => {
    setTogglingPayment(email);
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${email}/payment`;
      // Backend only has a "mark as paid" endpoint; for unpaid we use the general update
      let response: Response;
      if (!currentPaid) {
        response = await fetch(url, { method: 'PUT' });
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${email}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paid: 'false' }),
        });
      }
      if (response.ok) {
        await fetchUsers();
      } else {
        alert('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error toggling payment:', error);
      alert('An error occurred while updating payment status');
    } finally {
      setTogglingPayment(null);
    }
  };

  const updateStats = (userData) => {
    if (!Array.isArray(userData)) return;
    setStats({
      total: userData.length,
      paid: userData.filter(u => u.paid).length,
      unpaid: userData.filter(u => !u.paid).length,
      recent: userData.filter(u => {
        const date = new Date(u.createdAt || Date.now());
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return date > sevenDaysAgo;
      }).length
    });
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      const usersArray = Array.isArray(data) ? data : (data?.users ?? data?.data ?? []);
      setUsers(usersArray);
      updateStats(usersArray);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const filteredUsers = users
    .filter((user) => {
      if (filter === "all") return true;
      if (filter === "paid") return user.paid;
      if (filter === "unpaid") return !user.paid;
    })
    .filter((user) => 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery)
    );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-blue-200">Secure access to user management</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Username</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02]"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'} bg-gradient-to-b from-slate-900 to-blue-900 w-64 text-white transition-transform duration-200 ease-in-out z-30`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
          
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-800/50 rounded-xl text-white">
              <PieChart className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            {/* <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-800/30 rounded-xl text-blue-100 transition-colors">
              <Users className="w-5 h-5" />
              <span>Users</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-800/30 rounded-xl text-blue-100 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a> */}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-600/80 hover:bg-red-600 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
          <div className="px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                  <NextImage src="/logo.png" alt="Satyam logo" width={28} height={28} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Admin</p>
                  <p className="text-xs text-slate-500">Super Administrator</p>
                </div>
              </div>
              <button
                onClick={fetchUsers}
                title="Refresh users"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <TrendingUp className="w-5 h-5 text-slate-600" />
              </button>
              {/* <button
                onClick={handleLogout}
                title="Logout"
                className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button> */}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
              <button onClick={fetchUsers} className="ml-auto text-sm underline hover:no-underline">Retry</button>
            </div>
          )}
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
              </div>
              <p className="text-sm text-slate-600">Total Users</p>
              {/* <p className="text-xs text-slate-400 mt-1">+12% from last month</p> */}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">{stats.paid}</span>
              </div>
              <p className="text-sm text-slate-600">Paid Users</p>
              {/* <p className="text-xs text-green-600 mt-1">+{stats.paid ? Math.round((stats.paid/stats.total)*100) : 0}% conversion</p> */}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">{stats.unpaid}</span>
              </div>
              <p className="text-sm text-slate-600">Unpaid Users</p>
              {/* <p className="text-xs text-slate-400 mt-1">Pending payments</p> */}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">{stats.recent}</span>
              </div>
              <p className="text-sm text-slate-600">New This Week</p>
              {/* <p className="text-xs text-slate-400 mt-1">Last 7 days</p> */}
            </div>
          </div>

          {/* Users Table Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">User Management</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <select
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setFilter(e.target.value)}
                    value={filter}
                  >
                    <option value="all">All Users</option>
                    <option value="paid">Paid Users</option>
                    <option value="unpaid">Unpaid Users</option>
                  </select>
                  
                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{user.name}</p>
                              <p className="text-xs text-slate-500">Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">{user.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{user.positionApplied || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.paid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              <XCircle className="w-3 h-3" />
                              Unpaid
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(user.email)}
                              className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleTogglePayment(user.email, user.paid)}
                              disabled={togglingPayment === user.email}
                              className={`p-2 rounded-lg transition-colors ${
                                user.paid
                                  ? 'hover:bg-yellow-100 text-yellow-600'
                                  : 'hover:bg-green-100 text-green-600'
                              } disabled:opacity-50`}
                              title={user.paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                            >
                              {togglingPayment === user.email
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : user.paid
                                  ? <XCircle className="w-4 h-4" />
                                  : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.email)}
                              className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">User Details</h3>
                <button
                  onClick={closePopup}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase">Full Name</label>
                  <p className="text-lg font-semibold text-slate-900">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase">Father's Name</label>
                  <p className="text-lg font-semibold text-slate-900">{selectedUser.fatherName}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase">Email</label>
                  <p className="text-slate-700">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase">Phone</label>
                  <p className="text-slate-700">{selectedUser.phone}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase">Address</label>
                  <p className="text-slate-700">{selectedUser.address}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase">Experience</label>
                  <p className="text-slate-700">{selectedUser.experience} years</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase">Position Applied</label>
                  <p className="text-slate-700">{selectedUser.positionApplied}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase">Payment Status</label>
                  <p className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${selectedUser.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedUser.paid ? 'Paid' : 'Unpaid'}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Job Profile
                </h4>
                <a
                  href={selectedUser.jobProfileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {selectedUser.jobProfileLink}
                </a>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Passport Photo
                  </h4>
                  <img
                    src={selectedUser.passportPhoto}
                    alt="Passport"
                    className="w-full h-48 object-cover rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  {/* <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Signature
                  </h4> */}
                  <img
                    src={selectedUser.signaturePhoto}
                    alt="Signature"
                    className="w-full h-48 object-cover rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="mt-8">
                <a
                  href={selectedUser.resumePdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
                  download
                >
                  <Download className="w-4 h-4" />
                  Download Resume
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;