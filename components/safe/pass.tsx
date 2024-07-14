'use client'

import { Safe4337Pack } from '@safe-global/relay-kit'
import { BUNDLER_URL, RPC_URL } from './constants'
import { mintNFT } from './mintNFT'
import { getPasskeyFromRawId } from '../../lib/passkeys'
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasskeyArgType } from '@safe-global/protocol-kit'
import { useEffect, useState } from 'react'
import {
	createPasskey,
	loadPasskeysFromLocalStorage,
	storePasskeyInLocalStorage
} from '../../lib/passkeys'

function Create4337SafeAccount({ onSafeAddressSet }: { onSafeAddressSet: (address: string) => void }) {
	const [selectedPasskey, setSelectedPasskey] = useState<PasskeyArgType | undefined>()
	const [safeAddress, setSafeAddress] = useState<string | undefined>()
	const [isSafeDeployed, setIsSafeDeployed] = useState<boolean>()
	const [userOp, setUserOp] = useState<string | undefined>()
	const [other, setOther] = useState<string | undefined>()

	const { address, isConnecting, isDisconnected } = useAccount();
	let otherAdd = "";

	const selectPasskeySigner = async (rawId: string, event: React.MouseEvent): Promise<void> => {
		event.preventDefault();
		console.log('selected passkey signer: ', rawId)
		const passkey = getPasskeyFromRawId(rawId)
		if (address)
			otherAdd = address
		else
			otherAdd = ""
		const safe4337Pack = await Safe4337Pack.init({
			provider: RPC_URL,
			signer: passkey,
			bundlerUrl: BUNDLER_URL,
			options: {
				owners: [otherAdd],
				threshold: 1
			}
		})

		const safeAddress = await safe4337Pack.protocolKit.getAddress()
		const isSafeDeployed = await safe4337Pack.protocolKit.isSafeDeployed()

		setSelectedPasskey(passkey)
		setSafeAddress(safeAddress)
		setIsSafeDeployed(isSafeDeployed)
		setOther(otherAdd)

		// Notify parent component of the safe address
		onSafeAddressSet(safeAddress);

		return Promise.resolve();
	}

	const [passkeyList, setPasskeyList] = useState<PasskeyArgType[]>([])

	async function handleSubmit(event: React.MouseEvent): Promise<void> {
		event.preventDefault();
		const passkey = await createPasskey()
		storePasskeyInLocalStorage(passkey)
		refreshPasskeyList()
	}

	function refreshPasskeyList() {
		const passkeys = loadPasskeysFromLocalStorage()
		setPasskeyList(passkeys)
	}

	useEffect(() => {
		refreshPasskeyList()
	}, [])

	const handleDeploy = async (event: React.MouseEvent): Promise<void> => {
		event.preventDefault();
		if (selectedPasskey && safeAddress && otherAdd) {
			await mintNFT({
				signer: selectedPasskey,
				safeAddress,
				other: otherAdd
			}).then(userOpHash => {
				setUserOp(userOpHash)
				setIsSafeDeployed(true)
			})
		}
	}

	return (
		<div>
			<div style={{ width: '50%' }}>
				<>
					<div className="py-2">
						<Button className='border ' onClick={handleSubmit}>Add New Passkey</Button>{' '}
						<div className=''>
							{passkeyList.length > 0 && (
								<>
									<br />
									{passkeyList.map(passkey => (
										<Label className='py-5' key={passkey.rawId}>
											ID: {passkey.rawId}{' '}
											<Button className="border" onClick={(event) => selectPasskeySigner(passkey.rawId, event)}>
												Select
											</Button>
										</Label>
									))}
								</>
							)}
						</div>
					</div>
				</>
			</div>
			{safeAddress && (
				<div className='py-5'>
					<Label>Safe Account</Label>
					<div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
						Address: {safeAddress}
					</div>
					<div>
						<a
							href={`https://app.safe.global/transactions/history?safe=sep:${safeAddress}`}
							target='_blank'
							rel='noreferrer'
						>
						</a>

					</div>

					{userOp && isSafeDeployed && (
						<>
							<div>
								Done! Check the transaction status on{' '}
								<a
									href={`//https://eth-sepolia.blockscout.com/op/${userOp}`}
									target='_blank'
									rel='noreferrer'
								>
									Blockscout :{' '}
								</a>
							</div>
						</>
					)}
				</div>
			)}
			<div className='grid pt-5'>
				<Button onClick={handleDeploy}
					className="font-bold text-white bg-green-600"
					type="submit"
				>
					Deploy
				</Button>
			</div>
		</div>
	)
}

export default Create4337SafeAccount
