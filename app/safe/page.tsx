"use client";

import Image from "next/image";
import Navbar from "@/components/navbar.jsx";
import Hero from "@/components/hero_text.jsx";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/magicui/border-beam";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAccount } from 'wagmi'


export default function Home() {
	const { address, isConnecting, isDisconnected } = useAccount();

	return (
		<main className="bg-black">
			<Navbar />
			<h1 className="text-4xl py-10 font-bold text-center text-white">Dashboard</h1>

			<div className="flex justify-center px-10 pt-10 space-x-4 max-h-[26em]">

				<section className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<Card>
						<CardHeader>
							<CardTitle>Create a Smart Wallet with <span className="text-[#35c184]">Safe</span></CardTitle>
						</CardHeader>
						<CardContent>
							<form className="grid gap-4">
								<div className="grid gap-2">
									<Label className="text-[#35c184]" htmlFor="name">Owner Wallet Address</Label>
									<p  />{address}
								</div>
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input id="email" type="email" placeholder="Enter your email" />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="message">Message</Label>
									<Textarea id="message" placeholder="Enter your message" />
								</div>
								<Button type="submit">Submit</Button>
							</form>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Modify Existing <span className="text-[#35c184]">Safe</span> Smart Wallet</CardTitle>
						</CardHeader>
						<CardContent>
							<form className="grid gap-4">
								<div className="grid gap-2">
									<Label htmlFor="name">Smart Wallet Address</Label>
									<Input id="name" placeholder="0x...." />
								</div>
								
								<Button className="text-[#35c184] border" type="submit">Submit</Button>
							</form>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Contact Information</CardTitle>
						</CardHeader>
						<CardContent>
							<form className="grid gap-4">
								<div className="grid gap-2">
									<Label htmlFor="name">Name</Label>
									<Input id="name" placeholder="Enter your name" />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input id="email" type="email" placeholder="Enter your email" />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="message">Message</Label>
									<Textarea id="message" placeholder="Enter your message" />
								</div>
								<Button type="submit">Submit</Button>
							</form>
						</CardContent>
					</Card>
				</section>			
			</div>
		</main >
	);
}
