import { strict as assert } from 'assert';
import { web3Factory } from '@arianee/spkz-sdk';
import lockAbi from '../abi/lock-abi';

interface PublicLockVersionResult {
  success: boolean;
  details?: string;
  publicLockVersion?: string;
  symbol?: string;
  name?: string;
}

export const tryGetLockInfos = async (chainId: string,
  address: string): Promise<PublicLockVersionResult> => {
  assert(chainId, 'chainId must be defined');
  assert(address, 'contract address must be defined');

  let web3Provider;
  try {
    web3Provider = await web3Factory(chainId);
  } catch (e) {
    return { success: false, details: e.message };
  }
  const lockContract = new web3Provider.eth.Contract(lockAbi as any, address);

  const [symbol, name, publicLockVersion] = await Promise.all([
    lockContract.methods.symbol().call().catch('LOCK'),
    lockContract.methods.name().call().catch('LOCK'),
    lockContract.methods.publicLockVersion().call().catch(null),
  ]);

  if (!publicLockVersion) {
    return {
      success: false,
      details:
        'This address is not a valid Lock contract: must implement publicLockVersion()',
    };
  }

  return {
    success: true,
    publicLockVersion,
    symbol,
    name,
  };
};
