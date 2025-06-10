import React, { useState } from "react";
import { getContract } from "../utils/contract";
import { ethers } from "ethers";

export default function ListItem() {
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");

  const listItem = async () => {
    if (!tokenId || !price) return alert("Isi tokenId dan harga");

    try {
      const contract = await getContract();
      const priceInWei = ethers.parseEther(price);
      const tx = await contract.listItem(tokenId, priceInWei);
      await tx.wait();
      alert("NFT berhasil di-list");
    } catch (err) {
      alert("Gagal list NFT: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">List NFT</h2>
      <div className="space-y-4">
        <input
          type="number"
          placeholder="Token ID"
          className="w-full p-2 border rounded"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Harga (ETH)"
          className="w-full p-2 border rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          step="0.01"
          min="0"
        />
        <button
          onClick={listItem}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          List NFT
        </button>
      </div>
    </div>
  );
}