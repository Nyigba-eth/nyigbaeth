// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BaseCulturalMarketplace
 * @dev Base-optimized marketplace for cultural NFTs
 * Leverages Base's low gas costs for efficient trading
 */
contract BaseCulturalMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        uint256 tokenId;
        address seller;
        address nftContract;
        uint256 price;
        bool active;
        uint256 listedAt;
    }

    struct Offer {
        address buyer;
        uint256 price;
        uint256 deadline;
        bool active;
    }

    // Base network optimizations
    uint256 public constant BASE_FEE_PERCENTAGE = 25; // 0.25% fee
    uint256 public constant BASE_OFFER_DURATION = 604800; // 7 days in seconds
    uint256 public constant MAX_ACTIVE_LISTINGS = 1000; // Per user limit

    mapping(address => mapping(uint256 => Listing)) public listings;
    mapping(address => mapping(uint256 => Offer[])) public offers;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256) public userListingCount;

    address public feeRecipient;
    uint256 public totalVolume;
    uint256 public totalListings;

    event NFTListed(address indexed nftContract, uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTSold(address indexed nftContract, uint256 indexed tokenId, address indexed buyer, uint256 price);
    event NFTPurchased(address indexed nftContract, uint256 indexed tokenId, address indexed buyer, uint256 price);
    event OfferMade(address indexed nftContract, uint256 indexed tokenId, address indexed buyer, uint256 price);
    event OfferAccepted(address indexed nftContract, uint256 indexed tokenId, address indexed seller, uint256 price);
    event ListingCancelled(address indexed nftContract, uint256 indexed tokenId, address indexed seller);

    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev List NFT for sale (Base-optimized)
     * @param nftContract The NFT contract address
     * @param tokenId The token ID
     * @param price The listing price in wei
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(userListingCount[msg.sender] < MAX_ACTIVE_LISTINGS, "Too many active listings");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(nft.isApprovedForAll(msg.sender, address(this)) || nft.getApproved(tokenId) == address(this), "Not approved");

        listings[nftContract][tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            nftContract: nftContract,
            price: price,
            active: true,
            listedAt: block.timestamp
        });

        userListings[msg.sender].push(tokenId);
        userListingCount[msg.sender]++;
        totalListings++;

        emit NFTListed(nftContract, tokenId, msg.sender, price);
    }

    /**
     * @dev Buy NFT directly (Base-optimized)
     * @param nftContract The NFT contract address
     * @param tokenId The token ID
     */
    function buyNFT(address nftContract, uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        uint256 fee = (listing.price * BASE_FEE_PERCENTAGE) / 10000;
        uint256 sellerProceeds = listing.price - fee;

        // Transfer NFT
        IERC721 nft = IERC721(nftContract);
        nft.safeTransferFrom(listing.seller, msg.sender, tokenId);

        // Transfer payments
        payable(listing.seller).transfer(sellerProceeds);
        payable(feeRecipient).transfer(fee);

        // Refund excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }

        // Update state
        listing.active = false;
        totalVolume += listing.price;
        _removeUserListing(listing.seller, tokenId);
        userListingCount[listing.seller]--;

        emit NFTPurchased(nftContract, tokenId, msg.sender, listing.price);
    }

    /**
     * @dev Make offer on NFT
     * @param nftContract The NFT contract address
     * @param tokenId The token ID
     * @param price The offer price
     */
    function makeOffer(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external payable nonReentrant {
        require(msg.value >= price, "Insufficient offer amount");
        require(price > 0, "Offer price must be greater than 0");

        Offer memory newOffer = Offer({
            buyer: msg.sender,
            price: price,
            deadline: block.timestamp + BASE_OFFER_DURATION,
            active: true
        });

        offers[nftContract][tokenId].push(newOffer);

        emit OfferMade(nftContract, tokenId, msg.sender, price);
    }

    /**
     * @dev Accept offer (Base-optimized)
     * @param nftContract The NFT contract address
     * @param tokenId The token ID
     * @param offerIndex The index of the offer to accept
     */
    function acceptOffer(
        address nftContract,
        uint256 tokenId,
        uint256 offerIndex
    ) external nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        Offer storage offer = offers[nftContract][tokenId][offerIndex];
        require(offer.active, "Offer not active");
        require(block.timestamp <= offer.deadline, "Offer expired");

        uint256 fee = (offer.price * BASE_FEE_PERCENTAGE) / 10000;
        uint256 sellerProceeds = offer.price - fee;

        // Transfer NFT
        IERC721 nft = IERC721(nftContract);
        nft.safeTransferFrom(listing.seller, offer.buyer, tokenId);

        // Transfer payments
        payable(listing.seller).transfer(sellerProceeds);
        payable(feeRecipient).transfer(fee);

        // Update state
        listing.active = false;
        offer.active = false;
        totalVolume += offer.price;
        _removeUserListing(listing.seller, tokenId);
        userListingCount[listing.seller]--;

        emit OfferAccepted(nftContract, tokenId, msg.sender, offer.price);
    }

    /**
     * @dev Cancel listing
     * @param nftContract The NFT contract address
     * @param tokenId The token ID
     */
    function cancelListing(address nftContract, uint256 tokenId) external {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        listing.active = false;
        _removeUserListing(msg.sender, tokenId);
        userListingCount[msg.sender]--;

        emit ListingCancelled(nftContract, tokenId, msg.sender);
    }

    /**
     * @dev Get active listings for user
     * @param user The user address
     */
    function getUserListings(address user) external view returns (uint256[] memory) {
        return userListings[user];
    }

    /**
     * @dev Get listing details
     * @param nftContract The NFT contract address
     * @param tokenId The token ID
     */
    function getListing(address nftContract, uint256 tokenId) external view returns (Listing memory) {
        return listings[nftContract][tokenId];
    }

    /**
     * @dev Get offers for NFT
     * @param nftContract The NFT contract address
     * @param tokenId The token ID
     */
    function getOffers(address nftContract, uint256 tokenId) external view returns (Offer[] memory) {
        return offers[nftContract][tokenId];
    }

    /**
     * @dev Update fee recipient
     * @param newRecipient The new fee recipient address
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        feeRecipient = newRecipient;
    }

    /**
     * @dev Emergency withdraw stuck funds
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Internal function to remove user listing
     */
    function _removeUserListing(address user, uint256 tokenId) internal {
        uint256[] storage userListingArray = userListings[user];
        for (uint256 i = 0; i < userListingArray.length; i++) {
            if (userListingArray[i] == tokenId) {
                userListingArray[i] = userListingArray[userListingArray.length - 1];
                userListingArray.pop();
                break;
            }
        }
    }
}
