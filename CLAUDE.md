# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a white-label DEX trading frontend built on Orderly Network SDK. It's a broker template for perpetual futures trading interfaces, currently configured for Honeypot Finance.

**Tech Stack**: React 18, TypeScript 5.8.3, Vite 7.1.9, Tailwind CSS, React Router DOM 7.1.3

## Commands

```bash
yarn dev              # Development server (with PWA manifest generation)
yarn build            # Production SPA build → build/client/
yarn build:spa        # SPA build with pre-rendered static routes
yarn typecheck        # TypeScript validation
yarn lint             # ESLint check
```

## Architecture

### Dual Configuration System

The app uses a dual-layer configuration pattern:
- **Build-time**: `.env` file (standard Vite `VITE_*` variables)
- **Runtime**: `public/config.js` (no rebuild needed for deployment customization)

Access runtime config via utilities in `app/utils/runtime-config.ts`:
- `getRuntimeConfig(key)` - string value
- `getRuntimeConfigBoolean(key)` - boolean
- `getRuntimeConfigArray(key)` - comma-separated array
- `getRuntimeConfigJSON(key)` - parsed JSON

### Key Directories

- `app/pages/` - Route-level page components (lazy-loaded)
- `app/components/` - Reusable UI components
- `app/components/orderlyProvider/` - Wallet provider implementations (Privy, Para, Web3-Onboard)
- `app/hooks/` - Custom React hooks
- `app/utils/` - Configuration and utilities
- `public/config.js` - Runtime configuration (broker ID, chains, features)
- `public/locales/` - i18n translation files

### Routing

Routes defined in `app/main.tsx`. Main routes:
- `/perp/:symbol` - Trading page
- `/portfolio/*` - User account pages
- `/markets` - Market analytics
- `/vaults`, `/dirac-vault` - Vault strategies

### Wallet Integration

Pluggable wallet provider system in `app/components/orderlyProvider/`:
- `privyConnector.tsx` - Email/SMS auth, in-app wallet
- `paraConnector.tsx` - Multi-chain (EVM, Solana, Cosmos)
- `walletConnector.tsx` - Web3-Onboard (MetaMask, WalletConnect, etc.)

Add new providers to `PROVIDER_REGISTRY` in `orderlyProvider/index.tsx`.

### State Management

- **Orderly Network SDK** handles trading state (positions, orders)
- **TanStack React Query** for server state
- **Wagmi** for EVM wallet state
- Minimal React Context usage

### Styling

CSS imports in `app/styles/index.css`:
1. Orderly UI base styles (`@orderly.network/ui/dist/styles.css`)
2. Theme customization (`theme.css`)
3. Tailwind utilities

Override Orderly UI variables in `theme.css`. Components use `oui-*` class prefix.

## Key Files

- `app/main.tsx` - Router setup and route definitions
- `app/App.tsx` - Root layout with provider hierarchy
- `app/utils/config.tsx` - `useOrderlyConfig()` hook for menus, logos, UI config
- `app/utils/walletConfig.ts` - Wallet provider configuration
- `public/config.js` - Runtime configuration (broker settings, chains, features)

## Dependencies

Primary SDK packages are `@orderly.network/*` at version 2.8.1. Multi-chain support via Wagmi (EVM), Solana wallet adapters, and CosmJS (Cosmos).

## Dirac Vault Integration

### Overview

The Dirac Vault (`/dirac-vault`) is an ERC4626-compatible vault strategy on Berachain. It has its own isolated Wagmi provider separate from the main Orderly SDK wallet context.

### File Structure

```
app/
├── pages/dirac-vault/
│   ├── Index.tsx              # Main vault page (UI components inline)
│   ├── Layout.tsx             # Scaffold wrapper
│   └── components/
│       └── utils.ts           # formatNumber, useWalletChain hooks
├── hooks/useDiracVault.ts     # Contract interaction hooks
└── utils/dirac-vault/
    ├── config.ts              # Runtime-configurable vault settings
    └── abi.ts                 # ERC4626 + Dirac custom ABIs
```

### Key Hooks (useDiracVault.ts)

- `useVaultData()` - TVL, total users, max deposit, pause status
- `useTradeCycle()` - Current cycle ID, status, timestamps
- `useUserVaultPosition()` - User shares, deposits, PnL
- `useAssetToken()` - Asset token balance, allowance
- `useVaultDeposit()` - Approve and deposit functions
- `useVaultWithdraw()` - Withdraw and redeem functions

### Configuration

Vault settings use runtime config (`public/config.js`) for deployment flexibility:

```js
VITE_DIRAC_VAULT_ADDRESS: "0x...",
VITE_DIRAC_VAULT_CHAIN_ID: "80094",
VITE_DIRAC_VAULT_NAME: "Honeypot Perpetual Vault",
VITE_DIRAC_VAULT_DESCRIPTION: "..."
```

### Trade Cycles

The vault operates in cycles managed by the vault operator:
- `INITIALIZED` (0) - Withdrawals allowed
- `ACTIVE` (1) - Funds deployed, withdrawals locked
- `PENDING_END` (2) - Cycle ending
- `ENDED` (3) - Withdrawals allowed

### Chain Handling

The vault uses `window.ethereum` directly for chain detection (not wagmi hooks) because it has an isolated WagmiProvider. The `useWalletChain()` hook in `components/utils.ts` handles this.

### Adding New Vaults

1. Create new config in `utils/[vault-name]/config.ts`
2. Copy and modify hooks from `useDiracVault.ts`
3. Create page in `pages/[vault-name]/`
4. Add route in `main.tsx`
5. Add to `VITE_ENABLED_MENUS`
