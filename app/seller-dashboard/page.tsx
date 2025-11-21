'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  DollarSign,
  Database,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useWallet } from '@/lib/contexts/WalletContext';
import { marketplaceService, DataListing } from '@/lib/services/marketplace';

interface SellerStats {
  totalListings: number;
  totalSales: number;
  totalRevenue: number;
  avgRating: number;
}

export default function SellerDashboardPage() {
  const { accountId, isConnected } = useWallet();
  const [listings, setListings] = useState<DataListing[]>([]);
  const [stats, setStats] = useState<SellerStats>({
    totalListings: 0,
    totalSales: 0,
    totalRevenue: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    rows: '',
    categories: '',
  });

  // Load seller's listings
  useEffect(() => {
    const loadListings = () => {
      if (!accountId || !isConnected) {
        setLoading(false);
        return;
      }

      try {
        // Get all listings (in production, filter by seller)
        const allListings = marketplaceService.getAllListings();
        const sellerListings = allListings.filter((l) => l.seller === accountId);

        setListings(sellerListings);

        // Calculate stats
        const sales = marketplaceService.getUserSales(accountId);
        const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
        const avgRating =
          sellerListings.length > 0
            ? sellerListings.reduce((sum, l) => sum + (l.rating || 0), 0) / sellerListings.length
            : 0;

        setStats({
          totalListings: sellerListings.length,
          totalSales: sales.length,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          avgRating: Math.round(avgRating * 10) / 10,
        });
      } catch (error) {
        console.error('Failed to load listings:', error);
        toast.error('Failed to load your listings');
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [accountId, isConnected]);

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountId) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      const categories = formData.categories
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c);

      if (!formData.name || !formData.description || !formData.price || !formData.rows) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (categories.length === 0) {
        toast.error('Please add at least one category');
        return;
      }

      const dataHash = `QmHash${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

      const listing = marketplaceService.createListing(
        formData.name,
        formData.description,
        parseFloat(formData.price),
        parseInt(formData.rows),
        categories,
        accountId,
        dataHash
      );

      setListings([...listings, listing]);
      setFormData({
        name: '',
        description: '',
        price: '',
        rows: '',
        categories: '',
      });
      setShowCreateModal(false);
      toast.success('Listing created successfully!');
    } catch (error: any) {
      console.error('Failed to create listing:', error);
      toast.error(error.message || 'Failed to create listing');
    }
  };

  const handleDeleteListing = (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        marketplaceService.deleteListing(id);
        setListings(listings.filter((l) => l.id !== id));
        toast.success('Listing deleted');
      } catch (error) {
        toast.error('Failed to delete listing');
      }
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 flex flex-col items-center text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-yellow-900 dark:text-yellow-200 mb-2">
              Wallet Not Connected
            </h2>
            <p className="text-yellow-800 dark:text-yellow-300 mb-6">
              Please connect your wallet to access the seller dashboard
            </p>
            <Link
              href="/"
              className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-10 h-10" />
              <h1 className="text-4xl font-bold">Seller Dashboard</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-5 h-5" />
              List New Dataset
            </button>
          </div>
          <p className="text-blue-100 text-lg">
            Account: <span className="font-mono font-semibold">{accountId}</span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Listings</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalListings}
                </p>
              </div>
              <Database className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalSales}
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalRevenue} ℏ
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.avgRating}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Listings */}
        {listings.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Dataset
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Rows
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {listings.map((listing) => (
                    <tr
                      key={listing.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {listing.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                            {listing.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                          {listing.price} ℏ
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {listing.rows.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {listing.purchases || 0}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {listing.rating?.toFixed(1) || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="flex items-center gap-1 px-3 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium">
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm font-medium">
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Listings Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start selling your datasets by creating your first listing.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Create First Listing
            </button>
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center gap-3">
              <Plus className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Create New Listing</h2>
            </div>

            <form onSubmit={handleCreateListing} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dataset Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sales Analytics Q4 2024"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your dataset..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (HBAR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="5.5"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Number of Rows *
                  </label>
                  <input
                    type="number"
                    value={formData.rows}
                    onChange={(e) => setFormData({ ...formData, rows: e.target.value })}
                    placeholder="1000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categories (comma-separated) *
                </label>
                <input
                  type="text"
                  value={formData.categories}
                  onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                  placeholder="e.g., Sales, Analytics, Business"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Create Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 flex gap-4 flex-wrap">
          <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
            ← Home
          </Link>
          <Link href="/data-marketplace" className="text-blue-600 hover:underline dark:text-blue-400">
            Data Marketplace
          </Link>
          <Link href="/token-gallery" className="text-blue-600 hover:underline dark:text-blue-400">
            Token Gallery
          </Link>
          <Link href="/tokenized-data" className="text-blue-600 hover:underline dark:text-blue-400">
            Tokenize Data
          </Link>
          <Link href="/my-purchases" className="text-blue-600 hover:underline dark:text-blue-400">
            My Purchases
          </Link>
        </div>
      </div>
    </div>
  );
}
