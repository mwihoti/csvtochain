# CSV Minting Setup Guide

## Problem You're Facing

You're getting an `INVALID_SIGNATURE` error when trying to mint CSV datasets. This happens because:

1. The system tries to **create an NFT collection token** on the first mint
2. Token creation requires admin and supply key permissions
3. The transaction fails because the key configuration isn't correct for token creation

## Solution: Pre-Create the Collection Token

Instead of creating the token on-demand during minting, we create it once upfront as a separate step.

### Step-by-Step Setup

#### 1. Verify Environment Variables

Make sure your `.env.local` has these values:

```bash
# Copy your actual values
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=302e020100300506032b6570042204...YOUR_KEY
```

**To find these:**
- Go to [Hedera Testnet Faucet](https://testnet.faucet.hedera.com/)
- Create/import account
- Copy Account ID and Private Key
- Paste into `.env.local`

#### 2. Fund Your Account

Make sure your account has at least **50 HBAR** for the token creation fee.
- Use the faucet above to request testnet HBAR if needed
- Wait a few minutes for confirmation

#### 3. Create the Collection Token

Run this command in your terminal:

```bash
npm run create:token
```

**Expected output:**
```
🔧 Creating NFT Collection Token
   Network: testnet
   Account: 0.0.XXXXX

📝 Building token creation transaction...
⏳ Submitting transaction to Hedera...

⏳ Waiting for receipt...

✅ Token created successfully!

📌 Token ID: 0.0.7299452

📋 Add this to your .env.local:

NEXT_PUBLIC_DATASET_TOKEN_ID=0.0.7299452

🔗 View on HashScan:
https://hashscan.io/testnet/token/0.0.7299452
```

#### 4. Update .env.local

Copy the token ID and add it to your `.env.local`:

```bash
NEXT_PUBLIC_DATASET_TOKEN_ID=0.0.7299452
```

#### 5. Restart the Dev Server

Stop your dev server (Ctrl+C) and restart:

```bash
npm run dev
```

#### 6. Test Minting

1. Go to http://localhost:3000/tokenized-data
2. Upload a CSV file
3. Click "Mint Dataset NFT on Hedera"
4. Should complete successfully!

## If It Still Fails

### Error: "Treasury account not configured"
- Check `HEDERA_ACCOUNT_ID` and `HEDERA_PRIVATE_KEY` are set in `.env.local`
- Make sure values don't have extra quotes or spaces

### Error: "transaction failed precheck with status INVALID_SIGNATURE"
- **Check account balance**: Account needs ~50 HBAR
- Use faucet to request more HBAR
- Wait a few minutes and try again

### Error: "Key format invalid"
- Your private key might be in ED25519 format instead of ECDSA
- The script will try both formats automatically
- If still failing, try exporting key in different format from faucet

### Still not working?

1. Verify account has HBAR: `npm run test:connection`
2. Check that HEDERA_ACCOUNT_ID is in format `0.0.NUMBER`
3. Make sure HEDERA_PRIVATE_KEY doesn't have quotes around it
4. Try creating a new account on the faucet and starting fresh

## Architecture

After you complete setup once:

```
User uploads CSV
    ↓
Frontend calls /api/prepare-mint
    ↓
Backend uses pre-created collection token (NEXT_PUBLIC_DATASET_TOKEN_ID)
    ↓
Creates unsigned mint transaction
    ↓
Frontend calls /api/submit-signed-mint
    ↓
Backend signs and executes
    ↓
NFT minted! ✨
```

The token creation only happens **once during setup**. Then all CSVs are minted into the same collection.

## What the Token ID Does

- **Token ID**: Identifies your NFT collection (like a contract address)
- **Each mint**: Creates a new NFT in this collection with unique serial number
- **Public**: Anyone can view your collection on HashScan with the token ID
- **Permanent**: Token ID never changes once created

Example: `0.0.7299452` = Your CSV Datasets Collection

View all mints: https://hashscan.io/testnet/token/0.0.7299452

## Troubleshooting Checklist

- [ ] `.env.local` has `HEDERA_ACCOUNT_ID=0.0.XXXXX` (no quotes)
- [ ] `.env.local` has `HEDERA_PRIVATE_KEY=302e...` (full key, no quotes)
- [ ] Account has at least 50 HBAR balance
- [ ] Ran `npm run create:token` successfully
- [ ] Output showed "✅ Token created successfully!"
- [ ] Copied token ID to `.env.local` as `NEXT_PUBLIC_DATASET_TOKEN_ID`
- [ ] Restarted dev server with `npm run dev`
- [ ] Wallet is connected on the website

## Next Steps

Once setup is complete:

1. **Mint datasets**: Upload CSV → Click mint
2. **View in gallery**: See all your tokens at `/token-gallery`
3. **Share**: Give token ID to anyone who wants to view your NFTs
4. **Deploy**: Works same way on mainnet (just change `HEDERA_NETWORK`)

---

**Need help?**
- Check `.env.local` values are correct
- Review server logs for detailed error messages
- Verify account on [HashScan](https://hashscan.io/testnet/)
