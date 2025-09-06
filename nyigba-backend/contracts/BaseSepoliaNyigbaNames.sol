// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";

/**
 * @title BaseSepoliaNyigbaNames
 * @dev Base Sepolia-optimized subdomain system for Nyigba platform
 * Creates subdomains under nyigba-base.eth for Base Sepolia testnet
 * Optimized for Base's low gas costs and 2-second block times
 */
contract BaseSepoliaNyigbaNames is Ownable, ReentrancyGuard, IERC1271 {
    struct NameRecord {
        address owner;
        address[] multiSigOwners;
        uint256 requiredConfirmations;
        string label;
        mapping(string => string) textRecords;
        mapping(string => address) paymentRoutes;
        mapping(bytes32 => AgentRecord) agents;
        uint256 createdAt;
        bool isMultiSig;
        bool isPremium;
        uint256 expiryDate;
    }

    struct AgentRecord {
        address agentAddress;
        string agentType; // "autonomous", "coordinator", "payment"
        string metadata;
        bool isActive;
        uint256 lastActivity;
    }

    struct PaymentRoute {
        address recipient;
        uint256 fee; // in basis points
        bool isActive;
        string description;
    }

    struct SubdomainConfig {
        uint256 registrationFee;
        uint256 renewalFee;
        uint256 premiumMultiplier;
        bool requiresApproval;
        uint256 minLength;
        uint256 maxLength;
    }

    mapping(bytes32 => NameRecord) private _names;
    mapping(string => bool) private _labelExists;
    mapping(address => string[]) private _ownedLabels;
    mapping(bytes32 => PaymentRoute) private _paymentRoutes;
    mapping(address => bool) private _registeredAgents;
    mapping(string => bool) private _reservedNames;

    // Base Sepolia specific configuration
    string public constant BASE_DOMAIN = "nyigba-base.eth"; // For Base Sepolia testnet
    uint256 public constant MAX_MULTISIG_OWNERS = 10;
    uint256 public constant MAX_AGENTS_PER_NAME = 5;
    uint256 public constant REGISTRATION_PERIOD = 365 days;
    uint256 public constant GRACE_PERIOD = 30 days;
    
    // Base network optimizations
    uint256 public constant BASE_BLOCK_TIME = 2; // ~2 second block time
    uint256 public constant LOW_GAS_OPTIMIZATION = 21000; // Base gas limit per transaction

    SubdomainConfig public config;

    event NameClaimed(address indexed owner, string label, bytes32 node, uint256 expiryDate);
    event NameRenewed(address indexed owner, string label, bytes32 node, uint256 newExpiryDate);
    event TextRecordSet(bytes32 indexed node, string key, string value);
    event NameTransferred(address indexed from, address indexed to, string label);
    event MultiSigSetup(bytes32 indexed node, address[] owners, uint256 required);
    event PaymentRouteSet(bytes32 indexed node, string routeKey, address recipient);
    event AgentRegistered(bytes32 indexed node, bytes32 agentId, address agentAddress);
    event AgentCommunication(bytes32 indexed fromNode, bytes32 indexed toNode, string message);
    event SubdomainConfigUpdated(SubdomainConfig newConfig);
    event NameExpired(bytes32 indexed node, string label);

    constructor() Ownable(msg.sender) {
        // Initialize with Base Sepolia-friendly configuration
        config = SubdomainConfig({
            registrationFee: 0.001 ether, // Very low fee for testnet
            renewalFee: 0.0005 ether,
            premiumMultiplier: 5,
            requiresApproval: false, // Open registration for testnet
            minLength: 3,
            maxLength: 32
        });

        // Reserve some important names
        _reservedNames["admin"] = true;
        _reservedNames["api"] = true;
        _reservedNames["www"] = true;
        _reservedNames["mail"] = true;
        _reservedNames["support"] = true;
    }

    /**
     * @dev Claim a new subdomain on Base Sepolia
     * @param label The subdomain label (e.g., "artist" -> "artist.nyigba-base.eth")
     */
    function claimSubdomain(string calldata label) external payable nonReentrant {
        require(bytes(label).length >= config.minLength, "Label too short");
        require(bytes(label).length <= config.maxLength, "Label too long");
        require(!_labelExists[label], "Label already exists");
        require(!_reservedNames[label], "Label is reserved");
        require(_isValidLabel(label), "Invalid label format");

        uint256 fee = _isPremiumName(label) ? 
            config.registrationFee * config.premiumMultiplier : 
            config.registrationFee;
        
        require(msg.value >= fee, "Insufficient payment");

        bytes32 node = keccak256(abi.encodePacked(label, ".", BASE_DOMAIN));
        require(_names[node].owner == address(0), "Name already claimed");

        uint256 expiryDate = block.timestamp + REGISTRATION_PERIOD;

        _labelExists[label] = true;
        _names[node].owner = msg.sender;
        _names[node].label = label;
        _names[node].createdAt = block.timestamp;
        _names[node].expiryDate = expiryDate;
        _names[node].isMultiSig = false;
        _names[node].isPremium = _isPremiumName(label);
        _ownedLabels[msg.sender].push(label);

        // Refund excess payment
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }

        emit NameClaimed(msg.sender, label, node, expiryDate);
    }

    /**
     * @dev Renew a subdomain registration
     * @param label The subdomain label to renew
     */
    function renewSubdomain(string calldata label) external payable nonReentrant {
        bytes32 node = keccak256(abi.encodePacked(label, ".", BASE_DOMAIN));
        require(_names[node].owner != address(0), "Name not registered");
        
        uint256 fee = _names[node].isPremium ? 
            config.renewalFee * config.premiumMultiplier : 
            config.renewalFee;
        
        require(msg.value >= fee, "Insufficient payment");

        // Can renew even if expired (within grace period)
        require(
            block.timestamp <= _names[node].expiryDate + GRACE_PERIOD,
            "Name expired beyond grace period"
        );

        uint256 newExpiryDate = _names[node].expiryDate > block.timestamp ?
            _names[node].expiryDate + REGISTRATION_PERIOD :
            block.timestamp + REGISTRATION_PERIOD;

        _names[node].expiryDate = newExpiryDate;

        // Refund excess payment
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }

        emit NameRenewed(msg.sender, label, node, newExpiryDate);
    }

    /**
     * @dev Set text record for a subdomain
     * @param node The namehash of the domain
     * @param key The record key
     * @param value The record value
     */
    function setText(bytes32 node, string calldata key, string calldata value) external {
        require(_names[node].owner == msg.sender, "Not name owner");
        require(block.timestamp <= _names[node].expiryDate, "Name expired");

        _names[node].textRecords[key] = value;
        emit TextRecordSet(node, key, value);
    }

    /**
     * @dev Get text record for a subdomain
     * @param node The namehash of the domain
     * @param key The record key
     * @return The record value
     */
    function text(bytes32 node, string calldata key) external view returns (string memory) {
        return _names[node].textRecords[key];
    }

    /**
     * @dev Get the owner of a subdomain
     * @param node The namehash of the domain
     * @return The owner address
     */
    function owner(bytes32 node) external view returns (address) {
        if (block.timestamp > _names[node].expiryDate + GRACE_PERIOD) {
            return address(0); // Expired
        }
        return _names[node].owner;
    }

    /**
     * @dev Get subdomain info including expiry
     * @param label The subdomain label
     * @return ownerAddress The owner address
     * @return expiryDate The expiry timestamp
     * @return isPremium Whether it's a premium name
     */
    function getSubdomainInfo(string calldata label) external view returns (
        address ownerAddress,
        uint256 expiryDate,
        bool isPremium,
        bool isExpired
    ) {
        bytes32 node = keccak256(abi.encodePacked(label, ".", BASE_DOMAIN));
        NameRecord storage nameRecord = _names[node];
        
        return (
            nameRecord.owner,
            nameRecord.expiryDate,
            nameRecord.isPremium,
            block.timestamp > nameRecord.expiryDate
        );
    }

    /**
     * @dev Get available subdomains for an address
     * @param _owner The owner address
     * @return labels Array of owned labels
     * @return expiryDates Array of corresponding expiry dates
     */
    function getOwnedSubdomains(address _owner) external view returns (
        string[] memory labels,
        uint256[] memory expiryDates
    ) {
        string[] memory ownedLabels = _ownedLabels[_owner];
        uint256[] memory expiries = new uint256[](ownedLabels.length);
        
        for (uint256 i = 0; i < ownedLabels.length; i++) {
            bytes32 node = keccak256(abi.encodePacked(ownedLabels[i], ".", BASE_DOMAIN));
            expiries[i] = _names[node].expiryDate;
        }
        
        return (ownedLabels, expiries);
    }

    /**
     * @dev Get the full domain name for Base Sepolia
     * @param _label The subdomain label
     * @return The full domain string
     */
    function fullDomain(string calldata _label) external pure returns (string memory) {
        return string(abi.encodePacked(_label, ".", BASE_DOMAIN));
    }

    /**
     * @dev Check if a subdomain is available for registration
     * @param label The subdomain label
     * @return available Whether the subdomain is available
     * @return fee The registration fee required
     */
    function checkAvailability(string calldata label) external view returns (
        bool available,
        uint256 fee,
        string memory reason
    ) {
        if (bytes(label).length < config.minLength) {
            return (false, 0, "Label too short");
        }
        if (bytes(label).length > config.maxLength) {
            return (false, 0, "Label too long");
        }
        if (_reservedNames[label]) {
            return (false, 0, "Label is reserved");
        }
        if (_labelExists[label]) {
            return (false, 0, "Label already exists");
        }
        if (!_isValidLabel(label)) {
            return (false, 0, "Invalid label format");
        }

        uint256 registrationFee = _isPremiumName(label) ? 
            config.registrationFee * config.premiumMultiplier : 
            config.registrationFee;

        return (true, registrationFee, "Available");
    }

    /**
     * @dev Update subdomain configuration (owner only)
     * @param newConfig New configuration parameters
     */
    function updateConfig(SubdomainConfig calldata newConfig) external onlyOwner {
        require(newConfig.minLength >= 1, "Min length too small");
        require(newConfig.maxLength <= 64, "Max length too large");
        require(newConfig.premiumMultiplier >= 1, "Invalid premium multiplier");
        
        config = newConfig;
        emit SubdomainConfigUpdated(newConfig);
    }

    /**
     * @dev Withdraw collected fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Add/remove reserved names (owner only)
     * @param name The name to reserve/unreserve
     * @param reserved Whether to reserve or unreserve
     */
    function setReservedName(string calldata name, bool reserved) external onlyOwner {
        _reservedNames[name] = reserved;
    }

    /**
     * @dev Clean up expired names (anyone can call)
     * @param labels Array of labels to clean up
     */
    function cleanupExpiredNames(string[] calldata labels) external {
        for (uint256 i = 0; i < labels.length; i++) {
            bytes32 node = keccak256(abi.encodePacked(labels[i], ".", BASE_DOMAIN));
            if (block.timestamp > _names[node].expiryDate + GRACE_PERIOD) {
                _labelExists[labels[i]] = false;
                emit NameExpired(node, labels[i]);
            }
        }
    }

    // Internal functions
    function _isValidLabel(string calldata label) internal pure returns (bool) {
        bytes memory labelBytes = bytes(label);
        
        for (uint256 i = 0; i < labelBytes.length; i++) {
            bytes1 char = labelBytes[i];
            // Allow a-z, 0-9, and hyphens (but not at start/end)
            if (!(
                (char >= 0x30 && char <= 0x39) || // 0-9
                (char >= 0x61 && char <= 0x7A) || // a-z
                (char == 0x2D && i > 0 && i < labelBytes.length - 1) // hyphen not at start/end
            )) {
                return false;
            }
        }
        return true;
    }

    function _isPremiumName(string calldata label) internal pure returns (bool) {
        bytes memory labelBytes = bytes(label);
        
        // Premium names: length <= 4 or common dictionary words
        if (labelBytes.length <= 4) {
            return true;
        }
        
        // Add more premium name logic here
        return false;
    }

    // ERC1271 implementation (for future multi-sig support)
    function isValidSignature(bytes32 /* hash */, bytes memory /* signature */) 
        external 
        pure 
        override 
        returns (bytes4 magicValue) 
    {
        // Basic implementation - extend for full multi-sig support
        return 0x1626ba7e;
    }
}
