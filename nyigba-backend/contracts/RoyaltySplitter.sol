// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title RoyaltySplitter
 * @dev Handles royalty distribution between artist and DAO treasury
 */
contract RoyaltySplitter is Ownable, ReentrancyGuard {
    address public immutable artist;
    address public immutable treasury;
    uint256 public immutable artistShare; // in basis points (e.g., 8500 = 85%)
    uint256 public immutable treasuryShare; // in basis points (e.g., 1500 = 15%)

    event RoyaltyReceived(address indexed token, uint256 amount);
    event RoyaltyDistributed(address indexed token, uint256 artistAmount, uint256 treasuryAmount);

    constructor(
        address _artist,
        address _treasury,
        uint256 _artistShare,
        uint256 _treasuryShare
    ) Ownable(msg.sender) {
        require(_artist != address(0), "Invalid artist address");
        require(_treasury != address(0), "Invalid treasury address");
        require(_artistShare + _treasuryShare == 10000, "Shares must total 100%");

        artist = _artist;
        treasury = _treasury;
        artistShare = _artistShare;
        treasuryShare = _treasuryShare;
    }

    /**
     * @dev Receive ETH royalties and distribute automatically
     */
    receive() external payable {
        if (msg.value > 0) {
            _distributeRoyalty(address(0), msg.value);
        }
    }

    /**
     * @dev Distribute ERC20 royalties
     * @param token The ERC20 token address (address(0) for ETH)
     * @param amount The amount to distribute
     */
    function distributeRoyalty(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");

        if (token == address(0)) {
            require(address(this).balance >= amount, "Insufficient ETH balance");
        } else {
            require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient token balance");
        }

        _distributeRoyalty(token, amount);
    }

    /**
     * @dev Internal function to distribute royalties
     * @param token The token address (address(0) for ETH)
     * @param amount The total amount to distribute
     */
    function _distributeRoyalty(address token, uint256 amount) internal {
        uint256 artistAmount = (amount * artistShare) / 10000;
        uint256 treasuryAmount = (amount * treasuryShare) / 10000;

        emit RoyaltyReceived(token, amount);

        if (token == address(0)) {
            // Distribute ETH
            (bool artistSuccess,) = payable(artist).call{value: artistAmount}("");
            require(artistSuccess, "Artist ETH transfer failed");

            (bool treasurySuccess,) = payable(treasury).call{value: treasuryAmount}("");
            require(treasurySuccess, "Treasury ETH transfer failed");
        } else {
            // Distribute ERC20
            require(IERC20(token).transfer(artist, artistAmount), "Artist token transfer failed");
            require(IERC20(token).transfer(treasury, treasuryAmount), "Treasury token transfer failed");
        }

        emit RoyaltyDistributed(token, artistAmount, treasuryAmount);
    }

    /**
     * @dev Get contract balances
     * @param token The token address (address(0) for ETH)
     * @return The balance
     */
    function getBalance(address token) external view returns (uint256) {
        if (token == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(token).balanceOf(address(this));
        }
    }

    /**
     * @dev Emergency withdraw function (only owner)
     * @param token The token address to withdraw
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
}
