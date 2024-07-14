"use client";

import Navbar from "@/components/navbar.jsx";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAccount } from "wagmi";
import { useEffect, useState } from 'react'
import Create4337SafeAccount from "@/components/safe/pass";
import addModule from "@/components/safe/add_module";
import {
	createPasskey,
	loadPasskeysFromLocalStorage,
	storePasskeyInLocalStorage
} from '../../lib/passkeys'
import { PasskeyArgType } from '@safe-global/protocol-kit'

export default function Home() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [passkey, setPasskey] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [passkeyList, setPasskeyList] = useState<PasskeyArgType[]>([]);
  const [safeAddress, setSafeAddress] = useState<string | undefined>();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setPasskey(!passkey);
  };

  const handleWorldID = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget
    const formElements = form.elements as typeof form.elements & {
      tryrecovery: {value: string}
    }
    console.log(formElements.tryrecovery.value)
    setMessages((prevMessages) => [...prevMessages, "hello"]);
  };

  function refreshPasskeyList() {
    const passkeys = loadPasskeysFromLocalStorage();
    setPasskeyList(passkeys);
  }

  useEffect(() => {
    refreshPasskeyList();
  }, []);

  const handleModule = (event: React.MouseEvent) => {
    event.preventDefault();
    const passkeys = loadPasskeysFromLocalStorage();
    setPasskeyList(passkeys);
    if (safeAddress) {
      addModule(passkeys[0].rawId, passkeys[0].coordinates, safeAddress);
    } else {
      console.error("Safe address is undefined");
    }
  };

  return (
    <main className="bg-black">
      <Navbar />
      <h1 className="text-4xl py-10 font-bold text-center text-white">
        Dashboard
      </h1>

      <div className="flex justify-center px-10 pt-10 space-x-4 max-h-[26em]">
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="justify-around">
            <CardHeader>
              <CardTitle>
                <span className="text-[#52ff80]">Create</span> a Smart Wallet
                with <span className="text-[#35c184]">Safe</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Owner Wallet Address</Label>
                  <div>{address}</div>
                </div>
                <div className="text-left">
                  <Button
                    className={`border font-bold ${passkey ? "bg-green-600" : ""}`}
                    type="submit"
                    onClick={handleClick}
                  >
                    Enable PassKey
                  </Button>
                </div>
                {passkey && <Create4337SafeAccount onSafeAddressSet={setSafeAddress} />}
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="text-[#50ff7f]">Add Recovery</span> on an
                Existing <span className="text-[#35c184]">Safe</span> Smart
                Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Smart Wallet Address</Label>
                  <Input
                    className="text-black"
                    id="name"
                    placeholder="0x...."
                    onChange={(e) => setSafeAddress(e.target.value)}
                  />
                </div>
                <div className="grid">
                  <Button
                    className="font-bold text-white bg-green-600"
                    type="submit"
                    onClick={handleModule}
                  >
                    Add Recovery Module
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="text-[#50ff7f]">Recover</span> Smart Wallet
                with <span className="text-[#35c184]">World ID</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWorldID} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tryrecovery">Smart Wallet Address</Label>
                  <Input id="tryrecovery" placeholder="0x...." />
                </div>
                {messages.map((message, index) => (
                  <p key={index} className="text-white">
                    {message}
                  </p>
                ))}
                <div className="grid">
                  <Button
                    className="font-bold text-white bg-green-600"
                    type="submit"
                  >
                    Try Recover
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
