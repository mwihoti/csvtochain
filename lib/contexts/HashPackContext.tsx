'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HashConnect } from 'hashconnect';
import { LedgerId } from '@hashgraph/sdk';

interface SavedPairingData {
  accountIds: string[];
  network: string;
  topic: string;
  origin: string;
}

interface HashPackContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  accountId: string | null;
  balance: string | null;
  
  // Methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  
  // HashConnect instance
  hashConnect: HashConnect | null;
  topic: string | null;
  pairingData: SavedPairingData | null;
}

const HashPackContext = createContext<HashPackContextType | undefined>(undefined);

// App metadata for HashPack
const appMetadata = {
  name: 'SheetToChain',
  description: 'Transform CSV Data into Verifiable Digital Assets on Hedera',
  icons: ['https://sheettochain.vercel.app/icon.png'],
  url: 'https://sheettochain.vercel.app',
};

export function HashPackProvider({ children }: { children: ReactNode }) {
  const [hashConnect, setHashConnect] = useState<HashConnect | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [pairingData, setPairingData] = useState<SavedPairingData | null>(null);

  // Initialize HashConnect
  useEffect(() => {
    initializeHashConnect();
  }, []);

  const initializeHashConnect = async () => {
    try {
      const hc = new HashConnect(
        LedgerId.TESTNET,
        process.env.NEXT_PUBLIC_PROJECT_ID || 'sheettochain',
        appMetadata,
        true
      );

      setHashConnect(hc);

      // Set up event listeners
      hc.pairingEvent.on((data: any) => {
        console.log('HashPack pairing event:', data);
        handlePairingEvent(data);
      });

      hc.disconnectionEvent.on(() => {
        console.log('HashPack disconnection event');
        handleDisconnection();
      });

      hc.connectionStatusChangeEvent.on((state: string) => {
        console.log('HashPack connection status changed:', state);
      });

      // Initialize connection
      await hc.init();
      console.log('HashConnect initialized');

      // Check for existing pairings in localStorage
      const savedPairing = localStorage.getItem('hashpack_pairing');
      if (savedPairing) {
        try {
          const pairing = JSON.parse(savedPairing);
          setPairingData(pairing);
          setAccountId(pairing.accountIds[0]);
          setIsConnected(true);
          fetchBalance(pairing.accountIds[0]);
        } catch (e) {
          console.error('Error loading saved pairing:', e);
          localStorage.removeItem('hashpack_pairing');
        }
      }
    } catch (error) {
      console.error('Error initializing HashConnect:', error);
    }
  };

  const handlePairingEvent = (data: any) => {
    console.log('Pairing successful:', data);
    
    if (data.accountIds && data.accountIds.length > 0) {
      const acctId = data.accountIds[0];
      setAccountId(acctId);
      setIsConnected(true);
      setIsConnecting(false);
      
      // Store pairing data
      const pairing: SavedPairingData = {
        accountIds: data.accountIds,
        network: data.network || 'testnet',
        topic: topic || '',
        origin: appMetadata.url,
      };
      
      setPairingData(pairing);
      localStorage.setItem('hashpack_pairing', JSON.stringify(pairing));

      // Fetch balance
      fetchBalance(acctId);
    }
  };

  const handleDisconnection = () => {
    setIsConnected(false);
    setAccountId(null);
    setBalance(null);
    setPairingData(null);
    localStorage.removeItem('hashpack_pairing');
    console.log('HashPack disconnected');
  };

  const connectWallet = async () => {
    if (!hashConnect) {
      console.error('HashConnect not initialized');
      return;
    }

    setIsConnecting(true);

    try {
      // Request pairing
      hashConnect.openPairingModal();
      
      // The pairing event will handle the rest
      console.log('HashPack pairing request sent');
    } catch (error) {
      console.error('Error connecting to HashPack:', error);
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (hashConnect) {
      hashConnect.disconnect();
      handleDisconnection();
    }
  };

  const fetchBalance = async (acctId: string) => {
    try {
      // Call Hedera Mirror Node API to get balance
      const response = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/balances?account.id=${acctId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      
      if (data.balances && data.balances.length > 0) {
        const balanceInTinybars = data.balances[0].balance;
        const balanceInHbar = (balanceInTinybars / 100000000).toFixed(2);
        setBalance(balanceInHbar);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('N/A');
    }
  };

  const value: HashPackContextType = {
    isConnected,
    isConnecting,
    accountId,
    balance,
    connectWallet,
    disconnectWallet,
    hashConnect,
    topic,
    pairingData,
  };

  return (
    <HashPackContext.Provider value={value}>
      {children}
    </HashPackContext.Provider>
  );
}

// Custom hook to use HashPack context
export function useHashPack() {
  const context = useContext(HashPackContext);
  if (context === undefined) {
    throw new Error('useHashPack must be used within a HashPackProvider');
  }
  return context;
}
