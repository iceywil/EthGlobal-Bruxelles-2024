"use client";

import Image from "next/image";
import Navbar from "@/components/navbar.jsx";
import Hero from "@/components/hero_text.jsx";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/magicui/border-beam";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAccount } from "wagmi";
import { useState } from "react";

export default function Home() {
	const { address, isConnecting, isDisconnected } = useAccount();
	const [passkey, setPasskey] = useState(false);
	const [messages, setMessages] = useState<string[]>([]);

	const handleClick = (event: React.MouseEvent) => {
		event.preventDefault();
		setPasskey(!passkey);
		
	};

	const handleWorldID = (event: React.MouseEvent) => {
		event.preventDefault();
		setMessages((prevMessages) => [...prevMessages, "hello"]);
	};

	return (
		<main className="bg-black">
			<Navbar />
			<h1 className="text-4xl py-10 font-bold text-center text-white">Dashboard</h1>

			<div className="flex justify-center px-10 pt-10 space-x-4 max-h-[26em]">
				<section className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<Card className="justify-around">
						<CardHeader>
							<CardTitle className="pl-2">
								<span className="text-[#52ff80]">Create</span> a Smart Wallet with{" "}
								<span className="text-[#35c184]">Safe</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form className="grid gap-4">
								<div className="grid gap-2">
									<Label className="pl-2" htmlFor="name">
										Owner Wallet Address
									</Label>
									<div className="pl-2">{address}</div>
								</div>
								<div className="text-left pl-2">
									<Button
										className={`border font-bold ${passkey ? "bg-green-600" : ""}`}
										type="submit"
										onClick={handleClick}
									>
										Enable PassKey
									</Button>
								</div>
								<div className="text-left pl-2">
									<Button className="border font-bold" type="submit" onClick={handleWorldID}>
										Add a World ID Recovery
									</Button>
								</div>
								{messages.map((message, index) => (
									<p key={index} className="pl-2 text-white">
										{message}
									</p>
								))}
								<div className="grid pl-2">
									<Button className="font-bold text-white bg-green-600" type="submit">
										Deploy
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>
								<span className="text-[#50ff7f]">Add Recovery</span> on an Existing{" "}
								<span className="text-[#35c184]">Safe</span> Smart Wallet
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form className="grid gap-4">
								<div className="grid gap-2">
									<Label htmlFor="name">Smart Wallet Address</Label>
									<Input id="name" placeholder="0x...." />
								</div>

								<div className="grid">
									<Button className="font-bold text-white bg-green-600" type="submit">
										Add
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>
								<span className="text-[#50ff7f]">Recover</span> Smart Wallet with{" "}
								<span className="text-[#35c184]">World ID</span>
							</CardTitle>
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
								<div className="grid">
									<Button className="font-bold text-white bg-green-600" type="submit">
										Recover
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</section>
			</div>
		</main>
	);
}
