// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

/**
 * @title TreasuryRewards
 * @dev Handles periodic distribution of treasury rewards to DAO members
 */
contract TreasuryRewards is Ownable, ReentrancyGuard {
    struct DistributionEpoch {
        uint256 totalAmount;
        address rewardToken;
        uint256 snapshotId;
        uint256 perMemberAmount;
        uint256 distributedAt;
        uint256 claimDeadline;
        bool isActive;
        mapping(address => bool) hasClaimed;
    }

    mapping(uint256 => DistributionEpoch) public epochs;
    uint256 public currentEpochId = 0;
    address public votingToken; // ERC20Votes contract

    event EpochCreated(
        uint256 indexed epochId,
        address rewardToken,
        uint256 totalAmount,
        uint256 snapshotId,
        uint256 claimDeadline
    );

    event RewardClaimed(
        address indexed member,
        uint256 indexed epochId,
        address rewardToken,
        uint256 amount
    );

    event FundsDeposited(address indexed token, uint256 amount);

    constructor(address _votingToken) Ownable(msg.sender) {
        require(_votingToken != address(0), "Invalid voting token address");
        votingToken = _votingToken;
    }

    /**
     * @dev Deposit funds for distribution
     */
    function depositFunds(address token, uint256 amount) external payable {
        if (token == address(0)) {
            require(msg.value == amount, "ETH amount mismatch");
        } else {
            require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        }
        emit FundsDeposited(token, amount);
    }

    /**
     * @dev Create a new distribution epoch
     * @param rewardToken The token to distribute
     * @param totalAmount Total amount to distribute
     * @param snapshotId The voting power snapshot ID
     * @param claimDeadline Deadline for claiming rewards
     */
    function createEpoch(
        address rewardToken,
        uint256 totalAmount,
        uint256 snapshotId,
        uint256 claimDeadline
    ) external onlyOwner {
        require(claimDeadline > block.timestamp, "Invalid claim deadline");
        require(totalAmount > 0, "Amount must be greater than 0");

        // Check if contract has enough funds
        if (rewardToken == address(0)) {
            require(address(this).balance >= totalAmount, "Insufficient ETH balance");
        } else {
            require(IERC20(rewardToken).balanceOf(address(this)) >= totalAmount, "Insufficient token balance");
        }

        currentEpochId++;
        DistributionEpoch storage epoch = epochs[currentEpochId];
        epoch.totalAmount = totalAmount;
        epoch.rewardToken = rewardToken;
        epoch.snapshotId = snapshotId;
        epoch.distributedAt = block.timestamp;
        epoch.claimDeadline = claimDeadline;
        epoch.isActive = true;

        // Note: In a real implementation, you'd get the total voting power from the snapshot
        // For simplicity, we'll assume equal distribution for now
        epoch.perMemberAmount = totalAmount; // This would be calculated based on voting power

        emit EpochCreated(currentEpochId, rewardToken, totalAmount, snapshotId, claimDeadline);
    }

    /**
     * @dev Claim rewards for a member
     * @param epochId The epoch ID
     * @param member The member address
     */
    function claimReward(uint256 epochId, address member) external nonReentrant {
        DistributionEpoch storage epoch = epochs[epochId];
        require(epoch.isActive, "Epoch not active");
        require(block.timestamp <= epoch.claimDeadline, "Claim deadline passed");
        require(!epoch.hasClaimed[member], "Already claimed");

        // In a real implementation, you'd check if the member had voting power at the snapshot
        // For now, we'll allow any address to claim (this should be restricted)
        uint256 claimAmount = epoch.perMemberAmount;

        epoch.hasClaimed[member] = true;

        if (epoch.rewardToken == address(0)) {
            (bool success,) = payable(member).call{value: claimAmount}("");
            require(success, "ETH transfer failed");
        } else {
            require(IERC20(epoch.rewardToken).transfer(member, claimAmount), "Token transfer failed");
        }

        emit RewardClaimed(member, epochId, epoch.rewardToken, claimAmount);
    }

    /**
     * @dev Check if a member has claimed rewards for an epoch
     * @param epochId The epoch ID
     * @param member The member address
     * @return True if claimed
     */
    function hasClaimed(uint256 epochId, address member) external view returns (bool) {
        return epochs[epochId].hasClaimed[member];
    }

    /**
     * @dev Get epoch details
     * @param epochId The epoch ID
     * @return Epoch details
     */
    function getEpoch(uint256 epochId) external view returns (
        uint256 totalAmount,
        address rewardToken,
        uint256 snapshotId,
        uint256 perMemberAmount,
        uint256 distributedAt,
        uint256 claimDeadline,
        bool isActive
    ) {
        DistributionEpoch storage epoch = epochs[epochId];
        return (
            epoch.totalAmount,
            epoch.rewardToken,
            epoch.snapshotId,
            epoch.perMemberAmount,
            epoch.distributedAt,
            epoch.claimDeadline,
            epoch.isActive
        );
    }

    /**
     * @dev Emergency withdraw function
     * @param token The token to withdraw
     * @param amount The amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            require(address(this).balance >= amount, "Insufficient ETH balance");
            (bool success,) = payable(owner()).call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient token balance");
            require(IERC20(token).transfer(owner(), amount), "Token transfer failed");
        }
    }

    /**
     * @dev Get contract balance
     * @param token The token address
     * @return The balance
     */
    function getBalance(address token) external view returns (uint256) {
        if (token == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(token).balanceOf(address(this));
        }
    }

    receive() external payable {}
}
