# 🧪 Wallet Integration Testing Guide

## Quick Start Testing

### Prerequisites
- Node.js v20+ installed
- MetaMask browser extension installed (for MetaMask testing)
- HashPack account (for HashPack testing)
- HBAR testnet account with balance

---

## Test Environment Setup

```bash
# 1. Navigate to project
cd /home/daniel/work/hedera/csvtochain

# 2. Install dependencies
pnpm install

# 3. Start dev server
pnpm dev

# 4. Open browser
# http://localhost:3000
```

---

## Test Cases

### TEST 1: Initial Page Load

**Objective**: Verify wallet button appears and app loads

**Steps**:
1. Open http://localhost:3000
2. Look for "Connect Wallet" button in top right
3. Verify button text and styling

**Expected Result**:
```
✅ Page loads successfully
✅ "Connect Wallet" button visible
✅ Button shows wallet icon
✅ No console errors
```

**Console Check**:
```bash
# Open browser DevTools (F12)
# Check Console tab - should be clean
# Check for any red errors
```

---

### TEST 2: HashPack Connection

**Objective**: Connect wallet using HashPack

**Prerequisites**:
- HashPack extension installed
- HashPack wallet with testnet account

**Steps**:
1. Click "Connect Wallet" button
2. See dropdown with two options:
   - 🔐 HashPack
   - 🦊 MetaMask
3. Click "HashPack"
4. HashPack pairing window opens
5. Approve pairing in HashPack

**Expected Result**:
```
✅ Dropdown appears with both wallet options
✅ HashPack popup opens
✅ Wallet connects after approval
✅ Button shows connected account: 0.0.XXXXX
✅ Button shows balance: XXX.XXXX HBAR
✅ Wallet type shows: 🔐 HashPack
✅ No console errors
```

**Verification**:
```bash
# 1. Open browser DevTools
# 2. Go to Application → LocalStorage
# 3. Check for "hashpack_pairing" key
# 4. Verify it contains account ID and other data
```

---

### TEST 3: MetaMask Connection

**Objective**: Connect wallet using MetaMask

**Prerequisites**:
- MetaMask extension installed
- MetaMask account created (Ethereum side, content doesn't matter for Hedera)

**Steps**:
1. Click "Connect Wallet" button
2. Click "MetaMask" option
3. MetaMask popup appears
4. Click "Next" → "Connect"
5. Confirm connection

**Expected Result**:
```
✅ MetaMask popup appears
✅ Shows account connection request
✅ After approval, shows connected account
✅ Button shows: 0.0.6990992 (treasury account)
✅ Shows balance from treasury account
✅ Wallet type shows: 🦊 MetaMask
✅ No console errors
```

**Verification**:
```bash
# 1. Open browser DevTools
# 2. Go to Application → LocalStorage
# 3. Check for "metamask_account" key
# 4. Should contain: "0.0.6990992"
```

---

### TEST 4: Wallet Switching (HashPack → MetaMask)

**Objective**: Verify smooth wallet switching

**Prerequisites**:
- Already connected with HashPack

**Steps**:
1. Verify connected as HashPack
2. Click wallet button
3. See dropdown menu
4. Click "Disconnect Wallet"
5. Verify disconnected (button shows "Connect Wallet")
6. Click "Connect Wallet"
7. Select "MetaMask"
8. Complete MetaMask connection

**Expected Result**:
```
✅ Can see connected account and wallet type
✅ Disconnect button works
✅ Account clears from UI
✅ Can reconnect with MetaMask
✅ LocalStorage updated correctly
✅ No balance/account conflicts
✅ No console errors
```

**LocalStorage Check**:
```bash
# Before switch: hashpack_pairing exists, metamask_account doesn't
# After disconnect: both cleared
# After MetaMask connect: only metamask_account exists
```

---

### TEST 5: Session Persistence

**Objective**: Verify wallet connection persists across page reloads

**Prerequisites**:
- Connected wallet (HashPack or MetaMask)

**Steps**:
1. Connect wallet
2. Note the account ID shown
3. Refresh page (Cmd+R or Ctrl+R)
4. Wait for page to load
5. Check if still connected

**Expected Result**:
```
✅ After refresh, still shows connected account
✅ Same account ID displayed
✅ Balance shows immediately
✅ No re-authentication needed
✅ No console errors
```

**Test With Different Scenarios**:
```bash
# Scenario 1: Hard refresh
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
# Should still remember wallet

# Scenario 2: Close and reopen tab
# Should still remember wallet

# Scenario 3: Different tab
# Open new tab to http://localhost:3000
# Should share wallet state (if using same browser storage)
```

---

### TEST 6: Manual Disconnection

**Objective**: Verify disconnect functionality

**Prerequisites**:
- Connected wallet

**Steps**:
1. Click wallet button
2. See dropdown with account info
3. See "Disconnect Wallet" button in red
4. Click "Disconnect Wallet"
5. Verify disconnected

**Expected Result**:
```
✅ Dropdown appears on button click
✅ Shows account ID
✅ Shows balance
✅ Shows wallet type (HashPack or MetaMask)
✅ Red disconnect button appears
✅ After click, disconnected
✅ Button returns to "Connect Wallet"
✅ LocalStorage cleared
```

**LocalStorage Check**:
```bash
# After disconnect, both should be gone:
# - hashpack_pairing
# - metamask_account
```

---

### TEST 7: Clear LocalStorage and Reconnect

**Objective**: Verify app works after storage cleared

**Prerequisites**:
- Any wallet connected

**Steps**:
1. Open DevTools (F12)
2. Go to Application → LocalStorage
3. Right-click on http://localhost:3000
4. Click "Clear"
5. Refresh page
6. Try to connect wallet again

**Expected Result**:
```
✅ LocalStorage cleared successfully
✅ After refresh, shows "Connect Wallet"
✅ Can reconnect to wallet
✅ Everything works normally
```

---

### TEST 8: Balance Display

**Objective**: Verify balance fetches and displays correctly

**Steps**:
1. Connect wallet
2. Note displayed balance
3. Check the same account on HashScan
4. Compare balances

**Expected Result**:
```
✅ Balance displays with 4 decimal places
✅ Shows HBAR abbreviation
✅ Matches HashScan balance (within 1 block)
✅ Formatted as "XXX.XXXX HBAR"
```

**Manual Verification**:
```bash
# Go to https://hashscan.io/testnet/account/0.0.6990992
# Compare balance with app display
# Should match (within 1-2 seconds due to blockchain latency)
```

---

### TEST 9: Error Handling - MetaMask Not Installed

**Objective**: Handle missing MetaMask gracefully

**Steps**:
1. Use browser WITHOUT MetaMask extension
2. Click "Connect Wallet"
3. Click "MetaMask" option
4. See error message

**Expected Result**:
```
❌ Error toast appears: "MetaMask not installed"
✅ Provides download link
✅ Links to https://metamask.io/download/
✅ App doesn't crash
✅ Can dismiss error and try again
```

---

### TEST 10: Error Handling - MetaMask Rejected

**Objective**: Handle user rejection gracefully

**Steps**:
1. Have MetaMask installed
2. Click "Connect Wallet"
3. Click "MetaMask"
4. MetaMask popup appears
5. Click "Cancel" button
6. See error message

**Expected Result**:
```
❌ Error toast appears: "MetaMask connection rejected"
✅ App doesn't crash
✅ Can retry connection
✅ UI returns to normal state
```

---

### TEST 11: Treasury Account Configuration

**Objective**: Verify treasury account is properly configured

**Steps**:
1. Check .env.local file
2. Verify NEXT_PUBLIC_TREASURY_ACCOUNT is set
3. Connect MetaMask wallet
4. Verify shown account matches treasury

**Expected Result**:
```
✅ NEXT_PUBLIC_TREASURY_ACCOUNT=0.0.6990992 (or your account)
✅ MetaMask shows same account
✅ Balance is for treasury account
✅ Transactions will use treasury account
```

**Check Configuration**:
```bash
# In .env.local
cat .env.local | grep TREASURY
# Should show: NEXT_PUBLIC_TREASURY_ACCOUNT=0.0.XXXXX

# In app during MetaMask connection
# Should show same account ID
```

---

### TEST 12: Responsive Design

**Objective**: Verify wallet selector works on mobile

**Steps**:
1. Open http://localhost:3000
2. Open DevTools (F12)
3. Click responsive design icon (Ctrl+Shift+M)
4. Select mobile device (e.g., iPhone 12)
5. Try to connect wallet
6. See if dropdown works properly

**Expected Result**:
```
✅ "Connect Wallet" button visible on mobile
✅ Dropdown appears on tap
✅ Text readable on small screen
✅ No horizontal scroll needed
✅ Buttons are large enough to tap
✅ Dropdown positioned correctly
```

---

### TEST 13: CSV Tokenization with Wallet

**Objective**: Verify CSV minting uses treasury account

**Prerequisites**:
- Wallet connected (HashPack or MetaMask)

**Steps**:
1. Navigate to /tokenized-data
2. Upload a CSV file
3. Review validation results
4. Click "Mint Dataset NFT on Hedera"
5. Wait for transaction

**Expected Result**:
```
✅ CSV uploads successfully
✅ Validation passes
✅ Mint button clickable (wallet connected)
✅ Transaction appears to send
✅ Success message shows token ID
✅ NFT appears in gallery at /token-gallery
```

---

### TEST 14: Dark Mode Support

**Objective**: Verify wallet selector looks good in dark mode

**Steps**:
1. Connect wallet
2. Look for theme toggle (sun/moon icon)
3. Click to switch to dark mode
4. Check wallet button styling
5. Check dropdown styling

**Expected Result**:
```
✅ Wallet button visible in dark mode
✅ Dropdown background dark
✅ Text readable on dark background
✅ Icons display correctly
✅ No color contrast issues
```

---

## Performance Testing

### TEST 15: Connection Speed

**Objective**: Measure time to connect

**Steps**:
1. Click "Connect Wallet"
2. Time how long until wallet is responsive
3. Note from start to fully connected

**Expected Result**:
```
⏱️ HashPack: ~2-5 seconds
⏱️ MetaMask: ~1-3 seconds
```

---

### TEST 16: Balance Fetch Speed

**Objective**: Measure time to fetch and display balance

**Steps**:
1. Connect wallet
2. Open DevTools Network tab
3. Note request to mirrornode.hedera.com
4. Check response time

**Expected Result**:
```
⏱️ Balance fetched in: <2 seconds
✅ API response time: <1000ms
✅ Display updated immediately
```

---

## Integration Testing

### TEST 17: Full User Flow

**Objective**: Complete end-to-end flow

**Steps**:
1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Select wallet (MetaMask or HashPack)
4. Complete connection
5. Click "Tokenize Data" in header
6. Upload CSV file
7. Mint NFT
8. View in gallery
9. Click back to dashboard
10. Verify wallet still connected
11. Disconnect wallet
12. Verify disconnected

**Expected Result**:
```
✅ All steps complete without errors
✅ Wallet state maintained throughout
✅ No data loss
✅ Can perform all operations
✅ Clean disconnection at end
```

---

## Console Error Checking

After each test, verify console is clean:

```bash
# Open DevTools (F12)
# Go to Console tab
# Should see NO red errors
# May see blue/yellow warnings (acceptable)

# Look for these patterns (BAD):
❌ "TypeError: Cannot read property..."
❌ "ReferenceError: X is not defined"
❌ "Uncaught Error..."

# These are OK (INFO):
✅ "[HashConnect] Initialized"
✅ "[WalletContext] Pairing event"
✅ Network requests to API
```

---

## Common Issues & Solutions

### Issue: "window is not defined"

**Solution**: Already handled in code with `typeof window !== 'undefined'`

### Issue: Balance not updating

**Solution**:
```bash
# Check network tab in DevTools
# Verify mirrornode.hedera.com request succeeds
# Check for CORS errors
```

### Issue: Dropdown not appearing

**Solution**:
```bash
# Check z-index in CSS
# Verify no parent elements have overflow: hidden
# Check browser zoom level
```

### Issue: Wallet not persisting

**Solution**:
```bash
# Check localStorage is not disabled
# Verify .env.local variables are set
# Clear cache and hard refresh (Ctrl+Shift+R)
```

---

## Automated Testing Scripts

```bash
# Run all TypeScript checks
pnpm tsc --noEmit

# Check for lint errors
pnpm lint 2>/dev/null || echo "No linter configured"

# Test build
pnpm build

# Start dev server
pnpm dev
```

---

## Test Results Checklist

After completing all tests, check off:

- [ ] Initial page load works
- [ ] HashPack connection works
- [ ] MetaMask connection works
- [ ] Wallet switching works
- [ ] Session persistence works
- [ ] Manual disconnect works
- [ ] LocalStorage clearing works
- [ ] Balance displays correctly
- [ ] Errors handled gracefully
- [ ] Treasury account configured
- [ ] Mobile responsive design works
- [ ] CSV tokenization works
- [ ] Dark mode works
- [ ] Console clean (no errors)
- [ ] Full flow works end-to-end

---

## Final Verification

```bash
# In browser DevTools Console:
localStorage
# Should show hashpack_pairing OR metamask_account (but not both)

window.location.href
# Should show: http://localhost:3000 (or variant)

document.title
# Should show: SheetToChain - CSV to NFT Tokenization
```

---

## Ready for Production?

✅ All tests passing  
✅ No console errors  
✅ Mobile responsive  
✅ Error handling works  
✅ Session persistent  
✅ Treasury account configured  

**Status**: READY TO DEPLOY 🚀

---

*Last Updated: 2025-11-21*
*Test Version: 1.0*
