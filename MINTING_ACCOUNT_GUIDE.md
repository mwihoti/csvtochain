# Minting Account Configuration - CSVToChain

## Answer: Which Account Mints the CSV?

**The CSV is minted using the account configured in your `.env.local` file, NOT the user's wallet address.**

### Current Architecture

```
User's Wallet (MetaMask/HashPack)
    ↓
    Uploads CSV via UI
    ↓
Browser-side validation & hashing
    ↓
Calls API: POST /api/mint-dataset
    ↓
Backend API Route (Next.js Server)
    ↓
Reads HEDERA_ACCOUNT_ID from .env.local
    ↓
Uses HEDERA_PRIVATE_KEY from .env.local
    ↓
Mints NFT on behalf of ENV Account
    ↓
Stores result in localStorage
    ↓
Shows to User
```

### Technical Details

**File: `/app/api/mint-dataset/route.ts` (Lines 40-44)**
```typescript
// Validate environment variables
const accountId = process.env.HEDERA_ACCOUNT_ID;
const privateKey = process.env.HEDERA_PRIVATE_KEY;
const network = (process.env.HEDERA_NETWORK || 'testnet') as 'testnet' | 'mainnet' | 'previewnet';
```

**File: `/app/api/mint-dataset/route.ts` (Line 58)**
```typescript
const mintingService = new TokenMintingService(
  accountId,           // FROM ENV FILE
  privateKey,          // FROM ENV FILE
  network
);
```

### The User's Wallet Role

The user's wallet (MetaMask/HashPack) is:
- ✅ **Used for viewing balances** - shown on dashboard
- ✅ **Used for purchasing data** - in the marketplace
- ❌ **NOT used for minting** - minting uses env account

### Configuration Required

In your `.env.local`:
```env
# This account will be the OWNER of all minted NFTs
HEDERA_ACCOUNT_ID=0.0.6990992
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...

# Optional: Set as treasury account for purchases
NEXT_PUBLIC_TREASURY_ACCOUNT=0.0.6990992
```

### Key Points

1. **Treasury Account Benefit**: You set `0.0.6990992` as the minting account, which means:
   - All minted NFTs are owned by this account
   - Perfect for a centralized data marketplace
   - Simplifies payment/royalty tracking
   - Can see all tokens in token-gallery

2. **User Experience Flow**:
   - User uploads CSV → UI validates
   - User clicks "Mint" button
   - API uses env credentials to sign transaction
   - NFT appears in your treasury account
   - Automatically syncs to marketplace
   - User can then purchase from marketplace

3. **Security Implication**:
   - Backend has full control via env private key
   - Users cannot bypass the minting process
   - Prevents unauthorized token creation
   - Ensures data integrity at mint time

### To Change Minting Account

If you want users' personal wallets to mint instead, you would need to:

1. Modify `/components/CSVTokenizer.tsx` to pass user's account ID
2. Update `/app/api/mint-dataset/route.ts` to accept user account parameter
3. Implement client-side signing OR redirect to wallet signing flow
4. Handle transaction confirmation from user's wallet

**Note**: This is more complex and requires user approval for each mint.

### Recommended Approach (Current)

Keep the current setup because:
- ✅ Simple, user-friendly (no wallet signing needed for minting)
- ✅ Consistent token ownership for marketplace
- ✅ Backend controls data integrity
- ✅ Better user experience (mint happens instantly)
- ✅ Can implement royalties from treasury account
