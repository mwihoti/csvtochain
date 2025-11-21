'use client';

import { useHashPack } from '@/lib/contexts/HashPackContext';
import { Wallet, LogOut, Loader2 } from 'lucide-react';

export default function HashPackWalletButton() {
  const {
    isConnected,
    isConnecting,
    accountId,
    balance,
    connectWallet,
    disconnectWallet,
  } = useHashPack();

  if (isConnected && accountId) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg">
        <Wallet className="w-5 h-5" />
        <div className="flex flex-col text-sm">
          <span className="font-semibold">
            {accountId.substring(0, 7)}...{accountId.substring(accountId.length - 4)}
          </span>
          {balance && (
            <span className="text-xs opacity-90">{balance} HBAR</span>
          )}
        </div>
        <button
          onClick={disconnectWallet}
          className="ml-2 p-1 hover:bg-white/20 rounded transition"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
    >
      {isConnecting ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="w-5 h-5" />
          <span>Connect HashPack</span>
        </>
      )}
    </button>
  );
}
