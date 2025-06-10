import { Contract, BrowserProvider } from "ethers";
import NFTMarketplace from "../constants/NFTMarketplace.json";

const CONTRACT_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";

// Tambahkan guard flag di luar fungsi
let isRequestingAccounts = false;
let contractPromise = null;

export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask tidak tersedia");

  if (isRequestingAccounts) {
    // Jika sudah ada promise, tunggu promise yang sama
    if (contractPromise) {
      return contractPromise;
    }
    // fallback lama (seharusnya tidak pernah terjadi)
    console.warn("Masih menunggu koneksi wallet...");
    return null;
  }

  const provider = new BrowserProvider(window.ethereum);

  try {
    isRequestingAccounts = true;
    contractPromise = (async () => {
      // Pastikan wallet terkoneksi sebelum ambil signer
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      return new Contract(CONTRACT_ADDRESS, NFTMarketplace.abi, signer);
    })();
    const contract = await contractPromise;
    return contract;
  } catch (error) {
    console.error("Gagal koneksi ke wallet:", error);
    return null;
  } finally {
    isRequestingAccounts = false;
    contractPromise = null;
  }
}
