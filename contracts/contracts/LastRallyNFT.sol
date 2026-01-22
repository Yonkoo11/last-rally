// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LastRallyNFT
 * @dev NFT contract for Last Rally achievements and cosmetics
 *
 * Token Types:
 * - Achievements (0-99): Soul-bound, earned through gameplay
 * - Cosmetics (100+): Tradeable, unlocked through achievements
 */
contract LastRallyNFT is ERC721, ERC721URIStorage, Ownable {
    // Token ID counter
    uint256 private _nextTokenId;

    // Achievement IDs are 0-99 (soul-bound)
    uint256 public constant ACHIEVEMENT_MAX_ID = 99;

    // Mapping from player address to their minted achievements
    mapping(address => mapping(uint256 => bool)) public hasAchievement;

    // Mapping from player address to their minted cosmetics
    mapping(address => mapping(uint256 => bool)) public hasCosmetic;

    // Mapping from token ID to achievement/cosmetic ID
    mapping(uint256 => uint256) public tokenToItemId;

    // Mapping from token ID to item type (true = achievement, false = cosmetic)
    mapping(uint256 => bool) public isAchievementToken;

    // Events
    event AchievementMinted(address indexed player, uint256 indexed achievementId, uint256 tokenId);
    event CosmeticMinted(address indexed player, uint256 indexed cosmeticId, uint256 tokenId);

    constructor() ERC721("Last Rally", "RALLY") Ownable(msg.sender) {}

    /**
     * @dev Mint an achievement NFT (soul-bound) - owner only
     * @param to Player address
     * @param achievementId The achievement ID (0-99)
     * @param uri Metadata URI
     */
    function mintAchievement(
        address to,
        uint256 achievementId,
        string memory uri
    ) external onlyOwner returns (uint256) {
        return _mintAchievementInternal(to, achievementId, uri);
    }

    /**
     * @dev Claim an achievement NFT (soul-bound) - anyone can claim for themselves
     * @param achievementId The achievement ID (0-99)
     * @param uri Metadata URI
     */
    function claimAchievement(
        uint256 achievementId,
        string memory uri
    ) external returns (uint256) {
        return _mintAchievementInternal(msg.sender, achievementId, uri);
    }

    /**
     * @dev Internal mint logic
     */
    function _mintAchievementInternal(
        address to,
        uint256 achievementId,
        string memory uri
    ) internal returns (uint256) {
        require(achievementId <= ACHIEVEMENT_MAX_ID, "Invalid achievement ID");
        require(!hasAchievement[to][achievementId], "Achievement already minted");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        hasAchievement[to][achievementId] = true;
        tokenToItemId[tokenId] = achievementId;
        isAchievementToken[tokenId] = true;

        emit AchievementMinted(to, achievementId, tokenId);
        return tokenId;
    }

    /**
     * @dev Mint a cosmetic NFT (tradeable)
     * @param to Player address
     * @param cosmeticId The cosmetic ID (100+)
     * @param uri Metadata URI
     */
    function mintCosmetic(
        address to,
        uint256 cosmeticId,
        string memory uri
    ) external onlyOwner returns (uint256) {
        require(cosmeticId > ACHIEVEMENT_MAX_ID, "Invalid cosmetic ID");
        require(!hasCosmetic[to][cosmeticId], "Cosmetic already minted");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        hasCosmetic[to][cosmeticId] = true;
        tokenToItemId[tokenId] = cosmeticId;
        isAchievementToken[tokenId] = false;

        emit CosmeticMinted(to, cosmeticId, tokenId);
        return tokenId;
    }

    /**
     * @dev Batch mint multiple achievements
     */
    function batchMintAchievements(
        address to,
        uint256[] calldata achievementIds,
        string[] calldata uris
    ) external onlyOwner {
        require(achievementIds.length == uris.length, "Arrays length mismatch");

        for (uint256 i = 0; i < achievementIds.length; i++) {
            if (!hasAchievement[to][achievementIds[i]] && achievementIds[i] <= ACHIEVEMENT_MAX_ID) {
                uint256 tokenId = _nextTokenId++;
                _safeMint(to, tokenId);
                _setTokenURI(tokenId, uris[i]);

                hasAchievement[to][achievementIds[i]] = true;
                tokenToItemId[tokenId] = achievementIds[i];
                isAchievementToken[tokenId] = true;

                emit AchievementMinted(to, achievementIds[i], tokenId);
            }
        }
    }

    /**
     * @dev Check if player has an achievement
     */
    function playerHasAchievement(address player, uint256 achievementId) external view returns (bool) {
        return hasAchievement[player][achievementId];
    }

    /**
     * @dev Check if player has a cosmetic
     */
    function playerHasCosmetic(address player, uint256 cosmeticId) external view returns (bool) {
        return hasCosmetic[player][cosmeticId];
    }

    /**
     * @dev Get all achievement IDs for a player (up to 22 achievements)
     */
    function getPlayerAchievements(address player) external view returns (uint256[] memory) {
        uint256 count = 0;

        // Count achievements
        for (uint256 i = 0; i <= ACHIEVEMENT_MAX_ID; i++) {
            if (hasAchievement[player][i]) count++;
        }

        // Build array
        uint256[] memory achievements = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i <= ACHIEVEMENT_MAX_ID; i++) {
            if (hasAchievement[player][i]) {
                achievements[index++] = i;
            }
        }

        return achievements;
    }

    // Soul-bound: Achievements cannot be transferred
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Block transfers of achievement tokens (soul-bound)
        // Allow minting (from == address(0)) and burning (to == address(0))
        if (from != address(0) && to != address(0) && isAchievementToken[tokenId]) {
            revert("Achievements are soul-bound");
        }

        return super._update(to, tokenId, auth);
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
