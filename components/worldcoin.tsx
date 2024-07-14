'use client';

import { IDKitWidget, useIDKit } from '@worldcoin/idkit';
import { useState } from 'react';

import {
	BaseError,
	useAccount,
	useConnect,
	usePrepareTransactionRequest,
	useSendTransaction,
	useWaitForTransactionReceipt,
	useWriteContract,
	type UsePrepareTransactionRequestReturnType
} from 'wagmi';
import { ethers } from 'ethers';



const ProofComponent = (onSuccess: any, onError: any) => {
	const account = useAccount();
	const { setOpen } = useIDKit();
	const [done, setDone] = useState(false);
	const {
		data: hash,
		isPending,
		error,
		writeContractAsync,
	} = useWriteContract();
	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash,
		});

	return (
		<div>
			{account.isConnected && (
				<>
					<IDKitWidget
						app_id="app_staging_3b82cdc9af8f0dc0fe86a65cd3e0ee70"
						action="validate"
						signal={account.address}
						onSuccess={onSuccess}
						onError={onError}
						autoClose
					>
						{({ open }) => <button onClick={open}>Verify with World ID</button>}
					</IDKitWidget>
					{!done && (
						<button onClick={() => setOpen(true)}>
							{!hash &&
								(isPending
									? "Pending, please check your wallet..."
									: "Verify and Execute Transaction")}
						</button>
					)}

					{hash && <p>Transaction Hash: {hash}</p>}
					{isConfirming && <p>Waiting for confirmation...</p>}
					{isConfirmed && <p>Transaction confirmed.</p>}
					{error && <p>Error: {(error as BaseError).message}</p>}
				</>
			)}
		</div>
	);
};

export default ProofComponent;