'use client';

import React, { useState } from 'react';
import { ShoppingCart, Loader2, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { DataListing } from '@/lib/services/marketplace';
import { useWallet } from '@/lib/contexts/WalletContext';

interface PurchaseModalProps {
  listing: DataListing;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (purchaseId: string) => void;
}

export default function PurchaseModal({
  listing,
  isOpen,
  onClose,
  onPurchaseSuccess,
}: PurchaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { accountId, isConnected } = useWallet();

  const handlePurchase = async () => {
    if (!isConnected || !accountId) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!agreed) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/purchase-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id,
          buyerId: accountId,
          sellerId: listing.seller,
          amount: listing.price,
          dataName: listing.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      toast.success(`Successfully purchased "${listing.name}" for ${listing.price} HBAR!`);
      onPurchaseSuccess(data.purchaseId);
      onClose();
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to complete purchase');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Purchase Data</h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Not Connected Warning */}
          {!isConnected && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Wallet not connected
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please connect your wallet to proceed with the purchase
                </p>
              </div>
            </div>
          )}

          {/* Listing Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{listing.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {listing.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Data Points</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {listing.rows.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                <p className="text-lg font-semibold text-yellow-500">
                  {listing.rating?.toFixed(1)} ⭐
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Purchases</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {listing.purchases || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Categories</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {listing.categories.length}
                </p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories:</p>
            <div className="flex flex-wrap gap-2">
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

          {/* Price */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Price</p>
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {listing.price} ℏ
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              HBAR (Hedera)
            </p>
          </div>

          {/* Terms & Conditions */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={loading || !isConnected}
              className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 cursor-pointer disabled:opacity-50"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  terms and conditions
                </a>{' '}
                and understand that this data purchase is final
              </p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex gap-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={loading || !isConnected || !agreed}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Buy for {listing.price} ℏ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
