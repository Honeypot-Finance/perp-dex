// Honeypot Perpetual Vault Configuration
import { defineChain } from "viem";
import { getRuntimeConfig } from "@/utils/runtime-config";

// Berachain Mainnet configuration
export const berachain = defineChain({
  id: 80094,
  name: "Berachain",
  nativeCurrency: {
    decimals: 18,
    name: "BERA",
    symbol: "BERA",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.berachain.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Berascan",
      url: "https://berascan.com",
    },
  },
});

// Get vault configuration from runtime config (allows deployment-time customization)
const getVaultAddress = (): `0x${string}` => {
  const address = getRuntimeConfig("VITE_DIRAC_VAULT_ADDRESS");
  return (address || "0x55a0264a53afbf8371444142bb0ae5d1763ed397") as `0x${string}`;
};

const getVaultChainId = (): number => {
  const chainId = getRuntimeConfig("VITE_DIRAC_VAULT_CHAIN_ID");
  return chainId ? parseInt(chainId, 10) : 80094;
};

const getVaultName = (): string => {
  return getRuntimeConfig("VITE_DIRAC_VAULT_NAME") || "Honeypot Perpetual Vault";
};

const getVaultDescription = (): string => {
  return (
    getRuntimeConfig("VITE_DIRAC_VAULT_DESCRIPTION") ||
    "Automated perpetual trading strategy powered by Dirac. Deposit HONEY to earn yield from trading profits."
  );
};

// Vault configuration - uses runtime config for deployment flexibility
export const DIRAC_VAULT_CONFIG = {
  // Vault contract address (configurable via runtime config)
  vaultAddress: getVaultAddress(),

  // Chain configuration
  chainId: getVaultChainId(),
  chain: berachain,

  // Vault metadata (configurable via runtime config)
  name: getVaultName(),
  description: getVaultDescription(),

  // Strategy details
  strategy: {
    type: "Perpetual Trading",
    partner: "Dirac + Orderly Network",
    risk: "Medium-High",
  },
} as const;

// Trade cycle status enum
export enum TradeCycleStatus {
  INITIALIZED = 0,
  ACTIVE = 1,
  PENDING_END = 2,
  ENDED = 3,
}

export const getTradeCycleStatusLabel = (status: number): string => {
  switch (status) {
    case TradeCycleStatus.INITIALIZED:
      return "Initialized";
    case TradeCycleStatus.ACTIVE:
      return "Active";
    case TradeCycleStatus.PENDING_END:
      return "Pending End";
    case TradeCycleStatus.ENDED:
      return "Ended";
    default:
      return "Unknown";
  }
};
