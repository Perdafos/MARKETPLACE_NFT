import React from "react";

export default function NFTCard({ nft, onBuy }) {
  return (
    <div className="max-w-sm rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition">
      <img src={nft.image} alt={nft.name} className="w-full h-64 object-cover" />
      <div className="p-4">
        <h2 className="text-xl font-bold">{nft.name}</h2>
        <p className="text-sm text-gray-500">{nft.description}</p>
        <p className="mt-2 text-lg font-semibold text-blue-600">{nft.price} ETH</p>
        {onBuy && (
          <button
            className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            onClick={() => onBuy(nft)}
          >
            Beli NFT
          </button>
        )}
      </div>
    </div>
  );
}
