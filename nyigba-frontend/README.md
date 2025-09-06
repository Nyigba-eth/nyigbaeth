# Nyigba.eth - Cultural Heritage Platform

A comprehensive Web3 platform for preserving, verifying, and trading African cultural heritage through blockchain technology. Built on Base Sepolia with full ENS integration.

**Tagline:** Preserving African heritage onchain, forever.

## 🚀 Features

### Core Functionality
- **ENS Integration**: Creators register ENS subnames (e.g., artist.nyigba.eth) for digital identity
- **NFT Minting**: Tokenize folklore, art, and music with onchain royalties
- **DAO Governance**: Community-managed treasury and artist approval system
- **Decentralized Storage**: Permanent preservation via NFT.Storage (IPFS + Filecoin)
- **Cultural Marketplace**: Web3-native marketplace for African cultural NFTs

### Technical Features
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **wagmi + RainbowKit** for Web3 integration
- **Framer Motion** for animations
- **React Hook Form** for form management
- **NFT.Storage** for IPFS/Filecoin storage

## 🛠 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nyigba-frontend.git
   cd nyigba-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   - `NEXT_PUBLIC_ALCHEMY_API_KEY`: Your Alchemy API key for Base Sepolia
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Your WalletConnect project ID
   - `NEXT_PUBLIC_NFT_STORAGE_TOKEN`: Your NFT.Storage API token
   - Contract addresses for deployed smart contracts

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── marketplace/        # NFT marketplace
│   ├── create/            # NFT creation
│   ├── dao/               # DAO governance
│   └── artists/           # Artist profiles
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   ├── home/              # Homepage components
│   ├── marketplace/       # Marketplace components
│   ├── create/            # Creation form components
│   └── dao/               # DAO components
├── lib/                   # Utility libraries
│   ├── config.ts          # App configuration
│   ├── web3.ts            # Web3 setup
│   ├── abis.ts            # Contract ABIs
│   ├── ipfs.ts            # IPFS utilities
│   └── utils.ts           # General utilities
├── types/                 # TypeScript type definitions
└── styles/                # Global styles
```

## 🎨 Key Components

### Homepage
- **Hero Section**: Dynamic cultural showcase
- **Features Overview**: Web3 technology explanation
- **Stats Dashboard**: Live platform metrics
- **Featured NFTs**: Curated cultural content

### Marketplace
- **Advanced Filtering**: By origin, language, category
- **Grid/List Views**: Flexible browsing options
- **Search Functionality**: Find specific content
- **Cultural Metadata**: Rich heritage information

### NFT Creation
- **File Upload**: Drag-and-drop for images/audio
- **Cultural Metadata**: Origin, language, category tags
- **Royalty Settings**: Configurable creator royalties
- **IPFS Storage**: Permanent preservation

### DAO Governance
- **Proposal System**: Community decision making
- **Voting Interface**: Token-weighted voting
- **Treasury Management**: Community fund oversight
- **Artist Applications**: Decentralized approval process

## 🔗 Smart Contract Integration

The frontend integrates with several smart contracts on Base Sepolia:

- **NyigbaNames**: ENS-like subdomain system
- **NyigbaNFT**: Main NFT collection contract
- **ArtistRegistry**: Artist verification system
- **Governor**: DAO governance contract
- **VotingToken**: Governance token for voting
- **RoyaltySplitter**: Automatic royalty distribution

## 🌐 Web3 Features

### Wallet Integration
- Multiple wallet support via RainbowKit
- Network switching to Base Sepolia
- Transaction status tracking
- Gas estimation and optimization

### IPFS Storage
- Decentralized file storage via NFT.Storage
- Automatic Filecoin backup
- Content addressing for permanence
- Multiple gateway support for reliability

### Cultural Preservation
- Rich metadata standards for heritage content
- Multi-language support
- Geographic origin tracking
- Cultural category classification

## 🎯 Usage Guide

### For Creators
1. **Connect Wallet**: Use MetaMask or compatible wallet
2. **Claim ENS Name**: Get your .nyigba.eth subdomain
3. **Apply as Artist**: Submit application to DAO
4. **Create NFTs**: Upload and mint cultural content
5. **Earn Royalties**: Receive ongoing payments from sales

### For Collectors
1. **Browse Marketplace**: Discover cultural heritage
2. **Filter by Origin**: Find specific cultural backgrounds
3. **Purchase NFTs**: Support creators and preserve culture
4. **Join DAO**: Participate in community governance

### For DAO Members
1. **Vote on Proposals**: Help guide platform direction
2. **Approve Artists**: Verify new creator applications
3. **Manage Treasury**: Oversee community funds
4. **Claim Rewards**: Receive periodic treasury distributions

## 🚀 Deployment

### Environment Setup
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Vercel Deployment
The easiest way to deploy is using Vercel:

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

## 🤝 Contributing

We welcome contributions to help preserve African cultural heritage! 

### Development Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

### Code Standards
- Use TypeScript for type safety
- Follow ESLint rules
- Write meaningful component names
- Add JSDoc comments for complex functions
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- African cultural communities for their rich heritage
- Web3 ecosystem for enabling decentralized preservation
- Open source contributors making this possible

## 📞 Support

- **Documentation**: [docs.nyigba.eth](https://docs.nyigba.eth)
- **Discord**: [discord.gg/nyigba](https://discord.gg/nyigba)
- **Twitter**: [@nyigba_eth](https://twitter.com/nyigba_eth)
- **Email**: hello@nyigba.eth

---

**Preserving African heritage onchain, forever. 🌍**
