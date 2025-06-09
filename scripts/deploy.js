const { ethers } = require("hardhat");

async function main() {
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const nftMarketplace = await NFTMarketplace.deploy();

    console.log("NFTMarketplace deployed to:", nftMarketplace.target); // gunakan .target untuk alamat kontrak
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });