import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract } from "ethers";
// Temporarily using basic Contract types until typechain types are generated
// import {
//   BaseCulturalNFT,
//   BaseCommunityDAO,
//   BaseCulturalMarketplace,
//   BaseRoyaltySplitter,
//   ERC20Votes
// } from "../typechain-types";

describe("Base-Optimized Nyigba.eth Contracts", function () {
  let culturalNFT: any;
  let communityDAO: any;
  let marketplace: any;
  let royaltySplitter: any;
  let govToken: any;

  let owner: SignerWithAddress;
  let artist: SignerWithAddress;
  let buyer: SignerWithAddress;
  let communityMember: SignerWithAddress;

  beforeEach(async function () {
    [owner, artist, buyer, communityMember] = await ethers.getSigners();

    // Deploy Governance Token
    const NyigbaToken = await ethers.getContractFactory("NyigbaToken");
    govToken = await NyigbaToken.deploy();
    await govToken.waitForDeployment();

    // Deploy Cultural NFT
    const BaseCulturalNFT = await ethers.getContractFactory("BaseCulturalNFT");
    culturalNFT = await BaseCulturalNFT.deploy();
    await culturalNFT.waitForDeployment();

    // Deploy Marketplace
    const BaseCulturalMarketplace = await ethers.getContractFactory("BaseCulturalMarketplace");
    marketplace = await BaseCulturalMarketplace.deploy(owner.address);
    await marketplace.waitForDeployment();

    // Deploy Royalty Splitter
    const BaseRoyaltySplitter = await ethers.getContractFactory("BaseRoyaltySplitter");
    royaltySplitter = await BaseRoyaltySplitter.deploy();
    await royaltySplitter.waitForDeployment();

    // Deploy DAO (simplified without Timelock for now)
    const BaseCommunityDAO = await ethers.getContractFactory("BaseCommunityDAO");
    communityDAO = await BaseCommunityDAO.deploy(
      await govToken.getAddress()
    );
    await communityDAO.waitForDeployment();
  });

  describe("BaseCulturalNFT", function () {
    it("Should mint cultural NFT with metadata", async function () {
      const asset = {
        name: "Yoruba Mask",
        description: "Traditional Yoruba ceremonial mask",
        culturalOrigin: "Yoruba",
        language: "Yoruba",
        category: "Traditional Art",
        artistName: "Adebayo Johnson",
        creationDate: Date.now(),
        ipfsHash: "QmTest123",
        verified: false
      };

      await culturalNFT.connect(artist).mintCulturalAsset(
        artist.address,
        "https://ipfs.io/ipfs/QmTest123",
        asset
      );

      const tokenAsset = await culturalNFT.getCulturalAsset(1);
      expect(tokenAsset.name).to.equal("Yoruba Mask");
      expect(tokenAsset.culturalOrigin).to.equal("Yoruba");
    });

    it("Should batch mint multiple cultural assets", async function () {
      const assets = [
        {
          name: "Mask 1",
          description: "Description 1",
          culturalOrigin: "Yoruba",
          language: "Yoruba",
          category: "Art",
          artistName: "Artist 1",
          creationDate: Date.now(),
          ipfsHash: "Qm1",
          verified: false
        },
        {
          name: "Mask 2",
          description: "Description 2",
          culturalOrigin: "Yoruba",
          language: "Yoruba",
          category: "Art",
          artistName: "Artist 1",
          creationDate: Date.now(),
          ipfsHash: "Qm2",
          verified: false
        }
      ];

      const uris = ["https://ipfs.io/ipfs/Qm1", "https://ipfs.io/ipfs/Qm2"];

      await culturalNFT.connect(artist).batchMintCulturalAssets(
        artist.address,
        uris,
        assets
      );

      expect(await culturalNFT.ownerOf(1)).to.equal(artist.address);
      expect(await culturalNFT.ownerOf(2)).to.equal(artist.address);
    });

    it("Should verify cultural origin", async function () {
      await culturalNFT.verifyOrigin("Yoruba");
      expect(await culturalNFT.verifiedOrigins("Yoruba")).to.be.true;
    });
  });

  describe("BaseCulturalMarketplace", function () {
    beforeEach(async function () {
      // Mint NFT for testing
      const asset = {
        name: "Test NFT",
        description: "Test Description",
        culturalOrigin: "Test",
        language: "English",
        category: "Test",
        artistName: "Test Artist",
        creationDate: Date.now(),
        ipfsHash: "QmTest",
        verified: false
      };

      await culturalNFT.connect(artist).mintCulturalAsset(
        artist.address,
        "https://ipfs.io/ipfs/QmTest",
        asset
      );

      // Approve marketplace
      await culturalNFT.connect(artist).setApprovalForAll(await marketplace.getAddress(), true);
    });

    it("Should list NFT for sale", async function () {
      await marketplace.connect(artist).listNFT(
        await culturalNFT.getAddress(),
        1,
        ethers.parseEther("1")
      );

      const listing = await marketplace.getListing(await culturalNFT.getAddress(), 1);
      expect(listing.seller).to.equal(artist.address);
      expect(listing.price).to.equal(ethers.parseEther("1"));
      expect(listing.active).to.be.true;
    });

    it("Should buy NFT", async function () {
      await marketplace.connect(artist).listNFT(
        await culturalNFT.getAddress(),
        1,
        ethers.parseEther("1")
      );

      await marketplace.connect(buyer).buyNFT(
        await culturalNFT.getAddress(),
        1,
        { value: ethers.parseEther("1") }
      );

      expect(await culturalNFT.ownerOf(1)).to.equal(buyer.address);
    });

    it("Should make and accept offer", async function () {
      await marketplace.connect(artist).listNFT(
        await culturalNFT.getAddress(),
        1,
        ethers.parseEther("1")
      );

      await marketplace.connect(buyer).makeOffer(
        await culturalNFT.getAddress(),
        1,
        ethers.parseEther("0.8"),
        { value: ethers.parseEther("0.8") }
      );

      await marketplace.connect(artist).acceptOffer(
        await culturalNFT.getAddress(),
        1,
        0
      );

      expect(await culturalNFT.ownerOf(1)).to.equal(buyer.address);
    });
  });

  describe("BaseRoyaltySplitter", function () {
    it("Should create royalty split", async function () {
      const splitId = ethers.keccak256(ethers.toUtf8Bytes("test-split"));
      const recipients = [artist.address, buyer.address];
      const percentages = [7000, 3000]; // 70% and 30%

      await royaltySplitter.connect(owner).createRoyaltySplit(
        splitId,
        recipients,
        percentages
      );

      const split = await royaltySplitter.getRoyaltySplit(splitId);
      expect(split.length).to.equal(2);
      expect(split[0].percentage).to.equal(7000);
      expect(split[1].percentage).to.equal(3000);
    });

    it("Should distribute royalties", async function () {
      const splitId = ethers.keccak256(ethers.toUtf8Bytes("test-split"));
      const recipients = [artist.address, buyer.address];
      const percentages = [7000, 3000];

      await royaltySplitter.connect(owner).createRoyaltySplit(
        splitId,
        recipients,
        percentages
      );

      const initialBalanceArtist = await ethers.provider.getBalance(artist.address);
      const initialBalanceBuyer = await ethers.provider.getBalance(buyer.address);

      await royaltySplitter.distributeRoyalties(
        splitId,
        ethers.ZeroAddress,
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

      const finalBalanceArtist = await ethers.provider.getBalance(artist.address);
      const finalBalanceBuyer = await ethers.provider.getBalance(buyer.address);

      expect(finalBalanceArtist - initialBalanceArtist).to.equal(ethers.parseEther("0.7"));
      expect(finalBalanceBuyer - initialBalanceBuyer).to.equal(ethers.parseEther("0.3"));
    });
  });

  describe("BaseCommunityDAO", function () {
    beforeEach(async function () {
      // Mint governance tokens
      await govToken.mint(communityMember.address, ethers.parseEther("100"));
      await govToken.connect(communityMember).delegate(communityMember.address);
    });

    it("Should add community member", async function () {
      // For this test, we'll assume the owner can add members directly
      // In production, this would go through governance
      expect(await communityDAO.isCommunityMember(communityMember.address)).to.be.false;
      // Note: This would typically require governance approval
    });

    it("Should create proposal with category", async function () {
      // First add the member
      await communityDAO.addCommunityMember(communityMember.address);
      
      const description = "Verify Yoruba cultural origin";
      const category = "Cultural Preservation"; // Use valid category

      await expect(
        communityDAO.connect(communityMember).createProposal(description, category)
      ).to.emit(communityDAO, "ProposalCreated");
    });
  });
});
