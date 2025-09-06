import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying BaseCommunityDAOWithStaking to Base Sepolia...");

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

  // Get the existing NyigbaToken address
  const NYIGBA_TOKEN_ADDRESS = "0x280235D9b223c4159377C9538Eae27C422b40125";
  console.log("Using existing NyigbaToken at:", NYIGBA_TOKEN_ADDRESS);

  // Deploy the new staking-enabled DAO
  console.log("\n🏛️ Deploying BaseCommunityDAOWithStaking...");
  const BaseCommunityDAOWithStaking = await ethers.getContractFactory("BaseCommunityDAOWithStaking");
  const stakingDAO = await BaseCommunityDAOWithStaking.deploy(NYIGBA_TOKEN_ADDRESS);
  await stakingDAO.waitForDeployment();
  const stakingDAOAddress = await stakingDAO.getAddress();
  console.log("✅ BaseCommunityDAOWithStaking deployed to:", stakingDAOAddress);

  // Test the deployment
  console.log("\n🧪 Testing deployment...");
  try {
    const stakingDAOContract = stakingDAO as any;
    const minimumStake = await stakingDAOContract.MINIMUM_STAKE();
    console.log("✅ Minimum stake:", ethers.formatEther(minimumStake), "ETH");
    
    const categories = await stakingDAOContract.getCategories();
    console.log("✅ Categories loaded:", categories.length, "categories");
    
    const treasuryBalance = await stakingDAOContract.getTreasuryBalance();
    console.log("✅ Initial treasury balance:", ethers.formatEther(treasuryBalance), "ETH");
    
    console.log("✅ Contract is working correctly!");
  } catch (error) {
    console.error("❌ Contract test failed:", error);
  }

  // Get minimum stake for summary
  let minimumStakeAmount = "0.005";
  try {
    const stakingDAOContract = stakingDAO as any;
    const stake = await stakingDAOContract.MINIMUM_STAKE();
    minimumStakeAmount = ethers.formatEther(stake);
  } catch (e) {
    console.log("Using default minimum stake value");
  }

  // Summary
  console.log("\n🎉 Deployment Summary:");
  console.log("================================");
  console.log(`BaseCommunityDAOWithStaking: ${stakingDAOAddress}`);
  console.log(`NyigbaToken (existing): ${NYIGBA_TOKEN_ADDRESS}`);
  console.log(`Minimum Stake: ${minimumStakeAmount} ETH`);
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
      BaseCommunityDAOWithStaking: stakingDAOAddress,
      NyigbaToken: NYIGBA_TOKEN_ADDRESS,
    },
    config: {
      minimumStake: minimumStakeAmount,
      votingPeriod: "7 days",
      quorumPercentage: "10%"
    }
  };

  console.log("\n📋 Deployment information:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verification instructions
  if (network.chainId === 84532n) {
    console.log("\n🔍 To verify contract on BaseScan:");
    console.log(`npx hardhat verify --network baseSepolia ${stakingDAOAddress} "${NYIGBA_TOKEN_ADDRESS}"`);
  }

  console.log("\n✨ Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Update frontend contract address in contracts.ts");
  console.log("2. Update the frontend ABI to include staking functions");
  console.log("3. Test the join DAO functionality with ETH staking");
  console.log(`4. Frontend should use: ${stakingDAOAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
