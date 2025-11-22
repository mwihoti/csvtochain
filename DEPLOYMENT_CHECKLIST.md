# CSVToChain - Pre-Deployment Checklist

## Before You Deploy to Vercel

Complete this checklist to ensure smooth deployment:

---

## ✅ Phase 1: Local Testing & Verification

### Code Quality
- [ ] `pnpm build` runs successfully (0 errors)
- [ ] `pnpm dev` runs without warnings
- [ ] `npx tsc --noEmit` shows 0 TypeScript errors
- [ ] No `console.error` or `console.warn` in browser console
- [ ] ESLint passes (`pnpm run lint` if configured)

### Functionality Testing (Local)
- [ ] Home page (/) loads correctly
- [ ] Tokenize Data page loads
- [ ] Token Gallery page loads
- [ ] MetaMask wallet connection works
- [ ] CSV file upload and validation works
- [ ] NFT minting completes successfully
- [ ] Transaction appears on HashScan
- [ ] NFT appears in gallery after minting
- [ ] All navigation links work
- [ ] Dark mode toggle works
- [ ] Responsive design works on mobile

### Environment Setup
- [ ] `.env.local` file created with all variables
- [ ] All required environment variables set:
  - `HEDERA_ACCOUNT_ID` ✓
  - `HEDERA_PRIVATE_KEY` ✓
  - `HEDERA_NETWORK` ✓
  - `HCS_TOPIC_ID` ✓
  - `SMART_CONTRACT_ID` ✓
  - `NEXT_PUBLIC_TREASURY_ACCOUNT` ✓
  - `NEXT_PUBLIC_HEDERA_NETWORK` ✓
- [ ] `.env.local` NOT committed to Git (in `.gitignore`)
- [ ] `.env.example` committed to Git with empty secrets

### Dependencies
- [ ] `pnpm install` completes without errors
- [ ] `pnpm-lock.yaml` is committed to Git
- [ ] No deprecated packages detected
- [ ] Node.js version matches (16.x or higher)

---

## ✅ Phase 2: Git Repository Setup

### Repository Configuration
- [ ] Git repository initialized (`git init`)
- [ ] All code committed (`git add .` → `git commit`)
- [ ] Remote configured to GitHub
  ```bash
  git remote -v
  # Should show: origin https://github.com/YOUR_USERNAME/csvtochain.git
  ```
- [ ] Code pushed to GitHub (`git push origin main`)
- [ ] README.md is comprehensive and up-to-date
- [ ] `.gitignore` includes:
  - `.env.local` (secrets)
  - `node_modules/` (dependencies)
  - `.next/` (build output)
  - `.vercel/` (Vercel cache)

### Repository Content
- [ ] `package.json` present with all dependencies
- [ ] `tsconfig.json` configured correctly
- [ ] `next.config.ts` present
- [ ] All source files included
- [ ] No sensitive data in code or comments

---

## ✅ Phase 3: Vercel Account Setup

### Account & Authentication
- [ ] Vercel account created (vercel.com)
- [ ] GitHub account linked to Vercel
- [ ] Able to see GitHub repositories in Vercel dashboard
- [ ] GitHub OAuth permissions granted

### Project Preparation
- [ ] GitHub repository is public (or private with Vercel access)
- [ ] Repository name matches project: `csvtochain`
- [ ] Main branch is `main` (not `master`)
- [ ] No branches with uncommitted changes

---

## ✅ Phase 4: Vercel Deployment Configuration

### Project Settings
- [ ] Project name set to: `csvtochain`
- [ ] Framework auto-detected as: `Next.js`
- [ ] Build command verified: `pnpm build`
- [ ] Dev command verified: `pnpm dev`
- [ ] Install command verified: `pnpm install`
- [ ] Output directory verified: `.next`
- [ ] Root directory: `./` (default)

### Environment Variables
All variables added in Vercel dashboard with correct values:

**Production Environment:**
- [ ] `HEDERA_NETWORK=testnet` (or `mainnet` if ready)
- [ ] `HEDERA_ACCOUNT_ID=0.0.6990992`
- [ ] `HEDERA_PRIVATE_KEY=302e020100...` (encrypted)
- [ ] `HCS_TOPIC_ID=0.0.7170337`
- [ ] `SMART_CONTRACT_ID=0.0.7170851`
- [ ] `NEXT_PUBLIC_TREASURY_ACCOUNT=0.0.6990992`
- [ ] `NEXT_PUBLIC_HEDERA_NETWORK=testnet`
- [ ] `NEXT_PUBLIC_DATASET_TOKEN_ID=` (empty - will auto-create)

**Verification:**
- [ ] All sensitive values are encrypted in Vercel
- [ ] No secrets exposed in build logs
- [ ] Environment variables match local `.env.local`

### Build Settings
- [ ] Node.js version: `20.x`
- [ ] Build timeout: Default (60 seconds OK for this project)
- [ ] Output directory: `.next`

---

## ✅ Phase 5: Deployment Execution

### Pre-Deployment
- [ ] Latest code pushed to GitHub main branch
- [ ] All environment variables added to Vercel
- [ ] No pending changes in Git repository

### Deployment Steps
1. [ ] Clicked "Deploy" button in Vercel
2. [ ] Build logs show no errors
3. [ ] All pages compiled successfully
   - [ ] Home page
   - [ ] Tokenize Data
   - [ ] Token Gallery
   - [ ] Dashboard (if exists)
   - [ ] API routes compiled
4. [ ] Build completed with "✓ Ready" status
5. [ ] Deployment URL generated (https://csvtochain-xxxxx.vercel.app)

---

## ✅ Phase 6: Post-Deployment Testing

### Site Accessibility
- [ ] Live URL accessible without errors
- [ ] No 404 or 500 errors
- [ ] Page loads in <2 seconds
- [ ] No mixed content warnings (HTTP vs HTTPS)

### Functionality on Production
- [ ] Home page displays correctly
- [ ] Navigation works (`/tokenized-data`, `/token-gallery`)
- [ ] MetaMask button visible and functional
- [ ] "Connect Wallet" opens MetaMask popup
- [ ] Can select MetaMask as wallet provider
- [ ] Account ID displays after connection
- [ ] CSV upload input works
- [ ] File validation shows feedback
- [ ] "Mint Dataset NFT" button functions
- [ ] Minting process completes
- [ ] Transaction succeeds on testnet
- [ ] NFT appears in gallery
- [ ] Links to HashScan work correctly

### Browser Compatibility
- [ ] Chrome/Chromium: ✓ Works
- [ ] Firefox: ✓ Works
- [ ] Safari: ✓ Works
- [ ] Mobile browsers: ✓ Works

### Performance
- [ ] Page load time < 2 seconds
- [ ] No performance warnings in DevTools
- [ ] Network requests complete successfully
- [ ] API responses reasonable latency

### Security
- [ ] HTTPS enabled (Vercel automatic)
- [ ] No security warnings in browser
- [ ] MetaMask connected securely
- [ ] Private keys not exposed in console
- [ ] No sensitive data in network requests

---

## ✅ Phase 7: Monitoring & Maintenance

### Vercel Dashboard
- [ ] Bookmark Vercel project dashboard
- [ ] Set up email notifications for:
  - [ ] Build failures
  - [ ] Deployment errors
- [ ] Monitor analytics (if available)
- [ ] Check deployment history regularly

### Deployment Monitoring
- [ ] Verify latest deployment is active
- [ ] Check deployment logs for warnings
- [ ] Monitor API usage and errors
- [ ] Track performance metrics

### Post-Launch
- [ ] Document deployment date and URL
- [ ] Create backup of environment variables (securely)
- [ ] Test rollback procedure (redeploy previous version)
- [ ] Set up monitoring alerts

---

## ✅ Phase 8: Optional Enhancements

### Custom Domain (Optional)
- [ ] Purchase domain or have existing
- [ ] Add domain in Vercel → Settings → Domains
- [ ] Configure DNS records per Vercel instructions
- [ ] SSL certificate auto-provisions
- [ ] Test custom domain after DNS propagation

### Analytics (Optional)
- [ ] Enable Vercel Analytics for:
  - [ ] Page load times
  - [ ] API usage
  - [ ] User traffic
- [ ] Set up uptime monitoring
- [ ] Configure performance alerts

### Maintenance (Optional)
- [ ] Set up automated backups
- [ ] Plan regular updates
- [ ] Monitor for security vulnerabilities
- [ ] Keep dependencies updated

---

## 📝 Deployment Credentials & URLs

Save these securely (password manager):

```
GitHub Repository: https://github.com/YOUR_USERNAME/csvtochain
Vercel Project: https://vercel.com/YOUR_USERNAME/csvtochain
Live Site: https://csvtochain-xxxxx.vercel.app
```

---

## 🆘 Troubleshooting Quick Links

| Problem | Solution |
|---------|----------|
| Build fails | Check Vercel logs for error message |
| Missing env vars | Go to Settings → Environment Variables |
| MetaMask not working | Ensure HTTPS enabled (automatic) |
| Site slow | Check Vercel Analytics & API latency |
| Old version deployed | Go to Deployments → Find version → Redeploy |

---

## ✅ Final Sign-Off

- [ ] All phases completed
- [ ] Site tested and working
- [ ] Team notified of live URL
- [ ] Documentation updated
- [ ] Ready for production use

**Deployment Date**: ________________

**Deployed By**: ________________

**Live URL**: ________________

**Status**: ✅ **LIVE** or 🔄 **IN PROGRESS** or ❌ **BLOCKED**

---

## 📞 Support

- **Vercel Support**: https://vercel.com/support
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Issues**: Create in repository
- **Hedera Support**: https://hedera.com/contact

---

**Checklist Version**: 1.0  
**Last Updated**: November 2025  
**For Project**: CSVToChain MVP
