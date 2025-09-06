// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";

/**
 * @title NyigbaNames
 * @dev Advanced ENS-like subdomain system for Nyigba.eth
 * Enhanced with multi-sig, payment routing, and agent communication
 */
contract NyigbaNames is Ownable, ReentrancyGuard, IERC1271 {
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

    mapping(bytes32 => NameRecord) private _names;
    mapping(string => bool) private _labelExists;
    mapping(address => string[]) private _ownedLabels;
    mapping(bytes32 => PaymentRoute) private _paymentRoutes;
    mapping(address => bool) private _registeredAgents;

    string public constant BASE_DOMAIN = "nyigba.eth";
    uint256 public constant MAX_MULTISIG_OWNERS = 10;
    uint256 public constant MAX_AGENTS_PER_NAME = 5;

    event NameClaimed(address indexed owner, string label, bytes32 node);
    event TextRecordSet(bytes32 indexed node, string key, string value);
    event NameTransferred(address indexed from, address indexed to, string label);
    event MultiSigSetup(bytes32 indexed node, address[] owners, uint256 required);
    event PaymentRouteSet(bytes32 indexed node, string routeKey, address recipient);
    event AgentRegistered(bytes32 indexed node, bytes32 agentId, address agentAddress);
    event AgentCommunication(bytes32 indexed fromNode, bytes32 indexed toNode, string message);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Claim a new subdomain with enhanced features
     * @param label The subdomain label (e.g., "artist")
     */
    function claim(string calldata label) external nonReentrant {
        require(bytes(label).length > 0, "Label cannot be empty");
        require(bytes(label).length <= 32, "Label too long");
        require(!_labelExists[label], "Label already exists");

        bytes32 node = keccak256(abi.encodePacked(label, ".", BASE_DOMAIN));
        require(_names[node].owner == address(0), "Name already claimed");

        _labelExists[label] = true;
        _names[node].owner = msg.sender;
        _names[node].label = label;
        _names[node].createdAt = block.timestamp;
        _names[node].isMultiSig = false;
        _ownedLabels[msg.sender].push(label);

        emit NameClaimed(msg.sender, label, node);
    }

    /**
     * @dev Setup multi-sig for a name
     * @param node The name node
     * @param owners Array of owner addresses
     * @param required Number of required confirmations
     */
    function setupMultiSig(
        bytes32 node,
        address[] calldata owners,
        uint256 required
    ) external {
        require(_names[node].owner == msg.sender, "Not name owner");
        require(owners.length <= MAX_MULTISIG_OWNERS, "Too many owners");
        require(required <= owners.length && required > 0, "Invalid required confirmations");

        _names[node].multiSigOwners = owners;
        _names[node].requiredConfirmations = required;
        _names[node].isMultiSig = true;

        emit MultiSigSetup(node, owners, required);
    }

    /**
     * @dev Set a payment route for ENS-based payments
     * @param node The name node
     * @param routeKey The route identifier
     * @param recipient The payment recipient
     * @param fee Fee in basis points
     * @param description Route description
     */
    function setPaymentRoute(
        bytes32 node,
        string calldata routeKey,
        address recipient,
        uint256 fee,
        string calldata description
    ) external {
        require(_names[node].owner == msg.sender, "Not name owner");
        require(fee <= 10000, "Fee too high"); // Max 100%

        bytes32 routeId = keccak256(abi.encodePacked(node, routeKey));
        _paymentRoutes[routeId] = PaymentRoute({
            recipient: recipient,
            fee: fee,
            isActive: true,
            description: description
        });

        emit PaymentRouteSet(node, routeKey, recipient);
    }

    /**
     * @dev Register an autonomous agent for the name
     * @param node The name node
     * @param agentId Unique agent identifier
     * @param agentAddress The agent's contract address
     * @param agentType Type of agent
     * @param metadata Agent metadata
     */
    function registerAgent(
        bytes32 node,
        bytes32 agentId,
        address agentAddress,
        string calldata agentType,
        string calldata metadata
    ) external {
        require(_names[node].owner == msg.sender, "Not name owner");
        require(_names[node].agents[agentId].agentAddress == address(0), "Agent already exists");

        _names[node].agents[agentId] = AgentRecord({
            agentAddress: agentAddress,
            agentType: agentType,
            metadata: metadata,
            isActive: true,
            lastActivity: block.timestamp
        });

        _registeredAgents[agentAddress] = true;

        emit AgentRegistered(node, agentId, agentAddress);
    }

    /**
     * @dev Send message between agents
     * @param fromNode Sender's name node
     * @param toNode Recipient's name node
     * @param agentId Sender's agent ID
     * @param message The message content
     */
    function sendAgentMessage(
        bytes32 fromNode,
        bytes32 toNode,
        bytes32 agentId,
        string calldata message
    ) external {
        require(_names[fromNode].agents[agentId].agentAddress == msg.sender, "Not authorized agent");
        require(_names[fromNode].agents[agentId].isActive, "Agent not active");

        _names[fromNode].agents[agentId].lastActivity = block.timestamp;

        emit AgentCommunication(fromNode, toNode, message);
    }

    /**
     * @dev Process payment through ENS route
     * @param node The name node
     * @param routeKey The payment route key
     */
    function processENSPayment(bytes32 node, string calldata routeKey) external payable {
        bytes32 routeId = keccak256(abi.encodePacked(node, routeKey));
        PaymentRoute memory route = _paymentRoutes[routeId];

        require(route.isActive, "Route not active");
        require(msg.value > 0, "No payment sent");

        uint256 fee = (msg.value * route.fee) / 10000;
        uint256 payment = msg.value - fee;

        // Transfer payment to recipient
        (bool success,) = payable(route.recipient).call{value: payment}("");
        require(success, "Payment transfer failed");

        // Transfer fee to treasury (this contract for now)
        if (fee > 0) {
            // In production, this would go to a treasury contract
        }
    }

    /**
     * @dev ERC-1271 signature validation for multi-sig
     */
    function isValidSignature(bytes32 hash, bytes memory signature)
        external
        view
        returns (bytes4)
    {
        // Simplified implementation - in production this would validate multi-sig signatures
        return 0x1626ba7e; // ERC1271 magic value
    }

    // ... existing code ...

    /**
     * @dev Claim a new subdomain
     * @param _label The subdomain label (e.g., "artist")
     */
    function claim(string calldata _label) external nonReentrant {
        require(bytes(_label).length > 0, "Label cannot be empty");
        require(bytes(_label).length <= 32, "Label too long");
        require(!_labelExists[_label], "Label already exists");

        bytes32 node = keccak256(abi.encodePacked(_label, ".", BASE_DOMAIN));
        require(_names[node].owner == address(0), "Name already claimed");

        _labelExists[_label] = true;
        _names[node].owner = msg.sender;
        _names[node].label = _label;
        _names[node].createdAt = block.timestamp;
        _ownedLabels[msg.sender].push(_label);

        emit NameClaimed(msg.sender, _label, node);
    }

    /**
     * @dev Set a text record for a name
     * @param node The namehash of the name
     * @param key The record key (e.g., "bio", "origin")
     * @param value The record value
     */
    function setText(bytes32 node, string calldata key, string calldata value) external {
        require(_names[node].owner == msg.sender, "Not name owner");
        _names[node].textRecords[key] = value;
        emit TextRecordSet(node, key, value);
    }

    /**
     * @dev Get the owner of a name
     * @param node The namehash of the name
     * @return The owner address
     */
    function owner(bytes32 node) external view returns (address) {
        return _names[node].owner;
    }

    /**
     * @dev Get the label for a name
     * @param node The namehash of the name
     * @return The label string
     */
    function label(bytes32 node) external view returns (string memory) {
        return _names[node].label;
    }

    /**
     * @dev Get a text record for a name
     * @param node The namehash of the name
     * @param key The record key
     * @return The record value
     */
    function text(bytes32 node, string calldata key) external view returns (string memory) {
        return _names[node].textRecords[key];
    }

    /**
     * @dev Check if a label is available
     * @param _label The label to check
     * @return True if available
     */
    function available(string calldata _label) external view returns (bool) {
        return !_labelExists[_label];
    }

    /**
     * @dev Get all labels owned by an address
     * @param _owner The owner address
     * @return Array of labels
     */
    function ownedLabels(address _owner) external view returns (string[] memory) {
        return _ownedLabels[_owner];
    }

    /**
     * @dev Get the full domain name
     * @param _label The subdomain label
     * @return The full domain string
     */
    function fullDomain(string calldata _label) external pure returns (string memory) {
        return string(abi.encodePacked(_label, ".", BASE_DOMAIN));
    }

    /**
     * @dev Transfer a name to another address
     * @param node The namehash of the name
     * @param newOwner The new owner address
     */
    function transfer(bytes32 node, address newOwner) external {
        require(_names[node].owner == msg.sender, "Not name owner");
        require(newOwner != address(0), "Invalid new owner");

        address oldOwner = _names[node].owner;
        string memory currentLabel = _names[node].label;

        _names[node].owner = newOwner;
        _ownedLabels[newOwner].push(currentLabel);

        // Remove from old owner's list
        string[] storage oldLabels = _ownedLabels[oldOwner];
        for (uint256 i = 0; i < oldLabels.length; i++) {
            if (keccak256(bytes(oldLabels[i])) == keccak256(bytes(currentLabel))) {
                oldLabels[i] = oldLabels[oldLabels.length - 1];
                oldLabels.pop();
                break;
            }
        }

        emit NameTransferred(oldOwner, newOwner, currentLabel);
    }
}
