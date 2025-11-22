# ✅ Minting Setup Checklist

## Completed Setup ✅

- [x] Account created on Hedera testnet
- [x] Account has sufficient HBAR (947 HBAR)
- [x] Private key configured correctly
- [x] Hedera SDK initialized properly
- [x] Collection token created (0.0.7302567)
- [x] Token ID added to .env.local
- [x] Configuration verified with scripts

## Your Status

```
✅ Account: 0.0.6990992
✅ Network: testnet
✅ Token ID: 0.0.7302567
✅ Private Key: Valid
✅ Balance: 947 HBAR
✅ Ready to Mint: YES
```

## Before You Start

### If Dev Server is Running
1. Stop it: **Ctrl+C**
2. Restart it: `npm run dev`
3. Wait for "compiled successfully" message

### Check Browser Console
1. Open DevTools: **F12** or **Cmd+Opt+I**
2. Click **Console** tab
3. Refresh page: **Ctrl+Shift+R** (or **Cmd+Shift+R**)
4. Should see no red errors

## Minting Workflow

```
1. Go to /tokenized-data
   ↓
2. Upload CSV file
   ↓
3. CSV validation runs (5 seconds)
   ↓
4. Preview data shows
   ↓
5. Click "Mint Dataset NFT on Hedera"
   ↓
6. Wait for wallet connection (5 seconds)
   ↓
7. Wait for transaction (10-30 seconds)
   ↓
8. Success message appears ✅
   ↓
9. NFT saved to localStorage
   ↓
10. Go to /token-gallery to see it
```

## Expected Messages During Minting

```
✅ "Preparing transaction..." - Getting ready
✅ "Sign transaction in your wallet..." - Communicating with Hedera
✅ "Dataset NFT minted successfully! 🎉" - SUCCESS!
```

## What Could Go Wrong (And How to Fix)

| Issue | Cause | Fix |
|-------|-------|-----|
| "Collection token not configured" | Missing token ID in .env | Restart dev server |
| "Please connect wallet first" | Wallet not connected | Open wallet, connect account |
| Minting hangs for 60+ seconds | Network slow or blockchain busy | Wait a moment, try again |
| "INVALID_SIGNATURE" error | Key doesn't match account | Run `npm run diagnose` |
| "Failed to prepare transaction" | Server error | Check terminal for details |
| "Insufficient balance" | Account low on HBAR | Request from faucet |

## Verification Commands

```bash
# Check everything is configured
npm run verify

# Diagnose any issues
npm run diagnose

# Test Hedera connectivity
npm run test:connection

# View token on HashScan
# https://hashscan.io/testnet/token/0.0.7302567
```

## Quick Troubleshoot

### If Minting Fails
1. Check browser console (F12 → Console)
2. Read the error message carefully
3. Check terminal where dev server runs
4. Run: `npm run verify`
5. Run: `npm run diagnose`

### If Can't See NFT in Gallery
1. Go to http://localhost:3000/token-gallery
2. Click refresh button (reload icon)
3. Should appear immediately
4. If not, check browser console

### If Something is Broken
1. Stop dev server: **Ctrl+C**
2. Clear cache: `rm -rf .next`
3. Restart: `npm run dev`
4. Wait for "compiled successfully"
5. Try again

## After Successful Mint

### View Your NFT

**In Gallery:**
```
http://localhost:3000/token-gallery
```

**On Blockchain:**
```
https://hashscan.io/testnet/token/0.0.7302567
```

**Specific NFT:**
Click "View on HashScan" button on any NFT card

### Share Your Collection

You can share the token ID (0.0.7302567) with anyone, and they can view all your minted datasets on HashScan!

## Production Readiness

When ready for mainnet:

1. Get mainnet account with HBAR funds
2. Change `.env.local`:
   ```
   HEDERA_NETWORK=mainnet
   HEDERA_ACCOUNT_ID=<mainnet account>
   HEDERA_PRIVATE_KEY=<mainnet key>
   ```
3. Create new collection: `npm run create:token`
4. Add new token ID to `.env.local`
5. Deploy to production
6. Same UI, real blockchain! ✨

## File Locations

- Config: `.env.local`
- Frontend: `app/tokenized-data/page.tsx`
- Component: `components/CSVTokenizer.tsx`
- API: `app/api/prepare-mint/route.ts`
- API: `app/api/submit-signed-mint/route.ts`
- Gallery: `app/token-gallery/page.tsx`

## Support Commands

```bash
npm run verify       # ← Use this first!
npm run diagnose    # ← Detailed account check
npm run dev         # ← Run dev server
```

---

## ✅ You're All Set!

Everything is configured and ready. Start minting! 🚀

**Command**: `npm run dev`
**URL**: http://localhost:3000/tokenized-data
