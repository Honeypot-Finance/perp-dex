import { VercelRequest, VercelResponse } from '@vercel/node';
import { sendSuccess, sendError } from '../../../lib/response.js';

interface VaultAddress {
  chain: string;
  chainId: number;
  mainnet: string;
  testnet: string;
}

const VAULT_ADDRESSES: VaultAddress[] = [
  {
    chain: 'BSC',
    chainId: 56,
    mainnet: '0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9',
    testnet: '0xaf2036D5143219fa00dDd90e7A2dbF3E36dba050',
  },
  {
    chain: 'Arbitrum',
    chainId: 42161,
    mainnet: '0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9',
    testnet: '0x0EaC556c0C2321BA25b9DC01e4e3c95aD5CDCd2f',
  },
  {
    chain: 'Optimism',
    chainId: 10,
    mainnet: '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
    testnet: '0xEfF2896077B6ff95379EfA89Ff903598190805EC',
  },
  {
    chain: 'Base',
    chainId: 8453,
    mainnet: '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
    testnet: '0xdc7348975aE9334DbdcB944DDa9163Ba8406a0ec',
  },
  {
    chain: 'Ethereum',
    chainId: 1,
    mainnet: '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
    testnet: '0x0EaC556c0C2321BA25b9DC01e4e3c95aD5CDCd2f',
  },
  {
    chain: 'Avalanche',
    chainId: 43114,
    mainnet: '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
    testnet: '0xAB6c8F6245B67421302AAe30AcEB10E00c30F463',
  },
  {
    chain: 'Mantle',
    chainId: 5000,
    mainnet: '0x816f722424b49cf1275cc86da9840fbd5a6167e9',
    testnet: '0xfb0E5f3D16758984E668A3d76f0963710E775503',
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return sendError(res, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`, 405);
    }

    const { chainId } = req.query;

    // If chainId provided, return specific vault
    if (chainId) {
      const vault = VAULT_ADDRESSES.find(v => v.chainId === Number(chainId));
      if (!vault) {
        return sendError(res, 'CHAIN_NOT_FOUND', `Vault address not found for chain ID ${chainId}`, 404);
      }
      return sendSuccess(res, vault);
    }

    // Return all vaults
    return sendSuccess(res, {
      vaults: VAULT_ADDRESSES,
      note: 'Use testnet addresses for testing. Mainnet addresses are for production only.',
    });

  } catch (error) {
    console.error('Vault addresses API error:', error);
    return sendError(res, 'INTERNAL_ERROR', 'Failed to fetch vault addresses', 500);
  }
}
