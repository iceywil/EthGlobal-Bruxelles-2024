import Safe, { PasskeyCoordinates } from '@safe-global/protocol-kit'
import { PasskeyArgType } from '@safe-global/protocol-kit'


export default async function addModule(rawId: string, coordinates: PasskeyCoordinates, safeAddress: string) {

	const moduleAddress = '0x4624fFEB58e86dc941D8b65878eE7E8ad3533e16'
	const passkey: PasskeyArgType = {
		rawId,
		coordinates
	  }
	  
/* 	  const provider = new ethers.JsonRpcProvider('wss://ethereum-sepolia-rpc.publicnode.com')
	  const safeAuthPack = new SafeAuthPack({
		txServiceUrl: 'https://safe-transaction-mainnet.safe.global',
	  });
	  await safeAuthPack.init(safeAuthInitOptions);
	   */
	  //const provider = await getProvider();

	  const protocolKit = await Safe.init({
		provider: "wss://ethereum-sepolia-rpc.publicnode.com",
		signer: passkey,
		safeAddress,
	  })

	const safeTransaction = await protocolKit.createEnableModuleTx(moduleAddress)
	const txResponse = await protocolKit.executeTransaction(safeTransaction)
	let result = await (txResponse.transactionResponse as { wait: () => Promise<any> })?.wait()

	return result
}
/* const options: SafeTransactionOptionalProps = { ... }
const safeTransaction = await protocolKit.createEnableModuleTx(moduleAddress, options)
 */