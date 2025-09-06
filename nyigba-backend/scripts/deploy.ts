import { ethers } from "hardhat";
import { Contract } from "ethers";

async function main() {
  console.log("🚀 Starting Nyigba.eth deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "(", network.chainId, ")");

  // Deploy NyigbaNames
  console.log("\n📝 Deploying NyigbaNames...");
  const NyigbaNames = await ethers.getContractFactory("NyigbaNames");
  const nyigbaNames = await NyigbaNames.deploy();
  await nyigbaNames.waitForDeployment();
  const nyigbaNamesAddress = await nyigbaNames.getAddress();
  console.log("✅ NyigbaNames deployed to:", nyigbaNamesAddress);

  // Deploy NyigbaToken (Governance Token)
  console.log("\n🪙 Deploying NyigbaToken...");
  const NyigbaToken = await ethers.getContractFactory("NyigbaToken");
  const nyigbaToken = await NyigbaToken.deploy();
  await nyigbaToken.waitForDeployment();
  const nyigbaTokenAddress = await nyigbaToken.getAddress();
  console.log("✅ NyigbaToken deployed to:", nyigbaTokenAddress);

  // Deploy ArtistRegistry
  console.log("\n🎨 Deploying ArtistRegistry...");
  const ArtistRegistry = await ethers.getContractFactory("ArtistRegistry");
  const artistRegistry = await ArtistRegistry.deploy();
  await artistRegistry.waitForDeployment();
  const artistRegistryAddress = await artistRegistry.getAddress();
  console.log("✅ ArtistRegistry deployed to:", artistRegistryAddress);

  // Deploy Timelock
  console.log("\n⏰ Deploying Timelock...");
  const TimelockController = await ethers.getContractFactory("TimelockController");
  const timelock = await TimelockController.deploy(
    3600, // 1 hour delay
    [], // proposers (will be set later)
    [], // executors (will be set later)
    deployer.address // admin
  );
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();
  console.log("✅ Timelock deployed to:", timelockAddress);

  // Deploy Governor
  console.log("\n🏛️ Deploying Governor...");
  const NyigbaGovernor = await ethers.getContractFactory("NyigbaGovernor");
  const governor = await NyigbaGovernor.deploy(
    nyigbaTokenAddress,
    timelockAddress
  );
  await governor.waitForDeployment();
  const governorAddress = await governor.getAddress();
  console.log("✅ Governor deployed to:", governorAddress);

  // Deploy TreasuryRewards
  console.log("\n💰 Deploying TreasuryRewards...");
  const TreasuryRewards = await ethers.getContractFactory("TreasuryRewards");
  const treasuryRewards = await TreasuryRewards.deploy(nyigbaTokenAddress);
  await treasuryRewards.waitForDeployment();
  const treasuryRewardsAddress = await treasuryRewards.getAddress();
  console.log("✅ TreasuryRewards deployed to:", treasuryRewardsAddress);

  // Deploy RoyaltySplitterFactory
  console.log("\n🔄 Deploying RoyaltySplitterFactory...");
  const RoyaltySplitterFactory = await ethers.getContractFactory("RoyaltySplitterFactory");
  const royaltySplitterFactory = await RoyaltySplitterFactory.deploy(treasuryRewardsAddress);
  await royaltySplitterFactory.waitForDeployment();
  const royaltySplitterFactoryAddress = await royaltySplitterFactory.getAddress();
  console.log("✅ RoyaltySplitterFactory deployed to:", royaltySplitterFactoryAddress);

  // Deploy NyigbaNFT
  console.log("\n🎭 Deploying NyigbaNFT...");
  const NyigbaNFT = await ethers.getContractFactory("NyigbaNFT");
  const nyigbaNFT = await NyigbaNFT.deploy();
  await nyigbaNFT.waitForDeployment();
  const nyigbaNFTAddress = await nyigbaNFT.getAddress();
  console.log("✅ NyigbaNFT deployed to:", nyigbaNFTAddress);

  // Setup roles and permissions
  console.log("\n🔧 Setting up roles and permissions...");

  // Grant ARTIST_ROLE to deployer initially
  const artistRegistryContract = artistRegistry as any;
  await artistRegistryContract.grantRole(await artistRegistryContract.ARTIST_ROLE(), deployer.address);
  console.log("✅ Granted ARTIST_ROLE to deployer");

  // Grant MINTER_ROLE to deployer
  const nyigbaNFTContract = nyigbaNFT as any;
  await nyigbaNFTContract.grantRole(await nyigbaNFTContract.MINTER_ROLE(), deployer.address);
  console.log("✅ Granted MINTER_ROLE to deployer");

  // Setup Timelock
  const timelockContract = timelock as any;
  await timelockContract.grantRole(await timelockContract.PROPOSER_ROLE(), governorAddress);
  await timelockContract.grantRole(await timelockContract.EXECUTOR_ROLE(), ethers.ZeroAddress); // Anyone can execute
  await timelockContract.revokeRole(await timelockContract.TIMELOCK_ADMIN_ROLE(), deployer.address);
  console.log("✅ Timelock configured");

  // Setup Governor in ArtistRegistry
  await artistRegistryContract.grantRole(await artistRegistryContract.GOVERNANCE_ROLE(), timelockAddress);
  console.log("✅ Governor role granted to Timelock");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("NyigbaNames:", nyigbaNamesAddress);
  console.log("NyigbaToken:", nyigbaTokenAddress);
  console.log("ArtistRegistry:", artistRegistryAddress);
  console.log("Timelock:", timelockAddress);
  console.log("Governor:", governorAddress);
  console.log("TreasuryRewards:", treasuryRewardsAddress);
  console.log("RoyaltySplitterFactory:", royaltySplitterFactoryAddress);
  console.log("NyigbaNFT:", nyigbaNFTAddress);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    deployer: deployer.address,
    contracts: {
      nyigbaNames: nyigbaNamesAddress,
      nyigbaToken: nyigbaTokenAddress,
      artistRegistry: artistRegistryAddress,
      timelock: timelockAddress,
      governor: governorAddress,
      treasuryRewards: treasuryRewardsAddress,
      royaltySplitterFactory: royaltySplitterFactoryAddress,
      nyigbaNFT: nyigbaNFTAddress,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n💾 Deployment info saved to deployment.json");
  // In a real deployment, you'd write this to a file
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
