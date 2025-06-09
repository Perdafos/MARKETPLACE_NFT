import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Mint from "./pages/Mint";
import ListItem from "./pages/ListItem";
import Home from "./pages/Home";

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);

  // Cek jika sudah terkoneksi wallet saat reload
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then(accounts => {
        if (accounts.length > 0) setAccount(accounts[0]);
      });
      // Listen account change
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  // Fetch balance setiap kali account berubah
  useEffect(() => {
    async function fetchBalance() {
      if (window.ethereum && account) {
        const balanceWei = await window.ethereum.request({
          method: "eth_getBalance",
          params: [account, "latest"]
        });
        // Convert dari Wei ke ETH
        setBalance(parseFloat(parseInt(balanceWei, 16) / 1e18).toFixed(4));
      } else {
        setBalance(null);
      }
    }
    fetchBalance();
  }, [account]);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Metamask belum terinstal");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      alert("Wallet berhasil terkoneksi");
    } catch (error) {
      console.error(error);
      alert("Gagal koneksi ke wallet");
    }
  };

  // Avatar menggunakan dicebear
  const avatarUrl = account
    ? `https://api.dicebear.com/7.x/identicon/svg?seed=${account}`
    : null;

  return (
    <Router>
      <div className="p-4">
        <nav className="space-x-4 flex items-center">
          <Link to="/" className="text-blue-600 font-semibold">Home</Link>
          <Link to="/mint" className="text-blue-600 font-semibold">Mint NFT</Link>
          <Link to="/list" className="text-blue-600 font-semibold">Jual NFT</Link>

          {account ? (
            <div className="ml-4 flex items-center bg-white px-3 py-1 rounded shadow cursor-pointer">
              <img src={avatarUrl} alt="avatar" className="w-6 h-6 rounded-full mr-2" />
              <div className="flex flex-col">
                <span className="font-mono text-sm">{account.slice(0, 6)}...{account.slice(-4)}</span>
                {balance !== null && (
                  <span className="text-green-600 font-mono text-xs">{balance} ETH</span>
                )}
              </div>
            </div>
          ) : (
            <button onClick={connectWallet} className="ml-4 px-3 py-1 bg-blue-500 text-white rounded cursor-pointer">
              Connect Wallet
            </button>
          )}
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/list" element={<ListItem />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
