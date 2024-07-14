"use client";

import Navbar from "@/components/navbar.jsx";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAccount, useClient, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useEffect, useState } from 'react'
import Create4337SafeAccount from "@/components/safe/pass";
import addModule from "@/components/safe/add_module";
import {
	createPasskey,
	loadPasskeysFromLocalStorage,
	storePasskeyInLocalStorage
} from '../../lib/passkeys'
import { PasskeyArgType } from '@safe-global/protocol-kit'
import { useToast } from "@/components/ui/use-toast";
import { ISuccessResult } from "@worldcoin/idkit";
import abi from "@/abi/SafeModule.json";
import { BaseError, decodeAbiParameters, parseAbiParameters } from "viem";
import { readContract } from "viem/actions";
import ProofComponent from "@/components/worldcoin";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";
//import { decodeAbiParameters, decodeAbiParameters } from "viem";

export default function Home() {

  const { toast } = useToast()

  const { address, isConnecting, isDisconnected } = useAccount();
  const [passkey, setPasskey] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [enablingModule, setEnablingModule] = useState(false);


  const [messages, setMessages] = useState<string[]>([]);
  const [passkeyList, setPasskeyList] = useState<PasskeyArgType[]>([]);
  const [safeAddress, setSafeAddress] = useState<string | undefined>();
  const [recoveringSafeAddress, setRecoveringSafeAddress] = useState<string | undefined>();
  const [recoveringSignerAddress, setRecoveringSignerAddress] = useState<string | undefined>();


  const {
    data: hash,
    isPending,
    error,
    writeContractAsync,
  } = useWriteContract();
  const readContractAsync = useReadContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });
    const client = useClient()

    useEffect(() => {
      if (isConfirmed) {
        toast({
          variant: "default",
          title: "Transaction confirmed",
          description: "",
          action: <ToastAction altText="View tx"><Link href={`https://eth-sepolia.blockscout.com/tx/${hash}`} target="_blank"></Link></ToastAction>
        })
      }
    }, [isConfirmed])


  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setPasskey(!passkey);
  };

  const handleWorldID = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget
    const formElements = form.elements as typeof form.elements & {
      tryrecovery: {value: string}
      signer: {value: string}
    }
    
    setRecovering(true);
    setRecoveringSafeAddress(formElements.tryrecovery.value)
    setRecoveringSignerAddress(formElements.signer.value);
    // setMessages((prevMessages) => [...prevMessages, "hello"]);
  };

  const handleError= async(error: any) => {
    // toast({m})
    setRecovering(false);
  };

  const handleValidProofRecovery = async(proof: ISuccessResult) => {
    try {
      await writeContractAsync({
        address: "0x4624fFEB58e86dc941D8b65878eE7E8ad3533e16",
        account: address!,
        abi,
        functionName: "tryRecovery",
        args: [
          recoveringSafeAddress,
          recoveringSignerAddress,
          BigInt(proof!.merkle_root),
          BigInt(proof!.nullifier_hash),
          decodeAbiParameters(
            parseAbiParameters("uint256[8]"),
            proof!.proof as `0x${string}`
          )[0],
        ],
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      })
    }

    setRecovering(false);

    // setMessages((prevMessages) => [...prevMessages, "hello"]);
  };

  const handleAddRecoverUser = async(proof: ISuccessResult) => {
    try {
      await writeContractAsync({
        address: "0x4624fFEB58e86dc941D8b65878eE7E8ad3533e16",
        account: address!,
        abi,
        functionName: "addRecoverUser",
        args: [
          recoveringSafeAddress,
          BigInt(proof!.merkle_root),
          BigInt(proof!.nullifier_hash),
          decodeAbiParameters(
            parseAbiParameters("uint256[8]"),
            proof!.proof as `0x${string}`
          )[0],
        ],
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request. (handleAddRecoverUser)",
      })
    }

    setEnablingModule(false);
    // setMessages((prevMessages) => [...prevMessages, "hello"]);
  }

  const handleRemoveRecoverUser = async(proof: ISuccessResult) => {
    try {
      await writeContractAsync({
        address: "0x4624fFEB58e86dc941D8b65878eE7E8ad3533e16",
        account: address!,
        abi,
        functionName: "removeRecoverUser",
        args: [
          recoveringSafeAddress,
          BigInt(proof!.nullifier_hash),
        ],
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request. (handleRemoveRecoverUser)",
      })
    }

    setEnablingModule(false);
    // setMessages((prevMessages) => [...prevMessages, "hello"]);
  }

  const handleChangeRecoveryThresold = async(threshold: number) => {
    try {
      await writeContractAsync({
        address: "0x4624fFEB58e86dc941D8b65878eE7E8ad3533e16",
        account: address!,
        abi,
        functionName: "changeRecoveryThreshold",
        args: [
          recoveringSafeAddress,
          threshold,
        ],
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request. (handleChangeRecoveryThresold)",
      })
    }

    setEnablingModule(false);
    // setMessages((prevMessages) => [...prevMessages, "hello"]);
  }

  const handleDisableRecovery = async() => {
    try {
      await writeContractAsync({
        address: "0x4624fFEB58e86dc941D8b65878eE7E8ad3533e16",
        account: address!,
        abi,
        functionName: "disableRecovery",
        args: [
          recoveringSafeAddress,
        ],
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request. (handleDisableRecovery)",
      })
    }

    setEnablingModule(false);
    // setMessages((prevMessages) => [...prevMessages, "hello"]);
  }

  const handleAddRecovery = async(proof: ISuccessResult) => {
    try {
      await writeContractAsync({
        address: "0x4624fFEB58e86dc941D8b65878eE7E8ad3533e16",
        account: address!,
        abi,
        functionName: "setupRecovery",
        args: [
          recoveringSafeAddress,
          BigInt(proof!.merkle_root),
          BigInt(proof!.nullifier_hash),
          decodeAbiParameters(
            parseAbiParameters("uint256[8]"),
            proof!.proof as `0x${string}`
          )[0],
        ],
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request. (handleAddRecovery)",
      })
    }

    setEnablingModule(false);
    // setMessages((prevMessages) => [...prevMessages, "hello"]);
  };

  function refreshPasskeyList() {
    const passkeys = loadPasskeysFromLocalStorage();
    setPasskeyList(passkeys);
  }

  useEffect(() => {
    refreshPasskeyList();
  }, []);

  const handleModule = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget
    const formElements = form.elements as typeof form.elements & {
      safe: {value: string}
    }
    
    setEnablingModule(true);
    setRecoveringSafeAddress(formElements.safe.value)
    // const passkeys = loadPasskeysFromLocalStorage();
    // setPasskeyList(passkeys);
    // if (safeAddress) {
    //   addModule(passkeys[0].rawId, passkeys[0].coordinates, safeAddress);
    // } else {
    //   console.error("Safe address is undefined");
    // }
  };

  return (
    <main className="bg-black">
      <Navbar />
      <h1 className="text-4xl py-10 font-bold text-center text-white">
        Dashboard
      </h1>
      <Button onClick={ () =>       toast({
          variant: "default",
          title: "Transaction confirmed",
          description: "",
          action: <ToastAction altText="View transaction"><Link href={`https://eth-sepolia.blockscout.com/tx/${hash}`} target="_blank"></Link></ToastAction>
        })}> Toast</Button>
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
              {!enablingModule ? (
              <form onSubmit={handleModule} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="safe">Smart Wallet Address</Label>
                  <Input
                    className="text-black"
                    name="safe"
                    placeholder="0x...."
                    onChange={(e) => setSafeAddress(e.target.value)}
                  />
                </div>
                <div className="grid">
                  <Button
                    className="font-bold text-white bg-green-600"
                    type="submit"
                  >
                    Add Recovery Module
                  </Button>
                </div>
              </form>): (<ProofComponent onSuccess={handleAddRecovery} onError={handleError} show={enablingModule} setShow={setEnablingModule} />)}
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
              {!recovering ? (<form onSubmit={handleWorldID} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tryrecovery">Smart Wallet Address</Label>
                  <Input className="text-black" name="tryrecovery" type="text" placeholder="0x...." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signer">Signer to recover address</Label>
                  <Input name="signer" className="text-black" type="text" placeholder="0x...." />
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
              </form>): (<ProofComponent onSuccess={handleValidProofRecovery} onError={handleError} show={recovering} setShow={setRecovering} />)}
            </CardContent>
          </Card>

		  
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
        </section>
      </div>
    </main>
  );
}
