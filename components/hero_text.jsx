import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";

export default function Hero() {
	return (
		<div className="flex justify-center pt-20">
			<NeonGradientCard className="max-w-sm items-center justify-center text-center">
				<span className="pointer-events-none z-10 h-full whitespace-pre-wrap bg-gradient-to-br from-[#35f842] from-20% to-[#6083ff] bg-clip-text text-center text-5xl font-bold leading-none tracking-tighter text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
					BioSafe
				</span>
				<br />
				<div className="pt-4 pointer-events-none z-10 h-full whitespace-pre-wrap bg-gradient-to-br from-[#fdfffe] from-20% to-[#b6c6ff] bg-clip-text text-center text-xl font-bold leading-none tracking-tighter text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
				Keep your assets safe, with your eyes closed
				</div>
			</NeonGradientCard>
		</div>
	)
}
