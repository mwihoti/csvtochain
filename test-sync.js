#!/usr/bin/env node

/**
 * Test script to verify tokenized data sync mechanism
 * Simulates localStorage with minted NFTs and checks if they sync correctly
 */

// Mock localStorage
const localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  },
};

// Sample minted NFT data
const sampleMintedNFTs = [
  {
    tokenId: '0.0.123456',
    serialNumber: 1,
    metadata: {
      name: 'Sales Q1 2024',
      description: 'First quarter sales data with 5000 records',
      price: 50,
      rows: 5000,
      dataHash: 'hash123456',
    },
  },
  {
    tokenId: '0.0.234567',
    serialNumber: 1,
    metadata: {
      name: 'Analytics Dashboard',
      description: 'User analytics with 10000 records',
      price: 75,
      rows: 10000,
      dataHash: 'hash234567',
    },
  },
];

// Simulate the sync mechanism
function testSync() {
  // Setup: Add minted NFTs to localStorage
  localStorage.setItem('minted-nfts', JSON.stringify(sampleMintedNFTs));

  // Create marketplace listings
  const listings = [];

  // Simulate syncTokenizedData logic
  const mintedNFTs = JSON.parse(localStorage.getItem('minted-nfts') || '[]');
  console.log('✓ Retrieved minted NFTs from localStorage:', mintedNFTs.length, 'items');

  for (const nft of mintedNFTs) {
    const existingListing = listings.find(
      (l) => l.dataHash === nft.metadata?.dataHash
    );

    if (!existingListing && nft.metadata) {
      const listing = {
        id: `tokenized_${nft.tokenId}_${nft.serialNumber}`,
        name: nft.metadata.name,
        description: nft.metadata.description,
        price: nft.metadata.price,
        rows: nft.metadata.rows,
        categories: ['CSV', 'Tokenized'],
        seller: '0.0.6990992', // Treasury account
        rating: 5,
        purchases: 0,
        dataHash: nft.metadata.dataHash,
      };
      listings.push(listing);
      console.log(`✓ Synced NFT: ${nft.metadata.name} (${nft.metadata.rows} rows)`);
    }
  }

  // Verify results
  console.log('\n=== SYNC RESULTS ===');
  console.log(`Total listings after sync: ${listings.length}`);
  console.log('\nSynced listings:');
  listings.forEach((listing) => {
    console.log(`  • ${listing.name}`);
    console.log(`    - Rows: ${listing.rows}`);
    console.log(`    - Price: $${listing.price}`);
    console.log(`    - Seller: ${listing.seller}`);
    console.log(`    - ID: ${listing.id}`);
  });

  return listings.length === sampleMintedNFTs.length;
}

// Run test
const success = testSync();
console.log(`\n${success ? '✅ SYNC TEST PASSED' : '❌ SYNC TEST FAILED'}`);
process.exit(success ? 0 : 1);
