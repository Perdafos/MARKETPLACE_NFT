import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Mint from "./pages/Mint";
import Marketplace from "./pages/Marketplace";
import Home from "./pages/Home";

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);

  // 🔁 Cek jika sudah connect saat reload
  useEffect(() => {
    const connectWalletOnLoad = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });

        if (accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.setItem("isWalletConnected", "true");
        }
      }
    };

    connectWalletOnLoad();
  }, []);

  // 💰 Fetch balance saat account berubah
  useEffect(() => {
    const fetchBalance = async () => {
      if (!window.ethereum || !account) return;

      const balanceWei = await window.ethereum.request({
        method: "eth_getBalance",
        params: [account, "latest"],
      });

      const ethBalance = parseFloat(parseInt(balanceWei, 16) / 1e18).toFixed(4);
      setBalance(ethBalance);
    };

    fetchBalance();

    // Opsional: Auto-refresh setiap 15 detik
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [account]);

  // 📡 Listen perubahan akun dari MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.setItem("isWalletConnected", "true");
        } else {
          setAccount(null);
          localStorage.removeItem("isWalletConnected");
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
      }
    };
  }, []);

  // 🔐 Tombol Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Metamask belum terinstal");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
      localStorage.setItem("isWalletConnected", "true");
      alert("Wallet berhasil terkoneksi");
    } catch (error) {
      console.error("Gagal koneksi ke wallet:", error);
      alert("Pengguna menolak koneksi ke MetaMask");
    }
  };

  // 🚫 Disconnect handler (opsional)
  const disconnectWallet = () => {
    setAccount(null);
    localStorage.removeItem("isWalletConnected");
    alert("Wallet terputus");
  };

  // Avatar Dicebear untuk identitas user
  const avatarUrl = account
    ? `https://api.dicebear.com/7.x/identicon/svg?seed=${account}`
    : null;

  return (
    <Router>
      <div className="p-4">
        <nav className="space-x-4 flex items-center mb-6">
          <Link to="/" className="text-blue-600 font-semibold">Home</Link>
          <Link to="/mint" className="text-blue-600 font-semibold">Mint NFT</Link>
          <Link to="/marketplace" className="text-blue-600 font-semibold">Marketplace</Link>

          {account ? (
            <div className="ml-auto flex items-center bg-white px-3 py-1 rounded shadow cursor-pointer">
              <img src={avatarUrl} alt="avatar" className="w-6 h-6 rounded-full mr-2" />
              <div className="flex flex-col">
                <span className="font-mono text-sm">{account.slice(0, 6)}...{account.slice(-4)}</span>
                {balance !== null && (
                  <span className="text-green-600 font-mono text-xs">{balance} ETH</span>
                )}
              </div>
              <button onClick={disconnectWallet} className="ml-4 px-2 py-1 text-red-500 text-xs">
                Putus Koneksi
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="ml-auto px-3 py-1 bg-blue-500 text-white rounded cursor-pointer"
            >
              Connect Wallet
            </button>
          )}
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/marketplace" element={<Marketplace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;