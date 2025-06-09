import React, { useState } from "react";
import { getContract } from "../utils/contract";
import { parseEther } from "ethers";

export default function ListItem() {
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const listNFT = async () => {
    if (!tokenId || !price) return alert("Lengkapi tokenId dan harga");

    try {
      setLoading(true);
      const contract = await getContract();
      const tx = await contract.listItem(tokenId, parseEther(price));
      await tx.wait();

      alert("NFT berhasil didaftarkan untuk dijual");
      setTokenId("");
      setPrice("");
    } catch (err) {
      console.error(err);
      alert("Gagal mendaftarkan NFT");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Jual NFT Anda</h1>
      <input
        type="number"
        placeholder="Token ID NFT"
        className="w-full mb-3 p-2 border rounded"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Harga dalam ETH"
        className="w-full mb-3 p-2 border rounded"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        disabled={loading}
      />
      <button
        onClick={listNFT}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Listing..." : "Jual NFT"}
      </button>
    </div>
  );
}
