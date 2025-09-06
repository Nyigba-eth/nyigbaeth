import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Base-optimized Nyigba.eth contracts...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy BaseCulturalNFT
  console.log("Deploying BaseCulturalNFT...");
  const BaseCulturalNFT = await ethers.getContractFactory("BaseCulturalNFT");
  const culturalNFT = await BaseCulturalNFT.deploy();
  await culturalNFT.waitForDeployment();
  console.log("BaseCulturalNFT deployed to:", await culturalNFT.getAddress());

  // Deploy TimelockController for DAO
  console.log("Deploying TimelockController...");
  const TimelockController = await ethers.getContractFactory("TimelockController");
  const timelock = await TimelockController.deploy(
    3600, // 1 hour delay
    [], // proposers
    [], // executors
    deployer.address // admin
  );
  await timelock.waitForDeployment();
  console.log("TimelockController deployed to:", await timelock.getAddress());

  // Deploy Governance Token (simplified ERC20 for voting)
  console.log("Deploying Governance Token...");
  const NyigbaToken = await ethers.getContractFactory("NyigbaToken");
  const govToken = await NyigbaToken.deploy();
  await govToken.waitForDeployment();
  console.log("Governance Token deployed to:", await govToken.getAddress());

  // Deploy BaseCommunityDAO
  console.log("Deploying BaseCommunityDAO...");
  const BaseCommunityDAO = await ethers.getContractFactory("BaseCommunityDAO");
  const communityDAO = await BaseCommunityDAO.deploy(
    await govToken.getAddress()
  );
  await communityDAO.waitForDeployment();
  console.log("BaseCommunityDAO deployed to:", await communityDAO.getAddress());

  // Deploy BaseCulturalMarketplace
  console.log("Deploying BaseCulturalMarketplace...");
  const BaseCulturalMarketplace = await ethers.getContractFactory("BaseCulturalMarketplace");
  const marketplace = await BaseCulturalMarketplace.deploy(deployer.address);
  await marketplace.waitForDeployment();
  console.log("BaseCulturalMarketplace deployed to:", await marketplace.getAddress());

  // Deploy BaseRoyaltySplitter
  console.log("Deploying BaseRoyaltySplitter...");
  const BaseRoyaltySplitter = await ethers.getContractFactory("BaseRoyaltySplitter");
  const royaltySplitter = await BaseRoyaltySplitter.deploy();
  await royaltySplitter.waitForDeployment();
  console.log("BaseRoyaltySplitter deployed to:", await royaltySplitter.getAddress());

  // Setup DAO permissions
  console.log("Setting up DAO permissions...");
  const timelockContract = timelock as any;
  await timelockContract.grantRole(await timelockContract.PROPOSER_ROLE(), await communityDAO.getAddress());
  await timelockContract.grantRole(await timelockContract.EXECUTOR_ROLE(), await communityDAO.getAddress());
  await timelockContract.revokeRole(await timelockContract.TIMELOCK_ADMIN_ROLE(), deployer.address);

  console.log("\n=== Deployment Summary ===");
  console.log("BaseCulturalNFT:", await culturalNFT.getAddress());
  console.log("TimelockController:", await timelock.getAddress());
  console.log("GovernanceToken:", await govToken.getAddress());
  console.log("BaseCommunityDAO:", await communityDAO.getAddress());
  console.log("BaseCulturalMarketplace:", await marketplace.getAddress());
  console.log("BaseRoyaltySplitter:", await royaltySplitter.getAddress());

  // Verify contracts on Base Sepolia (if supported)
  if (process.env.BASESCAN_API_KEY) {
    console.log("\nVerifying contracts on Base Sepolia...");
    // Verification commands would go here
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
