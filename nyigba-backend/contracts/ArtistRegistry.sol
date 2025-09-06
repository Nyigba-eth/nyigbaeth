// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArtistRegistry
 * @dev Manages artist registration and approval through DAO governance
 */
contract ArtistRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant ARTIST_ROLE = keccak256("ARTIST_ROLE");

    struct ArtistApplication {
        address applicant;
        string portfolio;
        string bio;
        uint256 appliedAt;
        bool approved;
        bool rejected;
        uint256 decidedAt;
    }

    mapping(address => ArtistApplication) public applications;
    mapping(address => bool) public isRegisteredArtist;
    address[] public artists;

    event ArtistApplicationSubmitted(address indexed applicant, string portfolio);
    event ArtistApproved(address indexed artist, address indexed approvedBy);
    event ArtistRejected(address indexed artist, address indexed rejectedBy);
    event ArtistRevoked(address indexed artist, address indexed revokedBy);

    constructor() AccessControl() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
    }

    /**
     * @dev Submit an application to become an artist
     * @param portfolio Link to portfolio or description
     * @param bio Artist biography
     */
    function requestArtistRole(string calldata portfolio, string calldata bio) external {
        require(!isRegisteredArtist[msg.sender], "Already registered as artist");
        require(bytes(applications[msg.sender].portfolio).length == 0, "Application already exists");

        applications[msg.sender] = ArtistApplication({
            applicant: msg.sender,
            portfolio: portfolio,
            bio: bio,
            appliedAt: block.timestamp,
            approved: false,
            rejected: false,
            decidedAt: 0
        });

        emit ArtistApplicationSubmitted(msg.sender, portfolio);
    }

    /**
     * @dev Approve an artist application (only governance)
     * @param artist The artist address to approve
     */
    function approveArtist(address artist) external onlyRole(GOVERNANCE_ROLE) {
        require(!isRegisteredArtist[artist], "Already registered");
        require(!applications[artist].rejected, "Application was rejected");
        require(bytes(applications[artist].portfolio).length > 0, "No application found");

        applications[artist].approved = true;
        applications[artist].decidedAt = block.timestamp;
        isRegisteredArtist[artist] = true;
        artists.push(artist);

        emit ArtistApproved(artist, msg.sender);
    }

    /**
     * @dev Reject an artist application (only governance)
     * @param artist The artist address to reject
     */
    function rejectArtist(address artist) external onlyRole(GOVERNANCE_ROLE) {
        require(!isRegisteredArtist[artist], "Already registered");
        require(!applications[artist].approved, "Application was approved");

        applications[artist].rejected = true;
        applications[artist].decidedAt = block.timestamp;

        emit ArtistRejected(artist, msg.sender);
    }

    /**
     * @dev Revoke artist status (only governance)
     * @param artist The artist address to revoke
     */
    function revokeArtist(address artist) external onlyRole(GOVERNANCE_ROLE) {
        require(isRegisteredArtist[artist], "Not registered as artist");

        isRegisteredArtist[artist] = false;

        // Remove from artists array
        for (uint256 i = 0; i < artists.length; i++) {
            if (artists[i] == artist) {
                artists[i] = artists[artists.length - 1];
                artists.pop();
                break;
            }
        }

        emit ArtistRevoked(artist, msg.sender);
    }

    /**
     * @dev Get artist application details
     * @param artist The artist address
     * @return Artist application struct
     */
    function getApplication(address artist) external view returns (ArtistApplication memory) {
        return applications[artist];
    }

    /**
     * @dev Get all registered artists
     * @return Array of artist addresses
     */
    function getAllArtists() external view returns (address[] memory) {
        return artists;
    }

    /**
     * @dev Get total number of registered artists
     * @return Number of artists
     */
    function getArtistCount() external view returns (uint256) {
        return artists.length;
    }

    /**
     * @dev Check if address is a registered artist
     * @param account The address to check
     * @return True if registered artist
     */
    function isArtist(address account) external view returns (bool) {
        return isRegisteredArtist[account];
    }

    /**
     * @dev Get pending applications count
     * @return Number of pending applications
     */
    function getPendingApplicationsCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < artists.length; i++) {
            if (!applications[artists[i]].approved && !applications[artists[i]].rejected) {
                count++;
            }
        }
        return count;
    }
}
