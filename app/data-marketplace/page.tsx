'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Star,
  TrendingUp,
  Download,
  Eye,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  marketplaceService,
  DataListing,
  SAMPLE_LISTINGS,
} from '@/lib/services/marketplace';
import { useWallet } from '@/lib/contexts/WalletContext';
import PurchaseModal from '@/components/PurchaseModal';

export default function DataMarketplacePage() {
  const [listings, setListings] = useState<DataListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<DataListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedListing, setSelectedListing] = useState<DataListing | null>(
    null
  );
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { isConnected, accountId } = useWallet();

  // Load listings
  useEffect(() => {
    const loadListings = () => {
      try {
        // Sync tokenized data first (CSVs from treasury account)
        marketplaceService.syncTokenizedDataManually();
        
        const stored = marketplaceService.getAllListings();
        
        // If no listings, use sample data
        if (stored.length === 0) {
          SAMPLE_LISTINGS.forEach((listing) => {
            marketplaceService.createListing(
              listing.name,
              listing.description,
              listing.price,
              listing.rows,
              listing.categories,
              listing.seller,
              listing.dataHash,
              listing.preview
            );
          });
          setListings(SAMPLE_LISTINGS);
        } else {
          setListings(stored);
        }
      } catch (error) {
        console.error('Failed to load listings:', error);
        setListings(SAMPLE_LISTINGS);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  // Filter listings
  useEffect(() => {
    let filtered = listings;

    // Search filter
    if (searchQuery) {
      filtered = marketplaceService.searchListings(searchQuery);
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((listing) =>
        listing.categories.includes(selectedCategory)
      );
    }

    setFilteredListings(filtered);
  }, [listings, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    listings.forEach((listing) => {
      listing.categories.forEach((cat) => cats.add(cat));
    });
    return ['All', ...Array.from(cats).sort()];
  }, [listings]);

  // Get marketplace stats
  const stats = useMemo(() => {
    const totalValue = listings.reduce((sum, l) => sum + l.price, 0);
    const totalRows = listings.reduce((sum, l) => sum + l.rows, 0);
    const avgRating =
      listings.reduce((sum, l) => sum + (l.rating || 0), 0) / (listings.length || 1);

    return {
      totalListings: listings.length,
      totalDataPoints: totalRows,
      totalValue: totalValue.toFixed(2),
      avgRating: avgRating.toFixed(1),
    };
  }, [listings]);

  const handlePurchase = (listing: DataListing) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    setSelectedListing(listing);
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = (purchaseId: string) => {
    toast.success('Purchase completed! Check your profile for downloads.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Data Marketplace</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-2xl">
            Buy and sell verified CSV datasets on-chain. Secure, transparent, and powered by
            Hedera.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Datasets</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalListings}
                </p>
              </div>
              <ShoppingCart className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Data Points</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {(stats.totalDataPoints as number).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Value</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalValue} ℏ
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
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
              <Star className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-8">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search datasets by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-400" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wallet Warning */}
        {!isConnected && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8 flex gap-4">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Wallet Not Connected
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please connect your wallet to purchase datasets from the marketplace.
              </p>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                  <h3 className="text-lg font-bold text-white line-clamp-2">
                    {listing.name}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="flex-1 p-4 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Preview */}
                  {listing.preview && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-xs">
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Preview:
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 font-mono">
                        {listing.preview.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Rows</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {listing.rows.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded">
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Rating</p>
                      <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                        {listing.rating?.toFixed(1)} ⭐
                      </p>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1">
                    {listing.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Price</p>
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        {listing.price} ℏ
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {listing.purchases || 0} purchases
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePurchase(listing)}
                      disabled={!isConnected}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No datasets found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or category filters
            </p>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {selectedListing && (
        <PurchaseModal
          listing={selectedListing}
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedListing(null);
          }}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}

      {/* Footer Navigation */}
      <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 flex gap-4 flex-wrap">
          <Link
            href="/"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Back to Home
          </Link>
          <Link
            href="/token-gallery"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Token Gallery →
          </Link>
          <Link
            href="/tokenized-data"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Tokenize Data →
          </Link>
        </div>
      </div>
    </div>
  );
}
