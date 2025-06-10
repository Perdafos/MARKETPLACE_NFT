// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Listing {
        address seller;
        uint256 price;
    }

    mapping(uint256 => Listing) public listings;

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string tokenURI
    );
    event NFTBought(uint256 indexed tokenId, address indexed buyer, address seller, uint256 price);

    constructor() ERC721("DafaNFT", "DNFT") {}

    function mint(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        emit NFTMinted(newItemId, msg.sender, tokenURI);
        return newItemId;
    }

    function listItem(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Bukan pemilik");
        listings[tokenId] = Listing(msg.sender, price);
    }

    function buyItem(uint256 tokenId) public payable {
        Listing memory item = listings[tokenId];
        require(item.price > 0, "Item tidak terdaftar");
        require(msg.value >= item.price, "Bayaran kurang");

        address seller = item.seller;

        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(msg.value);

        delete listings[tokenId];

        emit NFTBought(tokenId, msg.sender, seller, item.price);
    }

    function getAvailableNFTs()
        public
        view
        returns (
            uint256[] memory tokenIds,
            address[] memory sellers,
            uint256[] memory prices
        )
    {
        uint256 totalItems = _tokenIds.current();
        uint256 availableCount = 0;

        for (uint256 i = 1; i <= totalItems; i++) {
            if (listings[i].price > 0 && ownerOf(i) != address(0)) {
                availableCount++;
            }
        }

        uint256[] memory ids = new uint256[](availableCount);
        address[] memory addrs = new address[](availableCount);
        uint256[] memory priceList = new uint256[](availableCount);

        uint256 index = 0;
        for (uint256 i = 1; i <= totalItems; i++) {
            if (listings[i].price > 0 && ownerOf(i) != address(0)) {
                ids[index] = i;
                addrs[index] = listings[i].seller;
                priceList[index] = listings[i].price;
                index++;
            }
        }

        return (ids, addrs, priceList);
    }
}
