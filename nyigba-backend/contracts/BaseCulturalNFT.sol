// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BaseCulturalNFT
 * @dev Base-optimized NFT contract for cultural heritage
 * Leverages Base's low gas costs for efficient cultural preservation
 */
contract BaseCulturalNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    struct CulturalAsset {
        string name;
        string description;
        string culturalOrigin;
        string language;
        string category;
        string artistName;
        uint256 creationDate;
        string ipfsHash;
        bool verified;
    }

    mapping(uint256 => CulturalAsset) public culturalAssets;
    mapping(address => uint256[]) public artistTokens;
    mapping(string => bool) public verifiedOrigins;

    uint256 public nextTokenId = 1;
    uint256 public constant MAX_BATCH_MINT = 10; // Optimized for Base's gas costs

    // Base network optimizations
    uint256 public constant BASE_BLOCK_TIME = 2; // ~2 second block time
    uint256 public constant LOW_GAS_PRICE = 1000000000; // 1 gwei base fee

    event CulturalAssetMinted(uint256 indexed tokenId, address indexed artist, string culturalOrigin);
    event OriginVerified(string origin, address indexed verifier);
    event BatchMintExecuted(address indexed artist, uint256[] tokenIds);

    constructor() ERC721("Base Cultural Heritage", "BCH") Ownable(msg.sender) {}

    /**
     * @dev Optimized mint function for Base network
     * @param to Recipient address
     * @param uri Token metadata URI
     * @param asset Cultural asset data
     */
    function mintCulturalAsset(
        address to,
        string calldata uri,
        CulturalAsset calldata asset
    ) external nonReentrant returns (uint256) {
        uint256 tokenId = nextTokenId++;

        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);

        culturalAssets[tokenId] = asset;
        artistTokens[to].push(tokenId);

        emit CulturalAssetMinted(tokenId, to, asset.culturalOrigin);
        return tokenId;
    }

    /**
     * @dev Batch mint multiple cultural assets (Base-optimized)
     * @param to Recipient address
     * @param uris Array of metadata URIs
     * @param assets Array of cultural asset data
     */
    function batchMintCulturalAssets(
        address to,
        string[] calldata uris,
        CulturalAsset[] calldata assets
    ) external nonReentrant returns (uint256[] memory) {
        require(uris.length == assets.length, "Arrays length mismatch");
        require(uris.length <= MAX_BATCH_MINT, "Batch too large");
        require(uris.length > 0, "Empty batch");

        uint256[] memory tokenIds = new uint256[](uris.length);

        for (uint256 i = 0; i < uris.length; i++) {
            uint256 tokenId = nextTokenId++;

            _mint(to, tokenId);
            _setTokenURI(tokenId, uris[i]);
            culturalAssets[tokenId] = assets[i];
            artistTokens[to].push(tokenId);

            tokenIds[i] = tokenId;

            emit CulturalAssetMinted(tokenId, to, assets[i].culturalOrigin);
        }

        emit BatchMintExecuted(to, tokenIds);
        return tokenIds;
    }

    /**
     * @dev Verify cultural origin (community governance)
     * @param origin The cultural origin to verify
     */
    function verifyOrigin(string calldata origin) external onlyOwner {
        verifiedOrigins[origin] = true;
        emit OriginVerified(origin, msg.sender);
    }

    /**
     * @dev Get cultural asset data
     * @param tokenId The token ID
     */
    function getCulturalAsset(uint256 tokenId) external view returns (CulturalAsset memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return culturalAssets[tokenId];
    }

    /**
     * @dev Get artist's tokens
     * @param artist The artist address
     */
    function getArtistTokens(address artist) external view returns (uint256[] memory) {
        return artistTokens[artist];
    }

    /**
     * @dev Get tokens by cultural origin
     * @param origin The cultural origin
     * @param startIndex Starting index for pagination
     * @param limit Maximum number of results
     */
    function getTokensByOrigin(
        string calldata origin,
        uint256 startIndex,
        uint256 limit
    ) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](limit);
        uint256 count = 0;

        for (uint256 i = startIndex; i < nextTokenId && count < limit; i++) {
            if (keccak256(bytes(culturalAssets[i].culturalOrigin)) == keccak256(bytes(origin))) {
                result[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory finalResult = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            finalResult[i] = result[i];
        }

        return finalResult;
    }

    /**
     * @dev Get verified origins
     */
    function getVerifiedOrigins() external pure returns (string[] memory) {
        // This is a simplified implementation
        // In production, you'd maintain an array of verified origins
        string[] memory origins = new string[](1);
        origins[0] = "Yoruba"; // Example
        return origins;
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");

        (bool success,) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
