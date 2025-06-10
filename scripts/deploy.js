const hre = require("hardhat");

async function main() {
  // Deploy kontrak
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.waitForDeployment();

  console.log("NFTMarketplace deployed to:", nftMarketplace.target);

  // Mint NFT pertama
  const metadataURI = "data:application/json;base64," + Buffer.from(
    JSON.stringify({
      name: "Kucing Bakekok",
      description: "Ini adalah NFT kucing pertama",
      image: "https://ipfs.io/ipfs/QmZaGdFa3DnVq9uYJvEcHwZQbKShp2U9XeTgKjKZ7iSfjA" 
    })
  ).toString("base64");

  const txMint = await nftMarketplace.mint(metadataURI);
  const receipt = await txMint.wait();

  // Ambil tokenId dari event Transfer
  const transferEvent = receipt.logs.find(log => log.fragment?.name === 'Transfer');
  const tokenId = transferEvent.args[2];

  console.log("NFT minted with tokenId:", tokenId.toString());

  // List NFT dengan harga 0.01 ETH
  const priceInWei = hre.ethers.parseEther("0.01");
  const txList = await nftMarketplace.listItem(tokenId, priceInWei);
  await txList.wait();

  console.log("NFT listed with price: 0.01 ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });