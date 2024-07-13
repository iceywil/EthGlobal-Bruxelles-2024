'use client';

import { IDKitWidget } from '@worldcoin/idkit';
import { useState } from 'react';

import {
    useAccount,
    useConnect,
    usePrepareTransactionRequest,
    useSendTransaction,
    type UsePrepareTransactionRequestReturnType
} from 'wagmi';
import { ethers } from 'ethers';

const getAddress = () => {
    // todo get address from wallet connect
    const [address, setAddress] = useState('0x1234567890abcdef'); // Example address
    return { address };
};

const onSuccess = (response: any) => {
    console.log('Proof Generated:', response);

    const account = useAccount();
    console.log('Account:', account);

    let toAddress: any = process.env.CONTRACT

    const tx = usePrepareTransactionRequest({
        account: '0xFEUR',
        to: toAddress,
        value: ethers.parseEther('1'),
        data: '0x',
    })


    /*
    const handleSendTransaction = async () => {
        try {
            const tx = await sendTransaction?.();
            if (tx) {
                console.log('Transaction sent:', tx);
            }
        } catch (error) {
            console.error('Error sending transaction:', error);
        }
    };
     */

    verifyProof(response);
};

const verifyProof = (proof: any) => {

}

const ProofComponent = () => {
    const { address } = getAddress(); // Get the user's wallet address

    return (
        <IDKitWidget
            app_id="app_staging_3b82cdc9af8f0dc0fe86a65cd3e0ee70" // must be an app set to on-chain in Developer Portal
            action="validate"
            signal={address} // proof will only verify if the signal is unchanged, this prevents tampering
            onSuccess={onSuccess} // use onSuccess to call your smart contract
        >
            {({ open }) => <button onClick={open}>Verify with World ID</button>}
        </IDKitWidget>
    );
};

export default ProofComponent;