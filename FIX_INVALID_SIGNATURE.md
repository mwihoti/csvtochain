# INVALID_SIGNATURE Error - Quick Fix

## The Error You're Seeing

```
transaction failed precheck with status INVALID_SIGNATURE
```

## Why It's Happening

Your collection token hasn't been created yet. The system tries to create it on the first mint, but that operation requires special setup.

## Quick Fix (2 Minutes)

### Step 1: Run the Setup Script
```bash
npm run create:token
```

### Step 2: Copy the Output
You'll see something like:
```
✅ Token created successfully!

📌 Token ID: 0.0.7299452

NEXT_PUBLIC_DATASET_TOKEN_ID=0.0.7299452
```

### Step 3: Add to .env.local
Add this line to your `.env.local`:
```
NEXT_PUBLIC_DATASET_TOKEN_ID=0.0.7299452
```

### Step 4: Restart Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 5: Try Minting Again
Go to /tokenized-data and mint a CSV. Should work now! ✨

---

## If Script Fails

### "Treasury account not configured"
→ Add to `.env.local`:
```
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=302e...YOUR_KEY
```

### "insufficient balance"
→ Request HBAR from [faucet](https://testnet.faucet.hedera.com/)
→ Wait 2-3 minutes
→ Try again

### Any other error
→ Check these files exist in `.env.local`:
```
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.XXXXX
HEDERA_PRIVATE_KEY=302e...
```

---

## Why This Works

**Before (broken):**
- User clicks mint
- System tries to create token on the fly
- Token creation needs special keys
- Transaction fails ❌

**After (fixed):**
- Setup: Create token once with proper keys ✅
- User clicks mint
- System uses existing token ✅
- Transaction succeeds ✅

## One-Command Summary

If your `.env.local` is already configured:

```bash
npm run create:token && echo "Copy the token ID and add NEXT_PUBLIC_DATASET_TOKEN_ID=... to .env.local"
```

Then restart `npm run dev` and mint!
