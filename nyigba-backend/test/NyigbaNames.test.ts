import { expect } from "chai";
import { ethers } from "hardhat";
// Using BaseSepoliaNyigbaNames instead of NyigbaNames

describe("BaseSepoliaNyigbaNames (Legacy Test)", function () {
  let nyigbaNames: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const BaseSepoliaNyigbaNames = await ethers.getContractFactory("BaseSepoliaNyigbaNames");
    nyigbaNames = await BaseSepoliaNyigbaNames.deploy();
    await nyigbaNames.waitForDeployment();
  });

  describe("Claiming names", function () {
    it("Should allow claiming available names", async function () {
      const premiumFee = ethers.parseEther("0.005"); // Premium fee for 4-char names
      const tx = await nyigbaNames.claimSubdomain("test", {
        value: premiumFee
      });

      await expect(tx)
        .to.emit(nyigbaNames, "NameClaimed");

      const node = ethers.keccak256(ethers.toUtf8Bytes("test.nyigba-base.eth"));
      // Use specific function signature to avoid ambiguity
      const nodeOwner = await nyigbaNames['owner(bytes32)'](node);
      expect(nodeOwner).to.equal(owner.address);
    });

    it("Should not allow claiming already taken names", async function () {
      const premiumFee = ethers.parseEther("0.005");
      await nyigbaNames.claimSubdomain("test", { value: premiumFee });
      await expect(nyigbaNames.claimSubdomain("test", { value: premiumFee }))
        .to.be.revertedWith("Label already exists");
    });

    it("Should not allow claiming short names", async function () {
      await expect(nyigbaNames.claimSubdomain("ab", { value: ethers.parseEther("0.001") }))
        .to.be.revertedWith("Label too short");
    });
  });

  describe("Text records", function () {
    let node: string;

    beforeEach(async function () {
      const premiumFee = ethers.parseEther("0.005"); // Premium fee for 4-char names
      await nyigbaNames.claimSubdomain("test", { value: premiumFee });
      node = ethers.keccak256(ethers.toUtf8Bytes("test.nyigba-base.eth"));
    });

    it("Should allow setting text records", async function () {
      await expect(nyigbaNames.setText(node, "bio", "Test bio"))
        .to.emit(nyigbaNames, "TextRecordSet")
        .withArgs(node, "bio", "Test bio");

      expect(await nyigbaNames.text(node, "bio")).to.equal("Test bio");
    });

    it("Should not allow setting text records for unowned names", async function () {
      const otherNode = ethers.keccak256(ethers.toUtf8Bytes("other.nyigba-base.eth"));
      await expect(nyigbaNames.connect(addr1).setText(otherNode, "bio", "Test"))
        .to.be.revertedWith("Not name owner");
    });
  });

  describe("Availability checking", function () {
    it("Should correctly check name availability", async function () {
      const [available, fee, reason] = await nyigbaNames.checkAvailability("available");
      expect(available).to.be.true;
      expect(fee).to.equal(ethers.parseEther("0.001"));
      expect(reason).to.equal("Available");
    });

    it("Should detect unavailable names", async function () {
      await nyigbaNames.claimSubdomain("taken", { value: ethers.parseEther("0.001") });
      const [available, , reason] = await nyigbaNames.checkAvailability("taken");
      expect(available).to.be.false;
      expect(reason).to.equal("Label already exists");
    });
  });
});
