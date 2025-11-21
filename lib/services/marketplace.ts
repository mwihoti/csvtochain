/**
 * Marketplace Service
 * Handles data listing, purchasing, and payment verification on Hedera
 */

import { Client, AccountId, TransferTransaction, Hbar } from '@hashgraph/sdk';

export interface DataListing {
  id: string;
  name: string;
  description: string;
  price: number; // in HBAR
  rows: number;
  categories: string[];
  seller: string;
  timestamp: string;
  dataHash: string;
  fileUrl?: string;
  preview?: string[];
  rating?: number;
  purchases?: number;
}

export interface Purchase {
  id: string;
  buyerId: string;
  sellerId: string;
  dataId: string;
  amount: number; // in HBAR
  timestamp: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed';
}

class MarketplaceService {
  private listings: DataListing[] = [];
  private purchases: Purchase[] = [];

  constructor() {
    this.loadFromLocalStorage();
    this.syncTokenizedData();
  }

  /**
   * Sync tokenized CSVs from the treasury account to marketplace
   */
  private syncTokenizedData() {
    try {
      if (typeof window === 'undefined') return;
      
      // Get minted NFTs from localStorage (these are tokenized CSVs)
      const mintedNFTs = localStorage.getItem('minted-nfts');
      if (!mintedNFTs) return;

      const nfts = JSON.parse(mintedNFTs);
      const treasuryAccount = process.env.NEXT_PUBLIC_TREASURY_ACCOUNT || '0.0.6990992';

      // Convert minted NFTs to marketplace listings
      nfts.forEach((nft: any) => {
        // Check if already exists by token ID
        const existingListing = this.listings.find(
          (l) => l.id === `tokenized_${nft.tokenId}_${nft.serialNumber}`
        );

        if (!existingListing && nft.metadata) {
          // Extract name from fileName or use default
          const fileName = nft.metadata.fileName || `dataset_${Date.now()}`;
          const fileNameWithoutExt = fileName.replace(/\.csv$/i, '');
          
          // Create listing with available metadata
          const listing: DataListing = {
            id: `tokenized_${nft.tokenId}_${nft.serialNumber}`,
            name: fileNameWithoutExt,
            description: `Tokenized CSV dataset with ${nft.metadata.rowCount || nft.metadata.summary?.totalRows || 'unknown'} rows`,
            price: 2.5, // Default price, can be updated later
            rows: nft.metadata.rowCount || nft.metadata.summary?.totalRows || 0,
            categories: ['CSV', 'Tokenized Data'],
            seller: treasuryAccount,
            timestamp: nft.timestamp || new Date().toISOString(),
            dataHash: nft.metadata.hash || `${nft.tokenId}-${nft.serialNumber}`,
            rating: 5,
            purchases: 0,
          };

          console.log('Adding tokenized listing:', listing);
          this.listings.push(listing);
        }
      });

      this.saveToLocalStorage();
    } catch (error) {
      console.error('Error syncing tokenized data:', error);
    }
  }

  /**
   * Create a new data listing in the marketplace
   */
  createListing(
    name: string,
    description: string,
    price: number,
    rows: number,
    categories: string[],
    seller: string,
    dataHash: string,
    preview?: string[]
  ): DataListing {
    const listing: DataListing = {
      id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      price,
      rows,
      categories,
      seller,
      timestamp: new Date().toISOString(),
      dataHash,
      preview,
      rating: 5,
      purchases: 0,
    };

    this.listings.push(listing);
    this.saveToLocalStorage();
    return listing;
  }

  /**
   * Get all marketplace listings
   */
  getAllListings(): DataListing[] {
    // Re-sync tokenized data on each call to ensure fresh listings
    this.syncTokenizedData();
    return this.listings;
  }

  /**
   * Manually trigger sync of tokenized data
   */
  syncTokenizedDataManually(): void {
    this.syncTokenizedData();
  }

  /**
   * Get listings by category
   */
  getListingsByCategory(category: string): DataListing[] {
    return this.listings.filter((listing) =>
      listing.categories.includes(category)
    );
  }

  /**
   * Search listings
   */
  searchListings(query: string): DataListing[] {
    const q = query.toLowerCase();
    return this.listings.filter(
      (listing) =>
        listing.name.toLowerCase().includes(q) ||
        listing.description.toLowerCase().includes(q)
    );
  }

  /**
   * Get listing by ID
   */
  getListingById(id: string): DataListing | undefined {
    // Ensure listings are synced
    this.syncTokenizedData();
    return this.listings.find((listing) => listing.id === id);
  }

  /**
   * Record a purchase
   */
  recordPurchase(
    buyerId: string,
    sellerId: string,
    dataId: string,
    amount: number,
    transactionId?: string
  ): Purchase {
    const purchase: Purchase = {
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      buyerId,
      sellerId,
      dataId,
      amount,
      timestamp: new Date().toISOString(),
      transactionId,
      status: 'completed',
    };

    this.purchases.push(purchase);
    
    // Update listing purchase count
    const listing = this.getListingById(dataId);
    if (listing) {
      listing.purchases = (listing.purchases || 0) + 1;
    }

    this.saveToLocalStorage();
    return purchase;
  }

  /**
   * Get user's purchases
   */
  getUserPurchases(userId: string): Purchase[] {
    return this.purchases.filter((p) => p.buyerId === userId);
  }

  /**
   * Get user's sales
   */
  getUserSales(userId: string): Purchase[] {
    return this.purchases.filter((p) => p.sellerId === userId);
  }

  /**
   * Get purchase by ID
   */
  getPurchaseById(id: string): Purchase | undefined {
    return this.purchases.find((p) => p.id === id);
  }

  /**
   * Calculate marketplace stats
   */
  getMarketplaceStats() {
    const totalListings = this.listings.length;
    const totalPurchases = this.purchases.length;
    const totalVolume = this.purchases.reduce((sum, p) => sum + p.amount, 0);
    const averagePrice =
      this.listings.length > 0
        ? this.listings.reduce((sum, l) => sum + l.price, 0) /
          this.listings.length
        : 0;

    return {
      totalListings,
      totalPurchases,
      totalVolume,
      averagePrice: Math.round(averagePrice * 100) / 100,
    };
  }

  /**
   * Delete a listing
   */
  deleteListing(id: string): boolean {
    const index = this.listings.findIndex((l) => l.id === id);
    if (index > -1) {
      this.listings.splice(index, 1);
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  /**
   * Update listing
   */
  updateListing(
    id: string,
    updates: Partial<DataListing>
  ): DataListing | undefined {
    const listing = this.getListingById(id);
    if (listing) {
      Object.assign(listing, updates);
      this.saveToLocalStorage();
    }
    return listing;
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('marketplace_listings', JSON.stringify(this.listings));
      localStorage.setItem('marketplace_purchases', JSON.stringify(this.purchases));
    }
  }

  private loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const listings = localStorage.getItem('marketplace_listings');
      const purchases = localStorage.getItem('marketplace_purchases');

      if (listings) {
        this.listings = JSON.parse(listings);
      }
      if (purchases) {
        this.purchases = JSON.parse(purchases);
      }
    }
  }
}

// Export singleton instance
export const marketplaceService = new MarketplaceService();

// Sample data for demo
export const SAMPLE_LISTINGS: DataListing[] = [
  {
    id: 'sample_1',
    name: 'E-Commerce Sales Analytics',
    description: 'Comprehensive sales data with customer demographics and purchase patterns',
    price: 5.5,
    rows: 10000,
    categories: ['Sales', 'E-commerce', 'Analytics'],
    seller: '0.0.6990992',
    timestamp: new Date().toISOString(),
    dataHash: 'QmX9...',
    preview: ['Customer ID', 'Amount', 'Date', 'Category'],
    rating: 4.8,
    purchases: 42,
  },
  {
    id: 'sample_2',
    name: 'Weather Data Europe 2024',
    description: 'Daily weather measurements across major European cities',
    price: 2.75,
    rows: 5475,
    categories: ['Weather', 'Climate', 'Europe'],
    seller: '0.0.7654321',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    dataHash: 'QmY8...',
    preview: ['City', 'Temperature', 'Humidity', 'Pressure'],
    rating: 4.9,
    purchases: 28,
  },
  {
    id: 'sample_3',
    name: 'Real Estate Market Trends',
    description: 'Property listings with pricing and market indicators',
    price: 8.2,
    rows: 15000,
    categories: ['Real Estate', 'Market', 'Analytics'],
    seller: '0.0.1111111',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    dataHash: 'QmZ7...',
    preview: ['Address', 'Price', 'Bedrooms', 'Location'],
    rating: 4.7,
    purchases: 35,
  },
  {
    id: 'sample_4',
    name: 'Social Media Engagement Metrics',
    description: 'Platform engagement data and user interaction patterns',
    price: 4.0,
    rows: 8500,
    categories: ['Social Media', 'Marketing', 'Analytics'],
    seller: '0.0.2222222',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    dataHash: 'QmA6...',
    preview: ['Post ID', 'Likes', 'Comments', 'Shares'],
    rating: 4.6,
    purchases: 19,
  },
  {
    id: 'sample_5',
    name: 'Supply Chain Logistics Data',
    description: 'Shipment tracking and delivery performance metrics',
    price: 6.5,
    rows: 12000,
    categories: ['Logistics', 'Supply Chain', 'Operations'],
    seller: '0.0.3333333',
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    dataHash: 'QmB5...',
    preview: ['Shipment ID', 'Origin', 'Destination', 'Status'],
    rating: 4.9,
    purchases: 56,
  },
];
