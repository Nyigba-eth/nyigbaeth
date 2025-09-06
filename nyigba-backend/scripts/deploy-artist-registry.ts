import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ArtistRegistry contract to Base Sepolia...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy ArtistRegistry
  console.log("Deploying ArtistRegistry...");
  const ArtistRegistry = await ethers.getContractFactory("ArtistRegistry");
  const artistRegistry = await ArtistRegistry.deploy();
  await artistRegistry.waitForDeployment();
  
  const artistRegistryAddress = await artistRegistry.getAddress();
  console.log("ArtistRegistry deployed to:", artistRegistryAddress);

  // Verify deployment
  console.log("Verifying deployment...");
  const code = await ethers.provider.getCode(artistRegistryAddress);
  if (code === "0x") {
    throw new Error("Contract deployment failed - no code at address");
  }
  
  console.log("✅ ArtistRegistry successfully deployed!");
  console.log("Contract Address:", artistRegistryAddress);
  console.log("Network:", await ethers.provider.getNetwork());
  
  // Test basic functionality
  console.log("\nTesting basic contract functionality...");
  try {
    const artistCount = await artistRegistry.getArtistCount();
    console.log("Initial artist count:", artistCount.toString());
    
    const pendingCount = await artistRegistry.getPendingApplicationsCount();
    console.log("Initial pending applications:", pendingCount.toString());
    
    console.log("✅ Contract is functional!");
  } catch (error) {
    console.error("⚠️ Error testing contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
