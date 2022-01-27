import { strict as assert } from 'assert';
import { web3Factory } from '@arianee/spkz-sdk';
import sharedTokenAbi from '../abi/shared-token-abi';

interface TokenInfo {
  success: boolean;
  details?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
}

/**
 * Returns simple token infos if the address
 * is an ERC-20 contract or an ERC-721 contract, throws otherwise
 * @param parameters chainId and address of the contract
 * @returns name, symbol and decimals of the token
 */
export const tryGetTokenInfos = async (parameters: {
  chainId: string;
  address: string;
}): Promise<TokenInfo> => {
  const { chainId, address } = parameters;

  assert(chainId, 'chainId must be defined');
  assert(address, 'contract address must be defined');

  let web3Provider;
  try {
    web3Provider = await web3Factory(chainId);
  } catch (e) {
    return { success: false, details: e.message };
  }
  const tokenContract = new web3Provider.eth.Contract(sharedTokenAbi as any, address);

  let isERC20OrERC721Contract = true;

  const [symbol, name, decimals] = await Promise.all([
    tokenContract.methods
      .symbol()
      .call()
      .catch(() => ''),
    tokenContract.methods
      .name()
      .call()
      .catch(() => ''),
    tokenContract.methods
      .decimals()
      .call()
      .catch(() => 0),
    // Try calling balanceOf, if it throws it implies that the contract is neither an ERC20 nor an ERC721
    tokenContract.methods
      .balanceOf('0x0123456789012345678901234567890123456789')
      .call()
      .catch(() => {
        isERC20OrERC721Contract = false;
      }),
  ]);

  if (!isERC20OrERC721Contract) {
    return {
      success: false,
      details:
        'This address is not a valid contract (ERC20 or ERC721): must implement balanceOf(address)',
    };
  }

  return {
    success: true,
    name: name || symbol || address,
    symbol,
    decimals: decimals ? parseInt(decimals, 10) : 0,
  };
};
