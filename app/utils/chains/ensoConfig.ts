/**
 * Enso Checkout Widget Configuration
 * Maps chain IDs to their respective USDC token addresses for the checkout widget
 */

export interface EnsoChainConfig {
  chainId: number;
  tokenOut: string; // USDC or stablecoin address
  tokenSymbol: string;
}

// USDC/stablecoin addresses per chain
export const ensoChainConfigs: Record<number, EnsoChainConfig> = {
  // Arbitrum One
  42161: {
    chainId: 42161,
    tokenOut: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC (native)
    tokenSymbol: "USDC",
  },
  // Base
  8453: {
    chainId: 8453,
    tokenOut: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC (native)
    tokenSymbol: "USDC",
  },
  // Ethereum Mainnet
  1: {
    chainId: 1,
    tokenOut: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    tokenSymbol: "USDC",
  },
  // BSC
  56: {
    chainId: 56,
    tokenOut: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
    tokenSymbol: "USDC",
  },
  // Optimism
  10: {
    chainId: 10,
    tokenOut: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC (native)
    tokenSymbol: "USDC",
  },
  // Polygon
  137: {
    chainId: 137,
    tokenOut: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC (native)
    tokenSymbol: "USDC",
  },
  // Avalanche C-Chain
  43114: {
    chainId: 43114,
    tokenOut: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // USDC
    tokenSymbol: "USDC",
  },
  // Linea
  59144: {
    chainId: 59144,
    tokenOut: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff", // USDC.e
    tokenSymbol: "USDC.e",
  },
  // Blast
  81457: {
    chainId: 81457,
    tokenOut: "0x4300000000000000000000000000000000000003", // USDB (native stablecoin)
    tokenSymbol: "USDB",
  },
  // Manta Pacific
  169: {
    chainId: 169,
    tokenOut: "0xb73603C5d87fA094B7314C74ACE2e64D165016fb", // USDC
    tokenSymbol: "USDC",
  },
  // Mode
  34443: {
    chainId: 34443,
    tokenOut: "0xd988097fb8612cc24eeC14542bC03424c656005f", // USDC
    tokenSymbol: "USDC",
  },
  // Sonic
  146: {
    chainId: 146,
    tokenOut: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894", // USDC.e
    tokenSymbol: "USDC.e",
  },
  // Berachain
  80094: {
    chainId: 80094,
    tokenOut: "0x549943e04f40284185054145c6E4e9568C1D3241", // USDC
    tokenSymbol: "USDC",
  },
  // Gnosis
  100: {
    chainId: 100,
    tokenOut: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83", // USDC (bridged)
    tokenSymbol: "USDC",
  },
  // Hyper (Hyperliquid EVM)
  999: {
    chainId: 999,
    tokenOut: "0xb88339CB7199b77E23DB6E890353E22632Ba630f", // USDC (native)
    tokenSymbol: "USDC",
  },
  // Ink
  57073: {
    chainId: 57073,
    tokenOut: "0x2D270e6886d130D724215A266106e6832161EAEd", // USDC (native)
    tokenSymbol: "USDC",
  },
  // Plume
  98866: {
    chainId: 98866,
    tokenOut: "0x222365EF19F7947e5484218551B56bb3965Aa7aF", // USDC (native)
    tokenSymbol: "USDC",
  },
  // Soneium
  1868: {
    chainId: 1868,
    tokenOut: "0xba9986d2381edf1da03b0b9c1f8b00dc4aacc369", // USDC.e (bridged)
    tokenSymbol: "USDC.e",
  },
  // Unichain
  130: {
    chainId: 130,
    tokenOut: "0x078D782b760474a361dDA0AF3839290b0EF57AD6", // USDC (native)
    tokenSymbol: "USDC",
  },
  // World Chain
  480: {
    chainId: 480,
    tokenOut: "0x79a02482a880bce3f13e09da970dc34db4cd24d1", // USDC (native)
    tokenSymbol: "USDC",
  },
  // zkSync Era
  324: {
    chainId: 324,
    tokenOut: "0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4", // USDC (native)
    tokenSymbol: "USDC",
  },
  // Merlin
  4200: {
    chainId: 4200,
    tokenOut: "0x480E158395cC5b41e5584347c495584cA2cAf78d", // USDC
    tokenSymbol: "USDC",
  },
  // Conflux eSpace
  1030: {
    chainId: 1030,
    tokenOut: "0x6963EfED0aB40F6C3d7BdA44A05dCf1437C44372", // USDC
    tokenSymbol: "USDC",
  },
};

// Default config (Arbitrum) used when chain is not supported
export const defaultEnsoConfig: EnsoChainConfig = {
  chainId: 42161,
  tokenOut: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  tokenSymbol: "USDC",
};

/**
 * Get Enso checkout config for a specific chain
 * Falls back to default (Arbitrum) if chain is not supported
 */
export function getEnsoConfigByChainId(chainId: number): EnsoChainConfig {
  return ensoChainConfigs[chainId] || defaultEnsoConfig;
}

/**
 * Check if a chain is supported by Enso checkout
 */
export function isEnsoSupportedChain(chainId: number): boolean {
  return chainId in ensoChainConfigs;
}

/**
 * Get all supported chain IDs for Enso checkout
 */
export function getEnsoSupportedChainIds(): number[] {
  return Object.keys(ensoChainConfigs).map(Number);
}
