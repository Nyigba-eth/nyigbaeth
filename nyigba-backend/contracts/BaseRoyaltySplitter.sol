// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BaseRoyaltySplitter
 * @dev Base-optimized royalty splitter for cultural content creators
 * Efficiently distributes royalties using Base's low gas costs
 */
contract BaseRoyaltySplitter is ReentrancyGuard, Ownable {
    struct RoyaltyShare {
        address payable recipient;
        uint256 percentage; // Basis points (100 = 1%)
        bool active;
    }

    struct Split {
        address tokenAddress;
        uint256 totalAmount;
        uint256 distributedAmount;
        bool completed;
        uint256 createdAt;
    }

    // Base network optimizations
    uint256 public constant BASE_MAX_SHARES = 20; // Limit for gas optimization
    uint256 public constant BASE_DISTRIBUTION_TIMEOUT = 2592000; // 30 days
    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000 basis points

    mapping(bytes32 => RoyaltyShare[]) public royaltySplits;
    mapping(bytes32 => Split) public splits;
    mapping(address => bytes32[]) public creatorSplits;

    bytes32[] public allSplitIds;

    event RoyaltySplitCreated(bytes32 indexed splitId, address indexed creator, uint256 totalShares);
    event RoyaltyDistributed(bytes32 indexed splitId, address indexed token, uint256 amount);
    event RecipientAdded(bytes32 indexed splitId, address indexed recipient, uint256 percentage);
    event RecipientRemoved(bytes32 indexed splitId, address indexed recipient);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create royalty split configuration
     * @param splitId Unique identifier for the split
     * @param recipients Array of recipient addresses
     * @param percentages Array of percentage shares (basis points)
     */
    function createRoyaltySplit(
        bytes32 splitId,
        address[] calldata recipients,
        uint256[] calldata percentages
    ) external {
        require(recipients.length == percentages.length, "Arrays length mismatch");
        require(recipients.length > 0 && recipients.length <= BASE_MAX_SHARES, "Invalid recipient count");
        require(royaltySplits[splitId].length == 0, "Split ID already exists");

        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            require(percentages[i] > 0, "Percentage must be greater than 0");
            totalPercentage += percentages[i];
        }
        require(totalPercentage == BASIS_POINTS, "Total percentage must equal 100%");

        for (uint256 i = 0; i < recipients.length; i++) {
            royaltySplits[splitId].push(RoyaltyShare({
                recipient: payable(recipients[i]),
                percentage: percentages[i],
                active: true
            }));
        }

        creatorSplits[msg.sender].push(splitId);
        allSplitIds.push(splitId);

        emit RoyaltySplitCreated(splitId, msg.sender, recipients.length);
    }

    /**
     * @dev Distribute royalties (Base-optimized batch distribution)
     * @param splitId The split configuration ID
     * @param tokenAddress The token address (address(0) for ETH)
     * @param amount The amount to distribute
     */
    function distributeRoyalties(
        bytes32 splitId,
        address tokenAddress,
        uint256 amount
    ) external payable nonReentrant {
        require(amount > 0, "Amount must be greater than 0");

        RoyaltyShare[] storage shares = royaltySplits[splitId];
        require(shares.length > 0, "Split not found");

        // Handle ETH vs ERC20
        if (tokenAddress == address(0)) {
            require(msg.value >= amount, "Insufficient ETH sent");
        } else {
            IERC20 token = IERC20(tokenAddress);
            require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        }

        // Create split record
        splits[splitId] = Split({
            tokenAddress: tokenAddress,
            totalAmount: amount,
            distributedAmount: 0,
            completed: false,
            createdAt: block.timestamp
        });

        // Batch distribute to all active recipients
        uint256 totalDistributed = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            if (shares[i].active) {
                uint256 recipientAmount = (amount * shares[i].percentage) / BASIS_POINTS;

                if (tokenAddress == address(0)) {
                    (bool success,) = shares[i].recipient.call{value: recipientAmount}("");
                    require(success, "ETH transfer failed");
                } else {
                    IERC20 token = IERC20(tokenAddress);
                    require(token.transfer(shares[i].recipient, recipientAmount), "Token transfer failed");
                }

                totalDistributed += recipientAmount;
            }
        }

        // Update split record
        splits[splitId].distributedAmount = totalDistributed;
        splits[splitId].completed = true;

        // Refund any excess ETH
        if (tokenAddress == address(0) && msg.value > amount) {
            payable(msg.sender).transfer(msg.value - amount);
        }

        emit RoyaltyDistributed(splitId, tokenAddress, amount);
    }

    /**
     * @dev Add recipient to existing split
     * @param splitId The split configuration ID
     * @param recipient The new recipient address
     * @param percentage The percentage share (basis points)
     */
    function addRecipient(
        bytes32 splitId,
        address recipient,
        uint256 percentage
    ) external {
        RoyaltyShare[] storage shares = royaltySplits[splitId];
        require(shares.length > 0, "Split not found");
        require(shares.length < BASE_MAX_SHARES, "Max recipients reached");
        require(percentage > 0, "Percentage must be greater than 0");

        // Check if recipient already exists
        for (uint256 i = 0; i < shares.length; i++) {
            require(shares[i].recipient != recipient, "Recipient already exists");
        }

        shares.push(RoyaltyShare({
            recipient: payable(recipient),
            percentage: percentage,
            active: true
        }));

        emit RecipientAdded(splitId, recipient, percentage);
    }

    /**
     * @dev Remove recipient from split
     * @param splitId The split configuration ID
     * @param recipient The recipient address to remove
     */
    function removeRecipient(bytes32 splitId, address recipient) external {
        RoyaltyShare[] storage shares = royaltySplits[splitId];
        require(shares.length > 0, "Split not found");

        for (uint256 i = 0; i < shares.length; i++) {
            if (shares[i].recipient == recipient) {
                shares[i].active = false;
                emit RecipientRemoved(splitId, recipient);
                break;
            }
        }
    }

    /**
     * @dev Get royalty split details
     * @param splitId The split configuration ID
     */
    function getRoyaltySplit(bytes32 splitId) external view returns (RoyaltyShare[] memory) {
        return royaltySplits[splitId];
    }

    /**
     * @dev Get creator's splits
     * @param creator The creator address
     */
    function getCreatorSplits(address creator) external view returns (bytes32[] memory) {
        return creatorSplits[creator];
    }

    /**
     * @dev Get split details
     * @param splitId The split ID
     */
    function getSplit(bytes32 splitId) external view returns (Split memory) {
        return splits[splitId];
    }

    /**
     * @dev Get all split IDs
     */
    function getAllSplitIds() external view returns (bytes32[] memory) {
        return allSplitIds;
    }

    /**
     * @dev Emergency withdraw stuck funds
     * @param tokenAddress The token address (address(0) for ETH)
     */
    function emergencyWithdraw(address tokenAddress) external onlyOwner {
        if (tokenAddress == address(0)) {
            uint256 balance = address(this).balance;
            require(balance > 0, "No ETH balance");
            payable(owner()).transfer(balance);
        } else {
            IERC20 token = IERC20(tokenAddress);
            uint256 balance = token.balanceOf(address(this));
            require(balance > 0, "No token balance");
            require(token.transfer(owner(), balance), "Transfer failed");
        }
    }

    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}
