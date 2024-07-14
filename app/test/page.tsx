"use client";

// pages/deploy-safe.tsx
import { useEffect, useState } from 'react';
import { SafeFactory } from '@safe-global/protocol-kit';
import { Web3Provider } from '@ethersproject/providers';

export default function DeploySafePage() {
  const [providerUrl, setProviderUrl] = useState<string>("https://sepolia.infura.io/v3/d25b9c5599824d3c81ce49394f805fdf");
  const [signer, setSigner] = useState<any>(null);

  useEffect(() => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    // Request accounts from MetaMask
    window.ethereum.request({ method: 'eth_requestAccounts' })
      .then(async (accounts: string[]) => {
        if (accounts.length > 0) {
          // Create a Web3Provider instance and get the signer
          const web3Provider = new Web3Provider(window.ethereum);
          const signer = web3Provider.getSigner();

          // Get chainId using the new method
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          console.log(`Connected to chain ID: ${chainId}`);

          // Optionally, get network version and selected address if needed
          // const networkVersion = await window.ethereum.request({ method: 'net_version' });
          // const selectedAddress = await window.ethereum.request({ method: 'eth_accounts' });
  console.log(signer);
  console.log()
          setSigner(signer);
        } else {
          alert("No accounts found.");
        }
      })
      .catch((error: any) => {
        console.error("Error requesting accounts:", error);
        if (error.code === 4001) {
          alert("You denied account access. Please allow access to continue.");
        } else {
          alert("Failed to request accounts.");
        }
      });
  }, []);

  const handleDeploy = async () => {
    if (!signer) {
      alert("Signer not ready.");
      return;
    }

    try {
      await main(window.ethereum
, signer);
      alert('Deployment successful');
    } catch (error) {
      console.error('Error deploying Safe:', error);
      alert('Failed to deploy Safe');
    }
  };

  async function main(provider: string, signer: any) {
console.log(await signer.getAddress())
    const safeFactory = await SafeFactory.init({
      provider,
      signer: await signer.getAddress()
    });

    console.log("Safe Factory initialized");

    const safeAccountConfig = {
      owners: ["0x7b4194917918857E20D2E9EA1bBFB33af94469b3"],
      threshold: 1,
    };

    const protocolKit = await safeFactory.deploySafe({ safeAccountConfig });
    console.log("Safe deployed successfully");
  }

  return (
    <div>
      <h1>Deploying Safe...</h1>
      <button onClick={handleDeploy} disabled={!signer}>Deploy Safe</button>
    </div>
  );
}