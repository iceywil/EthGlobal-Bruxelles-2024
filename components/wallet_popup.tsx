"use client";

import { useState, useEffect } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";

export default function WalletConnectButton() {
  const [provider, setProvider] = useState<WalletConnectProvider | null>(null);
  const [web3, setWeb3] = useState<Web3<RegisteredSubscription> | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    if (provider) {
      provider.on("accountsChanged", (accounts: string[]) => {
        return setAccount(accounts[0]);
      });

      provider.on("disconnect", () => {
        setProvider(null);
        setWeb3(null);
        setAccount(null);
      });
    }
  }, [provider]);

  const connectWallet = async () => {
    const walletConnectProvider = new WalletConnectProvider({
      infuraId: "YOUR_INFURA_PROJECT_ID" // replace with your Infura project ID
    });

    await walletConnectProvider.enable();
    const web3Instance = new Web3(walletConnectProvider);

    setProvider(walletConnectProvider);
    setWeb3(web3Instance);

    const accounts = await web3Instance.eth.getAccounts();
    setAccount(accounts[0]);
  };

  return (
    <div>
      {account ? (
        <div>
          Connected: {account}
        </div>
      ) : (
        <button onClick={connectWallet} className="bg-[#35c184] text-white p-2 rounded">
          Connect Wallet
        </button>
      )}
    </div>
  );
}
