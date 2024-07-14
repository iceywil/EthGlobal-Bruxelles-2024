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
import { Button } from './ui/button';



const ProofComponent = ({onSuccess, onError, show, setShow}: {onSuccess: any, onError: any, show: boolean, setShow: any}) => {
	const account = useAccount();
	const { setOpen } = useIDKit();

	return (
		<div>
			{show && account.isConnected && (
				<>
					<IDKitWidget
						app_id="app_staging_3b82cdc9af8f0dc0fe86a65cd3e0ee70"
						action="validate"
						signal={account.address}
						onSuccess={onSuccess}
						onError={onError}
						autoClose
					>
						{({ open }) => <div className='grid gap-4'><Button onClick={open} className="font-bold text-white bg-green-600 w-full">Verify with World ID</Button><Button onClick={() => setShow(false)} className="font-bold text-white border w-full">Stop verification</Button></div>}
		
					</IDKitWidget>
				</>
			)}
		</div>
	);
};

export default ProofComponent;