"use client";
import {
  ReactNode,
  useCallback,
  useState,
  useMemo,
  Suspense,
  useEffect,
  startTransition,
  useRef,
} from "react";
import {
  AuthCoreContextProvider,
  useConnect,
  useEthereum,
  useAuthCore,
} from "@particle-network/authkit";
import {
  WalletConnectorContext,
  WalletConnectorContextState,
} from "@orderly.network/hooks";
import { type NetworkId, ChainNamespace } from "@orderly.network/types";
import {
  getRuntimeConfig,
  getRuntimeConfigBoolean,
} from "@/utils/runtime-config";
import {
  arbitrum,
  base,
  berachainTestnetbArtio,
  mainnet,
  polygon,
  sepolia,
  type Chain,
} from "@particle-network/authkit/chains";

interface ParticleConnectorProps {
  children: ReactNode;
  networkId: NetworkId;
}

// Map of chain IDs to Particle chain objects
const PARTICLE_CHAINS: Record<number, Chain> = {
  1: mainnet,
  42161: arbitrum,
  8453: base,
  137: polygon,
  11155111: sepolia,
  80094: berachainTestnetbArtio,
};

// Wallet state interface
interface WalletState {
  chains: Array<{ id: string; namespace: ChainNamespace }>;
  accounts: Array<{ address: string; chain?: { id: string } }>;
  icon: string;
  label: string;
  provider: any;
}

// Inner component that uses Particle hooks
const ParticleWalletConnector = ({
  children,
  networkId,
}: {
  children: ReactNode;
  networkId: NetworkId;
}) => {
  const { connect, disconnect, connectionStatus } = useConnect();
  const { address, chainId, switchChain, provider } = useEthereum();
  const { userInfo } = useAuthCore();

  const [settingChain, setSettingChain] = useState(false);
  const [disconnectCount, setDisconnectCount] = useState(0);
  const [wallet, setWallet] = useState<WalletState>({
    chains: [],
    accounts: [],
    icon: "",
    label: "Particle Network",
    provider: null,
  });

  // Use refs to maintain stable object references
  const isMountedRef = useRef(false);
  const walletRef = useRef<WalletState>(wallet);
  const connectedChainRef = useRef<{ id: number; namespace: ChainNamespace } | null>(null);
  const chainsRef = useRef<Chain[]>([]);
  const walletChainsRef = useRef<Array<{ id: string; namespace: ChainNamespace }>>([]);
  const providerRef = useRef<any>(null);

  // Store Particle functions in refs to prevent callback recreation
  const connectRef = useRef(connect);
  const disconnectRef = useRef(disconnect);
  const switchChainRef = useRef(switchChain);

  // Update refs when Particle functions change
  useEffect(() => {
    connectRef.current = connect;
    disconnectRef.current = disconnect;
    switchChainRef.current = switchChain;
  }, [connect, disconnect, switchChain]);

  // Defer initialization until after mount
  useEffect(() => {
    console.log("[ParticleConnector] Component mounting...");
    isMountedRef.current = true;
  }, []);

  // Log initial Particle state on mount
  useEffect(() => {
    if (!isMountedRef.current) return;

    console.log("[ParticleConnector] Initial Particle state:", {
      connectionStatus,
      address,
      chainId,
      hasProvider: !!provider,
      hasUserInfo: !!userInfo,
      userInfoData: userInfo,
    });
  }, [connectionStatus, address, chainId, provider, userInfo]);

  // Handle OAuth redirect from Particle - AuthKit handles this automatically
  // We just need to clean up the URL after Particle processes it
  useEffect(() => {
    if (typeof window === "undefined" || !isMountedRef.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const hasParticleParams = urlParams.has("particleThirdpartyParams");

    if (hasParticleParams) {
      console.log("[ParticleConnector] OAuth redirect detected");
      console.log(
        "[ParticleConnector] Waiting for Particle AuthKit to process login..."
      );

      // AuthKit should automatically process the OAuth params
      // Just wait a bit and then clean the URL
      setTimeout(() => {
        console.log("[ParticleConnector] Connection status:", connectionStatus);
        console.log("[ParticleConnector] Address:", address);
        console.log("[ParticleConnector] User info:", userInfo);

        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
        console.log("[ParticleConnector] URL cleaned");
      }, 2000);
    }
  }, [connectionStatus, address, userInfo]);

  // Get chains from config - memoize and use ref to maintain stability
  const chains = useMemo(() => {
    const disableMainnet = getRuntimeConfigBoolean("VITE_DISABLE_MAINNET");
    const disableTestnet = getRuntimeConfigBoolean("VITE_DISABLE_TESTNET");

    const mainnetChainIds = disableMainnet
      ? []
      : getRuntimeConfig("VITE_ORDERLY_MAINNET_CHAINS")
          ?.split(",")
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id)) || [];

    const testnetChainIds = disableTestnet
      ? []
      : getRuntimeConfig("VITE_ORDERLY_TESTNET_CHAINS")
          ?.split(",")
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id)) || [];

    const chainIds =
      networkId === "mainnet" ? mainnetChainIds : testnetChainIds;

    const newChains = chainIds
      .map((id) => PARTICLE_CHAINS[id])
      .filter((chain): chain is Chain => chain !== undefined);

    // Check if chains actually changed
    const chainsChanged =
      chainsRef.current.length !== newChains.length ||
      chainsRef.current.some((c, i) => c.id !== newChains[i]?.id);

    if (chainsChanged) {
      chainsRef.current = newChains;
    }

    return chainsRef.current;
  }, [networkId]);

  // Format chains for Orderly - maintain stable reference
  const walletChains = useMemo(() => {
    const newWalletChains = chains.map((c) => ({
      id: c.id.toString(),
      namespace: ChainNamespace.evm,
    }));

    // Check if walletChains actually changed
    const chainsChanged =
      walletChainsRef.current.length !== newWalletChains.length ||
      walletChainsRef.current.some((c, i) => c.id !== newWalletChains[i]?.id);

    if (chainsChanged) {
      walletChainsRef.current = newWalletChains;
    }

    return walletChainsRef.current;
  }, [chains]);

  // Update wallet when Particle connection state changes
  useEffect(() => {
    console.log("[ParticleConnector] Connection state changed:", {
      address,
      hasProvider: !!provider,
      userInfo: userInfo
        ? { email: userInfo.email, name: userInfo.name }
        : null,
      connectionStatus,
      chainId,
    });

    // Update provider ref only when there's a real connection change
    // This keeps the provider object reference stable across re-renders
    if (provider && (!providerRef.current || address !== walletRef.current.accounts[0]?.address)) {
      providerRef.current = provider;
    } else if (!provider || connectionStatus === "disconnected") {
      providerRef.current = null;
    }

    const newWallet: WalletState = (!address || !providerRef.current || connectionStatus === "disconnected")
      ? {
          chains: walletChains,
          accounts: [],
          icon: "",
          label: "Particle Network",
          provider: null,
        }
      : {
          chains: walletChains,
          accounts: [{ address, chain: { id: chainId?.toString() || "" } }],
          icon: "",
          label: "Particle Network",
          provider: providerRef.current,
        };

    // Only update if wallet actually changed (check all relevant fields)
    // Note: We use providerRef so provider comparison is stable
    const hasChanged =
      walletRef.current.accounts.length !== newWallet.accounts.length ||
      walletRef.current.accounts[0]?.address !== newWallet.accounts[0]?.address ||
      walletRef.current.accounts[0]?.chain?.id !== newWallet.accounts[0]?.chain?.id ||
      walletRef.current.chains.length !== newWallet.chains.length;

    if (hasChanged) {
      console.log("[ParticleConnector] Wallet state changed:", {
        accountsChanged: walletRef.current.accounts.length !== newWallet.accounts.length,
        addressChanged: walletRef.current.accounts[0]?.address !== newWallet.accounts[0]?.address,
        chainChanged: walletRef.current.accounts[0]?.chain?.id !== newWallet.accounts[0]?.chain?.id,
        chainsLengthChanged: walletRef.current.chains.length !== newWallet.chains.length,
      });
      walletRef.current = newWallet;
      setWallet(newWallet);
    }
  }, [address, provider, userInfo, chainId, walletChains, connectionStatus]);

  // Handle connect with startTransition to avoid Suspense errors
  // Use ref to prevent recreation when Particle's connect changes
  const handleConnect = useCallback(async () => {
    if (!isMountedRef.current) {
      console.log("[ParticleConnector] Not mounted yet, deferring connect");
      return [];
    }

    try {
      // Wrap in startTransition to handle async state updates
      return await new Promise<any[]>((resolve) => {
        startTransition(() => {
          connectRef.current({})
            .then(() => {
              console.log("[ParticleConnector] Connect successful");
              resolve([]);
            })
            .catch((error) => {
              console.error("[ParticleConnector] Connect error:", error);
              resolve([]);
            });
        });
      });
    } catch (error) {
      console.error("[ParticleConnector] Connect error:", error);
      return [];
    }
  }, []); // No dependencies - completely stable

  // Handle disconnect - use ref to prevent recreation
  const handleDisconnect = useCallback(async () => {
    try {
      console.log("[ParticleConnector] Disconnecting...");
      await disconnectRef.current();

      // Force clear wallet state immediately
      const clearedWallet = {
        chains: walletChainsRef.current,
        accounts: [],
        icon: "",
        label: "Particle Network",
        provider: null,
      };

      walletRef.current = clearedWallet;
      setWallet(clearedWallet);

      // Increment disconnect counter to trigger re-render
      setDisconnectCount((prev) => prev + 1);

      console.log("[ParticleConnector] Disconnect complete");
      return [];
    } catch (error) {
      console.error("[ParticleConnector] Disconnect error:", error);
      // Still clear wallet state even on error
      const clearedWallet = {
        chains: walletChainsRef.current,
        accounts: [],
        icon: "",
        label: "Particle Network",
        provider: null,
      };

      walletRef.current = clearedWallet;
      setWallet(clearedWallet);
      return [];
    }
  }, []);

  // Handle chain switching with startTransition - use ref to prevent recreation
  const handleSwitchChain = useCallback(
    async ({ chainId: targetChainId }: { chainId: string | number }) => {
      if (!isMountedRef.current) {
        console.log(
          "[ParticleConnector] Not mounted yet, deferring chain switch"
        );
        return null;
      }

      setSettingChain(true);
      try {
        const targetChainIdNum =
          typeof targetChainId === "string"
            ? parseInt(targetChainId)
            : targetChainId;
        const targetChain = chainsRef.current.find((c) => c.id === targetChainIdNum);

        if (targetChain && switchChainRef.current) {
          // Wrap chain switching in startTransition
          await new Promise<void>((resolve, reject) => {
            startTransition(() => {
              switchChainRef.current(targetChain.id)
                .then(() => resolve())
                .catch(reject);
            });
          });
        }
        return targetChain;
      } catch (error) {
        console.error("[ParticleConnector] Chain switch error:", error);
        throw error;
      } finally {
        setSettingChain(false);
      }
    },
    [] // No dependencies - completely stable
  );

  // Connected chain state - use ref to maintain stability
  const connectedChain = useMemo(() => {
    if (!chainId || !address) {
      connectedChainRef.current = null;
      return null;
    }

    // Only create new object if chain ID actually changed
    if (connectedChainRef.current?.id !== chainId) {
      connectedChainRef.current = {
        id: chainId,
        namespace: ChainNamespace.evm,
      };
    }

    return connectedChainRef.current;
  }, [chainId, address]);

  // Determine connecting state
  const isConnecting =
    connectionStatus === "connecting" && !address && !provider;

  // Memoize context value (include disconnectCount to ensure fresh context after disconnect)
  const contextValue = useMemo(() => {
    console.log("[ParticleConnector] Creating new context value:", {
      isConnecting,
      settingChain,
      chainsLength: chains.length,
      walletAccountsLength: wallet.accounts.length,
      hasConnectedChain: !!connectedChain,
      disconnectCount,
    });

    return {
      connect: handleConnect,
      disconnect: handleDisconnect,
      connecting: isConnecting,
      setChain: handleSwitchChain,
      chains,
      wallet,
      connectedChain,
      settingChain,
      namespace: ChainNamespace.evm,
    } as WalletConnectorContextState;
  }, [
    handleConnect,
    handleDisconnect,
    isConnecting,
    handleSwitchChain,
    chains,
    wallet,
    connectedChain,
    settingChain,
    disconnectCount,
  ]);

  // Track dependency changes to identify what's causing re-renders
  const prevDeps = useRef({
    handleConnect,
    handleDisconnect,
    isConnecting,
    handleSwitchChain,
    chains,
    wallet,
    connectedChain,
    settingChain,
    disconnectCount,
  });

  useEffect(() => {
    const changedDeps: string[] = [];

    if (prevDeps.current.handleConnect !== handleConnect) changedDeps.push("handleConnect");
    if (prevDeps.current.handleDisconnect !== handleDisconnect) changedDeps.push("handleDisconnect");
    if (prevDeps.current.isConnecting !== isConnecting) changedDeps.push("isConnecting");
    if (prevDeps.current.handleSwitchChain !== handleSwitchChain) changedDeps.push("handleSwitchChain");
    if (prevDeps.current.chains !== chains) changedDeps.push("chains");
    if (prevDeps.current.wallet !== wallet) changedDeps.push("wallet");
    if (prevDeps.current.connectedChain !== connectedChain) changedDeps.push("connectedChain");
    if (prevDeps.current.settingChain !== settingChain) changedDeps.push("settingChain");
    if (prevDeps.current.disconnectCount !== disconnectCount) changedDeps.push("disconnectCount");

    if (changedDeps.length > 0) {
      console.log("[ParticleConnector] Dependencies changed:", changedDeps);
    }

    prevDeps.current = {
      handleConnect,
      handleDisconnect,
      isConnecting,
      handleSwitchChain,
      chains,
      wallet,
      connectedChain,
      settingChain,
      disconnectCount,
    };
  }, [handleConnect, handleDisconnect, isConnecting, handleSwitchChain, chains, wallet, connectedChain, settingChain, disconnectCount]);

  // Don't render context until component is mounted to avoid Suspense issues
  if (!isMountedRef.current) {
    return <></>;
  }

  return (
    <WalletConnectorContext.Provider value={contextValue}>
      {children}
    </WalletConnectorContext.Provider>
  );
};

const ParticleConnector = ({ children, networkId }: ParticleConnectorProps) => {
  const projectId = getRuntimeConfig("VITE_PARTICLE_PROJECT_ID");
  const clientKey = getRuntimeConfig("VITE_PARTICLE_CLIENT_KEY");
  const appId = getRuntimeConfig("VITE_PARTICLE_APP_ID");

  // Get all supported chains for Particle AuthCore
  const allSupportedChains = useMemo((): readonly [Chain, ...Chain[]] => {
    const result: Chain[] = [];
    const seen = new Set<number>();

    const mainnetChainIds =
      getRuntimeConfig("VITE_ORDERLY_MAINNET_CHAINS")
        ?.split(",")
        .map((id) => parseInt(id.trim(), 10)) || [];
    const testnetChainIds =
      getRuntimeConfig("VITE_ORDERLY_TESTNET_CHAINS")
        ?.split(",")
        .map((id) => parseInt(id.trim(), 10)) || [];

    [...mainnetChainIds, ...testnetChainIds].forEach((id) => {
      if (!isNaN(id) && !seen.has(id) && PARTICLE_CHAINS[id]) {
        seen.add(id);
        result.push(PARTICLE_CHAINS[id]);
      }
    });

    if (result.length === 0) {
      result.push(mainnet);
    }

    return result as [Chain, ...Chain[]];
  }, []);

  if (!projectId || !clientKey || !appId) {
    console.warn(
      "Particle Network credentials not configured. Please set VITE_PARTICLE_PROJECT_ID, VITE_PARTICLE_CLIENT_KEY, and VITE_PARTICLE_APP_ID in config.js"
    );
    return <>{children}</>;
  }

  return (
    <AuthCoreContextProvider
      options={{
        projectId,
        clientKey,
        appId,
        chains: allSupportedChains,
        themeType: "dark",
        language: "en",
        wallet: {
          visible: false,
        },
      }}
    >
      <Suspense fallback={null}>
        <ParticleWalletConnector networkId={networkId}>
          {children}
        </ParticleWalletConnector>
      </Suspense>
    </AuthCoreContextProvider>
  );
};

export default ParticleConnector;
