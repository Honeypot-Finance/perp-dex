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
    const getEthereum = () => {
      // Handle various wallet providers
      const win = window as any;
      return win.ethereum || win.web3?.currentProvider;
    };

    const parseChainId = (chainId: string | number): number => {
      if (typeof chainId === "number") return chainId;
      // Handle both "0x" prefixed and plain hex strings
      return parseInt(chainId, chainId.startsWith("0x") ? 16 : 10);
    };

    const ethereum = getEthereum();
    if (!ethereum) return;

    const getChainId = async () => {
      try {
        const chainId = await ethereum.request({ method: "eth_chainId" });
        setWalletChainId(parseChainId(chainId));
      } catch {
        // Try alternative method
        try {
          if (ethereum.chainId) {
            setWalletChainId(parseChainId(ethereum.chainId));
          }
        } catch {
          // Silently fail
        }
      }
    };

    getChainId();

    const handleChainChanged = (chainId: string | number) => {
      setWalletChainId(parseChainId(chainId));
    };

    ethereum.on("chainChanged", handleChainChanged);

    // Also poll periodically in case events don't fire
    const interval = setInterval(getChainId, 2000);

    return () => {
      ethereum.removeListener("chainChanged", handleChainChanged);
      clearInterval(interval);
    };
  }, []);

  return walletChainId;
}
