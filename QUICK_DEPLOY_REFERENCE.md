# Vercel Deployment - Quick Reference Card

## 🚀 TL;DR - Deploy in 5 Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Sign In to Vercel
Visit: https://vercel.com → Sign up with GitHub

### Step 3: Import Project
Dashboard → New Project → Select `csvtochain` → Import

### Step 4: Add Environment Variables
Click "Add Environment Variable" for each:

| Variable | Value |
|----------|-------|
| `HEDERA_NETWORK` | `testnet` |
| `HEDERA_ACCOUNT_ID` | `0.0.6990992` |
| `HEDERA_PRIVATE_KEY` | `302e020100300506032b657004220420...` |
| `HCS_TOPIC_ID` | `0.0.7170337` |
| `SMART_CONTRACT_ID` | `0.0.7170851` |
| `NEXT_PUBLIC_TREASURY_ACCOUNT` | `0.0.6990992` |
| `NEXT_PUBLIC_HEDERA_NETWORK` | `testnet` |

### Step 5: Deploy
Click "Deploy" button → Wait 3-5 minutes → Live! ✅

---

## 📋 Environment Variables (Copy-Paste)

```
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.6990992
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420e1f236ef2abb4f2063540a4a31e734da6c4fa465181a4a2d80596318dc319e60
HCS_TOPIC_ID=0.0.7170337
SMART_CONTRACT_ID=0.0.7170851
NEXT_PUBLIC_TREASURY_ACCOUNT=0.0.6990992
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_DATASET_TOKEN_ID=
```

---

## ✅ Test Your Deployment

After deployment goes live:

```
1. Visit: https://csvtochain-xxxxx.vercel.app
2. Test: Home page loads ✓
3. Test: Connect MetaMask ✓
4. Test: Upload CSV file ✓
5. Test: Mint NFT (on testnet) ✓
6. Test: View in gallery ✓
```

---

## 🔗 Useful Links

| Purpose | URL |
|---------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Your Project | https://vercel.com/csvtochain |
| Deployment Logs | Dashboard → [Project] → Deployments |
| Environment Variables | Dashboard → [Project] → Settings → Environment Variables |
| Domain Configuration | Dashboard → [Project] → Settings → Domains |

---

## 🐛 Troubleshooting Quick Links

**Issue: Build fails**
→ Check deployment logs in Vercel dashboard

**Issue: Environment variables missing**
→ Go to Settings → Environment Variables → Add missing vars

**Issue: MetaMask not working**
→ Ensure you're on HTTPS (Vercel provides this automatically)

**Issue: Previous version working, new one broken**
→ Go to Deployments → Find last working version → Click "..." → "Redeploy"

---

## 💾 After Deployment

### Keep Deploying Updates:
```bash
# Make code changes locally
nano components/CSVTokenizer.tsx

# Test
pnpm dev
pnpm build

# Deploy
git add .
git commit -m "Fix: Better error messages"
git push origin main
# Vercel deploys automatically!
```

### Monitor Your Site:
- Check Vercel Analytics dashboard
- Review deployment logs
- Monitor API performance
- Track user sessions

---

## 🎯 Success Indicators

After deployment, you should see:

- ✅ Site accessible at vercel.app URL
- ✅ No build errors in logs
- ✅ All environment variables present
- ✅ MetaMask integration works
- ✅ CSV minting completes
- ✅ Transactions visible on HashScan
- ✅ Performance metrics good (<2s load time)

---

## 📞 Get Help

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Hedera Docs**: https://docs.hedera.com/
- **GitHub Issues**: Create issue in repo

---

## 🎉 You're Done!

Your CSVToChain is now live on the internet!

Share your URL: `https://csvtochain-xxxxx.vercel.app` 🚀
