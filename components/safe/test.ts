import { BUNDLER_URL, RPC_URL } from '../../lib/constants'
//import { mintNFT } from '../lib/mintNFT'
import { getPasskeyFromRawId } from '../../lib/passkeys'
import { Safe4337Pack } from '@safe-global/relay-kit'


export default async function selectPasskeySign(rawId: string) {
    console.log('selected passkey signer: ', rawId)

    const passkey = getPasskeyFromRawId(rawId)

    const safe4337Pack = await Safe4337Pack.init({
      provider: RPC_URL,
      signer: passkey,
      bundlerUrl: BUNDLER_URL,
      options: {
        owners: [],
        threshold: 1
      }
    })

    const safeAddress = await safe4337Pack.protocolKit.getAddress()
    const isSafeDeployed = await safe4337Pack.protocolKit.isSafeDeployed()

  return { passkey, safeAddress, isSafeDeployed };
    // setIsSafeDeployed(isSafeDeployed)
  }