const Web3 = require('web3');

const web3 = new Web3('');

const contractAddress = 'YOUR_CONTRACT_ADDRESS';
const contractABI = [];

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function transferOwnership(newOwnerAddress) {
    try {
        const accounts = await web3.eth.getAccounts();
        const ownerAccount = accounts[0];
        const gasEstimate = await contract.methods.transferOwnership(newOwnerAddress).estimateGas({from: ownerAccount});

        const result = await contract.methods.transferOwnership(newOwnerAddress).send({
            from: ownerAccount,
            gas: gasEstimate
        });

        console.log('Ownership transferred ✅', result.transactionHash);
    } catch (error) {
        console.error('Error', error);
    }
}

transferOwnership('NEW_OWNER_ADDRESS');