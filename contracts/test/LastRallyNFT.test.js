const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LastRallyNFT", function () {
  let nft;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    const LastRallyNFT = await ethers.getContractFactory("LastRallyNFT");
    nft = await LastRallyNFT.deploy();
  });

  describe("Deployment", function () {
    it("should set correct name and symbol", async function () {
      expect(await nft.name()).to.equal("Last Rally");
      expect(await nft.symbol()).to.equal("RALLY");
    });

    it("should set deployer as owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });
  });

  describe("Achievement Claiming", function () {
    it("should allow anyone to claim an achievement", async function () {
      const tx = await nft.connect(player1).claimAchievement(0, "data:application/json;base64,test");
      await tx.wait();
      expect(await nft.hasAchievement(player1.address, 0)).to.be.true;
    });

    it("should emit AchievementMinted event", async function () {
      await expect(nft.connect(player1).claimAchievement(5, "uri://test"))
        .to.emit(nft, "AchievementMinted")
        .withArgs(player1.address, 5, 0); // tokenId 0 (first mint)
    });

    it("should reject duplicate achievement claims", async function () {
      await nft.connect(player1).claimAchievement(0, "uri://test");
      await expect(
        nft.connect(player1).claimAchievement(0, "uri://test")
      ).to.be.revertedWith("Achievement already minted");
    });

    it("should reject achievement IDs above 99", async function () {
      await expect(
        nft.connect(player1).claimAchievement(100, "uri://test")
      ).to.be.revertedWith("Invalid achievement ID");
    });

    it("should allow different players to claim same achievement", async function () {
      await nft.connect(player1).claimAchievement(0, "uri://p1");
      await nft.connect(player2).claimAchievement(0, "uri://p2");
      expect(await nft.hasAchievement(player1.address, 0)).to.be.true;
      expect(await nft.hasAchievement(player2.address, 0)).to.be.true;
    });

    it("should store token URI correctly", async function () {
      await nft.connect(player1).claimAchievement(0, "data:application/json;base64,eyJ0ZXN0IjoidHJ1ZSJ9");
      expect(await nft.tokenURI(0)).to.equal("data:application/json;base64,eyJ0ZXN0IjoidHJ1ZSJ9");
    });
  });

  describe("Owner Minting", function () {
    it("should allow owner to mint for any player", async function () {
      await nft.connect(owner).mintAchievement(player1.address, 10, "uri://test");
      expect(await nft.hasAchievement(player1.address, 10)).to.be.true;
    });

    it("should reject non-owner minting", async function () {
      await expect(
        nft.connect(player1).mintAchievement(player2.address, 10, "uri://test")
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });

  describe("Batch Minting", function () {
    it("should batch mint multiple achievements", async function () {
      await nft.connect(owner).batchMintAchievements(
        player1.address,
        [0, 1, 2],
        ["uri://0", "uri://1", "uri://2"]
      );
      expect(await nft.hasAchievement(player1.address, 0)).to.be.true;
      expect(await nft.hasAchievement(player1.address, 1)).to.be.true;
      expect(await nft.hasAchievement(player1.address, 2)).to.be.true;
    });

    it("should reject mismatched array lengths", async function () {
      await expect(
        nft.connect(owner).batchMintAchievements(
          player1.address,
          [0, 1],
          ["uri://0"]
        )
      ).to.be.revertedWith("Arrays length mismatch");
    });

    it("should skip already-minted achievements in batch", async function () {
      await nft.connect(player1).claimAchievement(0, "uri://first");
      // Batch includes already-minted ID 0 - should skip it, mint 1 and 2
      await nft.connect(owner).batchMintAchievements(
        player1.address,
        [0, 1, 2],
        ["uri://0-dup", "uri://1", "uri://2"]
      );
      expect(await nft.hasAchievement(player1.address, 1)).to.be.true;
      expect(await nft.hasAchievement(player1.address, 2)).to.be.true;
      // Original URI should be preserved (not overwritten)
      expect(await nft.tokenURI(0)).to.equal("uri://first");
    });
  });

  describe("Soul-bound (Non-transferable Achievements)", function () {
    it("should block transfer of achievement tokens", async function () {
      await nft.connect(player1).claimAchievement(0, "uri://test");
      await expect(
        nft.connect(player1).transferFrom(player1.address, player2.address, 0)
      ).to.be.revertedWith("Achievements are soul-bound");
    });

    it("should block safeTransferFrom of achievement tokens", async function () {
      await nft.connect(player1).claimAchievement(0, "uri://test");
      await expect(
        nft.connect(player1)["safeTransferFrom(address,address,uint256)"](
          player1.address, player2.address, 0
        )
      ).to.be.revertedWith("Achievements are soul-bound");
    });

    it("should allow transfer of cosmetic tokens", async function () {
      await nft.connect(owner).mintCosmetic(player1.address, 100, "uri://cosmetic");
      await nft.connect(player1).transferFrom(player1.address, player2.address, 0);
      expect(await nft.ownerOf(0)).to.equal(player2.address);
    });
  });

  describe("Cosmetic Minting", function () {
    it("should allow owner to mint cosmetics", async function () {
      await nft.connect(owner).mintCosmetic(player1.address, 100, "uri://cosmetic");
      expect(await nft.hasCosmetic(player1.address, 100)).to.be.true;
    });

    it("should reject cosmetic IDs in achievement range", async function () {
      await expect(
        nft.connect(owner).mintCosmetic(player1.address, 50, "uri://test")
      ).to.be.revertedWith("Invalid cosmetic ID");
    });

    it("should reject duplicate cosmetics", async function () {
      await nft.connect(owner).mintCosmetic(player1.address, 100, "uri://test");
      await expect(
        nft.connect(owner).mintCosmetic(player1.address, 100, "uri://test")
      ).to.be.revertedWith("Cosmetic already minted");
    });
  });

  describe("Query Functions", function () {
    it("should return player achievements", async function () {
      await nft.connect(player1).claimAchievement(0, "uri://0");
      await nft.connect(player1).claimAchievement(5, "uri://5");
      await nft.connect(player1).claimAchievement(10, "uri://10");

      const achievements = await nft.getPlayerAchievements(player1.address);
      expect(achievements.length).to.equal(3);
      expect(achievements[0]).to.equal(0n);
      expect(achievements[1]).to.equal(5n);
      expect(achievements[2]).to.equal(10n);
    });

    it("should return empty array for player with no achievements", async function () {
      const achievements = await nft.getPlayerAchievements(player1.address);
      expect(achievements.length).to.equal(0);
    });

    it("should check achievement via playerHasAchievement", async function () {
      expect(await nft.playerHasAchievement(player1.address, 0)).to.be.false;
      await nft.connect(player1).claimAchievement(0, "uri://test");
      expect(await nft.playerHasAchievement(player1.address, 0)).to.be.true;
    });
  });

  describe("Token ID Tracking", function () {
    it("should increment token IDs sequentially", async function () {
      await nft.connect(player1).claimAchievement(0, "uri://0");
      await nft.connect(player1).claimAchievement(1, "uri://1");
      await nft.connect(owner).mintCosmetic(player1.address, 100, "uri://100");

      expect(await nft.ownerOf(0)).to.equal(player1.address);
      expect(await nft.ownerOf(1)).to.equal(player1.address);
      expect(await nft.ownerOf(2)).to.equal(player1.address);

      expect(await nft.tokenToItemId(0)).to.equal(0n);
      expect(await nft.tokenToItemId(1)).to.equal(1n);
      expect(await nft.tokenToItemId(2)).to.equal(100n);

      expect(await nft.isAchievementToken(0)).to.be.true;
      expect(await nft.isAchievementToken(1)).to.be.true;
      expect(await nft.isAchievementToken(2)).to.be.false;
    });
  });
});
