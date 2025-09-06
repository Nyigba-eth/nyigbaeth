# Nyigba Cultural NFT Platform

A decentralized platform for African cultural heritage preservation through NFTs, built on Base Sepolia blockchain.

## 🌍 Overview

Nyigba is a Web3 platform that enables artists to tokenize and preserve African cultural artifacts, stories, and art. The platform features a DAO governance system, artist registry, and a naming service for user-friendly blockchain interactions.

## 🏗️ Architecture

### Frontend (nyigba-frontend)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Web3 Integration**: ethers.js v6
- **State Management**: React hooks and context

### Backend (nyigba-backend)
- **Development Environment**: Hardhat
- **Smart Contracts**: Solidity
- **Network**: Base Sepolia Testnet

## 📝 Smart Contracts

### Deployed Contracts on Base Sepolia

1. **DAO Contract**: `0xD6799aF65B0598E326Ee1537E7607F019DF33f07`
   - ETH-based staking governance
   - Artist application voting
   - Proposal management

2. **Artist Registry**: `0x6c107341Eae178Ec54166a6655D2C61EA04b7dd4`
   - Artist registration and verification
   - Application management
   - Status tracking

3. **Nyigba Names**: `0x516A5dd0bDCf2D711188Daa54f7156C84f89286C`
   - Domain name service
   - Human-readable addresses
   - Name resolution

## 🚀 Features

### Current Features
- **DAO Governance**: ETH staking-based voting system
- **Artist Registry**: Application and verification process
- **Domain Names**: Human-readable blockchain addresses
- **Wallet Integration**: MetaMask and WalletConnect support
- **Responsive UI**: Modern dark theme interface

### Core Functionality
- Artist application submission and voting
- DAO member management
- Proposal creation and voting
- Domain name registration and resolution
- NFT marketplace (structure ready)

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask wallet
- Git

### Frontend Setup
```bash
cd nyigba-frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd nyigba-backend
npm install
npx hardhat compile
npx hardhat test
```

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

#### Backend (.env)
```env
PRIVATE_KEY=your_private_key
ALCHEMY_API_KEY=your_alchemy_key
ETHERSCAN_API_KEY=your_etherscan_key
```

## 📁 Project Structure

```
nyigbaeth/
├── nyigba-frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   └── types/           # TypeScript definitions
│   ├── public/              # Static assets
│   └── package.json
├── nyigba-backend/           # Hardhat development environment
│   ├── contracts/           # Smart contracts
│   ├── scripts/             # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.js
└── README.md
```

## 🔧 Key Components

### Frontend Components
- **WalletConnection**: Web3 wallet integration
- **DAO Management**: Governance interface
- **Artist Registry**: Application management
- **AddressDisplay**: Domain name resolution UI

### Smart Contract Features
- **Staking System**: ETH-based DAO membership
- **Voting Mechanism**: Democratic decision making
- **Artist Verification**: Community-driven approval
- **Name Service**: User-friendly addresses

## 🌐 Network Information

**Base Sepolia Testnet**
- Chain ID: 84532
- RPC URL: `https://sepolia.base.org`
- Explorer: `https://sepolia.basescan.org`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Repository**: https://github.com/Nyigba-eth/nyigbaeth
- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Documentation**: See individual README files in each directory

## 🚀 Deployment

### Frontend Deployment
- Platform: Vercel/Netlify
- Build Command: `npm run build`
- Output Directory: `.next`

### Smart Contract Deployment
```bash
cd nyigba-backend
npx hardhat run scripts/deploy.js --network baseSepolia
```

## 📞 Support

For questions and support, please open an issue in the GitHub repository.

---

Built with ❤️ for African cultural heritage preservation
