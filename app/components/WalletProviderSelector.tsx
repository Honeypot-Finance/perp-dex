export type WalletProviderType = 'privy' | 'web3-onboard';

interface ProviderOption {
  type: WalletProviderType;
  name: string;
  description: string;
  icon: string;
}

interface WalletProviderSelectorProps {
  isOpen: boolean;
  onSelect: (type: WalletProviderType) => void;
  onClose: () => void;
}

/**
 * Modal for selecting wallet authentication provider
 */
export const WalletProviderSelector = ({ isOpen, onSelect, onClose }: WalletProviderSelectorProps) => {
  const providerOptions: ProviderOption[] = [
    {
      type: 'privy',
      name: 'Privy',
      description: 'Social login (email, Google, Twitter)',
      icon: '🔐',
    },
    {
      type: 'web3-onboard',
      name: 'Direct Wallet',
      description: 'MetaMask, WalletConnect, Solana wallets',
      icon: '🔗',
    },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" data-wallet-provider-modal>
      <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl border border-gray-700">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">
            Choose Login Method
          </h2>
        </div>

        {/* Provider Options List */}
        <div className="p-3">
          {providerOptions.map((provider) => (
            <button
              key={provider.type}
              onClick={() => onSelect(provider.type)}
              className="w-full flex items-center gap-3 p-3 mb-2 last:mb-0 rounded-lg text-left transition-all duration-200 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500 cursor-pointer group"
            >
              <div className="text-2xl">{provider.icon}</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">
                  {provider.name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {provider.description}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

