import React, { useState, useEffect } from "react";
import { getContract } from "../utils/contract";
import { ethers } from "ethers";

export default function Marketplace() {
  const [allNFTs, setAllNFTs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAllNFTs = async () => {
    try {
      const contract = await getContract();
      const [tokenIds, sellers, prices] = await contract.getAvailableNFTs();

      if (!Array.isArray(tokenIds)) {
        setAllNFTs([]);
        return;
      }

      const fetchedNFTs = [];

      for (let idx = 0; idx < tokenIds.length; idx++) {
        const tokenId = tokenIds[idx];

        try {
          const owner = await contract.ownerOf(tokenId);
          if (
            !owner ||
            owner === "0x0000000000000000000000000000000000000000"
          ) {
            continue;
          }

          const tokenURI = await contract.tokenURI(tokenId);
          const metadata = await fetchMetadata(tokenURI);

          fetchedNFTs.push({
            tokenId: tokenId.toString(),
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            price: ethers.formatEther(prices[idx].toString()),
            seller: sellers[idx],
          });
        } catch (err) {
          console.warn("Gagal ambil token:", tokenId.toString(), err.message);
          continue;
        }
      }

      setAllNFTs(fetchedNFTs);
      setLoading(false);
    } catch (err) {
      console.error("Gagal muat NFT:", err);
      alert("Gagal muat marketplace: " + err.message);
      setLoading(false);
    }
  };

  const fetchMetadata = async (tokenURI) => {
    if (tokenURI.startsWith("data:")) {
      const base64Data = tokenURI.split(",")[1];
      const jsonString = atob(base64Data);
      return JSON.parse(jsonString);
    } else {
      const response = await fetch(tokenURI);
      return await response.json();
    }
  };

  // Fungsi beli NFT
  const buyNFT = async (tokenId, price) => {
    if (!window.confirm(`Yakin membeli NFT #${tokenId} seharga ${price} ETH?`))
      return;

    try {
      const contract = await getContract();
      const priceInWei = ethers.parseEther(price);

      const tx = await contract.buyItem(tokenId, { value: priceInWei });
      await tx.wait();

      alert("Berhasil membeli NFT!");
      loadAllNFTs();
    } catch (err) {
      console.error("Gagal membeli NFT:", err);
      alert("Gagal membeli NFT: " + err.message);
    }
  };

  // Setup event listener
  useEffect(() => {
    const handleNFTSold = (e) => {
      const { tokenId, buyer, price } = e.detail;
      alert(`🎉 NFT #${tokenId} terjual kepada ${buyer} seharga ${price} ETH`);
      loadAllNFTs(); // refresh daftar NFT
    };

    window.addEventListener("nftSold", handleNFTSold);

    return () => {
      window.removeEventListener("nftSold", handleNFTSold);
    };
  }, []);
  // Muat semua NFT saat mount
  useEffect(() => {
    loadAllNFTs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Marketplace NFT</h1>

      {loading ? (
        <p>Memuat NFT...</p>
      ) : allNFTs.length === 0 ? (
        <p className="text-center text-gray-500">Belum ada NFT dijual.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allNFTs.map((nft) => (
            <div key={nft.tokenId} className="border rounded-lg p-4 shadow-md">
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-48 object-cover mb-2"
              />
              <h3 className="font-bold">{nft.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{nft.description}</p>
              <p className="font-semibold">{nft.price} ETH</p>
              <button
                onClick={() => buyNFT(nft.tokenId, nft.price)}
                className="mt-2 bg-green-500 text-white py-1 px-3 rounded w-full"
              >
                Beli NFT
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
