// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title NyigbaNFT
 * @dev Main NFT collection contract for Nyigba.eth cultural heritage
 * Supports ERC721, ERC2981 royalties, and artist-gated minting
 */
contract NyigbaNFT is ERC721, ERC721URIStorage, ERC2981, AccessControl, ReentrancyGuard {
    using Strings for uint256;

    bytes32 public constant ARTIST_ROLE = keccak256("ARTIST_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct CulturalMetadata {
        string origin;      // e.g., "Yoruba", "Akan"
        string language;    // e.g., "Yoruba", "Twi"
        string category;    // e.g., "Folklore", "Music"
        string nyigbaName;  // e.g., "artist.nyigba.eth"
        uint256 createdAt;
    }

    mapping(uint256 => CulturalMetadata) private _culturalData;
    mapping(address => uint256[]) private _artistTokens;

    uint256 private _nextTokenId = 1;
    string private _baseTokenURI;

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string tokenURI,
        address royaltyReceiver,
        uint96 royaltyFee
    );

    event CulturalDataSet(uint256 indexed tokenId, string origin, string language, string category);

    constructor()
        ERC721("Nyigba.eth Cultural Heritage", "NYIGBA")
        ERC2981()
        AccessControl()
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Mint a new cultural NFT (only artists can mint)
     * @param to The recipient address
     * @param tokenURI The metadata URI
     * @param royaltyReceiver The royalty receiver address
     * @param royaltyFee The royalty fee in basis points
     * @param origin Cultural origin
     * @param language Cultural language
     * @param category Cultural category
     * @param nyigbaName The artist's Nyigba name
     */
    function mintTo(
        address to,
        string calldata _tokenURI,
        address royaltyReceiver,
        uint96 royaltyFee,
        string calldata origin,
        string calldata language,
        string calldata category,
        string calldata nyigbaName
    ) external onlyRole(ARTIST_ROLE) nonReentrant returns (uint256) {
        require(royaltyFee <= 10000, "Royalty fee too high"); // Max 100%

        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        // Set royalty info
        _setTokenRoyalty(tokenId, royaltyReceiver, royaltyFee);

        // Set cultural metadata
        _culturalData[tokenId] = CulturalMetadata({
            origin: origin,
            language: language,
            category: category,
            nyigbaName: nyigbaName,
            createdAt: block.timestamp
        });

        // Track artist's tokens
        _artistTokens[msg.sender].push(tokenId);

        emit NFTMinted(tokenId, msg.sender, _tokenURI, royaltyReceiver, royaltyFee);
        emit CulturalDataSet(tokenId, origin, language, category);

        return tokenId;
    }

    /**
     * @dev Get cultural metadata for a token
     * @param tokenId The token ID
     * @return Cultural metadata struct
     */
    function getCulturalData(uint256 tokenId) external view returns (CulturalMetadata memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return _culturalData[tokenId];
    }

    /**
     * @dev Get all tokens created by an artist
     * @param artist The artist address
     * @return Array of token IDs
     */
    function getArtistTokens(address artist) external view returns (uint256[] memory) {
        return _artistTokens[artist];
    }

    /**
     * @dev Check if an address has the artist role
     * @param account The address to check
     * @return True if the address has artist role
     */
    function isArtist(address account) external view returns (bool) {
        return hasRole(ARTIST_ROLE, account);
    }

    /**
     * @dev Set base token URI for all tokens
     * @param baseURI The base URI
     */
    function setBaseURI(string calldata baseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Get base token URI
     * @return The base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Override supportsInterface to support ERC2981
     * @param interfaceId The interface ID
     * @return True if supported
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override tokenURI to use ERC721URIStorage
     * @param tokenId The token ID
     * @return The token URI
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Burn a token (only owner or approved)
     * @param tokenId The token ID to burn
     */
    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender || getApproved(tokenId) == msg.sender || isApprovedForAll(ownerOf(tokenId), msg.sender), "Not owner or approved");
        _burn(tokenId);
    }

    /**
     * @dev Override _burn to handle URI storage
     * @param tokenId The token ID
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev Get total supply (not standard but useful)
     * @return Total number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}
