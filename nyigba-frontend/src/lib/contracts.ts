// Contract addresses and configuration for Base Sepolia
export const CONTRACTS = {
  BASE_SEPOLIA_NYIGBA_NAMES: "0x516A5dd0bDCf2D711188Daa54f7156C84f89286C",
  NYIGBA_TOKEN: "0x280235D9b223c4159377C9538Eae27C422b40125", // Governance token
  ARTIST_REGISTRY: "0x6c107341Eae178Ec54166a6655D2C61EA04b7dd4", // Artist verification system
  BASE_CULTURAL_NFT: "0x1FAFEc572F3Af58243CCbC43E40A61dc39bfaae5", // Cultural heritage NFT contract
  BASE_ROYALTY_SPLITTER: "0xAC5EC56452E1A59D8200E26b1372D7A7Bfa96e52", // Royalty distribution
  BASE_CULTURAL_MARKETPLACE: "0x022ED93865976f91b9b261080ecf34F14AaA34E2", // NFT marketplace
  BASE_COMMUNITY_DAO: "0xD6799aF65B0598E326Ee1537E7607F019DF33f07", // Community governance DAO with ETH staking
} as const;

export const NETWORKS = {
  BASE_SEPOLIA: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://base-sepolia.blockscout.com"],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
  },
} as const;

export const CONTRACT_CONFIG = {
  REGISTRATION_FEE: "0.001", // ETH
  PREMIUM_FEE: "0.005", // ETH for premium names (≤4 chars)
  RENEWAL_FEE: "0.0005", // ETH
  BASE_DOMAIN: "nyigba-base.eth",
  REGISTRATION_PERIOD: 365, // days
  GRACE_PERIOD: 30, // days
} as const;
