import { ethers } from "hardhat";

async function main() {
  console.log("🔗 Connecting to deployed contracts on Base Sepolia...");
  
  // Contract address from your deployment
  const baseSepoliaNyigbaNames = "0x516A5dd0bDCf2D711188Daa54f7156C84f89286C";
  
  // Get the contract factory and attach to deployed address
  const BaseSepoliaNyigbaNames = await ethers.getContractFactory("BaseSepoliaNyigbaNames");
  const contract = BaseSepoliaNyigbaNames.attach(baseSepoliaNyigbaNames);
  
  console.log("✅ Connected to BaseSepoliaNyigbaNames at:", baseSepoliaNyigbaNames);
  
  try {
    // Test basic contract functionality
    console.log("\n📋 Contract Information:");
    
    // Get base domain
    const baseDomain = await contract.BASE_DOMAIN();
    console.log("🌐 Base Domain:", baseDomain);
    
    // Get registration fee
    const config = await contract.config();
    console.log("💰 Registration Fee:", ethers.formatEther(config.registrationFee), "ETH");
    console.log("💰 Renewal Fee:", ethers.formatEther(config.renewalFee), "ETH");
    console.log("🔢 Premium Multiplier:", config.premiumMultiplier.toString());
    
    // Check availability of a test subdomain
    const testLabel = "test";
    const [available, fee, reason] = await contract.checkAvailability(testLabel);
    console.log(`\n🔍 Subdomain "${testLabel}" availability:`);
    console.log("   Available:", available);
    console.log("   Fee:", ethers.formatEther(fee), "ETH");
    console.log("   Reason:", reason);
    
    // Get full domain name
    const fullDomain = await contract.fullDomain(testLabel);
    console.log("   Full Domain:", fullDomain);
    
    console.log("\n🎉 Contract is working perfectly!");
    console.log("🌍 Users can now claim subdomains on Base Sepolia!");
    
  } catch (error) {
    console.error("❌ Error testing contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
