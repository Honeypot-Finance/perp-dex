import { useEffect, useRef } from 'react';
import { useAccount } from '@orderly.network/hooks';

const ACTIVE_PROVIDER_KEY = "orderly_active_provider";

/**
 * Component that detects when user disconnects their wallet
 * and clears the stored provider selection
 */
export const WalletDisconnectHandler = () => {
  const { account } = useAccount();
  const wasConnectedRef = useRef(false);

  useEffect(() => {
    // Track if user was connected
    if (account?.address) {
      wasConnectedRef.current = true;
    }

    // Only clear provider if user WAS connected and then disconnected
    if (!account?.address && wasConnectedRef.current) {
      console.log('[WalletDisconnectHandler] User disconnected, clearing provider');
      wasConnectedRef.current = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ACTIVE_PROVIDER_KEY);
      }
    }
  }, [account?.address]);

  return null;
};
