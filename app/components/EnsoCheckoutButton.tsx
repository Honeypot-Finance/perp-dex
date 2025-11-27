import { FC, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Checkout } from "@ensofinance/checkout-widget";
import { useWalletConnector } from "@orderly.network/hooks";
import { getRuntimeConfig } from "@/utils/runtime-config";
import { getEnsoConfigByChainId } from "@/utils/chains";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  arbitrum,
  base,
  mainnet,
  bsc,
  optimism,
  polygon,
  avalanche,
  linea,
  blast,
  manta,
  mode,
} from "wagmi/chains";

// Supported chains for Enso widget
const SUPPORTED_CHAINS = [
  mainnet,
  arbitrum,
  base,
  bsc,
  optimism,
  polygon,
  avalanche,
  linea,
  blast,
  manta,
  mode,
] as const;

// Generate transports dynamically from chains
const transports = SUPPORTED_CHAINS.reduce(
  (acc, chain) => ({ ...acc, [chain.id]: http() }),
  {} as Record<number, ReturnType<typeof http>>
);

// Wagmi config for Enso widget (created once outside component)
const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [injected()],
  transports,
  ssr: false,
});

// Query client for Enso widget (created once outside component)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Theme configuration matching the app's dark theme
const ENSO_THEME = {
  theme: {
    semanticTokens: {
      colors: {
        bg: { value: "#140E06" },
        "bg.muted": { value: "#1B1308" },
        "bg.subtle": { value: "#1B1308" },
        "bg.emphasized": { value: "#2a2a2a" },
        fg: { value: "#FFFFFF" },
        "fg.muted": { value: "#a0a0a0" },
        "fg.subtle": { value: "#888888" },
        "fg.emphasized": { value: "#FFFFFF" },
        border: { value: "#2a2a2a" },
        "border.emphasized": { value: "#3a3a3a" },
        primary: { value: "#F7931A" },
        customBlack: { value: "#FFFFFF" },
        customWhite: { value: "#140E06" },
        gray: {
          50: { value: "#1B1308" },
          100: { value: "#CCCCCC" },
          200: { value: "#1B1308" },
          300: { value: "#2a2a2a" },
          400: { value: "#AAAAAA" },
        },
      },
    },
  },
};

// Supported CEX exchanges
const ENABLED_EXCHANGES = ["binance", "coinbase", "kraken", "bybit"] as const;

// Modal overlay styles
const OVERLAY_STYLES: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const MODAL_CONTENT_STYLES: React.CSSProperties = {
  maxHeight: "90vh",
  overflow: "auto",
};

interface EnsoCheckoutButtonProps {
  className?: string;
}

export const EnsoCheckoutButton: FC<EnsoCheckoutButtonProps> = ({
  className,
}) => {
  const [isActive, setIsActive] = useState(false);
  const { connectedChain } = useWalletConnector();

  const apiKey = getRuntimeConfig("VITE_ENSO_API_KEY");

  // Get config based on connected chain, fallback to Arbitrum (42161)
  const currentChainId = Number(connectedChain?.id) || 42161;
  const ensoConfig = getEnsoConfigByChainId(currentChainId);

  // Memoize checkout config to prevent unnecessary re-renders
  const checkoutConfig = useMemo(
    () => ({
      apiKey: apiKey || "",
      tokenOut: ensoConfig.tokenOut,
      chainIdOut: ensoConfig.chainId,
      enableExchange: [...ENABLED_EXCHANGES],
      theme: ENSO_THEME,
    }),
    [apiKey, ensoConfig.tokenOut, ensoConfig.chainId]
  );

  const handleOpen = useCallback(() => setIsActive(true), []);
  const handleClose = useCallback(() => setIsActive(false), []);
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Don't render if no API key configured
  if (!apiKey) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className={`oui-flex oui-items-center oui-justify-center oui-rounded-md oui-px-3 oui-py-2 oui-text-sm oui-font-medium oui-transition-all hover:oui-opacity-80 ${className || ""}`}
        style={{ backgroundColor: "#F7931A", color: "#000" }}
      >
        Get USDC
      </button>

      {isActive &&
        createPortal(
          <div style={OVERLAY_STYLES} onClick={handleOverlayClick}>
            <div
              onClick={(e) => e.stopPropagation()}
              style={MODAL_CONTENT_STYLES}
            >
              <WagmiProvider config={wagmiConfig}>
                <QueryClientProvider client={queryClient}>
                  <Checkout config={checkoutConfig} onClose={handleClose} />
                </QueryClientProvider>
              </WagmiProvider>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default EnsoCheckoutButton;
