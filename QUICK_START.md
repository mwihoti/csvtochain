# Quick Reference Guide

## 🚀 Get Started (5 Minutes)

### Step 1: Verify Setup
```bash
npm run verify
```

**Expected output:**
```
✅ All checks passed! You're ready to mint.
```

If you see ❌ or ⚠️, run:
```bash
npm run diagnose
```

### Step 2: Start Dev Server
```bash
npm run dev
```

Wait for: `compiled successfully`

### Step 3: Mint a CSV
1. Go to http://localhost:3000/tokenized-data
2. Upload a CSV file
3. Click "Mint Dataset NFT on Hedera"
4. Wait 10-30 seconds
5. See success message! ✨

### Step 4: View Your NFT
```
http://localhost:3000/token-gallery
```

---

## 🔧 Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run verify` | Check minting is configured ✅ |
| `npm run diagnose` | Debug account & key issues |
| `npm run create:token` | Create new collection token |
| `npm run test:connection` | Test Hedera connectivity |

---

## 📋 Configuration Checklist

```
✅ HEDERA_ACCOUNT_ID=0.0.6990992
✅ HEDERA_PRIVATE_KEY=302e020100...
✅ HEDERA_NETWORK=testnet
✅ NEXT_PUBLIC_DATASET_TOKEN_ID=0.0.7302567
✅ NEXT_PUBLIC_TREASURY_ACCOUNT=0.0.6990992
```

**Location**: `.env.local`

---

## 🎯 Minting Process

```
CSV File
    ↓
Upload & Validate (Client)
    ↓
Generate Metadata Hash
    ↓
Click Mint Button
    ↓
/api/prepare-mint (Server)
    ↓
/api/submit-signed-mint (Server)
    ↓
✅ Transaction Broadcast to Hedera
    ↓
NFT Created!
    ↓
Serial # assigned
    ↓
Saved to Gallery
```

**Time**: 10-30 seconds per mint

---

## 🐛 Troubleshooting

### "Collection token not configured"
→ Token ID missing from `.env.local`
→ Add: `NEXT_PUBLIC_DATASET_TOKEN_ID=0.0.7302567`
→ Restart server

### "Minting failed: INVALID_SIGNATURE"
→ Run: `npm run diagnose`
→ Check account & key match
→ Verify HBAR balance

### "Transaction timeout"
→ Network slow or blockchain busy
→ Try again in a few moments
→ Check internet connection

### "NFT doesn't appear in gallery"
→ Refresh page
→ Check browser console (F12)
→ Verify transaction on HashScan

---

## 🔗 Useful Links

| Link | Purpose |
|------|---------|
| http://localhost:3000/tokenized-data | Mint CSVs |
| http://localhost:3000/token-gallery | View NFTs |
| https://hashscan.io/testnet/token/0.0.7302567 | Blockchain explorer |

---

## 📊 Your Configuration

```
Account:      0.0.6990992
Network:      testnet
Token:        0.0.7302567
Balance:      947 HBAR
Status:       ✅ READY
```

---

## ⚡ Performance

| Operation | Time |
|-----------|------|
| Setup (one-time) | ~10 sec |
| Upload CSV | <1 sec |
| Validate CSV | ~5 sec |
| Mint NFT | 10-30 sec |
| **Total per CSV** | ~15-40 sec |

---

## 📱 Next Steps

1. **Test**: Mint 1 CSV
2. **Verify**: Check gallery
3. **Share**: Show someone your NFT!
4. **Deploy**: Ready for production anytime

---

## ⚙️ Environment Variables Explained

| Variable | Example | Purpose |
|----------|---------|---------|
| `HEDERA_ACCOUNT_ID` | `0.0.6990992` | Your Hedera account |
| `HEDERA_PRIVATE_KEY` | `302e020100...` | Sign transactions |
| `HEDERA_NETWORK` | `testnet` | Which Hedera network |
| `NEXT_PUBLIC_DATASET_TOKEN_ID` | `0.0.7302567` | NFT collection ID |
| `NEXT_PUBLIC_TREASURY_ACCOUNT` | `0.0.6990992` | Pays for transactions |

---

## 🎓 Learning Resources

**What's Happening:**
1. CSV → Hashed with SHA-256
2. Hash → Stored on Hedera Consensus Service
3. NFT → Created on Hedera Token Service
4. Serial # → Unique within collection
5. Gallery → Shows all your minted NFTs

**Why This Works:**
- Immutable proof of data
- Blockchain verified
- Shareable proof
- Standard NFT format

---

## ✅ Success Indicators

You'll know everything is working when:

✅ `npm run verify` shows all green
✅ Dev server starts without errors
✅ CSV uploads complete successfully
✅ Minting takes 10-30 seconds
✅ NFT appears in gallery immediately
✅ HashScan shows your NFT

---

## 🚨 Critical Issues

| Issue | Solution |
|-------|----------|
| Private key wrong | Run `npm run diagnose` |
| Token ID missing | Check `.env.local` |
| Low HBAR | Request from faucet |
| Dev server won't start | Delete `.next` folder, retry |
| Page won't load | Clear browser cache |

---

## 📞 Debug Commands

```bash
# Most useful first
npm run verify        # Start here!
npm run diagnose      # Detailed check
npm run test:connection # Verify network
npm run dev           # Start server
```

---

**Remember**: First run `npm run verify` to check everything is configured! ✅
