import React, { useState, useEffect } from "react";
import { getContract } from "../utils/contract";
import { uploadImageToIPFS } from "../utils/ipfs";
import { ethers } from "ethers";

export default function Mint() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myNFTs, setMyNFTs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");

  // Memuat NFT milik pengguna
  const loadMyNFTs = async () => {
    try {
      const contract = await getContract();

      const [tokenIds, sellers, prices] = await contract.getAvailableNFTs();

      if (
        !Array.isArray(tokenIds) ||
        !Array.isArray(sellers) ||
        !Array.isArray(prices)
      ) {
        setMyNFTs([]);
        return;
      }

      if (
        tokenIds.length !== sellers.length ||
        tokenIds.length !== prices.length
      ) {
        console.error("Data token tidak konsisten:", {
          tokenIds,
          sellers,
          prices,
        });
        setMyNFTs([]);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const ownedNFTs = [];

      for (let idx = 0; idx < tokenIds.length; idx++) {
        const tokenId = tokenIds[idx];

        try {
          // Cek apakah token benar-benar ada
          const owner = await contract.ownerOf(tokenId);

          if (
            !owner ||
            owner.toLowerCase() === "0x0000000000000000000000000000000000000000"
          ) {
            continue;
          }

          const tokenURI = await contract.tokenURI(tokenId);
          const metadata = await fetchMetadata(tokenURI);

          const isUserOwner = owner.toLowerCase() === userAddress.toLowerCase();

          ownedNFTs.push({
            tokenId: tokenId.toString(),
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            price: ethers.formatEther(prices[idx].toString()),
            seller: sellers[idx],
            isOwner: isUserOwner,
          });
        } catch (err) {
          console.warn(
            "Gagal ambil data token:",
            tokenId.toString(),
            err.message
          );
          continue;
        }
      }

      setMyNFTs(ownedNFTs);
    } catch (err) {
      console.error("Gagal memuat NFT:", err);
      alert("Gagal memuat NFT: " + err.message);
      setMyNFTs([]);
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

  useEffect(() => {
    loadMyNFTs();
  }, []);

  const mintAndListNFT = async () => {
  if (!name || !imageFile || !price) return alert("Lengkapi nama, harga, dan pilih gambar");

  try {
    setLoading(true);

    // Upload gambar ke IPFS
    const imageIPFSUrl = await uploadImageToIPFS(imageFile);

    // Buat metadata NFT
    const metadata = {
      name,
      description,
      image: imageIPFSUrl
    };

    const metadataURI = "data:application/json;base64," + btoa(JSON.stringify(metadata));

    const contract = await getContract();
    
    // Mint NFT
    const txMint = await contract.mint(metadataURI);
    const receipt = await txMint.wait(); // ⚠️ PASTIKAN INI SELESAI

    // Ambil tokenId dari event Transfer
    const transferEvent = receipt.logs.find(log => log.fragment?.name === 'Transfer');
    if (!transferEvent) throw new Error("Transfer event tidak ditemukan");

    const tokenId = transferEvent.args[2]; // tokenId adalah argumen ke-3

    // List NFT dengan harga
    const priceInWei = ethers.parseEther(price);
    const txList = await contract.listItem(tokenId, priceInWei);
    await txList.wait();

    alert("NFT berhasil di-mint dan ditawarkan!");
    resetForm();
    await loadMyNFTs();
  } catch (err) {
    console.error(err);
    alert("Gagal mint NFT: " + err.message);
  } finally {
    setLoading(false);
  }
};

  const updateListingPrice = async (tokenId) => {
    if (!editPrice) return alert("Masukkan harga baru");

    try {
      setLoading(true);
      const contract = await getContract();
      const priceInWei = ethers.parseEther(editPrice);
      const tx = await contract.listItem(tokenId, priceInWei);
      await tx.wait();

      alert("Harga NFT berhasil diupdate!");
      setEditingId(null);
      await loadMyNFTs();
    } catch (err) {
      console.error(err);
      alert("Gagal update harga NFT");
    } finally {
      setLoading(false);
    }
  };

  const cancelListing = async (tokenId) => {
    if (!window.confirm("Yakin ingin membatalkan penawaran NFT ini?")) return;

    try {
      setLoading(true);
      const contract = await getContract();
      const tx = await contract.listItem(tokenId, 0);
      await tx.wait();

      alert("Penawaran NFT dibatalkan!");
      await loadMyNFTs();
    } catch (err) {
      console.error(err);
      alert("Gagal membatalkan penawaran NFT");
    } finally {
      setLoading(false);
    }
  };

  const buyNFT = async (tokenId, price) => {
    if (!window.confirm(`Yakin membeli NFT ini seharga ${price} ETH?`)) return;

    try {
      setLoading(true);
      const contract = await getContract();
      const priceInWei = ethers.parseEther(price.toString());

      const tx = await contract.buyItem(tokenId, { value: priceInWei });
      await tx.wait();

      alert("Berhasil membeli NFT!");
      await loadMyNFTs(); // refresh list
    } catch (err) {
      console.error("Gagal membeli NFT:", err);
      alert("Gagal membeli NFT: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImageFile(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mint NFT Baru</h1>

      {/* Form Minting */}
      <div className="bg-gray-100 p-4 rounded-lg mb-8">
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
          type="number"
          placeholder="Harga NFT (ETH)"
          className="w-full mb-3 p-2 border rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={loading}
          step="0.01"
          min="0"
        />
        <input
          type="file"
          accept="image/*"
          className="w-full mb-3 p-2 border rounded"
          onChange={(e) => setImageFile(e.target.files[0])}
          disabled={loading}
        />
        <button
          onClick={mintAndListNFT}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Minting..." : "Mint & Jual NFT"}
        </button>
      </div>

      {/* Daftar NFT Saya */}
      <h2 className="text-xl font-bold mb-4">NFT Saya yang Dijual</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myNFTs.length > 0 ? (
          myNFTs.map((nft) => (
            <div key={nft.tokenId} className="border rounded-lg p-4">
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-48 object-cover mb-2 rounded"
              />
              <h3 className="font-bold">{nft.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{nft.description}</p>
              <p className="font-semibold">{nft.price} ETH</p>

              {nft.isOwner ? (
                editingId === nft.tokenId ? (
                  <div className="mt-2">
                    <input
                      type="number"
                      placeholder="Harga Baru"
                      className="w-full p-2 border rounded mb-2"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                    <button
                      onClick={() => updateListingPrice(nft.tokenId)}
                      className="bg-blue-500 text-white py-1 px-3 rounded mr-2"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-500 text-white py-1 px-3 rounded"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        setEditingId(nft.tokenId);
                        setEditPrice(nft.price);
                      }}
                      className="bg-yellow-500 text-white py-1 px-3 rounded mr-2"
                    >
                      Edit Harga
                    </button>
                    <button
                      onClick={() => cancelListing(nft.tokenId)}
                      className="bg-red-500 text-white py-1 px-3 rounded"
                    >
                      Batalkan Penjualan
                    </button>
                  </div>
                )
              ) : (
                <button
                  onClick={() => buyNFT(nft.tokenId, nft.price)}
                  className="bg-green-500 text-white py-1 px-3 rounded mt-2"
                >
                  Beli NFT
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            Belum ada NFT yang dijual.
          </p>
        )}
      </div>
    </div>
  );
}
