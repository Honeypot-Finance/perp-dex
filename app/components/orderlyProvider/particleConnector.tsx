import { ReactNode, useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  ConnectKitProvider,
  createConfig,
  useAccount,
  useDisconnect,
  useConnect,
  useSwitchChain,
  useModal,
  usePublicClient
} from '@particle-network/connectkit';
import { authWalletConnectors } from '@particle-network/connectkit/auth';
import { evmWalletConnectors } from '@particle-network/connectkit/evm';
import { solanaWalletConnectors } from '@particle-network/connectkit/solana';
import { wallet, EntryPosition } from '@particle-network/connectkit/wallet';
import { WalletConnectorContext, type WalletConnectorContextState } from '@orderly.network/hooks';
import { ChainNamespace, type NetworkId } from '@orderly.network/types';
import { getRuntimeConfig, getRuntimeConfigBoolean } from '@/utils/runtime-config';
import { mainnet, arbitrum, base, polygon, optimism, bsc, arbitrumSepolia } from '@particle-network/connectkit/chains';
import { solana, solanaDevnet } from '@particle-network/connectkit/chains';
import { type EIP1193Provider } from '@web3-onboard/common';

// Bridge component that connects Particle to Orderly's context
const ParticleOrderlyBridge = ({ children, particleConfig }: { children: ReactNode; particleConfig: ReturnType<typeof createConfig> }) => {
  const { address, isConnected, chainId, chain, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect: particleConnect } = useConnect();
  const { switchChain } = useSwitchChain();
  const { setOpen } = useModal();
  const [connecting, setConnecting] = useState(false);
  const [settingChain, setSettingChain] = useState(false);
  const [providerReady, setProviderReady] = useState(false);

  // Store event listeners for the provider
  const eventListenersRef = useRef<Map<string, Set<(...args: unknown[]) => void>>>(new Map());

  // Create a stable provider instance
  const stableProviderRef = useRef<EIP1193Provider | null>(null);

  // Store Particle's provider from connector
  const particleProviderRef = useRef<any>(null);

  // Get Particle's provider when connected
  useEffect(() => {
    const getProvider = async () => {
      if (isConnected && connector) {
        console.log('[Particle Connector] ==========');
        console.log('[Particle Connector] Getting provider from connector...');

        try {
          // Try getProvider first
          if (typeof connector.getProvider === 'function') {
            console.log('[Particle Connector] Calling connector.getProvider()...');
            const provider = await Promise.race([
              connector.getProvider(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            console.log('[Particle Connector] Got provider from connector:', provider);
            console.log('[Particle Connector] Provider type:', typeof provider);
            console.log('[Particle Connector] Provider has request:', typeof provider?.request);
            console.log('[Particle Connector] Provider methods:', Object.keys(provider || {}).filter(k => typeof (provider as any)?.[k] === 'function'));
            particleProviderRef.current = provider;
            setProviderReady(true);
            console.log('[Particle Connector] Provider ready flag set to true');
          } else {
            console.warn('[Particle Connector] Connector does not have getProvider method');
            setProviderReady(true);
          }
          console.log('[Particle Connector] ==========');
        } catch (error) {
          console.error('[Particle Connector] Failed to get provider:', error);
          console.log('[Particle Connector] ==========');
        }
      } else {
        console.log('[Particle Connector] Not getting provider - isConnected:', isConnected, 'connector:', !!connector);
      }
    };
    getProvider();
  }, [isConnected, connector]);

  // Emit chainChanged event when chain changes
  const prevChainIdRef = useRef<number | undefined>(chainId);
  useEffect(() => {
    if (chainId && chainId !== prevChainIdRef.current && prevChainIdRef.current !== undefined) {
      const hexChainId = `0x${chainId.toString(16)}`;
      console.log('[Particle Connector] Chain changed, emitting chainChanged event:', prevChainIdRef.current, '->', chainId);

      const listeners = eventListenersRef.current.get('chainChanged');
      if (listeners) {
        listeners.forEach(listener => {
          try {
            listener(hexChainId);
          } catch (error) {
            console.error('[Particle Connector] Error in chainChanged listener:', error);
          }
        });
      }
    }
    prevChainIdRef.current = chainId;
  }, [chainId]);

  // Orderly's connect method
  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      // If already connected, return current wallet state
      if (isConnected && address) {
        return [{
          label: 'Particle Wallet',
          icon: '',
          provider: stableProviderRef.current || window.ethereum,
          accounts: [{ address }],
          chains: [{ id: chainId || 1, namespace: ChainNamespace.evm }]
        }];
      }

      // Open Particle modal for connection
      setOpen(true);

      // Return empty array - Particle will handle connection through its modal
      // The wallet state will update via hooks once user connects
      return [];
    } finally {
      setConnecting(false);
    }
  }, [isConnected, address, chainId, setOpen]);

  // Orderly's disconnect method
  const handleDisconnect = useCallback(async () => {
    await disconnect();
    return [];
  }, [disconnect]);

  // Orderly's setChain method
  const setChain = useCallback(async (options: { chainId: number | string }) => {
    setSettingChain(true);
    try {
      const requestedChainId = typeof options.chainId === 'string'
        ? parseInt(options.chainId, 16)
        : options.chainId;

      await switchChain({ chainId: requestedChainId });
      return { success: true };
    } finally {
      setSettingChain(false);
    }
  }, [switchChain]);

  // Map Particle chain to Orderly format
  const connectedChain = useMemo(() => {
    if (!chain || !chainId || !isConnected) return null;
    return {
      id: chainId,
      namespace: ChainNamespace.evm,
    };
  }, [chain, chainId, isConnected]);

  // Wallet state for Orderly
  const walletState = useMemo(() => {
    if (!isConnected || !address || !chainId) {
      console.log('[Particle Connector] Wallet state null - not connected or missing data');
      return null;
    }

    console.log('[Particle Connector] Building wallet state for address:', address, 'chainId:', chainId);
    console.log('[Particle Connector] Provider ready:', providerReady);
    console.log('[Particle Connector] Particle provider available:', !!particleProviderRef.current);

    const particleProvider = particleProviderRef.current;

    if (!particleProvider && !window.ethereum) {
      console.error('[Particle Connector] No provider available!');
      return null;
    }

    // Always create EIP-1193 wrapper for better control and debugging
    console.log('[Particle Connector] Creating EIP-1193 wrapper for Particle provider');
    console.log('[Particle Connector] Provider has request:', typeof particleProvider?.request);
    const wrappedProvider = particleProvider ? {
      request: async ({ method, params }: { method: string; params?: any[] }) => {
        console.log('[Particle Connector] ===== WRAPPER REQUEST START =====');
        console.log('[Particle Connector] Request method:', method);
        console.log('[Particle Connector] Request params:', JSON.stringify(params, null, 2));

        // If provider has native request, try it first for non-signing methods
        if (typeof particleProvider.request === 'function' &&
            !['personal_sign', 'eth_sign', 'eth_signTypedData', 'eth_signTypedData_v4', 'eth_sendTransaction'].includes(method)) {
          console.log('[Particle Connector] Using native provider.request for:', method);
          try {
            const result = await particleProvider.request({ method, params });
            console.log('[Particle Connector] Native request result:', result);
            console.log('[Particle Connector] ===== WRAPPER REQUEST END =====');
            return result;
          } catch (error) {
            console.warn('[Particle Connector] Native request failed, falling back to custom handling:', error);
          }
        }

        try {
          switch (method) {
            case 'eth_accounts':
            case 'eth_requestAccounts':
              console.log('[Particle Connector] Returning accounts:', [address]);
              return [address];

            case 'eth_chainId':
              const hexChainId = `0x${chainId.toString(16)}`;
              console.log('[Particle Connector] Returning chainId:', hexChainId);
              return hexChainId;

            case 'personal_sign':
            case 'eth_sign': {
              const [message, account] = params || [];
              console.log('[Particle Connector] personal_sign - message:', message, 'account:', account);

              // Try signMessage method
              if (typeof particleProvider.signMessage === 'function') {
                console.log('[Particle Connector] Calling particleProvider.signMessage()');
                const result = await particleProvider.signMessage(message);
                console.log('[Particle Connector] signMessage result:', result);
                return result;
              }

              throw new Error('signMessage not available on provider');
            }

            case 'eth_signTypedData':
            case 'eth_signTypedData_v4': {
              const [account, typedData] = params || [];
              const parsedData = typeof typedData === 'string' ? JSON.parse(typedData) : typedData;
              console.log('[Particle Connector] eth_signTypedData_v4 - account:', account);
              console.log('[Particle Connector] eth_signTypedData_v4 - typedData:', parsedData);

              // Use native request method instead of direct signTypedData
              if (typeof particleProvider.request === 'function') {
                console.log('[Particle Connector] Using native provider.request for signing');
                try {
                  const result = await particleProvider.request({
                    method: 'eth_signTypedData_v4',
                    params: [account, typeof typedData === 'string' ? typedData : JSON.stringify(parsedData)]
                  });
                  console.log('[Particle Connector] Native signTypedData_v4 result:', result);
                  console.log('[Particle Connector] Result length:', result?.length);
                  console.log('[Particle Connector] ===== WRAPPER REQUEST END =====');
                  return result;
                } catch (error) {
                  console.error('[Particle Connector] Native signTypedData_v4 error:', error);
                  console.log('[Particle Connector] ===== WRAPPER REQUEST END =====');
                  throw error;
                }
              }

              throw new Error('provider.request not available');
            }

            case 'eth_sendTransaction': {
              const [transaction] = params || [];
              console.log('[Particle Connector] eth_sendTransaction - transaction:', transaction);

              // Try sendTransaction method
              if (typeof particleProvider.sendTransaction === 'function') {
                console.log('[Particle Connector] Calling particleProvider.sendTransaction()');
                const result = await particleProvider.sendTransaction(transaction);
                console.log('[Particle Connector] sendTransaction result:', result);
                return result;
              }

              throw new Error('sendTransaction not available on provider');
            }

            default:
              console.log('[Particle Connector] Unhandled method:', method);
              throw new Error(`Method ${method} not supported`);
          }
        } catch (error) {
          console.error('[Particle Connector] Request error:', error);
          console.log('[Particle Connector] =====');
          throw error;
        }
      },
      on: (event: string, handler: any) => {
        console.log('[Particle Connector] Adding event listener:', event);
        if (particleProvider.on) {
          particleProvider.on(event, handler);
        }
      },
      removeListener: (event: string, handler: any) => {
        console.log('[Particle Connector] Removing event listener:', event);
        if (particleProvider.removeListener) {
          particleProvider.removeListener(event, handler);
        }
      },
    } as EIP1193Provider : window.ethereum;

    console.log('[Particle Connector] Using provider:', particleProvider ? 'Particle wrapper' : 'window.ethereum');

    // Test the wrapper to make sure it's callable
    if (wrappedProvider && typeof wrappedProvider.request === 'function') {
      console.log('[Particle Connector] ✓ Wrapped provider has request method');
    } else {
      console.error('[Particle Connector] ✗ Wrapped provider missing request method!');
    }

    const walletStateObj = {
      label: 'Particle Wallet',
      icon: '',
      provider: wrappedProvider,
      accounts: [{ address }],
      chains: [{ id: chainId, namespace: ChainNamespace.evm }]
    };

    console.log('[Particle Connector] Wallet state created:', {
      label: walletStateObj.label,
      hasProvider: !!walletStateObj.provider,
      providerHasRequest: typeof walletStateObj.provider?.request === 'function',
      accountsCount: walletStateObj.accounts.length,
      chainsCount: walletStateObj.chains.length,
    });

    return walletStateObj;
  }, [isConnected, address, chainId, providerReady]);

  // Orderly wallet connector context value
  const walletConnectorValue: WalletConnectorContextState = useMemo(() => ({
    connect,
    disconnect: handleDisconnect,
    connecting,
    setChain,
    chains: [], // Particle manages chains internally
    wallet: walletState,
    connectedChain,
    settingChain,
    namespace: ChainNamespace.evm,
  }), [connect, handleDisconnect, connecting, setChain, walletState, connectedChain, settingChain]);

  return (
    <WalletConnectorContext.Provider value={walletConnectorValue}>
      {children}
    </WalletConnectorContext.Provider>
  );
};

const ParticleConnector = ({ children, networkId }: {
  children: ReactNode;
  networkId: NetworkId;
}) => {
  const projectId = getRuntimeConfig('VITE_PARTICLE_PROJECT_ID');
  const clientKey = getRuntimeConfig('VITE_PARTICLE_CLIENT_KEY');
  const appId = getRuntimeConfig('VITE_PARTICLE_APP_ID');
  const walletConnectProjectId = getRuntimeConfig('VITE_WALLETCONNECT_PROJECT_ID');

  if (!projectId || !clientKey || !appId) {
    throw new Error('Particle Network credentials not configured. Please set VITE_PARTICLE_PROJECT_ID, VITE_PARTICLE_CLIENT_KEY, and VITE_PARTICLE_APP_ID in your config.');
  }

  // Memoize the Particle config to prevent re-creating on every render
  const config = useMemo(() => {
    const disableEVMWallets = getRuntimeConfigBoolean('VITE_DISABLE_EVM_WALLETS');
    const disableSolanaWallets = getRuntimeConfigBoolean('VITE_DISABLE_SOLANA_WALLETS');

    // Configure supported chains based on network
    const evmChains = networkId === 'mainnet'
      ? [mainnet, arbitrum, base, polygon, optimism, bsc]
      : [arbitrumSepolia];

    const solChains = networkId === 'mainnet'
      ? [solana]
      : [solanaDevnet];

    return createConfig({
      projectId,
      clientKey,
      appId,

      // Appearance customization
      appearance: {
        mode: 'dark',
        theme: {
          '--pcm-accent-color': '#5B38FB',
        },
        language: 'en-US',
      },

      // Wallet connectors
      walletConnectors: [
        // Social login connectors - primary feature of Particle
        authWalletConnectors({
          authTypes: ['email', 'google', 'twitter', 'github'],
          fiatCoin: 'USD',
          promptSettingConfig: {
            promptMasterPasswordSettingWhenLogin: 1,
            promptPaymentPasswordSettingWhenSign: 1,
          },
        }),

        ...(!disableEVMWallets ? [
          evmWalletConnectors({
            metadata: {
              name: getRuntimeConfig('VITE_APP_NAME') || 'Orderly Network',
              icon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.webp` : '',
              description: getRuntimeConfig('VITE_APP_DESCRIPTION') || 'Orderly Trading Application',
              url: typeof window !== 'undefined' ? window.location.origin : '',
            },
            walletConnectProjectId: walletConnectProjectId || undefined,
          }),
        ] : []),

        ...(!disableSolanaWallets ? [
          solanaWalletConnectors(),
        ] : []),
      ],

      // Plugin configuration
      plugins: [
        wallet({
          entryPosition: EntryPosition.BR, // Bottom right
          visible: true,
        }),
      ],

      // Chain configuration
      chains: [
        ...(!disableEVMWallets ? evmChains : []),
        ...(!disableSolanaWallets ? solChains : []),
      ],
    });
  }, [projectId, clientKey, appId, walletConnectProjectId, networkId]);

  return (
    <ConnectKitProvider config={config}>
      <ParticleOrderlyBridge particleConfig={config}>
        {children}
      </ParticleOrderlyBridge>
    </ConnectKitProvider>
  );
};

export default ParticleConnector;
