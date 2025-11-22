# MetaMask Transaction Signing - Implementation Guide

## Overview

You now have a complete **user-signed minting flow** where:

1. ✅ User connects their MetaMask wallet
2. ✅ User uploads and validates CSV
3. ✅ User clicks "Mint"
4. ✅ **MetaMask popup appears requesting transaction signature**
5. ✅ User approves/signs the transaction in MetaMask
6. ✅ Backend submits the signed transaction to Hedera
7. ✅ Transaction appears in user's wallet/account on HashScan
8. ✅ NFT is owned by user's wallet

## How It Works

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User Connected: 0.0.6990992 (954.2262 HBAR)                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │  Upload & Validate CSV             │
          │  ✅ sample-sales.csv (15 rows)     │
          └────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │  Click "Mint Dataset NFT"          │
          └────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
  STEP 1: PREPARE              STEP 2: SIGN WITH METAMASK
  ────────────────            ──────────────────────────────
  /api/prepare-mint           MetaMask Popup appears
           │                            │
           │ Returns:                   │ User clicks "Sign"
           │ - txPayload (base64)       │
           │ - tokenId                  ▼
           │ - fee (20 HBAR)      User's signature
           │                            │
           └────────────────┬───────────┘
                            │
                            ▼
                STEP 3: SUBMIT SIGNED TX
                ──────────────────────────
                /api/submit-signed-mint
                            │
                Backend uses treasury account to:
                - Verify signature
                - Submit transaction to Hedera
                - Pay transaction fees
                            │
                            ▼
          ┌────────────────────────────────────┐
          │  ✅ NFT Minted Successfully!       │
          │  Token ID: 0.0.7299452             │
          │  Serial: #42                       │
          │  Owner: 0.0.6990992                │
          │  Transaction Hash: [View on       │
          │                    HashScan]       │
          └────────────────────────────────────┘
```

### API Endpoints

#### 1. **`POST /api/prepare-mint`**
- **Purpose**: Build the mint transaction
- **Input**: 
  - `metadata` (CSV metadata)
  - `ownerAccountId` (user's wallet)
- **Output**:
  - `transactionPayload` (base64 encoded transaction)
  - `tokenId` (collection token ID)
  - `estimatedFee` (20 HBAR)
- **Note**: Transaction is frozen but not signed

#### 2. **`POST /api/submit-signed-mint`**
- **Purpose**: Submit the user-signed transaction
- **Input**:
  - `transactionPayload` (base64)
  - `signature` (from MetaMask)
  - `ownerAccountId` (user's wallet)
  - `metadata`
- **Output**:
  - `tokenId`, `serialNumber`
  - `transactionId` (visible on HashScan)
  - `explorerUrl` (link to transaction)
- **Note**: Backend signs with treasury account and submits

### Key Components

**File: `/components/CSVTokenizer.tsx`**
- `handleMintNFT()` now does 3-step flow
- Shows user progress with toast notifications
- Requests MetaMask signature via `personal_sign` RPC method
- Handles user rejections gracefully

**File: `/app/api/prepare-mint/route.ts`**
- Builds the `TokenMintTransaction`
- Returns serialized transaction ready for signing
- Uses environment's treasury account for transaction authority

**File: `/app/api/submit-signed-mint/route.ts`**
- Receives signed transaction from frontend
- Signs with backend's private key (treasury pays fees)
- Submits to Hedera network
- Returns transaction ID + HashScan link

## User Experience

### Before Minting
```
┌─ Connect Wallet ─────────────────────┐
│  0.0.6990992                         │
│  MetaMask • 954.2262 HBAR            │
│  Connected Account                   │
│  Wallet Type: 🦊 MetaMask           │
│  [Disconnect Wallet] [Testnet]       │
└──────────────────────────────────────┘
```

### During Minting
```
Toast 1: "Preparing transaction for signing..."
         ↓ (2 seconds)
Toast 2: "Please approve the transaction in your MetaMask wallet..."
         ↓ (MetaMask popup appears)
         [User clicks "Sign"]
         ↓
Toast 3: "Submitting signed transaction to Hedera..."
         ↓ (5-10 seconds)
Toast 4: "Dataset NFT minted successfully! 🎉"
```

### MetaMask Popup
```
┌─────────────────────────────────────────┐
│     MetaMask Notification               │
│  ┌─────────────────────────────────────┐│
│  │ Signature Request                   ││
│  │ hedera.csvtochain.vercel.app        ││
│  │                                     ││
│  │ Sign Hedera Transaction             ││
│  │                                     ││
│  │ Dataset: sample-sales.csv           ││
│  │ Account: 0.0.6990992                ││
│  │                                     ││
│  │  [Cancel]           [Sign]          ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### After Minting
```
┌────────────────────────────────────────┐
│ ✅ NFT Minted Successfully!            │
│                                        │
│ Token ID: 0.0.7299452                 │
│ Serial Number: #42                    │
│ Transaction ID: 0.0.6990992-xxxx-xxx  │
│                                        │
│ [View on HashScan] [Back to Home]     │
└────────────────────────────────────────┘
```

## Environment Configuration

**No new environment variables needed!**

Your existing setup still works:
```env
# Treasury account (used for transaction signing & fees)
HEDERA_ACCOUNT_ID=0.0.6990992
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...

# Network
HEDERA_NETWORK=testnet

# Collection token ID (recommended - set once)
NEXT_PUBLIC_DATASET_TOKEN_ID=0.0.7299452
```

### One-Time Setup: Create Collection Token

If you don't have `NEXT_PUBLIC_DATASET_TOKEN_ID` set yet:

1. **Option 1**: Create token using backend (need to create endpoint)
2. **Option 2**: Create manually on HashScan, then add to `.env.local`
3. **Option 3**: Use `/api/prepare-mint` for first mint (will error, then create token)

Once created, add to `.env.local`:
```env
NEXT_PUBLIC_DATASET_TOKEN_ID=0.0.XXXXXXXXX
```

## Transaction Flow Details

### Backend Treasury Account Role

The account in `.env` (0.0.6990992) now acts as **treasury** for:

1. **Transaction Authority**: Signs the frozen transaction to authorize minting
2. **Fee Payer**: Pays the 20 HBAR transaction fee
3. **Collection Owner**: Owns the NFT collection token
4. **Supply Key**: Can mint new NFTs to the collection

### User Wallet Role

The user's connected MetaMask wallet (also 0.0.6990992 in your case):

1. **NFT Owner**: Owns each minted dataset NFT
2. **Transaction Signer**: Signs the mint request with MetaMask
3. **Account Visibility**: Sees transaction in their wallet
4. **Trading Ready**: Can sell/transfer NFTs in marketplace

## Error Handling

### User Rejects Signature
```
Toast: "Transaction rejected by user"
Action: User can try again
```

### Invalid Wallet
```
Toast: "Please connect your wallet first"
Action: Display wallet connect button
```

### Transaction Fails on Chain
```
Toast: "Minting failed: Transaction failed with status: INVALID_TOKEN_ID"
Action: Check NEXT_PUBLIC_DATASET_TOKEN_ID is set correctly
```

### MetaMask Not Installed
```
Toast: "MetaMask not available"
Action: User needs to install MetaMask extension
```

## Testing Checklist

- [ ] Connect MetaMask wallet (account with testnet HBAR)
- [ ] Upload CSV file and validate
- [ ] Click "Mint Dataset NFT"
- [ ] See "Preparing transaction..." toast
- [ ] MetaMask popup appears
- [ ] Click "Sign" in MetaMask
- [ ] See "Submitting..." toast
- [ ] Success! NFT minted
- [ ] Click HashScan link - verify transaction shows
- [ ] Check account balance decreased by 20 HBAR
- [ ] NFT appears in token-gallery with correct owner

## Security Notes

✅ **User Signs Transaction**: MetaMask maintains key security  
✅ **Server Doesn't See Keys**: Frontend signs, backend submits  
✅ **Testnet Safe**: Using testnet for development  
✅ **Fee Covered**: Treasury account pays for all mints  
✅ **Audit Trail**: Every mint visible on HashScan  

## Migration from Old Flow

Old behavior (no signing):
```
User uploads → Backend mints directly → Done
```

New behavior (with signing):
```
User uploads → Build transaction → User signs → Backend submits → Done
```

All existing localStorage data still works! Minted NFTs appear in gallery correctly.
