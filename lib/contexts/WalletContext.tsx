'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, LedgerId, AccountId, PrivateKey } from '@hashgraph/sdk';
import toast from 'react-hot-toast';

// Type for HashConnect (avoids direct import during SSR)
type HashConnectType = any;

export type WalletType = 'hashpack' | 'metamask' | null;

interface SavedPairingData {
  accountIds: string[];
  network: string;
  topic: string;
  origin: string;
}

interface WalletContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  walletType: WalletType;
  accountId: string | null;
  balance: string | null;
  
  // Methods
  connectHashPack: () => Promise<void>;
  connectMetaMask: () => Promise<void>;
  disconnectWallet: () => void;
  
  // Client instances
  hashConnect: HashConnectType | null;
  topic: string | null;
  pairingData: SavedPairingData | null;
  
  // Treasury account
  treasuryAccountId: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// App metadata for HashPack
const appMetadata = {
  name: 'SheetToChain',
  description: 'Transform CSV Data into Verifiable Digital Assets on Hedera',
  icons: ['https://sheettochain.vercel.app/icon.png'],
  url: typeof window !== 'undefined' ? window.location.origin : 'https://sheettochain.vercel.app',
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [hashConnect, setHashConnect] = useState<HashConnectType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [pairingData, setPairingData] = useState<SavedPairingData | null>(null);
  const [treasuryAccountId, setTreasuryAccountId] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    initializeHashConnect();
    checkExistingConnections();
    setTreasuryAccountId(process.env.NEXT_PUBLIC_TREASURY_ACCOUNT || process.env.HEDERA_ACCOUNT_ID || null);
  }, []);

  const initializeHashConnect = async () => {
    try {
      // Dynamically import HashConnect to avoid SSR issues
      const { HashConnect } = await import('hashconnect');
      
      const hc = new HashConnect(
        LedgerId.TESTNET,
        'sheettochain',
        appMetadata,
        false  // Don't save pairing for now
      );

      // Initialize the instance
      try {
        await hc.init();
      } catch (initError) {
        console.warn('HashConnect init warning (non-fatal):', initError);
        // Continue anyway - some errors are non-fatal
      }

      setHashConnect(hc);

      // Set up event listeners with error handling
      hc.pairingEvent.on((data: any) => {
        console.log('HashPack pairing event received:', data);
        handleHashPackPairing(data);
      });

      hc.disconnectionEvent.on(() => {
        console.log('HashPack disconnection event');
        handleDisconnection();
      });

      console.log('HashConnect initialized successfully');
    } catch (error) {
      console.warn('Error initializing HashConnect (non-fatal):', error);
      // Don't show toast - HashPack optional, user can still use MetaMask
    }
  };

  const checkExistingConnections = () => {
    // Check for HashPack
    const savedHashPackPairing = localStorage.getItem('hashpack_pairing');
    if (savedHashPackPairing) {
      try {
        const pairing = JSON.parse(savedHashPackPairing);
        setPairingData(pairing);
        setAccountId(pairing.accountIds[0]);
        setWalletType('hashpack');
        setIsConnected(true);
        fetchBalance(pairing.accountIds[0]);
        return;
      } catch (e) {
        console.error('Error loading saved HashPack pairing:', e);
        localStorage.removeItem('hashpack_pairing');
      }
    }

    // Check for MetaMask
    const savedMetaMaskAccount = localStorage.getItem('metamask_account');
    if (savedMetaMaskAccount) {
      setAccountId(savedMetaMaskAccount);
      setWalletType('metamask');
      setIsConnected(true);
      fetchBalance(savedMetaMaskAccount);
    }
  };

  const handleHashPackPairing = async (data: any) => {
    try {
      if (data.accountIds && data.accountIds.length > 0) {
        const account = data.accountIds[0];
        setAccountId(account);
        setWalletType('hashpack');
        setIsConnected(true);
        setIsConnecting(false);
        setPairingData(data);

        // Save to localStorage
        localStorage.setItem('hashpack_pairing', JSON.stringify(data));
        localStorage.removeItem('metamask_account'); // Remove MetaMask if switching

        await fetchBalance(account);
        toast.success(`Connected: ${account}`);
      }
    } catch (error) {
      console.error('Error handling pairing:', error);
      setIsConnecting(false);
      toast.error('Failed to complete pairing');
    }
  };

  const connectHashPack = async () => {
    if (!hashConnect) {
      toast.error('Wallet system not ready. Please try again.');
      return;
    }

    setIsConnecting(true);
    try {
      // Generate pairing string / QR code for the user to scan with HashPack
      const pairingString = await (hashConnect as any).getOpenPairingString();
      
      if (!pairingString) {
        throw new Error('Failed to generate pairing string');
      }

      console.log('Opening HashPack pairing request with string:', pairingString);
      
      // Open the pairing request which will trigger the pairing event when wallet responds
      // This will display a QR code or modal that the user can scan/interact with
      await (hashConnect as any).openPairingRequest(pairingString);
      
      // The pairing event listener will handle the connection when it fires
      console.log('Pairing request sent to HashPack');
    } catch (error: any) {
      console.error('Error connecting to HashPack:', error);
      setIsConnecting(false);
      
      // Try alternative method if openPairingRequest doesn't work
      try {
        console.log('Trying alternative HashConnect method...');
        await (hashConnect as any).requestAccess();
      } catch (altError: any) {
        toast.error(`Failed to connect HashPack: ${altError.message || 'Please ensure HashPack mobile app is installed and scan the QR code'}`);
      }
    }
  };

  const connectMetaMask = async () => {
    setIsConnecting(true);
    try {
      // Check if MetaMask is installed
      if (typeof window === 'undefined' || !window.ethereum) {
        toast.error('MetaMask not installed. Please install MetaMask extension.');
        if (typeof window !== 'undefined') {
          window.open('https://metamask.io/download/', '_blank');
        }
        return;
      }

      // Request account access
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[] | undefined;

      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        // For Hedera, use the treasury account
        const hederaAccount = process.env.NEXT_PUBLIC_TREASURY_ACCOUNT || process.env.HEDERA_ACCOUNT_ID;
        
        if (!hederaAccount) {
          toast.error('Treasury account not configured');
          return;
        }

        setAccountId(hederaAccount);
        setWalletType('metamask');
        setIsConnected(true);

        // Save to localStorage
        localStorage.setItem('metamask_account', hederaAccount);
        localStorage.removeItem('hashpack_pairing'); // Remove HashPack if switching

        await fetchBalance(hederaAccount);
        toast.success(`Connected via MetaMask: ${hederaAccount}`);
      }
    } catch (error: any) {
      console.error('Error connecting MetaMask:', error);
      
      // User rejected connection
      if (error.code === 4001) {
        toast.error('MetaMask connection rejected');
      } else {
        toast.error(`MetaMask connection failed: ${error.message}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnection = () => {
    setIsConnected(false);
    setWalletType(null);
    setAccountId(null);
    setBalance(null);
    setPairingData(null);
    localStorage.removeItem('hashpack_pairing');
    localStorage.removeItem('metamask_account');
    toast.success('Wallet disconnected');
  };

  const disconnectWallet = () => {
    if (walletType === 'hashpack' && hashConnect) {
      // Disconnect from HashPack
      try {
        (hashConnect as any).disconnect?.();
      } catch (error) {
        console.error('Error disconnecting HashPack:', error);
      }
    }
    handleDisconnection();
  };

  const fetchBalance = async (account: string) => {
    try {
      const response = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/accounts/${account}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const balanceInTinybars = data.balance?.balance || 0;
        const balanceInHBAR = (balanceInTinybars / 100000000).toFixed(4);
        setBalance(balanceInHBAR);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        walletType,
        accountId,
        balance,
        connectHashPack,
        connectMetaMask,
        disconnectWallet,
        hashConnect,
        topic,
        pairingData,
        treasuryAccountId,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

// Keep backward compatibility with useHashPack
export function useHashPack() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useHashPack must be used within WalletProvider');
  }
  return {
    isConnected: context.isConnected,
    isConnecting: context.isConnecting,
    accountId: context.accountId,
    balance: context.balance,
    connectWallet: context.connectHashPack,
    disconnectWallet: context.disconnectWallet,
    hashConnect: context.hashConnect,
    topic: context.topic,
    pairingData: context.pairingData,
  };
}
