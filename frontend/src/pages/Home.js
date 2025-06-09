import React, { useEffect, useState } from "react";
import NFTCard from "../components/NFTCard";
import { getContract } from "../utils/contract";
import { parseEther, formatEther } from "ethers";

export default function Home() {
  const [nfts, setNfts] = useState([]);

  const loadNFTs = async () => {
    try {
      const contract = await getContract();
      const tokens = [];

      for (let tokenId = 1; tokenId <= 10; tokenId++) {
        try {
          const uri = await contract.tokenURI(tokenId);
          const res = await fetch(uri);
          const metadata = await res.json();

          const listing = await contract.listings(tokenId);
          if (listing && listing.price > 0) {
            tokens.push({
              id: tokenId,
              price: formatEther(listing.price),
              ...metadata,
            });
          }
        } catch (err) {
          break;
        }
      }

      setNfts(tokens);
    } catch (err) {
      console.error("Gagal load NFT:", err);
    }
  };

  const handleBuy = async (nft) => {
    try {
      const contract = await getContract();
      const tx = await contract.buyItem(nft.id, {
        value: parseEther(nft.price),
      });
      await tx.wait();
      alert("NFT berhasil dibeli!");
      loadNFTs();
    } catch (err) {
      alert("Gagal membeli NFT: " + err.message);
    }
  };

  useEffect(() => {
    loadNFTs();
  }, []);

  return (
    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} onBuy={handleBuy} />
      ))}
    </div>
  );
}


