import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting Base Sepolia Nyigba.eth deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "(Chain ID:", network.chainId, ")");

  // Check if we're on Base Sepolia
  if (network.chainId !== 84532n) {
    console.warn("⚠️  Warning: Not deploying to Base Sepolia testnet");
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  // Deploy contracts
  let baseSepoliaNyigbaNames: any;
  let nyigbaToken: any;
  let artistRegistry: any;
  let baseCulturalNFT: any;
  let baseRoyaltySplitter: any;
  let baseCulturalMarketplace: any;
  let baseCommunityDAO: any;

  // 1. Deploy Base Sepolia Nyigba Names (ENS for Base)
  console.log("\n📝 Deploying BaseSepoliaNyigbaNames...");
  const BaseSepoliaNyigbaNames = await ethers.getContractFactory("BaseSepoliaNyigbaNames");
  baseSepoliaNyigbaNames = await BaseSepoliaNyigbaNames.deploy();
  await baseSepoliaNyigbaNames.waitForDeployment();
  const namesAddress = await baseSepoliaNyigbaNames.getAddress();
  console.log("✅ BaseSepoliaNyigbaNames deployed to:", namesAddress);

  // 2. Deploy Nyigba Token (Governance)
  console.log("\n🪙 Deploying NyigbaToken...");
  const NyigbaToken = await ethers.getContractFactory("NyigbaToken");
  nyigbaToken = await NyigbaToken.deploy();
  await nyigbaToken.waitForDeployment();
  const tokenAddress = await nyigbaToken.getAddress();
  console.log("✅ NyigbaToken deployed to:", tokenAddress);

  // 3. Deploy Artist Registry
  console.log("\n🎨 Deploying ArtistRegistry...");
  const ArtistRegistry = await ethers.getContractFactory("ArtistRegistry");
  artistRegistry = await ArtistRegistry.deploy();
  await artistRegistry.waitForDeployment();
  const artistRegistryAddress = await artistRegistry.getAddress();
  console.log("✅ ArtistRegistry deployed to:", artistRegistryAddress);

  // 4. Deploy Base Cultural NFT
  console.log("\n🖼️ Deploying BaseCulturalNFT...");
  const BaseCulturalNFT = await ethers.getContractFactory("BaseCulturalNFT");
  baseCulturalNFT = await BaseCulturalNFT.deploy();
  await baseCulturalNFT.waitForDeployment();
  const nftAddress = await baseCulturalNFT.getAddress();
  console.log("✅ BaseCulturalNFT deployed to:", nftAddress);

  // 5. Deploy Base Royalty Splitter
  console.log("\n💰 Deploying BaseRoyaltySplitter...");
  const BaseRoyaltySplitter = await ethers.getContractFactory("BaseRoyaltySplitter");
  baseRoyaltySplitter = await BaseRoyaltySplitter.deploy();
  await baseRoyaltySplitter.waitForDeployment();
  const royaltyAddress = await baseRoyaltySplitter.getAddress();
  console.log("✅ BaseRoyaltySplitter deployed to:", royaltyAddress);

  // 6. Deploy Base Cultural Marketplace
  console.log("\n🏪 Deploying BaseCulturalMarketplace...");
  const BaseCulturalMarketplace = await ethers.getContractFactory("BaseCulturalMarketplace");
  baseCulturalMarketplace = await BaseCulturalMarketplace.deploy(deployer.address);
  await baseCulturalMarketplace.waitForDeployment();
  const marketplaceAddress = await baseCulturalMarketplace.getAddress();
  console.log("✅ BaseCulturalMarketplace deployed to:", marketplaceAddress);

  // 7. Deploy Base Community DAO
  console.log("\n🏛️ Deploying BaseCommunityDAO...");
  const BaseCommunityDAO = await ethers.getContractFactory("BaseCommunityDAO");
  baseCommunityDAO = await BaseCommunityDAO.deploy(tokenAddress);
  await baseCommunityDAO.waitForDeployment();
  const daoAddress = await baseCommunityDAO.getAddress();
  console.log("✅ BaseCommunityDAO deployed to:", daoAddress);

  // Initialize contracts with Base Sepolia specific settings
  console.log("\n⚙️ Initializing contracts...");

  // Set up some example subdomains
  if (baseSepoliaNyigbaNames) {
    console.log("🔧 Setting up example subdomains...");
    
    // Register some test subdomains for the deployer
    try {
      const tx1 = await baseSepoliaNyigbaNames.claimSubdomain("admin", {
        value: ethers.parseEther("0.001")
      });
      await tx1.wait();
      console.log("✅ Registered admin.nyigba-base.eth");

      const tx2 = await baseSepoliaNyigbaNames.claimSubdomain("test", {
        value: ethers.parseEther("0.001")
      });
      await tx2.wait();
      console.log("✅ Registered test.nyigba-base.eth");

    } catch (error) {
      console.log("ℹ️ Subdomain registration skipped (may already exist)");
    }
  }

  // Summary
  console.log("\n🎉 Deployment Summary:");
  console.log("================================");
  console.log(`BaseSepoliaNyigbaNames: ${namesAddress}`);
  console.log(`NyigbaToken: ${tokenAddress}`);
  console.log(`ArtistRegistry: ${artistRegistryAddress}`);
  console.log(`BaseCulturalNFT: ${nftAddress}`);
  console.log(`BaseRoyaltySplitter: ${royaltyAddress}`);
  console.log(`BaseCulturalMarketplace: ${marketplaceAddress}`);
  console.log(`BaseCommunityDAO: ${daoAddress}`);
  console.log("================================");

  // Save deployment info
  const deploymentInfo = {
    network: {
      name: network.name,
      chainId: network.chainId.toString(),
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      BaseSepoliaNyigbaNames: namesAddress,
      NyigbaToken: tokenAddress,
      ArtistRegistry: artistRegistryAddress,
      BaseCulturalNFT: nftAddress,
      BaseRoyaltySplitter: royaltyAddress,
      BaseCulturalMarketplace: marketplaceAddress,
      BaseCommunityDAO: daoAddress,
    },
  };

  console.log("\n📋 Deployment information saved!");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verification instructions
  if (network.chainId === 84532n) {
    console.log("\n🔍 To verify contracts on BaseScan:");
    console.log(`npx hardhat verify --network baseSepolia ${namesAddress}`);
    console.log(`npx hardhat verify --network baseSepolia ${tokenAddress}`);
    console.log(`npx hardhat verify --network baseSepolia ${artistRegistryAddress}`);
    console.log(`npx hardhat verify --network baseSepolia ${nftAddress}`);
    console.log(`npx hardhat verify --network baseSepolia ${royaltyAddress}`);
    console.log(`npx hardhat verify --network baseSepolia ${marketplaceAddress} "${deployer.address}"`);
    console.log(`npx hardhat verify --network baseSepolia ${daoAddress} "${tokenAddress}"`);
  }

  console.log("\n✨ Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
