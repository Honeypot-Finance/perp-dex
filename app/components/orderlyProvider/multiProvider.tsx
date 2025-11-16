import { ReactNode, lazy, Suspense } from 'react';
import type { NetworkId } from "@orderly.network/types";
import type { WalletProviderType } from "@/components/WalletProviderSelector";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const PrivyConnector = lazy(() => import("@/components/orderlyProvider/privyConnector"));
const WalletConnector = lazy(() => import("@/components/orderlyProvider/walletConnector"));

interface MultiProviderProps {
  children: ReactNode;
  networkId: NetworkId;
  activeProvider: WalletProviderType;
}

/**
 * Renders both wallet providers simultaneously but only displays the active one
 * This avoids re-initialization issues when switching between providers
 */
export const MultiProvider = ({ children, networkId, activeProvider }: MultiProviderProps) => {
  console.log('[MultiProvider] Active provider:', activeProvider);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {/* Render Privy provider - visible only when active */}
      <div style={{ display: activeProvider === 'privy' ? 'contents' : 'none' }}>
        <PrivyConnector networkId={networkId}>{children}</PrivyConnector>
      </div>

      {/* Render Web3-Onboard provider - visible only when active */}
      <div style={{ display: activeProvider === 'web3-onboard' ? 'contents' : 'none' }}>
        <WalletConnector networkId={networkId}>{children}</WalletConnector>
      </div>
    </Suspense>
  );
};
