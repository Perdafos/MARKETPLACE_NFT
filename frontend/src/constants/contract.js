import { BrowserProvider } from "ethers";
import NFTMarketplace from "../constants/NFTMarketplace.json"; // pastikan path benar

const CONTRACT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask tidak tersedia");

  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplace.abi, signer);
}