import React from "react";

export default function NFTCard({ nft, onBuy }) {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <img
        src={nft.image}
        alt={nft.name}
        className="w-full h-48 object-cover mb-2 rounded"
      />
      <h3 className="font-bold">{nft.name}</h3>
      <p className="text-sm text-gray-600 mb-1">{nft.description}</p>
      <p className="font-semibold">{nft.price} ETH</p>

      {onBuy && (
        <button
          onClick={onBuy}
          className="mt-2 bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded w-full"
        >
          Beli NFT
        </button>
      )}
    </div>
  );
}