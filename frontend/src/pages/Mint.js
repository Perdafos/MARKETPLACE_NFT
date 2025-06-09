import React, { useState } from "react";
import { getContract } from "../utils/contract";
import { uploadImageToIPFS } from "../utils/ipfs";

export default function Mint() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const mintNFT = async () => {
    if (!name || !imageFile) return alert("Lengkapi nama dan pilih gambar");

    try {
      setLoading(true);

      // Upload gambar ke IPFS
      const imageIPFSUrl = await uploadImageToIPFS(imageFile);

      // Buat metadata NFT, gunakan URL IPFS gambar
      const metadata = {
        name,
        description,
        image: imageIPFSUrl,
      };

      // Buat data URI metadata base64
      const metadataURI =
        "data:application/json;base64," + btoa(JSON.stringify(metadata));

      const contract = await getContract();
      const tx = await contract.mint(metadataURI);
      await tx.wait();

      alert("NFT berhasil di-mint!");
      setName("");
      setDescription("");
      setImageFile(null);
    } catch (err) {
      console.error(err);
      alert("Gagal mint NFT");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mint NFT Baru</h1>
      <input
        type="text"
        placeholder="Nama NFT"
        className="w-full mb-3 p-2 border rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
      />
      <textarea
        placeholder="Deskripsi NFT"
        className="w-full mb-3 p-2 border rounded"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
      />
      <input
        type="file"
        accept="image/*"
        className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setImageFile(e.target.files[0])}
        disabled={loading}
      />
      <button
        onClick={mintNFT}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Minting..." : "Mint NFT"}
      </button>
    </div>
  );
}
