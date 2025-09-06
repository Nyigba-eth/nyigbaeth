// BaseSepoliaNyigbaNames contract ABI - Main functions only
export const BASE_SEPOLIA_NYIGBA_NAMES_ABI = [
  // Read functions
  {
    "inputs": [],
    "name": "BASE_DOMAIN",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "config",
    "outputs": [
      {"internalType": "uint256", "name": "registrationFee", "type": "uint256"},
      {"internalType": "uint256", "name": "renewalFee", "type": "uint256"},
      {"internalType": "uint256", "name": "premiumMultiplier", "type": "uint256"},
      {"internalType": "bool", "name": "requiresApproval", "type": "bool"},
      {"internalType": "uint256", "name": "minLength", "type": "uint256"},
      {"internalType": "uint256", "name": "maxLength", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "label", "type": "string"}],
    "name": "checkAvailability",
    "outputs": [
      {"internalType": "bool", "name": "available", "type": "bool"},
      {"internalType": "uint256", "name": "fee", "type": "uint256"},
      {"internalType": "string", "name": "reason", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_label", "type": "string"}],
    "name": "fullDomain",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "label", "type": "string"}],
    "name": "getSubdomainInfo",
    "outputs": [
      {"internalType": "address", "name": "ownerAddress", "type": "address"},
      {"internalType": "uint256", "name": "expiryDate", "type": "uint256"},
      {"internalType": "bool", "name": "isPremium", "type": "bool"},
      {"internalType": "bool", "name": "isExpired", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_owner", "type": "address"}],
    "name": "getOwnedSubdomains",
    "outputs": [
      {"internalType": "string[]", "name": "labels", "type": "string[]"},
      {"internalType": "uint256[]", "name": "expiryDates", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "node", "type": "bytes32"},
      {"internalType": "string", "name": "key", "type": "string"}
    ],
    "name": "text",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "node", "type": "bytes32"}],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Write functions
  {
    "inputs": [{"internalType": "string", "name": "label", "type": "string"}],
    "name": "claimSubdomain",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "label", "type": "string"}],
    "name": "renewSubdomain",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "node", "type": "bytes32"},
      {"internalType": "string", "name": "key", "type": "string"},
      {"internalType": "string", "name": "value", "type": "string"}
    ],
    "name": "setText",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "label", "type": "string"},
      {"indexed": false, "internalType": "bytes32", "name": "node", "type": "bytes32"},
      {"indexed": false, "internalType": "uint256", "name": "expiryDate", "type": "uint256"}
    ],
    "name": "NameClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "label", "type": "string"},
      {"indexed": false, "internalType": "bytes32", "name": "node", "type": "bytes32"},
      {"indexed": false, "internalType": "uint256", "name": "newExpiryDate", "type": "uint256"}
    ],
    "name": "NameRenewed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "node", "type": "bytes32"},
      {"indexed": false, "internalType": "string", "name": "key", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "value", "type": "string"}
    ],
    "name": "TextRecordSet",
    "type": "event"
  }
] as const;
