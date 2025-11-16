import { useEffect } from 'react';

interface ConnectWalletTriggerProps {
  shouldConnect: boolean;
  onConnected: () => void;
}

/**
 * Component that triggers wallet connection by simulating a button click
 * Waits for the wallet connector UI to be ready, then clicks the connect button
 */
export const ConnectWalletTrigger = ({ shouldConnect, onConnected }: ConnectWalletTriggerProps) => {
  useEffect(() => {
    if (shouldConnect) {
      console.log('[ConnectWalletTrigger] Waiting for connector to be ready...');

      // Wait for the provider to fully initialize
      const tryConnect = (attempts = 0) => {
        if (attempts > 10) {
          console.error('[ConnectWalletTrigger] Could not find connect button after 10 attempts');
          onConnected();
          return;
        }

        // Look for the Orderly connect button
        const connectButton = document.querySelector(
          'button[class*="connect"], button[id*="connect"]'
        ) as HTMLElement;

        if (connectButton && connectButton.textContent?.toLowerCase().includes('connect')) {
          console.log('[ConnectWalletTrigger] Found connect button, clicking...');
          connectButton.click();
          onConnected();
        } else {
          // Try again after a short delay
          setTimeout(() => tryConnect(attempts + 1), 200);
        }
      };

      // Start trying after a brief delay to let the provider render
      setTimeout(() => tryConnect(), 300);
    }
  }, [shouldConnect, onConnected]);

  return null;
};
