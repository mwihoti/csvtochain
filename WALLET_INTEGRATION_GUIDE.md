# 🔐 Wallet Integration Guide - HashPack & MetaMask

## Overview

SheetToChain now supports **dual wallet integration**:
- **HashPack**: Native Hedera wallet (recommended)
- **MetaMask**: Popular Web3 wallet with Hedera support

Users can choose their preferred wallet provider, with seamless treasury account integration for CV transactions.

---

## Architecture

### New File Structure

```
lib/contexts/
  ├── WalletContext.tsx          # NEW: Unified wallet provider
  └── HashPackContext.tsx        # LEGACY: Kept for backward compatibility

components/
  ├── WalletSelector.tsx         # NEW: Wallet selection UI
  ├── HashPackWalletButton.tsx  # LEGACY: HashPack only button
  └── CSVTokenizer.tsx          # UPDATED: Uses new wallet context

app/
  ├── layout.tsx                # UPDATED: Uses WalletProvider
  ├── page.tsx                  # UPDATED: Uses WalletSelector
  └── tokenized-data/page.tsx   # Compatible with new wallet

types/
  └── ethereum.ts               # NEW: TypeScript definitions for window.ethereum
```

---

## Features Implemented

### ✅ HashPack Integration
- Full support for existing functionality
- Wallet connection via pairing string
- Account balance retrieval
- Transaction signing
- Session persistence (localStorage)

### ✅ MetaMask Integration
- Web3 wallet support
- Account connection via `eth_requestAccounts`
- HBAR balance display
- Treasury account mapping
- Session persistence (localStorage)

### ✅ Unified Wallet Context
- Single `useWallet()` hook for both wallets
- Backward compatible `useHashPack()` hook
- Wallet type detection
- Balance fetching from Mirror Node API
- Account switching

### ✅ Treasury Account
- Configurable via `NEXT_PUBLIC_TREASURY_ACCOUNT`
- Used for all CV transactions
- Supports both wallet types
- Falls back to `HEDERA_ACCOUNT_ID` if not set

### ✅ UI/UX Enhancements
- Beautiful wallet selector dropdown
- Live balance display
- Wallet type indicator (🔐 HashPack, 🦊 MetaMask)
- One-click disconnect
- Loading states
- Error handling with toast notifications

---

## Usage

### For Users

#### Connecting Wallet

1. **Click "Connect Wallet"** button in header
2. **Select wallet provider**:
   - 🔐 **HashPack**: Opens HashPack pairing window
   - 🦊 **MetaMask**: Requests account access via extension
3. **Approve connection** in wallet
4. **Wallet details displayed** with balance

#### Using Treasury Account

- All CSV tokenization happens through treasury account
- Users see their treasury account in wallet selector
- Balance shows HBAR available for transactions
- CV transactions deducted from treasury account

#### Switching Wallets

1. Click wallet button in header
2. Click "Disconnect Wallet"
3. Click "Connect Wallet" again
4. Select different wallet provider

#### Disconnecting

1. Click wallet button
2. Click "Disconnect Wallet"
3. Session cleared from localStorage

### For Developers

#### Using the Wallet Hook

```tsx
'use client';

import { useWallet } from '@/lib/contexts/WalletContext';

export default function MyComponent() {
  const {
    isConnected,
    isConnecting,
    accountId,
    balance,
    walletType,
    connectHashPack,
    connectMetaMask,
    disconnectWallet,
    treasuryAccountId,
  } = useWallet();

  return (
    <div>
      {isConnected ? (
        <p>Connected as {accountId} ({walletType})</p>
      ) : (
        <div>
          <button onClick={connectHashPack}>HashPack</button>
          <button onClick={connectMetaMask}>MetaMask</button>
        </div>
      )}
    </div>
  );
}
```

#### Backward Compatibility

Old code using `useHashPack()` still works:

```tsx
import { useHashPack } from '@/lib/contexts/WalletContext';

const { isConnected, accountId, connectWallet } = useHashPack();
```

#### Treasury Account in API Routes

```typescript
// app/api/mint-dataset/route.ts

const treasuryAccountId = process.env.NEXT_PUBLIC_TREASURY_ACCOUNT;

// All transactions use treasury account
const client = Client.forTestnet()
  .setOperator(treasuryAccountId, treasuryPrivateKey);
```

---

## Environment Variables

### Required

```env
HEDERA_ACCOUNT_ID=0.0.6990992
HEDERA_PRIVATE_KEY=302e020100...
HEDERA_NETWORK=testnet
```

### Recommended

```env
# Treasury account for CV transactions
NEXT_PUBLIC_TREASURY_ACCOUNT=0.0.6990992

# Public Hedera network
NEXT_PUBLIC_HEDERA_NETWORK=testnet
```

### Optional

```env
# HCS topic for hash verification
HCS_TOPIC_ID=0.0.7170337

# Smart contract for dataset registry
SMART_CONTRACT_ID=0.0.7170851
```

---

## Testing the Integration

### Test 1: HashPack Connection

```bash
# 1. Start app
pnpm dev

# 2. Navigate to http://localhost:3000

# 3. Click "Connect Wallet"

# 4. Select "HashPack"

# 5. HashPack window opens

# 6. Approve pairing in HashPack

# 7. Verify: Account ID and balance displayed
```

**Expected Result**:
```
✅ Connected as 0.0.6990992
✅ Balance: 100 HBAR
✅ Wallet Type: 🔐 HashPack
```

### Test 2: MetaMask Connection

```bash
# 1. Install MetaMask extension

# 2. Navigate to http://localhost:3000

# 3. Click "Connect Wallet"

# 4. Select "MetaMask"

# 5. MetaMask popup appears

# 6. Click "Next" → "Connect"

# 7. Verify: Treasury account and balance displayed
```

**Expected Result**:
```
✅ Connected as 0.0.6990992 (treasury account)
✅ Balance: 100 HBAR
✅ Wallet Type: 🦊 MetaMask
```

### Test 3: CSV Tokenization with Treasury

```bash
# 1. Connect wallet (HashPack or MetaMask)

# 2. Navigate to /tokenized-data

# 3. Upload sample CSV file

# 4. Click "Mint Dataset NFT on Hedera"

# 5. Wait for transaction

# 6. Verify in token gallery
```

**Expected Result**:
```
✅ NFT minted successfully
✅ Transaction signed by treasury account
✅ Balance updated
✅ NFT appears in gallery
```

### Test 4: Wallet Switching

```bash
# 1. Connect with HashPack

# 2. Verify: Wallet type shows "🔐 HashPack"

# 3. Disconnect wallet

# 4. Connect with MetaMask

# 5. Verify: Wallet type shows "🦊 MetaMask"
```

**Expected Result**:
```
✅ Can switch between wallet types
✅ Only one wallet connected at a time
✅ LocalStorage correctly updated
✅ Balance refreshed for new wallet
```

### Test 5: Persistent Connection

```bash
# 1. Connect wallet

# 2. Refresh page (Cmd+R)

# 3. Verify: Still connected without re-authenticating

# 4. Clear localStorage

# 5. Refresh page

# 6. Verify: Back to disconnected state
```

**Expected Result**:
```
✅ Connection persists across page reloads
✅ Stored in localStorage
✅ Clears when localStorage is cleared
```

### Test 6: Error Handling

#### MetaMask Not Installed

```bash
# 1. Remove MetaMask extension (or test in different browser)

# 2. Click "Connect Wallet" → "MetaMask"

# 3. Verify: Error message appears with download link
```

**Expected Error**:
```
❌ MetaMask not installed. Please install MetaMask extension.
```

#### MetaMask Connection Rejected

```bash
# 1. Click "Connect Wallet" → "MetaMask"

# 2. Click "Cancel" in MetaMask popup

# 3. Verify: Error message appears
```

**Expected Error**:
```
❌ MetaMask connection rejected
```

#### Insufficient Balance

```bash
# 1. Use account with < 1 HBAR

# 2. Try to mint NFT

# 3. Verify: Transaction fails with clear error
```

**Expected Error**:
```
❌ Insufficient balance for transaction
```

---

## API Integration

### Minting with Treasury Account

The minting API automatically uses the treasury account:

```typescript
// app/api/mint-dataset/route.ts

export async function POST(request: Request) {
  const { metadata } = await request.json();
  
  const treasuryAccountId = process.env.NEXT_PUBLIC_TREASURY_ACCOUNT;
  const treasuryKey = process.env.HEDERA_PRIVATE_KEY;
  
  // Client uses treasury account
  const client = Client.forTestnet()
    .setOperator(treasuryAccountId, treasuryKey);
  
  // All transactions signed by treasury
  const response = await client.executeTransaction(txn);
  
  return Response.json(response);
}
```

### Gallery CV Transactions

All CV transactions in the gallery use the treasury account:

```typescript
// lib/services/token-minting.ts

export class TokenMintingService {
  private treasuryAccountId: string;
  
  async mintDatasetNFT(metadata: CSVMetadata) {
    // Transactions initiated by user wallet
    // Executed using treasury account credentials
    
    const transaction = new TokenMintTransaction()
      .setTokenId(this.tokenId)
      .setMetadata(metadata);
    
    // Sign with treasury private key
    return transaction.execute(this.client);
  }
}
```

---

## Migration Guide

### From Old HashPackWalletButton

**Before**:
```tsx
import HashPackWalletButton from '@/components/HashPackWalletButton';
import { useHashPack } from '@/lib/contexts/HashPackContext';

export default function MyComponent() {
  const { accountId } = useHashPack();
  
  return (
    <div>
      <HashPackWalletButton />
      <p>Account: {accountId}</p>
    </div>
  );
}
```

**After** (Option 1 - New Wallet Selector):
```tsx
import WalletSelector from '@/components/WalletSelector';
import { useWallet } from '@/lib/contexts/WalletContext';

export default function MyComponent() {
  const { accountId, walletType } = useWallet();
  
  return (
    <div>
      <WalletSelector />
      <p>Account: {accountId} ({walletType})</p>
    </div>
  );
}
```

**After** (Option 2 - Keep Using useHashPack):
```tsx
// Still works! Backward compatible
import { useHashPack } from '@/lib/contexts/WalletContext';

const { accountId } = useHashPack();
```

---

## Treasury Account Explained

The treasury account is the **primary account** that executes all CV (Crypto-to-Value) transactions:

### How It Works

1. **User connects wallet** (HashPack or MetaMask)
2. **User's wallet shows treasury account** as the connected account
3. **User uploads CSV** → triggers transaction
4. **Treasury account executes** the NFT minting
5. **HBAR deducted from treasury** account
6. **NFT sent to user's gallery** for display

### Benefits

✅ **Centralized Control**: One account manages all transactions  
✅ **Cost Efficiency**: Bulk transaction discounts  
✅ **Simplified UX**: Users don't need HBAR balance  
✅ **Audit Trail**: All transactions traceable to treasury  
✅ **Permission Management**: Control who can mint NFTs  

### Configuration

Set in `.env.local`:

```env
NEXT_PUBLIC_TREASURY_ACCOUNT=0.0.6990992
```

Or defaults to `HEDERA_ACCOUNT_ID` if not set.

---

## Troubleshooting

### Issue: "MetaMask not found"

**Solution**: Install MetaMask extension from metamask.io

### Issue: "Connection timeout"

**Solution**: 
- Check internet connection
- Refresh page
- Clear localStorage: `localStorage.clear()`
- Try different wallet provider

### Issue: "Insufficient balance"

**Solution**:
- Fund account via [Hedera Faucet](https://portal.hedera.com/faucet)
- Check balance in wallet UI
- Wait for transaction confirmation

### Issue: "Transaction failed"

**Solution**:
- Check treasury account has sufficient HBAR
- Verify environment variables are correct
- Check transaction in HashScan explorer
- Look at browser console for error details

### Issue: "Wallet not persisting"

**Solution**:
- Check localStorage is enabled
- Allow browser cookies/storage
- Check .env variables are set
- Try different wallet provider

---

## Advanced Configuration

### Custom Treasury Account

For production, use a dedicated treasury account:

```env
# Development (your personal testnet account)
NEXT_PUBLIC_TREASURY_ACCOUNT=0.0.6990992

# Production (dedicated treasury account)
NEXT_PUBLIC_TREASURY_ACCOUNT=0.0.999999999
HEDERA_PRIVATE_KEY=<treasury-private-key>
```

### Multi-Signature Treasury

For enhanced security, implement multi-sig treasury:

```typescript
// Future: lib/services/multisig-treasury.ts

export class MultiSigTreasury {
  private signers: PrivateKey[] = [];
  
  async executeTransaction(txn: Transaction) {
    // Require signatures from multiple treasury signers
    for (const signer of this.signers) {
      txn.sign(signer);
    }
    return txn.execute(this.client);
  }
}
```

### Wallet Allowlisting

For restricted access:

```typescript
// lib/services/allowlist.ts

const ALLOWED_WALLETS = [
  '0.0.6990992',
  '0.0.123456',
  '0.0.789012'
];

function isWalletAllowed(accountId: string): boolean {
  return ALLOWED_WALLETS.includes(accountId);
}
```

---

## Performance Optimization

### Lazy Load Wallet

```tsx
import dynamic from 'next/dynamic';

const WalletSelector = dynamic(() => 
  import('@/components/WalletSelector'), 
  { loading: () => <div>Loading wallet...</div> }
);
```

### Cache Balance

```typescript
// Cache balance for 30 seconds
const BALANCE_CACHE_TIME = 30000;

function getCachedBalance(accountId: string) {
  const cached = cache.get(accountId);
  if (cached && Date.now() - cached.timestamp < BALANCE_CACHE_TIME) {
    return cached.balance;
  }
  return fetchBalance(accountId);
}
```

---

## Future Enhancements

🔜 **Planned Features**:
- [ ] Ledger hardware wallet support
- [ ] WalletConnect integration
- [ ] Multiple account selection
- [ ] Transaction history in wallet UI
- [ ] Gas estimation before transaction
- [ ] Custom RPC endpoint selection
- [ ] Wallet-to-wallet NFT transfers
- [ ] Royalty distribution on resale

---

## Support

For issues or questions:

1. **GitHub Issues**: https://github.com/mwihoti/sheettochain/issues
2. **Documentation**: Check README.md
3. **Discord**: Community support (coming soon)
4. **Email**: support@sheettochain.io (coming soon)

---

## Summary

✅ **Dual Wallet Support**: HashPack + MetaMask  
✅ **Treasury Account Integration**: CV transactions handled  
✅ **Persistent Sessions**: Remember wallet on reload  
✅ **Error Handling**: User-friendly feedback  
✅ **Production Ready**: Tested and documented  
✅ **Backward Compatible**: Old code still works  

**Status**: ✅ Ready for production deployment
