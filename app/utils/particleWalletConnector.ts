import type { WalletInit } from "@web3-onboard/common";
import { getRuntimeConfig } from "./runtime-config";

/**
 * Custom Web3-Onboard connector for Particle Network
 * This adds Particle as a wallet option in the Web3-Onboard modal
 */
export const particleWallet = (): WalletInit => {
  // Check if Particle credentials are configured
  const projectId = getRuntimeConfig("VITE_PARTICLE_PROJECT_ID");
  const clientKey = getRuntimeConfig("VITE_PARTICLE_CLIENT_KEY");
  const appId = getRuntimeConfig("VITE_PARTICLE_APP_ID");

  if (!projectId || !clientKey || !appId) {
    console.warn(
      "[Particle] Credentials not configured, skipping Particle wallet"
    );
    // Return a function that returns null to skip this wallet
    return () => null;
  }

  // Singleton instance to avoid re-initialization
  let particleInstance: any = null;

  return () => ({
    label: "Particle Network",
    getIcon: async () => `
      <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" rx="80" fill="url(#paint0_linear)"/>
        <circle cx="200" cy="200" r="80" fill="white" opacity="0.2"/>
        <circle cx="200" cy="200" r="50" fill="white"/>
        <defs>
          <linearGradient id="paint0_linear" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
            <stop stop-color="#A257FA"/>
            <stop offset="1" stop-color="#5D5FEF"/>
          </linearGradient>
        </defs>
      </svg>
    `,
    getInterface: async () => {
      try {
        // Only initialize Particle once
        if (!particleInstance) {
          console.log("[Particle Web3-Onboard] Initializing Particle...");

          // Dynamically import Particle SDK
          const { ParticleNetwork } = await import("@particle-network/auth");
          const { Ethereum } = await import("@particle-network/chains");

          // Initialize Particle (but don't login yet)
          particleInstance = new ParticleNetwork({
            projectId,
            clientKey,
            appId,
            chainName: Ethereum.name,
            chainId: Ethereum.id,
            wallet: {
              displayWalletEntry: false, // Don't show wallet icon until connected
            },
          });
        }

        const particle = particleInstance;

        // Get the EIP-1193 provider
        const baseProvider = particle.provider;

        // Create a wrapper provider that triggers login on eth_requestAccounts
        let isConnecting = false;
        const wrappedProvider = {
          request: async (args: any) => {
            // Intercept eth_requestAccounts to trigger Particle login
            if (args.method === "eth_requestAccounts" && !isConnecting) {
              isConnecting = true;
              try {
                console.log("[Particle Web3-Onboard] Triggering login...");
                const userInfo = await particle.auth.login();
                console.log(
                  "[Particle Web3-Onboard] User logged in:",
                  userInfo
                );
                isConnecting = false;
              } catch (error) {
                isConnecting = false;
                throw error;
              }
            }
            // Forward all requests to the actual provider
            return baseProvider.request(args);
          },
          // Implement event emitter methods (even if just stubs)
          on: (event: string, handler: any) => {
            if (baseProvider.on) {
              return baseProvider.on(event, handler);
            }
            return () => {}; // Return noop cleanup function
          },
          removeListener: (event: string, handler: any) => {
            if (baseProvider.removeListener) {
              return baseProvider.removeListener(event, handler);
            }
          },
        };

        return {
          provider: wrappedProvider as any,
          instance: particle,
        };
      } catch (error: any) {
        console.error("[Particle Web3-Onboard] Initialization error:", error);
        throw new Error(
          `Failed to initialize Particle: ${error.message || "Unknown error"}`
        );
      }
    },
    platforms: ["desktop", "mobile"],
  });
};
