import { useState, useEffect } from "react";

/**
 * Format a number with locale-aware separators
 */
export function formatNumber(value: string | number, decimals = 2): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Hook to get the actual wallet chain from window.ethereum
 * This bypasses wagmi's isolated provider to detect the real wallet chain
 */
export function useWalletChain() {
  const [walletChainId, setWalletChainId] = useState<number | null>(null);

  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const getChainId = async () => {
      try {
        const chainIdHex = await ethereum.request({ method: "eth_chainId" });
        setWalletChainId(parseInt(chainIdHex, 16));
      } catch {
        // Silently fail - user may not have wallet connected
      }
    };

    getChainId();

    const handleChainChanged = (chainIdHex: string) => {
      setWalletChainId(parseInt(chainIdHex, 16));
    };

    ethereum.on("chainChanged", handleChainChanged);
    return () => {
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return walletChainId;
}
