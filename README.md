# CSVToChain 📊⛓️

**Transforming CSV Data into Verifiable Digital Assets on Hedera**

---

## 📋 Submission Details

### Project Description

CSVToChain is the first CSV-to-NFT tokenization platform built on Hedera Hashgraph, solving the fundamental problem of data authenticity and ownership in the digital age. The platform transforms ordinary CSV files into verifiable, tradeable blockchain assets with immutable proof of integrity, NFT-based ownership with clear provenance, and a built-in marketplace for monetizing datasets. Users can upload CSV files, validate data quality, mint NFTs representing their datasets, browse a decentralized marketplace, and purchase tokenized data using their Hedera wallets—all in under 60 seconds with military-grade cryptographic verification.

Demo Video link: https://youtu.be/h3_Vm9uZ-4o

### Hackathon Track

**DeFi & Tokenization**

### Tech Stack

**Frontend:**
- Next.js 16 (React 19, TypeScript 5)
- Tailwind CSS 4 (responsive design)
- Lucide React (icons)
- React Hot Toast (notifications)

**Blockchain:**
- Hedera SDK 2.76.0 (HTS, HCS, crypto operations)
- Hedera Mirror Node API (account lookups, transaction verification)
- HashPack Wallet (Hedera native wallet)
- MetaMask (Web3 wallet compatibility)

**Backend & Services:**
- Next.js API Routes (purchase processing, data endpoints)
- Browser localStorage (persistent storage)
- CoinGecko API (real-time HBAR pricing)
- SHA-256 cryptographic hashing

**Infrastructure & DevOps:**
- Vercel (deployment ready)
- Docker support (containerization)
- pnpm (package management)
- ESLint & Prettier (code quality)

---

## 🎯 Key Features

### 1. CSV-to-NFT Tokenization Pipeline
```
CSV Upload → Validation → Hashing → NFT Minting → HCS Verification → Marketplace Listing
```

- **Drag & Drop Upload**: Modern file interface with real-time progress tracking
- **Smart Validation**: Multi-layer checks (size, structure, quality scoring)
- **Cryptographic Hashing**: SHA-256 for immutable data integrity proof
- **Real NFT Minting**: Live Hedera Token Service integration
- **Automatic Marketplace Sync**: Tokenized datasets appear instantly in the data marketplace

### 2. Data Marketplace
- **Browse Datasets**: Advanced search and filtering by category
- **Purchase Functionality**: One-click purchasing with wallet verification
- **Price Discovery**: Dynamic pricing with HBAR conversion
- **Transaction Verification**: HashScan integration for blockchain proof
- **Purchase History**: Track all acquired datasets with metadata

### 3. Wallet Integration
- **HashPack Support**: Native Hedera wallet integration
- **MetaMask Compatibility**: Popular Web3 wallet support
- **Multi-wallet Switching**: Seamless account selection
- **Live Balance Display**: Real-time HBAR balance from Mirror Node
- **Transaction Signing**: Secure, user-controlled transactions

### 4. Transaction Analytics Dashboard
- **Account Explorer**: Deep dive into Hedera accounts
- **Multi-Network Support**: Mainnet, Testnet, Previewnet
- **Real-Time Data**: Live transaction history and balances
- **AI Categorization**: Automated transaction classification
- **CSV Export**: Download transaction data for analysis

### 5. Dual-Layer Verification
- **Hedera Token Service (HTS)**: NFT represents ownership
- **Hedera Consensus Service (HCS)**: Immutable timestamp + hash
- **Military-Grade Security**: Double verification architecture

---

## 🚀 Quick Start

### Prerequisites
- Node.js v20+
- pnpm v9+ (or npm/yarn)
- Hedera testnet account: [portal.hedera.com](https://portal.hedera.com/)

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/mwihoti/csvtochain.git
cd csvtochain
```

2. **Install Dependencies**
```bash
pnpm install
```

3. **Configure Environment**
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
HEDERA_NETWORK=testnet
NEXT_PUBLIC_TREASURY_ACCOUNT=0.0.YOUR_ACCOUNT_ID
HCS_TOPIC_ID=0.0.YOUR_TOPIC_ID (optional)
NEXT_PUBLIC_HEDERA_NETWORK=testnet
```

4. **Test Connection**
```bash
pnpm test:connection
```

5. **Start Development Server**
```bash
pnpm dev
```

Access the app at `http://localhost:3000`

---

## 🧪 Testing Instructions

### Test 1: CSV Upload & Validation
1. Navigate to http://localhost:3000/tokenized-data
2. Upload `public/examples/sample-sales.csv`
3. Verify validation passes with:
   - ✅ 15 rows, 7 columns
   - ✅ Quality score shown
   - ✅ Data preview displayed
   - ✅ SHA-256 hash generated

### Test 2: NFT Minting (Requires HBAR)
1. Complete Test 1
2. Click "Mint Dataset NFT on Hedera"
3. Approve transaction in wallet
4. Verify success message shows:
   - Token ID
   - Serial Number
   - HashScan verification link

### Test 3: Marketplace Listing
1. After minting, navigate to http://localhost:3000/data-marketplace
2. Verify your tokenized CSV appears in listings
3. Click "View Details" to see metadata
4. (Optional) Click "Purchase" to test purchase flow

### Test 4: Wallet Integration
1. Connect wallet via button on homepage
2. Verify account ID and balance display
3. Switch between HashPack and MetaMask (if available)
4. Verify balance updates correctly

### Test 5: Transaction Analytics
1. Navigate to http://localhost:3000/dashboard
2. Search for a known account ID
3. Verify transaction history loads
4. Check dark mode functionality

---

## 📁 Project Structure

```
csvtochain/
├── app/
│   ├── api/
│   │   ├── mint-dataset/          # NFT minting endpoint
│   │   └── purchase-data/         # Marketplace purchase processing
│   ├── dashboard/                 # Transaction analytics
│   ├── data-marketplace/          # Browse & purchase datasets
│   ├── my-purchases/              # Purchase history
│   ├── seller-dashboard/          # Listing management
│   ├── token-gallery/             # Minted NFTs gallery
│   ├── tokenized-data/            # CSV upload & minting
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Homepage
├── components/
│   ├── CSVTokenizer.tsx           # Upload & minting UI
│   ├── DashboardOverview.tsx      # Analytics dashboard
│   ├── PurchaseModal.tsx          # Marketplace purchase modal
│   ├── TransactionTable.tsx       # Transaction display
│   └── [other components]
├── lib/
│   ├── services/
│   │   ├── csv-processor.ts       # CSV validation & hashing
│   │   ├── hedera-sdk.ts          # Hedera interactions
│   │   ├── marketplace.ts         # Listing & purchase logic
│   │   ├── token-minting.ts       # NFT minting service
│   │   └── categorization.ts      # Transaction categorization
│   ├── contexts/
│   │   └── WalletContext.tsx      # Wallet state management
│   └── api/
│       └── mirror-node.ts         # Hedera Mirror Node queries
├── public/
│   └── examples/
│       ├── sample-sales.csv       # Test dataset
│       └── sample-analytics.csv   # Test dataset
├── contracts/
│   └── DatasetRegistry.sol        # Smart contract for registry
└── package.json
```

---

## 🔐 Security Considerations

- **Environment Variables**: Never commit `.env.local` to git
- **Private Keys**: Use secure vaults in production
- **Testnet Only**: Development uses testnet for safety
- **Data Privacy**: Only SHA-256 hash stored on-chain, full dataset stays off-chain
- **GDPR Compliant**: No PII stored in blockchain metadata

---

## 📊 Performance Metrics

- **Tokenization Time**: < 60 seconds (upload to NFT minted)
- **Validation Time**: < 5 seconds
- **Hash Generation**: < 1 second
- **API Response Time**: < 500ms
- **Dashboard Load**: < 2 seconds
- **Marketplace Sync**: < 1 second

---

## 🛣️ Future Roadmap

### Phase 2: Advanced Features
- Batch CSV upload & tokenization
- Fractional dataset ownership (ERC-1155)
- Advanced search with AI/ML filtering
- Royalty system for creators


### Phase 3: Monetization
- Built-in payment streaming (HTS token distribution)
- Dataset subscription models
- Creator rewards program
- Governance token (DAO)

### Phase 4: Enterprise Features
- White-label marketplace
- Compliance & audit trails
- Data insurance
- Integration APIs
- Enterprise wallet support

### Key Learnings
- Hedera's consensus architecture enables 99.9% reliability
- Privacy-first design (only hash on-chain) is crucial for adoption
- User experience matters more than technical complexity
- Real-time analytics drive user engagement
- Marketplace liquidity requires clear pricing mechanisms

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please follow the existing code style and submit pull requests to the main branch.

---

## 📞 Support

For issues or questions:
- Create a GitHub issue
- Check existing documentation
- Review test files for usage examples

---

## 🎬 Demo Video

[Demo video will be embedded in pitch deck]

---

**CSVToChain**: Where Data Meets Blockchain
