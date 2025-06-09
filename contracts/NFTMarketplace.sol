// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
    }

    mapping(uint256 => Listing) public listings;

    constructor() ERC721("DafaNFT", "DNFT") {}

    function mint(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        return tokenId;
    }

    function listItem(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Bukan pemilik");
        listings[tokenId] = Listing(tokenId, msg.sender, price);
    }

    function buyItem(uint256 tokenId) public payable {
        Listing memory item = listings[tokenId];
        require(item.price > 0, "Item tidak terdaftar");
        require(msg.value >= item.price, "Bayaran kurang");

        address seller = item.seller;

        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(msg.value);

        delete listings[tokenId];
    }

    function getAvailableNFTs() public view returns (Listing[] memory) {
        uint256 totalItems = _tokenIds.current();
        uint256 availableCount = 0;

        // hitung berapa item yang tersedia (listing price > 0)
        for (uint256 i = 1; i <= totalItems; i++) {
            if (listings[i].price > 0) {
                availableCount++;
            }
        }

        Listing[] memory availableItems = new Listing[](availableCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= totalItems; i++) {
            if (listings[i].price > 0) {
                availableItems[index] = listings[i];
                index++;
            }
        }
        return availableItems;
    }
}
