const { ethers } = require("ethers");

async function createNewSafeWallet(provider, signer) {
  const contractAddress = 'YOUR_CONTRACT_ADDRESS_HERE';
  const abi = [];

  const contract = new ethers.Contract(contractAddress, abi, signer);

  const owners = ['0x123', '0xabc'];
  const threshold = 2;
  const fallbackHandler = '0x';
  const paymentToken = '0x0';
  const payment = 0;

  const inter = new ethers.utils.Interface(abi);
  const data = inter.encodeFunctionData('setup', [owners, threshold, fallbackHandler, paymentToken, payment]);

  try {
    const tx = await contract.createSafeWallet(data);
    console.log('Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    const safeAddress = receipt.events.find(e => e.event === 'SafeCreated').args.safe;
    console.log('New Safe Wallet Created at:', safeAddress);
  } catch (error) {
    console.error('Error creating Safe Wallet:', error);
  }
}

//usage exemple
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
createNewSafeWallet(provider, signer);
