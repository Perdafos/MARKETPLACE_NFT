import { ethers } from "ethers";
import NFTMarketplace from "../constants/NFTMarketplace.json";

const CONTRACT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask tidak tersedia");

  const provider = new ethers.BrowserProvider(window.ethereum);
  
  try {
    // Memastikan akun telah terhubung
    await provider.send("eth_requestAccounts", []);
    
    const signer = await provider.getSigner();
    
    // Mengembalikan instance kontrak
    return new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplace.abi, signer);
  } catch (error) {
    console.error("Gagal koneksi ke wallet atau ambil signer:", error);
    throw error;
  }
}