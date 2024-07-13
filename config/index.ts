// config/index.tsx

import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { cookieStorage, createStorage } from "wagmi";
import { Chain, sepolia } from "wagmi/chains";

// Your WalletConnect Cloud project ID
export const projectId = "b9956ab6580b75465649e4bff90ad854";

// Create a metadata object
const metadata = {
  name: "biosafe",
  description: "AppKit Example",
  url: "https://web3modal.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const sepoliaWithBlockscout = {
  ...Object.freeze(sepolia),
  blockExplorers: {
    default: {
      url: "https://eth-sepolia.blockscout.com",
      name: "Blockscout",
    },
  },
} as const satisfies Chain;

// Create wagmiConfig
export const config = defaultWagmiConfig({
  chains: [sepoliaWithBlockscout],
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  auth: {
    email: true, // default to true
    socials: ["google", "x", "github", "discord", "apple"],
    showWallets: true, // default to true
    walletFeatures: true, // default to true
  },
});
