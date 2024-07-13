import { Safe4337Pack } from '@safe-global/relay-kit'
import { extractPasskeyData } from '@safe-global/protocol-kit'

const RP_NAME = 'Safe Smart Account'
const USER_DISPLAY_NAME = 'User display name'
const USER_NAME = 'User name'

const passkeyCredential = await navigator.credentials.create({
  publicKey: {
    pubKeyCredParams: [
      {
        alg: -7,
        type: 'public-key'
      }
    ],
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    rp: {
      name: RP_NAME
    },
    user: {
      displayName: USER_DISPLAY_NAME,
      id: crypto.getRandomValues(new Uint8Array(32)),
      name: USER_NAME
    },
    timeout: 60_000,
    attestation: 'none',
  },
})

if (!passkeyCredential) {
	throw Error("Passkey creation failed: No credential was returned.");
  }
  
  const passkey = await extractPasskeyData(passkeyCredential);
  
  const PIMLICO_API_KEY = // ...
  const RPC_URL = 'https://rpc.ankr.com/eth_sepolia'
  
  const safe4337Pack = await Safe4337Pack.init({
	provider: RPC_URL,
	signer: passkey,
	bundlerUrl: `https://api.pimlico.io/v1/sepolia/rpc?apikey=${PIMLICO_API_KEY}`,
	paymasterOptions: {
	  isSponsored: true,
	  paymasterUrl: `https://api.pimlico.io/v2/sepolia/rpc?apikey=${PIMLICO_API_KEY}`,
	  paymasterAddress: '0x...',
	  paymasterTokenAddress: '0x...',
	  //sponsorshipPolicyId // Optional value to set the sponsorship policy id from Pimlico
	},
	options: {
	  owners: [],
	  threshold: 1
	}
  })

  // Define the transactions to execute
const transaction1 = { to, data, value }
const transaction2 = { to, data, value }

// Build the transaction array
const transactions = [transaction1, transaction2]

// Create the SafeOperation with all the transactions
const safeOperation = await safe4337Pack.createTransaction({ transactions })

  