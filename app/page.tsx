// pages/index.jsx

import Image from "next/image";
import Navbar from "@/components/navbar.jsx";
import Hero from "@/components/hero_text.jsx";
import WalletConnectButton from "@/components/wallet_popup";

export default function Home() {
	return (
		<main className="bg-black">
			<Navbar />
			<Hero />
			<div className="flex justify-center p-10 space-x-4">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            Recover your precious assets with a <span className="text-[#35c184]">glance</span>
          </div>
        </div>
        <Image className="flex-1" src="/eye.gif" alt="hero" width={250} height={500} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            Leveraging the ultimate secure onchain protocol: <span className="font-bold">WorldCoin</span>
          </div>
        </div>
      </div>
			<div className="flex justify-center p-10">
				<WalletConnectButton />
			</div>
		</main>
	);
}
