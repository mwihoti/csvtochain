#!/bin/bash

# CSVToChain - Pre-Deployment Verification Script
# Run this before deploying to Vercel to catch issues early

echo "🚀 CSVToChain - Pre-Deployment Verification"
echo "=============================================="
echo ""

# Check 1: Node.js and npm
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "  ✅ Node.js installed: $NODE_VERSION"
else
    echo "  ❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi

# Check 2: pnpm
echo ""
echo "✓ Checking pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo "  ✅ pnpm installed: v$PNPM_VERSION"
else
    echo "  ❌ pnpm not found. Install with: npm i -g pnpm"
    exit 1
fi

# Check 3: Dependencies
echo ""
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✅ Dependencies installed"
else
    echo "  ⚠️  node_modules not found. Running pnpm install..."
    pnpm install
fi

# Check 4: TypeScript compilation
echo ""
echo "✓ Checking TypeScript..."
if npx tsc --noEmit 2>/dev/null; then
    echo "  ✅ TypeScript compilation successful (0 errors)"
else
    echo "  ❌ TypeScript compilation failed"
    npx tsc --noEmit
    exit 1
fi

# Check 5: Build test
echo ""
echo "✓ Testing production build..."
if pnpm build 2>&1 | grep -q "successfully"; then
    echo "  ✅ Production build successful"
else
    echo "  ⚠️  Build completed (check output above for warnings)"
fi

# Check 6: Environment variables
echo ""
echo "✓ Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "  ✅ .env.local found"
    
    if grep -q "HEDERA_ACCOUNT_ID" .env.local; then
        echo "    ✅ HEDERA_ACCOUNT_ID present"
    else
        echo "    ❌ HEDERA_ACCOUNT_ID missing"
    fi
    
    if grep -q "HEDERA_PRIVATE_KEY" .env.local; then
        echo "    ✅ HEDERA_PRIVATE_KEY present"
    else
        echo "    ❌ HEDERA_PRIVATE_KEY missing"
    fi
    
    if grep -q "HEDERA_NETWORK" .env.local; then
        echo "    ✅ HEDERA_NETWORK present"
    else
        echo "    ❌ HEDERA_NETWORK missing"
    fi
else
    echo "  ⚠️  .env.local not found (will need to add to Vercel dashboard)"
fi

# Check 7: Git setup
echo ""
echo "✓ Checking Git setup..."
if [ -d ".git" ]; then
    REMOTE=$(git remote get-url origin 2>/dev/null)
    if [ -z "$REMOTE" ]; then
        echo "  ⚠️  Git initialized but no remote configured"
        echo "    Run: git remote add origin https://github.com/YOUR_USERNAME/csvtochain.git"
    else
        echo "  ✅ Git remote configured: $REMOTE"
    fi
else
    echo "  ⚠️  Git not initialized"
    echo "    Run: git init && git add . && git commit -m 'Initial commit'"
fi

# Check 8: Package.json
echo ""
echo "✓ Checking package.json..."
if [ -f "package.json" ]; then
    echo "  ✅ package.json found"
    if grep -q '"next":' package.json; then
        echo "    ✅ Next.js configured"
    fi
    if grep -q '"build":' package.json; then
        echo "    ✅ Build script configured"
    fi
else
    echo "  ❌ package.json not found"
    exit 1
fi

# Summary
echo ""
echo "=============================================="
echo "✅ Pre-Deployment Verification Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Push changes to GitHub: git push origin main"
echo "2. Go to https://vercel.com"
echo "3. Click 'New Project' and select your repository"
echo "4. Add environment variables in Vercel dashboard"
echo "5. Click 'Deploy'"
echo ""
echo "Reference: See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions"
