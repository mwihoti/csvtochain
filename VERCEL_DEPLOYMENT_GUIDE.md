# CSVToChain - Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

Before deploying to Vercel, ensure you have:

- ✅ GitHub account (for linking to Vercel)
- ✅ GitHub repository pushed with all code
- ✅ Vercel account (free tier available at https://vercel.com)
- ✅ All environment variables documented
- ✅ Project tested locally (`pnpm dev` working)
- ✅ Build succeeds locally (`pnpm build`)

---

## Step 1: Prepare Your GitHub Repository

### 1a. Initialize Git (if not already done)
```bash
cd /home/daniel/work/hedera/csvtochain
git init
git add .
git commit -m "Initial commit: CSVToChain MVP ready for deployment"
```

### 1b. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `csvtochain`
3. Description: "CSV-to-NFT Tokenization Platform on Hedera"
4. Choose **Public** (for portfolio/demo) or **Private** (for security)
5. Click "Create repository"

### 1c. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/csvtochain.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username.

---

## Step 2: Prepare Environment Variables

### 2a. Required Environment Variables

Create a file called `.env.example` in project root with:

```env
# Hedera Network Configuration
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.6990992
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420e1f236ef2abb4f2063540a4a31e734da6c4fa465181a4a2d80596318dc319e60

# HCS Topic (Consensus Service)
HCS_TOPIC_ID=0.0.7170337

# Smart Contract Registry
SMART_CONTRACT_ID=0.0.7170851

# Public Variables
NEXT_PUBLIC_TREASURY_ACCOUNT=0.0.6990992
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_DATASET_TOKEN_ID=0.0.XXXXXX  # Will auto-create on first mint if empty
```

### 2b. Add `.env.example` to Git
```bash
git add .env.example
git commit -m "Add environment variables example"
git push origin main
```

**Important:** Never commit `.env.local` - it contains secrets!

---

## Step 3: Sign Up / Log In to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** (or **"Log In"** if you have account)
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account
5. You'll be redirected to your Vercel dashboard

---

## Step 4: Import Project to Vercel

### 4a. Create New Project
1. In Vercel dashboard, click **"New Project"** (top right)
2. Vercel will show your GitHub repositories
3. Find and select **`csvtochain`** repository
4. Click **"Import"**

### 4b. Configure Project Settings

**Project Name**: `csvtochain` (or your preferred name)

**Framework Preset**: Should auto-detect **Next.js** ✅

**Root Directory**: `./` (leave as default)

**Environment Variables**: 
Click **"Add Environment Variable"** and add each variable:

```
Key: HEDERA_NETWORK
Value: testnet

Key: HEDERA_ACCOUNT_ID
Value: 0.0.6990992

Key: HEDERA_PRIVATE_KEY
Value: 302e020100300506032b657004220420e1f236ef2abb4f2063540a4a31e734da6c4fa465181a4a2d80596318dc319e60

Key: HCS_TOPIC_ID
Value: 0.0.7170337

Key: SMART_CONTRACT_ID
Value: 0.0.7170851

Key: NEXT_PUBLIC_TREASURY_ACCOUNT
Value: 0.0.6990992

Key: NEXT_PUBLIC_HEDERA_NETWORK
Value: testnet

Key: NEXT_PUBLIC_DATASET_TOKEN_ID
Value: (leave empty - will auto-create)
```

**⚠️ Important**: 
- Vercel encrypts all environment variables
- Never share your private key publicly
- Only store sensitive values as project env vars (not in code)

---

## Step 5: Build & Deploy

### 5a. Click "Deploy"
Once all environment variables are set, click the **"Deploy"** button.

Vercel will:
1. Clone your repository
2. Install dependencies (`pnpm install`)
3. Run build command (`next build`)
4. Deploy to Vercel's global CDN
5. Generate a live URL

**Expected build time**: 3-5 minutes

### 5b. Monitor Build Progress
- Watch the build logs in real-time
- Should see:
  ```
  ✓ Created JavaScript bundle in ... ms
  ✓ Compiled /api/prepare-mint
  ✓ Compiled /api/submit-signed-mint
  ✓ Generated HTML pages
  ✓ Analyzing bundle size
  ```

### 5c. Build Completes
When successful, you'll see:
```
✓ Deployment ready!
Your site is now live at: https://csvtochain-xxxxx.vercel.app
```

---

## Step 6: Configure Custom Domain (Optional)

### 6a. Add Custom Domain
1. In Vercel project dashboard, go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `csvtochain.app`)
4. Follow DNS instructions provided by Vercel

### 6b. Configure SSL
Vercel automatically provides free SSL certificates via Let's Encrypt.

---

## Step 7: Test Your Deployment

### 7a. Visit Your Live Site
1. Click the deployment URL from Vercel dashboard
2. Or go to: `https://csvtochain-xxxxx.vercel.app`

### 7b. Test Core Features
```
1. Home Page
   ✓ Loads successfully
   ✓ Logo and navigation visible
   ✓ All links functional

2. Connect Wallet
   ✓ MetaMask popup appears
   ✓ Wallet connects successfully
   ✓ Account ID displays

3. Tokenize Data Page (/tokenized-data)
   ✓ CSV upload works
   ✓ File validation passes
   ✓ Minting button enabled

4. Token Gallery (/token-gallery)
   ✓ Page loads
   ✓ Displays minted NFTs (if any)
   ✓ Shows transaction links
```

### 7c. Test Minting (on Testnet)
1. Connect MetaMask to Hedera Testnet
2. Ensure testnet account has HBAR
3. Upload sample CSV
4. Click "Mint Dataset NFT"
5. Approve in MetaMask
6. Verify transaction on HashScan

---

## Step 8: Set Up Automatic Deployments

### 8a. Enable Auto-Deployments
Vercel automatically deploys on:
- **Push to main** - Automatic production deployment
- **Pull requests** - Automatic preview deployments

### 8b. Configure Deployment Rules (Optional)
1. Go to **Settings** → **Git**
2. Configure:
   - Production Branch: `main`
   - Preview Deployments: `All`

---

## Step 9: Monitor & Manage Deployments

### 9a. View Deployment History
1. In Vercel dashboard, click **"Deployments"**
2. See all deployments with:
   - Timestamp
   - Status (✓ Success or ✗ Failed)
   - Commit message
   - Build duration

### 9b. Rollback to Previous Version
1. Find previous successful deployment
2. Click **"..."** menu
3. Select **"Redeploy"**
4. Vercel deploys previous version instantly

### 9c. Monitor Analytics (Pro feature)
- View real-time analytics
- Track API usage
- Monitor performance metrics

---

## Step 10: Configure Environment Variables for Different Environments

### 10a. Preview vs Production
You can have different env vars for preview and production:

1. Go to **Settings** → **Environment Variables**
2. For each variable, select:
   - **Production** - Used when deploying to main branch
   - **Preview** - Used for pull request previews
   - **Development** - Used locally with `vercel env`

### 10b. Example: Testnet vs Mainnet
```
Production: HEDERA_NETWORK = mainnet
Preview: HEDERA_NETWORK = testnet
```

---

## Troubleshooting

### Build Fails: "Module not found"
```bash
# Solution: Ensure all dependencies are in package.json
pnpm install
pnpm build

# If still fails:
git add pnpm-lock.yaml
git commit -m "Update lock file"
git push origin main
```

### Build Fails: "HEDERA_PRIVATE_KEY not found"
```bash
# Check: Ensure env variables are set in Vercel dashboard
# Go to Settings → Environment Variables
# Verify all required variables are present
```

### Build Fails: "TypeScript errors"
```bash
# Local test:
npx tsc --noEmit

# If errors, fix locally:
git add .
git commit -m "Fix TypeScript errors"
git push origin main
```

### Site Works Locally but Fails on Vercel
```bash
# Check build output for specific errors
# Common issues:
1. Missing env variables
2. TypeScript compilation errors
3. API route issues

# Review logs at: Vercel Dashboard → Deployments → [Latest] → Logs
```

### MetaMask Not Working on Vercel
```bash
# Ensure:
1. Site uses HTTPS (Vercel provides this)
2. MetaMask popup is not blocked
3. Correct network configured in MetaMask
4. Hedera network reachable from Vercel servers
```

---

## Performance Optimization

### 11a. Edge Functions (Pro Feature)
For faster API responses near users:
1. Go to **Settings** → **Edge Functions**
2. Configure regions for API routes
3. Select regions closest to users

### 11b. Caching
Vercel automatically caches:
- Static assets (images, CSS)
- Built pages
- API responses (optional)

---

## Security Best Practices

### 12a. Protect Sensitive Data
✅ **DO:**
- Store private keys in Environment Variables
- Use Vercel's encryption
- Use separate accounts for testnet/mainnet
- Enable two-factor authentication on GitHub & Vercel

❌ **DON'T:**
- Commit secrets to Git
- Share environment variable values
- Use same account for dev and production
- Leave test accounts with large balances

### 12b. Monitor Deployments
- Review deployment logs
- Check for unexpected errors
- Monitor API usage
- Alert on failed builds

---

## Verification Checklist

After deployment to Vercel:

```
□ Site loads at https://csvtochain-xxxxx.vercel.app
□ All pages accessible (/, /tokenized-data, /token-gallery, etc.)
□ MetaMask integration works
□ CSV upload and validation functional
□ NFT minting completes successfully
□ Transactions visible on HashScan
□ Gallery shows minted NFTs
□ No console errors or TypeScript warnings
□ Mobile responsive design working
□ Dark mode toggle functional
□ Performance metrics acceptable
□ All environment variables present
□ Custom domain (if configured) working
```

---

## Next Steps

### After Initial Deployment

1. **Monitor**: Watch for errors in Vercel logs
2. **Update**: Push improvements via Git
3. **Share**: Give URL to users/investors
4. **Scale**: Upgrade plan as traffic grows
5. **Analytics**: Enable analytics dashboard

### Deploy Updates

1. Make code changes locally
2. Test with `pnpm dev` and `pnpm build`
3. Commit and push to GitHub
4. Vercel automatically deploys
5. Verify at live URL

---

## Useful Vercel Commands

### Deploy from CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from current directory
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls
```

### Environment Variables via CLI
```bash
# Pull environment variables
vercel env pull

# This creates .env.local with production variables
# Use locally for testing
```

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Hedera on Vercel**: https://docs.hedera.com/
- **Vercel Status**: https://www.vercel-status.com/

---

## FAQ

**Q: How much does Vercel cost?**
A: Free tier includes unlimited projects, 100GB bandwidth, and auto-scaling. Pro/Team plans available for advanced features.

**Q: How long does deployment take?**
A: Typically 3-5 minutes for initial build, 1-2 minutes for subsequent updates.

**Q: Can I use custom domain on free tier?**
A: Yes, you can add custom domains on free tier.

**Q: What if my site goes down?**
A: Vercel auto-scales and has 99.95% uptime SLA. Check their status page.

**Q: How do I test before production?**
A: Vercel creates preview URLs for every pull request automatically.

**Q: Can I deploy from other Git providers?**
A: Vercel supports GitHub, GitLab, and Bitbucket.

---

**Deployment Guide Complete! 🚀**

For detailed setup, visit: https://vercel.com/docs/getting-started

Good luck deploying CSVToChain! 🎉
