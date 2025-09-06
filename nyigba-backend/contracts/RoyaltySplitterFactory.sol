// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./RoyaltySplitter.sol";

/**
 * @title RoyaltySplitterFactory
 * @dev Factory contract for deploying RoyaltySplitter contracts
 */
contract RoyaltySplitterFactory is Ownable, ReentrancyGuard {
    address public treasury;
    uint256 public defaultArtistShare = 8500; // 85%
    uint256 public defaultTreasuryShare = 1500; // 15%

    mapping(address => address) public artistSplitters;
    address[] public allSplitters;

    event SplitterCreated(
        address indexed artist,
        address splitter,
        uint256 artistShare,
        uint256 treasuryShare
    );

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event DefaultSharesUpdated(uint256 artistShare, uint256 treasuryShare);

    constructor(address _treasury) Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }

    /**
     * @dev Create a royalty splitter for an artist
     * @param artist The artist address
     * @return The splitter contract address
     */
    function createSplitter(address artist) external returns (address) {
        require(artist != address(0), "Invalid artist address");
        require(artistSplitters[artist] == address(0), "Splitter already exists for artist");

        RoyaltySplitter splitter = new RoyaltySplitter(
            artist,
            treasury,
            defaultArtistShare,
            defaultTreasuryShare
        );

        address splitterAddress = address(splitter);
        artistSplitters[artist] = splitterAddress;
        allSplitters.push(splitterAddress);

        emit SplitterCreated(artist, splitterAddress, defaultArtistShare, defaultTreasuryShare);

        return splitterAddress;
    }

    /**
     * @dev Create a custom splitter with specific shares
     * @param artist The artist address
     * @param artistShare Artist's share in basis points
     * @param treasuryShare Treasury's share in basis points
     * @return The splitter contract address
     */
    function createCustomSplitter(
        address artist,
        uint256 artistShare,
        uint256 treasuryShare
    ) external onlyOwner returns (address) {
        require(artist != address(0), "Invalid artist address");
        require(artistSplitters[artist] == address(0), "Splitter already exists for artist");
        require(artistShare + treasuryShare == 10000, "Shares must total 100%");

        RoyaltySplitter splitter = new RoyaltySplitter(
            artist,
            treasury,
            artistShare,
            treasuryShare
        );

        address splitterAddress = address(splitter);
        artistSplitters[artist] = splitterAddress;
        allSplitters.push(splitterAddress);

        emit SplitterCreated(artist, splitterAddress, artistShare, treasuryShare);

        return splitterAddress;
    }

    /**
     * @dev Get splitter for an artist
     * @param artist The artist address
     * @return The splitter address
     */
    function getSplitter(address artist) external view returns (address) {
        return artistSplitters[artist];
    }

    /**
     * @dev Get all created splitters
     * @return Array of splitter addresses
     */
    function getAllSplitters() external view returns (address[] memory) {
        return allSplitters;
    }

    /**
     * @dev Update treasury address
     * @param newTreasury The new treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Update default share percentages
     * @param artistShare Artist's share in basis points
     * @param treasuryShare Treasury's share in basis points
     */
    function updateDefaultShares(uint256 artistShare, uint256 treasuryShare) external onlyOwner {
        require(artistShare + treasuryShare == 10000, "Shares must total 100%");
        defaultArtistShare = artistShare;
        defaultTreasuryShare = treasuryShare;
        emit DefaultSharesUpdated(artistShare, treasuryShare);
    }

    /**
     * @dev Get total number of splitters created
     * @return Number of splitters
     */
    function getSplitterCount() external view returns (uint256) {
        return allSplitters.length;
    }
}
