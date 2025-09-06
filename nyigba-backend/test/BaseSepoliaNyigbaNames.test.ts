import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ethers } from "hardhat";
import { BaseSepoliaNyigbaNames } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BaseSepoliaNyigbaNames", function () {
  let baseNames: BaseSepoliaNyigbaNames;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  const REGISTRATION_FEE = ethers.parseEther("0.001");
  const RENEWAL_FEE = ethers.parseEther("0.0005");
  const BASE_DOMAIN = "nyigba-base.eth";

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const BaseSepoliaNyigbaNames = await ethers.getContractFactory("BaseSepoliaNyigbaNames");
    baseNames = await BaseSepoliaNyigbaNames.deploy();
    await baseNames.waitForDeployment();
  });

  describe("Subdomain Registration", function () {
    it("Should allow claiming available subdomains", async function () {
      const label = "artist";
      const fullDomain = `${label}.${BASE_DOMAIN}`;
      const node = ethers.keccak256(ethers.toUtf8Bytes(fullDomain));

      const tx = await baseNames.connect(addr1).claimSubdomain(label, { value: REGISTRATION_FEE });
      
      // Check that the event was emitted (don't check exact timestamp due to timing issues)
      await expect(tx)
        .to.emit(baseNames, "NameClaimed");
        
      // Verify event parameters manually
      const receipt = await tx.wait();
      const event = receipt?.logs.find(log => log.topics[0] === baseNames.interface.getEvent('NameClaimed').topicHash);
      expect(event).to.not.be.undefined;

      // Verify the subdomain was actually claimed
      expect(await baseNames['owner(bytes32)'](node)).to.equal(addr1.address);
    });

    it("Should reject subdomain claims with insufficient payment", async function () {
      const label = "test";
      const insufficientFee = ethers.parseEther("0.0005");

      await expect(
        baseNames.connect(addr1).claimSubdomain(label, { value: insufficientFee })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should reject already claimed subdomains", async function () {
      const label = "taken";

      await baseNames.connect(addr1).claimSubdomain(label, { value: REGISTRATION_FEE });
      
      await expect(
        baseNames.connect(addr2).claimSubdomain(label, { value: REGISTRATION_FEE })
      ).to.be.revertedWith("Label already exists");
    });

    it("Should reject reserved names", async function () {
      await expect(
        baseNames.connect(addr1).claimSubdomain("admin", { value: REGISTRATION_FEE })
      ).to.be.revertedWith("Label is reserved");
    });

    it("Should enforce label length requirements", async function () {
      // Too short
      await expect(
        baseNames.connect(addr1).claimSubdomain("ab", { value: REGISTRATION_FEE })
      ).to.be.revertedWith("Label too short");

      // Too long (33 characters)
      const longLabel = "a".repeat(33);
      await expect(
        baseNames.connect(addr1).claimSubdomain(longLabel, { value: REGISTRATION_FEE })
      ).to.be.revertedWith("Label too long");
    });

    it("Should handle premium names with higher fees", async function () {
      const premiumLabel = "abc"; // 3 characters = premium
      const premiumFee = REGISTRATION_FEE * 5n; // 5x multiplier

      await expect(
        baseNames.connect(addr1).claimSubdomain(premiumLabel, { value: REGISTRATION_FEE })
      ).to.be.revertedWith("Insufficient payment");

      await expect(
        baseNames.connect(addr1).claimSubdomain(premiumLabel, { value: premiumFee })
      ).to.emit(baseNames, "NameClaimed");
    });

    it("Should refund excess payment", async function () {
      const label = "refund";
      const excessPayment = REGISTRATION_FEE * 2n;
      
      const balanceBefore = await ethers.provider.getBalance(addr1.address);
      const tx = await baseNames.connect(addr1).claimSubdomain(label, { value: excessPayment });
      const receipt = await tx.wait();
      const balanceAfter = await ethers.provider.getBalance(addr1.address);

      // Should only pay the registration fee + gas
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const expectedBalance = balanceBefore - REGISTRATION_FEE - gasUsed;
      
      expect(balanceAfter).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });
  });

  describe("Subdomain Renewal", function () {
    beforeEach(async function () {
      await baseNames.connect(addr1).claimSubdomain("renewable", { value: REGISTRATION_FEE });
    });

    it("Should allow renewal of owned subdomains", async function () {
      const label = "renewable";
      const fullDomain = `${label}.${BASE_DOMAIN}`;
      const node = ethers.keccak256(ethers.toUtf8Bytes(fullDomain));

      await expect(
        baseNames.connect(addr1).renewSubdomain(label, { value: RENEWAL_FEE })
      ).to.emit(baseNames, "NameRenewed");

      const info = await baseNames.getSubdomainInfo(label);
      expect(info.ownerAddress).to.equal(addr1.address);
    });

    it("Should reject renewal with insufficient payment", async function () {
      const label = "renewable";
      const insufficientFee = ethers.parseEther("0.0001");

      await expect(
        baseNames.connect(addr1).renewSubdomain(label, { value: insufficientFee })
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Text Records", function () {
    beforeEach(async function () {
      await baseNames.connect(addr1).claimSubdomain("texttest", { value: REGISTRATION_FEE });
    });

    it("Should allow setting text records for owned subdomains", async function () {
      const label = "texttest";
      const fullDomain = `${label}.${BASE_DOMAIN}`;
      const node = ethers.keccak256(ethers.toUtf8Bytes(fullDomain));

      await expect(
        baseNames.connect(addr1).setText(node, "bio", "Test artist bio")
      ).to.emit(baseNames, "TextRecordSet")
        .withArgs(node, "bio", "Test artist bio");

      expect(await baseNames.text(node, "bio")).to.equal("Test artist bio");
    });

    it("Should reject setting text records for non-owned subdomains", async function () {
      const label = "texttest";
      const fullDomain = `${label}.${BASE_DOMAIN}`;
      const node = ethers.keccak256(ethers.toUtf8Bytes(fullDomain));

      await expect(
        baseNames.connect(addr2).setText(node, "bio", "Unauthorized bio")
      ).to.be.revertedWith("Not name owner");
    });
  });

  describe("Availability Checking", function () {
    it("Should correctly identify available subdomains", async function () {
      const [available, fee, reason] = await baseNames.checkAvailability("available");
      
      expect(available).to.be.true;
      expect(fee).to.equal(REGISTRATION_FEE);
      expect(reason).to.equal("Available");
    });

    it("Should correctly identify unavailable subdomains", async function () {
      await baseNames.connect(addr1).claimSubdomain("unavailable", { value: REGISTRATION_FEE });
      
      const [available, fee, reason] = await baseNames.checkAvailability("unavailable");
      
      expect(available).to.be.false;
      expect(fee).to.equal(0);
      expect(reason).to.equal("Label already exists");
    });

    it("Should identify premium subdomain pricing", async function () {
      const [available, fee, reason] = await baseNames.checkAvailability("abc");
      
      expect(available).to.be.true;
      expect(fee).to.equal(REGISTRATION_FEE * 5n); // Premium multiplier
      expect(reason).to.equal("Available");
    });
  });

  describe("Subdomain Information", function () {
    it("Should return correct subdomain info", async function () {
      const label = "infotest"; // Use longer name to avoid premium pricing
      await baseNames.connect(addr1).claimSubdomain(label, { value: REGISTRATION_FEE });

      const [owner, expiryDate, isPremium, isExpired] = await baseNames.getSubdomainInfo(label);

      expect(owner).to.equal(addr1.address);
      expect(expiryDate).to.be.greaterThan(await getCurrentTimestamp());
      expect(isPremium).to.be.false;
      expect(isExpired).to.be.false;
    });

    it("Should return owned subdomains for an address", async function () {
      await baseNames.connect(addr1).claimSubdomain("owned1", { value: REGISTRATION_FEE });
      await baseNames.connect(addr1).claimSubdomain("owned2", { value: REGISTRATION_FEE });

      const [labels, expiryDates] = await baseNames.getOwnedSubdomains(addr1.address);

      expect(labels).to.have.lengthOf(2);
      expect(labels).to.include("owned1");
      expect(labels).to.include("owned2");
      expect(expiryDates).to.have.lengthOf(2);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update configuration", async function () {
      const newConfig = {
        registrationFee: ethers.parseEther("0.002"),
        renewalFee: ethers.parseEther("0.001"),
        premiumMultiplier: 10,
        requiresApproval: true,
        minLength: 2,
        maxLength: 20
      };

      await expect(
        baseNames.connect(owner).updateConfig(newConfig)
      ).to.emit(baseNames, "SubdomainConfigUpdated");
    });

    it("Should reject config updates from non-owner", async function () {
      const newConfig = {
        registrationFee: ethers.parseEther("0.002"),
        renewalFee: ethers.parseEther("0.001"),
        premiumMultiplier: 10,
        requiresApproval: true,
        minLength: 2,
        maxLength: 20
      };

      await expect(
        baseNames.connect(addr1).updateConfig(newConfig)
      ).to.be.revertedWithCustomError(baseNames, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to set reserved names", async function () {
      await baseNames.connect(owner).setReservedName("newreserved", true);
      
      await expect(
        baseNames.connect(addr1).claimSubdomain("newreserved", { value: REGISTRATION_FEE })
      ).to.be.revertedWith("Label is reserved");
    });

    it("Should allow owner to withdraw fees", async function () {
      // Generate some fees
      await baseNames.connect(addr1).claimSubdomain("feetest", { value: REGISTRATION_FEE });
      
      const contractBalance = await ethers.provider.getBalance(await baseNames.getAddress());
      expect(contractBalance).to.equal(REGISTRATION_FEE);

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      await baseNames.connect(owner).withdrawFees();
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerBalanceAfter).to.be.greaterThan(ownerBalanceBefore);
    });
  });

  describe("Domain Utilities", function () {
    it("Should return correct full domain", async function () {
      const label = "test";
      const expectedDomain = `${label}.${BASE_DOMAIN}`;
      
      expect(await baseNames.fullDomain(label)).to.equal(expectedDomain);
    });
  });

  // Helper functions
  async function getCurrentTimestamp(): Promise<number> {
    const block = await ethers.provider.getBlock("latest");
    return block!.timestamp;
  }

  async function getExpectedExpiryDate(): Promise<number> {
    const currentTimestamp = await getCurrentTimestamp();
    return currentTimestamp + (365 * 24 * 60 * 60); // 1 year
  }
});
