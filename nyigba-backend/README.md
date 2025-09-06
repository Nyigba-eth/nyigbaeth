# Nyigba.eth Backend & Smart Contracts

This directory contains the smart contracts and backend infrastructure for the Nyigba.eth Web3 Cultural Heritage Platform.

## 📋 Overview

The Nyigba.eth platform consists of several smart contracts that work together to:

- **Preserve African cultural heritage** through NFTs
- **Empower creators** with ENS subdomains and royalty management
- **Enable community governance** through DAO mechanisms
- **Facilitate transparent funding** and reward distribution

## 🏗️ Architecture

### Core Contracts

#### 1. **NyigbaNames** (`contracts/NyigbaNames.sol`)
- ENS-like subdomain system for creators
- Allows claiming `artist.nyigba.eth` style names
- Supports text records for bio, origin, social links
- **Key Functions:**
  - `claim(string label)` - Claim a subdomain
  - `setText(bytes32 node, string key, string value)` - Set text records
  - `text(bytes32 node, string key)` - Get text records

#### 2. **NyigbaNFT** (`contracts/NyigbaNFT.sol`)
- Main NFT collection with cultural metadata
- ERC721 + ERC2981 for royalties
- Artist-gated minting through ArtistRegistry
- **Key Functions:**
  - `mintTo(address to, string uri, address royaltyReceiver, uint96 fee, ...)` - Mint NFT
  - `getCulturalData(uint256 tokenId)` - Get cultural metadata
  - `isArtist(address account)` - Check artist status

#### 3. **ArtistRegistry** (`contracts/ArtistRegistry.sol`)
- Manages artist registration and approval
- DAO-controlled artist verification
- **Key Functions:**
  - `requestArtistRole(string portfolio, string bio)` - Apply to be artist
  - `approveArtist(address artist)` - Approve artist (DAO only)
  - `isArtist(address account)` - Check artist status

#### 4. **RoyaltySplitter** (`contracts/RoyaltySplitter.sol`)
- Automatic royalty distribution between artist and treasury
- Supports ETH and ERC20 tokens
- **Key Functions:**
  - `distributeRoyalty(address token, uint256 amount)` - Distribute royalties
  - Configurable split ratios (default: 85% artist, 15% treasury)

#### 5. **RoyaltySplitterFactory** (`contracts/RoyaltySplitterFactory.sol`)
- Factory for deploying RoyaltySplitter contracts
- One splitter per artist
- **Key Functions:**
  - `createSplitter(address artist)` - Create splitter for artist
  - `getSplitter(address artist)` - Get artist's splitter

#### 6. **NyigbaGovernor** (`contracts/NyigbaGovernor.sol`)
- DAO governance contract
- OpenZeppelin Governor with timelock
- **Features:**
  - 1 day voting delay, 1 week voting period
  - 20% quorum requirement
  - Simple majority voting

#### 7. **NyigbaToken** (`contracts/NyigbaToken.sol`)
- Governance token (ERC20 + Votes)
- Used for DAO voting
- **Features:**
  - 100M initial supply
  - 1B max supply
  - Minting controls

#### 8. **TreasuryRewards** (`contracts/TreasuryRewards.sol`)
- Periodic reward distribution to DAO members
- Snapshot-based voting power calculations
- **Key Functions:**
  - `createEpoch(...)` - Create distribution epoch
  - `claimReward(uint256 epochId, address member)` - Claim rewards

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Hardhat
- Private key for deployment

### Installation

```bash
cd nyigba-backend
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Fill in your environment variables:
- `PRIVATE_KEY` - Your deployment private key
- `BASE_SEPOLIA_RPC_URL` - Base Sepolia RPC URL
- `BASESCAN_API_KEY` - For contract verification

### Compilation

```bash
npm run compile
```

### Testing

```bash
npm run test
```

### Deployment

```bash
# Deploy to Base Sepolia
npm run deploy:base-sepolia

# Deploy to local network
npm run deploy:local
```

## 📊 Contract Interactions

### Frontend Integration

The contracts are designed to work seamlessly with the Next.js frontend:

```typescript
// Example: Claim a Nyigba name
const claimName = async (label: string) => {
  const tx = await nyigbaNames.claim(label);
  await tx.wait();
};

// Example: Mint NFT as artist
const mintNFT = async (metadata: MintData) => {
  const tx = await nyigbaNFT.mintTo(
    recipient,
    tokenURI,
    royaltyReceiver,
    royaltyFee,
    origin,
    language,
    category,
    nyigbaName
  );
  await tx.wait();
};
```

### Governance Flow

1. **Artist Application**: User submits application via `ArtistRegistry.requestArtistRole()`
2. **DAO Proposal**: Governance creates proposal to approve artist
3. **Voting**: Token holders vote on proposal
4. **Execution**: If passed, timelock executes `ArtistRegistry.approveArtist()`
5. **Artist Status**: User gains ARTIST_ROLE and can mint NFTs

### Royalty Flow

1. **Primary Sale**: NFT minted with RoyaltySplitter as receiver
2. **Secondary Sale**: Marketplace pays royalties to RoyaltySplitter
3. **Automatic Distribution**: Split between artist (85%) and treasury (15%)
4. **Treasury Rewards**: Periodic distribution to DAO members

## 🔧 Development

### Adding New Contracts

1. Create contract in `contracts/` directory
2. Add to deployment script in `scripts/deploy.ts`
3. Write tests in `test/` directory
4. Update frontend ABIs if needed

### Testing Strategy

- Unit tests for individual contract functions
- Integration tests for cross-contract interactions
- Governance flow testing
- Royalty distribution testing

### Security Considerations

- All contracts use OpenZeppelin battle-tested implementations
- Access controls with role-based permissions
- Reentrancy guards on state-changing functions
- Timelock for critical governance actions

## 📈 Deployment Addresses

After deployment, contract addresses will be saved to `deployment.json`. Update the frontend configuration with these addresses.

## 🤝 Contributing

1. Follow Solidity style guide
2. Write comprehensive tests
3. Update documentation
4. Test on local network before mainnet deployment

## 📄 License

MIT License - see LICENSE file for details.
