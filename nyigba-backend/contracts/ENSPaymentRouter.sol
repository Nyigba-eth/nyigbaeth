// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";

/**
 * @title ENSPaymentRouter
 * @dev Advanced payment routing system using ENS names
 * Enables cross-border payments, rotating addresses, and agent-to-agent transactions
 */
contract ENSPaymentRouter is Ownable, ReentrancyGuard {
    struct PaymentChannel {
        address sender;
        address recipient;
        address ensContract;
        bytes32 nameNode;
        uint256 fee; // in basis points
        bool isActive;
        uint256 totalVolume;
        uint256 transactionCount;
    }

    struct AgentTransaction {
        bytes32 fromAgent;
        bytes32 toAgent;
        uint256 amount;
        string purpose;
        uint256 timestamp;
        bool executed;
    }

    mapping(bytes32 => PaymentChannel) public paymentChannels;
    mapping(address => bytes32[]) public userChannels;
    mapping(bytes32 => AgentTransaction[]) public agentTransactions;

    address public nyigbaNamesContract;
    uint256 public constant MAX_FEE = 500; // 5% max fee

    event PaymentChannelCreated(bytes32 indexed channelId, address indexed sender, bytes32 nameNode);
    event ENSPaymentProcessed(bytes32 indexed channelId, uint256 amount, uint256 fee);
    event AgentTransactionInitiated(bytes32 indexed fromAgent, bytes32 indexed toAgent, uint256 amount);
    event RotatingAddressUpdated(bytes32 indexed nameNode, address newAddress);

    constructor(address _nyigbaNamesContract) Ownable(msg.sender) {
        nyigbaNamesContract = _nyigbaNamesContract;
    }

    /**
     * @dev Create a payment channel for ENS-based payments
     * @param nameNode The ENS name node
     * @param recipient The payment recipient
     * @param fee Fee in basis points
     */
    function createPaymentChannel(
        bytes32 nameNode,
        address recipient,
        uint256 fee
    ) external returns (bytes32) {
        require(fee <= MAX_FEE, "Fee too high");
        require(recipient != address(0), "Invalid recipient");

        bytes32 channelId = keccak256(abi.encodePacked(msg.sender, nameNode, block.timestamp));

        paymentChannels[channelId] = PaymentChannel({
            sender: msg.sender,
            recipient: recipient,
            ensContract: nyigbaNamesContract,
            nameNode: nameNode,
            fee: fee,
            isActive: true,
            totalVolume: 0,
            transactionCount: 0
        });

        userChannels[msg.sender].push(channelId);

        emit PaymentChannelCreated(channelId, msg.sender, nameNode);
        return channelId;
    }

    /**
     * @dev Process payment through ENS channel
     * @param channelId The payment channel ID
     */
    function processENSPayment(bytes32 channelId) external payable nonReentrant {
        PaymentChannel storage channel = paymentChannels[channelId];
        require(channel.isActive, "Channel not active");
        require(msg.value > 0, "No payment sent");

        uint256 fee = (msg.value * channel.fee) / 10000;
        uint256 payment = msg.value - fee;

        channel.totalVolume += msg.value;
        channel.transactionCount++;

        // Transfer payment to recipient
        (bool success,) = payable(channel.recipient).call{value: payment}("");
        require(success, "Payment transfer failed");

        // Collect fee
        if (fee > 0) {
            // In production, distribute to network or treasury
        }

        emit ENSPaymentProcessed(channelId, msg.value, fee);
    }

    /**
     * @dev Agent-to-agent transaction
     * @param fromAgent Sender agent ID
     * @param toAgent Recipient agent ID
     * @param amount Transaction amount
     * @param purpose Transaction purpose
     */
    function initiateAgentTransaction(
        bytes32 fromAgent,
        bytes32 toAgent,
        uint256 amount,
        string calldata purpose
    ) external payable nonReentrant {
        require(msg.value >= amount, "Insufficient payment");

        AgentTransaction memory transaction = AgentTransaction({
            fromAgent: fromAgent,
            toAgent: toAgent,
            amount: amount,
            purpose: purpose,
            timestamp: block.timestamp,
            executed: false
        });

        agentTransactions[fromAgent].push(transaction);

        emit AgentTransactionInitiated(fromAgent, toAgent, amount);
    }

    /**
     * @dev Execute agent transaction (called by authorized agent)
     * @param fromAgent The sender agent
     * @param transactionIndex The transaction index
     * @param recipient The recipient address
     */
    function executeAgentTransaction(
        bytes32 fromAgent,
        uint256 transactionIndex,
        address recipient
    ) external nonReentrant {
        AgentTransaction storage transaction = agentTransactions[fromAgent][transactionIndex];
        require(!transaction.executed, "Transaction already executed");
        require(address(this).balance >= transaction.amount, "Insufficient contract balance");

        transaction.executed = true;

        (bool success,) = payable(recipient).call{value: transaction.amount}("");
        require(success, "Transaction execution failed");
    }

    /**
     * @dev Update rotating address for privacy
     * @param nameNode The ENS name node
     * @param newAddress The new address
     */
    function updateRotatingAddress(bytes32 nameNode, address newAddress) external {
        // In production, this would verify ownership through NyigbaNames contract
        require(newAddress != address(0), "Invalid address");

        emit RotatingAddressUpdated(nameNode, newAddress);
    }

    /**
     * @dev Get payment channel details
     * @param channelId The channel ID
     */
    function getPaymentChannel(bytes32 channelId) external view returns (PaymentChannel memory) {
        return paymentChannels[channelId];
    }

    /**
     * @dev Get user's payment channels
     * @param user The user address
     */
    function getUserChannels(address user) external view returns (bytes32[] memory) {
        return userChannels[user];
    }

    /**
     * @dev Get agent transactions
     * @param agentId The agent ID
     */
    function getAgentTransactions(bytes32 agentId) external view returns (AgentTransaction[] memory) {
        return agentTransactions[agentId];
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success,) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }
}
