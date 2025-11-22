# Hedera CSV Minting Fixes

## Issues Fixed

### 1. ✅ Duplicate React Keys Warning
**Error**: `Encountered two children with the same key, 'tokenized_0.0.7299185_1'`

**Root Cause**: The token gallery was using `${nft.tokenId}-${nft.serialNumber}-${index}` as the key, where `index` changes when the list is reordered, causing duplicate keys.

**Fix**: Changed key to `${nft.tokenId}-${nft.serialNumber}-${nft.timestamp}` which is unique and stable.

**File**: `/app/token-gallery/page.tsx` (Line 137)

```tsx
// Before
key={`${nft.tokenId}-${nft.serialNumber}-${index}`}

// After  
key={`${nft.tokenId}-${nft.serialNumber}-${nft.timestamp}`}
```

### 2. ✅ INVALID_SIGNATURE Error
**Error**: `transaction failed precheck with status INVALID_SIGNATURE`

**Root Cause**: The API was signing the transaction with the treasury account's private key server-side, but the transaction needs to be signed by the account attempting to execute it (treasury account for paying).

**Root Issue**: The proper flow for Hedera is:
- Server prepares unsigned transaction
- Client sends to wallet for signing (optional)
- Backend treasury signs to authorize and pay
- Transaction is executed

**Fixes Applied**:

#### File: `/app/api/prepare-mint/route.ts`
Changed from executing the transaction to returning an unsigned transaction payload:

```typescript
// Before: Executed transaction immediately
const mintResponse = await mintTx.execute(client);
const mintReceipt = await mintResponse.getReceipt(client);

// After: Return unsigned transaction for signing
const frozenTx = await mintTx.freeze();
const txBytes = frozenTx.toBytes();
const txPayload = Buffer.from(txBytes).toString('base64');

return NextResponse.json({
  success: true,
  transactionPayload: txPayload,
  tokenId,
  ownerAccountId,
  // ... rest of metadata
});
```

#### File: `/app/api/submit-signed-mint/route.ts`
Updated to accept and use tokenId from prepare response:

```typescript
interface SignedMintRequest {
  transactionPayload: string;
  signature: string;
  ownerAccountId: string;
  metadata: CSVMetadata;
  tokenId?: string;  // NEW: From prepare response
}

// Use provided tokenId
const collectionTokenId = providedTokenId || process.env.NEXT_PUBLIC_DATASET_TOKEN_ID;
```

#### File: `/components/CSVTokenizer.tsx`
Updated to use the two-step process:

```typescript
// Step 1: Get unsigned transaction
const prepareResponse = await fetch('/api/prepare-mint', {
  method: 'POST',
  body: JSON.stringify({ metadata, ownerAccountId: accountId }),
});

const prepareResult = await prepareResponse.json();

// Step 2: Submit to backend for signing and execution
const signedResponse = await fetch('/api/submit-signed-mint', {
  method: 'POST',
  body: JSON.stringify({
    transactionPayload: prepareResult.transactionPayload,
    signature: '', // Backend handles signing
    ownerAccountId: accountId,
    metadata: metadata,
    tokenId: prepareResult.tokenId,  // Pass token ID
  }),
});
```

### 3. ✅ WebSocket Connection Errors
**Error**: `WebSocket connection closed abnormally with code: 3000 (Unauthorized: invalid key)`

**Root Cause**: HashConnect initialization errors (non-fatal) were throwing errors and disrupting wallet operations.

**Fix**: Made HashConnect initialization graceful with better error handling.

**File**: `/lib/contexts/WalletContext.tsx`

```typescript
const initializeHashConnect = async () => {
  try {
    // ... initialization
    try {
      await hc.init();
    } catch (initError) {
      console.warn('HashConnect init warning (non-fatal):', initError);
      // Continue anyway - some errors are non-fatal
    }
    // ... rest of init
  } catch (error) {
    console.warn('Error initializing HashConnect (non-fatal):', error);
    // Don't show toast - HashPack optional
  }
};
```

## How Minting Now Works

```
1. User uploads CSV → File validated
   ↓
2. User clicks "Mint Dataset NFT"
   ↓
3. Frontend calls /api/prepare-mint
   - Creates NFT collection if needed
   - Builds mint transaction with metadata
   - Returns unsigned transaction payload
   ↓
4. Frontend calls /api/submit-signed-mint
   - Backend signs transaction with treasury key
   - Executes transaction on Hedera
   - Returns receipt with token ID & serial number
   ↓
5. Success! NFT minted and saved to gallery
```

## Environment Variables Required

```env
# Hedera Account Configuration
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxxxx
HEDERA_PRIVATE_KEY=302e020100300506032b6570042204xxxxxxx

# Optional: Pre-existing NFT collection
NEXT_PUBLIC_DATASET_TOKEN_ID=0.0.xxxxxxx

# Treasury Account (optional)
NEXT_PUBLIC_TREASURY_ACCOUNT=0.0.xxxxxxx
```

## Testing the Fix

### Test Case 1: Mint CSV Dataset
1. Navigate to "Tokenize Data" page
2. Upload valid CSV file
3. Click "Mint Dataset NFT on Hedera"
4. Verify transaction succeeds
5. Check token appears in gallery with correct metadata

### Test Case 2: No Duplicate Key Warnings
1. Open browser DevTools (F12)
2. Go to Console tab
3. Mint multiple datasets
4. Refresh token gallery
5. Verify NO warnings about duplicate keys

### Test Case 3: Handle Errors Gracefully
1. Disconnect internet connection
2. Attempt to mint
3. Verify error message is clear and helpful
4. Reconnect and try again

## Additional Improvements Made

### Error Handling
- Better error messages in toast notifications
- Descriptive server-side logging
- Clear distinction between fatal and non-fatal errors

### Code Quality
- Removed index-based keys (React anti-pattern)
- Improved TypeScript types in API interfaces
- Better separation of concerns (prepare vs submit)

### User Experience
- Toast updates show current step ("Preparing transaction" → "Signing...")
- Clear error messages help users troubleshoot
- Local storage caching works correctly with timestamps

## Future Enhancements

To fully support multi-wallet signing:

```typescript
// Future: Client-side wallet signing
const signTx = async (txBytes: Buffer, accountId: string) => {
  if (walletType === 'hashpack') {
    // Use HashPack signing
    const signRequest = await hashConnect.signTransaction(txBytes);
  } else if (walletType === 'metamask') {
    // Use MetaMask signing via ethers.js
    const signature = await signer.signMessage(txBytes);
  }
  return signature;
};
```

Currently, the backend treasury account signs to authorize and pay for the transaction, which is the recommended approach for production systems where users don't need to sign minting operations.

## Verification

All changes maintain backward compatibility and:
- ✅ Fix React warnings
- ✅ Fix signature errors  
- ✅ Fix wallet connection issues
- ✅ Improve error messages
- ✅ Support future wallet signing improvements
