import Image from "next/image";
import Navbar from "@/components/navbar.jsx";
import Hero from "@/components/hero_text.jsx";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/magicui/border-beam";
import Link from "next/link";

export default function Home() {
	return (
		<main className="bg-black">
			<Navbar />
			<Hero />
			<div className="flex justify-center px-36 pt-10 space-x-4 max-h-[26em]">
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						Recover your precious assets with just a <span className="text-[#35c184]">glance</span>
					</div>
				</div>
				<Image className="flex-1" src="/eye.gif" alt="hero" width={100} height={300} />
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						Leveraging the ultimate proof of personhood protocol: <span className="font-bold">WorldCoin</span>
					</div>
				</div>
			</div>
			<div className="flex justify-center p-10 space-x-4">
				<Link href="/safe">
					<Button className="flex text-white bg-[#35c184] text-base justify-center relative h-[50px] w-[120px] rounded-xl">
						<BorderBeam />
						Get Started !
						<a className="hidden"></a>
					</Button>
				</Link>
			</div>

			<div className="flex-1 flex items-center justify-center">
				<div className="text-center">
					 Powered by <span className="font-bold text-[#35c184]">Safe</span>, enhanced by <span className="font-bold text-[#35c184]">Blockscout</span> and secured by <span className="font-bold text-[#35c184]">WorldCoin</span>
				</div>
			</div>
		</main >
	);
}
