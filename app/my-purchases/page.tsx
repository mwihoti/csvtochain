'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useWallet } from '@/lib/contexts/WalletContext';
import { marketplaceService, DataListing } from '@/lib/services/marketplace';

interface UserPurchase {
  purchaseId: string;
  listing: DataListing;
  purchaseDate: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  transactionId?: string;
}

export default function MyPurchasesPage() {
  const { accountId, isConnected } = useWallet();
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    totalDataPoints: 0,
  });

  // Load user's purchases
  useEffect(() => {
    const loadPurchases = () => {
      if (!accountId || !isConnected) {
        setLoading(false);
        return;
      }

      try {
        const userPurchases = marketplaceService.getUserPurchases(accountId);
        
        // Map purchases to include listing details
        const purchasesWithListings: UserPurchase[] = userPurchases
          .map((purchase) => {
            const listing = marketplaceService.getListingById(purchase.dataId);
            return {
              purchaseId: purchase.id,
              listing: listing || ({} as DataListing),
              purchaseDate: purchase.timestamp,
              amount: purchase.amount,
              status: purchase.status,
              transactionId: purchase.transactionId,
            };
          })
          .filter((p) => p.listing && p.listing.id); // Filter out missing listings

        setPurchases(purchasesWithListings);

        // Calculate stats
        const totalSpent = purchasesWithListings.reduce((sum, p) => sum + p.amount, 0);
        const totalDataPoints = purchasesWithListings.reduce(
          (sum, p) => sum + (p.listing?.rows || 0),
          0
        );

        setStats({
          totalPurchases: purchasesWithListings.length,
          totalSpent: Math.round(totalSpent * 100) / 100,
          totalDataPoints,
        });
      } catch (error) {
        console.error('Failed to load purchases:', error);
        toast.error('Failed to load purchases');
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, [accountId, isConnected]);

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
              Please connect your wallet to view your purchases
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
          <p className="text-gray-600 dark:text-gray-400">Loading your purchases...</p>
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
            <h1 className="text-4xl font-bold">My Purchases</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Account: <span className="font-mono font-semibold">{accountId}</span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Purchases</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalPurchases}
                </p>
              </div>
              <ShoppingCart className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalSpent} ℏ
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Data Points</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalDataPoints.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Purchases List */}
        {purchases.length > 0 ? (
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
                      Data Points
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Date Purchased
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {purchases.map((purchase) => (
                    <tr
                      key={purchase.purchaseId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {purchase.listing.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {purchase.listing.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                          {purchase.amount} ℏ
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {(purchase.listing.rows || 0).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 dark:text-gray-400">
                          {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {purchase.status === 'completed' ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Completed</span>
                            </>
                          ) : purchase.status === 'pending' ? (
                            <>
                              <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                              <span className="text-sm font-medium text-yellow-600">Pending</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5 text-red-600" />
                              <span className="text-sm font-medium text-red-600">Failed</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium text-sm">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Purchases Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't purchased any datasets yet. Explore the marketplace to get started.
            </p>
            <Link
              href="/data-marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              <ShoppingCart className="w-5 h-5" />
              Browse Marketplace
            </Link>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 flex gap-4 flex-wrap">
          <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
            ← Back to Home
          </Link>
          <Link
            href="/data-marketplace"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Browse Marketplace →
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
