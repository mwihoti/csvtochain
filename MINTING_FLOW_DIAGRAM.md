# Minting Flow - Before vs After Fix

## BEFORE (Broken ❌)

```
User Attempts to Mint CSV
          ↓
    /api/prepare-mint
          ↓
   Check for collection token
          ↓
   Token doesn't exist yet
          ↓
   Try to CREATE token on-the-fly
          ↓
   TokenCreateTransaction sent
          ↓
   ❌ INVALID_SIGNATURE ERROR
   (Token creation failed)
          ↓
   User sees error, confused
   Can't mint anything
```

**Why it failed:**
- Token creation requires special key setup
- Server-side token creation has permission issues
- Happens on every first mint attempt

---

## AFTER (Fixed ✅)

### Phase 1: Setup (One Time)

```
Developer runs: npm run create:token
          ↓
   Create NFT collection token
          ↓
   TokenCreateTransaction with proper keys
          ↓
   ✅ Token created: 0.0.7299452
          ↓
   Copy token ID to .env.local
          ↓
NEXT_PUBLIC_DATASET_TOKEN_ID=0.0.7299452
          ↓
   Ready for minting!
```

**Happens once during setup**

### Phase 2: Minting (Every CSV)

```
User uploads CSV and clicks Mint
          ↓
    /api/prepare-mint
          ↓
   Check for collection token
          ↓
   ✅ Token exists (0.0.7299452)
          ↓
   Build mint transaction
          ↓
   Return unsigned transaction
          ↓
    /api/submit-signed-mint
          ↓
   Backend signs transaction
          ↓
   Execute on Hedera
          ↓
   ✅ NFT Created!
   Serial #1, #2, #3, etc.
          ↓
   Saved to gallery
```

**Happens for each CSV mint**

---

## Key Differences

| Aspect | Before | After |
|--------|--------|-------|
| Token creation | On-demand per mint | Once during setup |
| Error frequency | Every mint attempt | One-time setup only |
| User experience | Repeated failures | Works every time |
| Config needed | None | `NEXT_PUBLIC_DATASET_TOKEN_ID` |
| Reliability | Low ❌ | High ✅ |

---

## Setup Checklist

```
□ Have Hedera account (create at faucet)
□ Account has 50+ HBAR
□ .env.local has HEDERA_ACCOUNT_ID
□ .env.local has HEDERA_PRIVATE_KEY
□ Run: npm run create:token
□ Copy token ID from output
□ Add to .env.local: NEXT_PUBLIC_DATASET_TOKEN_ID=...
□ Restart dev server: npm run dev
□ Test: Upload CSV and mint
□ See success! ✨
```

---

## File Changes

**New:**
- `scripts/create-dataset-token.mjs` - Token creation script
- `SETUP_MINTING.md` - Setup guide
- `FIX_INVALID_SIGNATURE.md` - This quick fix guide

**Modified:**
- `app/api/prepare-mint/route.ts` - Now requires pre-created token
- `package.json` - Added `npm run create:token` command

**Result:**
- ✅ Removed on-demand token creation
- ✅ Fixed signature error
- ✅ Cleaner error messages
- ✅ Faster, more reliable minting

---

## How It Works Now

1. **Setup phase** (manual, once):
   - User runs script with their account
   - Token created with proper permissions
   - Token ID saved to environment

2. **Runtime phase** (automatic, always):
   - App checks for token ID at startup
   - If missing, shows clear error message
   - If present, minting works reliably

3. **Minting phase** (per CSV):
   - Two-step process (prepare → submit)
   - Uses pre-created token
   - No more permission issues

---

## Visual: Token ID Flow

```
Create Token Script
    ↓
Token created on Hedera
    ↓
Token ID: 0.0.7299452
    ↓
↙        ↘
.env.local  → App loads at startup
↓
NEXT_PUBLIC_DATASET_TOKEN_ID=0.0.7299452
↓
All minting operations use this token
↓
✅ Mint 1st CSV → Serial #1
✅ Mint 2nd CSV → Serial #2
✅ Mint 3rd CSV → Serial #3
...
```

Each CSV becomes a unique NFT in the same collection!

---

## Testing

### Test 1: Setup Works
```bash
npm run create:token
# Should output token ID successfully
```

### Test 2: Minting Works
1. Add token ID to `.env.local`
2. Restart dev server
3. Upload CSV file
4. Click "Mint Dataset NFT on Hedera"
5. Should complete in 10-30 seconds ✅

### Test 3: Gallery Works
1. Check `/token-gallery`
2. Should see your minted NFT
3. Click HashScan link
4. Should see NFT on blockchain ✅

---

## Success Indicators

✅ `npm run create:token` completes without error
✅ Token ID in .env.local as `NEXT_PUBLIC_DATASET_TOKEN_ID`
✅ No "Collection token not configured" error
✅ CSV minting completes successfully
✅ NFT appears in gallery
✅ Can view on HashScan
✅ No INVALID_SIGNATURE errors

---

**You're ready to mint! 🚀**
