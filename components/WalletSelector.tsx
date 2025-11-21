'use client';

import { useWallet } from '@/lib/contexts/WalletContext';
import { Wallet, LogOut, Loader2, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function WalletSelector() {
  const {
    isConnected,
    isConnecting,
    accountId,
    balance,
    walletType,
    connectHashPack,
    connectMetaMask,
    disconnectWallet,
  } = useWallet();

  const [showDropdown, setShowDropdown] = useState(false);

  if (isConnected && accountId) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200"
        >
          <Wallet className="w-5 h-5" />
          <div className="flex flex-col text-sm items-start">
            <span className="font-semibold">
              {accountId.substring(0, 7)}...{accountId.substring(accountId.length - 4)}
            </span>
            <span className="text-xs opacity-90">
              {walletType === 'hashpack' ? 'HashPack' : 'MetaMask'} • {balance} HBAR
            </span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Connected Account</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white mt-1">{accountId}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-semibold">{balance} HBAR</p>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-2">Wallet Type</p>
              <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                {walletType === 'hashpack' ? '🔐 HashPack' : '🦊 MetaMask'}
              </div>
            </div>

            <button
              onClick={() => {
                disconnectWallet();
                setShowDropdown(false);
              }}
              className="w-full p-4 flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-semibold">Disconnect Wallet</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isConnecting}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            <span>Connect Wallet</span>
            <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>

      {showDropdown && !isConnecting && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => {
              connectHashPack();
              setShowDropdown(false);
            }}
            className="w-full p-4 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-200 dark:border-gray-700 text-left"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold">
              🔐
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">HashPack</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Secure Hedera Wallet</p>
            </div>
          </button>

          <button
            onClick={() => {
              connectMetaMask();
              setShowDropdown(false);
            }}
            className="w-full p-4 flex items-center gap-3 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center text-white font-bold">
              🦊
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">MetaMask</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Popular Web3 Wallet</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
