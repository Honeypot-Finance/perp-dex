# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a perpetual trading DEX (decentralized exchange) UI built on top of Orderly Network's SDK. It's a Vite + React + TypeScript application configured as a broker template for launching customized trading interfaces. The project uses React Router for routing and supports multiple wallet providers (EVM, Solana, Cosmos) through a pluggable provider system.

## Development Commands

### Common Operations
```bash
# Development server (auto-generates manifest first)
yarn dev

# Build for production
yarn build

# Build as SPA (single-page app)
yarn build:spa

# Preview production build
yarn preview

# Type checking
yarn typecheck

# Lint code
yarn lint

# Generate PWA manifest only
yarn generate:manifest
```

## Configuration Architecture

### Two-Tier Configuration System
1. **Build-time**: Environment variables (`.env` file - minimal, mostly empty)
2. **Runtime**: `public/config.js` with `window.__RUNTIME_CONFIG__` object - this is the primary configuration method

The runtime config system allows changing configuration without rebuilding:
- All config reads use `getRuntimeConfig()` utility from `app/utils/runtime-config.ts`
- Supports string, boolean, number, array, and JSON parsing
- Fallback chain: `window.__RUNTIME_CONFIG__` → `import.meta.env` → defaults

### Key Configuration Files
- `public/config.js` - Runtime configuration (broker ID, chains, wallet settings, UI customization)
- `app/utils/config.tsx` - UI configuration hook (`useOrderlyConfig`) for menus, icons, themes
- `app/utils/walletConfig.ts` - Wallet connector configurations (EVM, Solana, Cosmos)
- `app/styles/theme.css` - Theme customization (colors, spacing, etc.)

### Important Configuration Fields
- `VITE_ORDERLY_BROKER_ID` - Orderly Network broker identifier
- `VITE_ORDERLY_MAINNET_CHAINS` / `VITE_ORDERLY_TESTNET_CHAINS` - Supported chain IDs (comma-separated)
- `VITE_DEFAULT_CHAIN` - Default chain ID on load
- `VITE_ENABLED_MENUS` - Which navigation menus to show (Trading,Portfolio,Markets,etc)
- `VITE_CUSTOM_MENUS` - External links in navigation (format: "Name,URL;Name2,URL2")
- `VITE_PRIVY_APP_ID` / `VITE_WALLETCONNECT_PROJECT_ID` / `VITE_PARA_API_KEY` - Wallet provider API keys

## Architecture

### Multi-Provider Wallet System
The application uses a **provider registry pattern** to support multiple wallet connection systems:

**Location**: `app/components/orderlyProvider/index.tsx`

**How it works**:
1. User clicks "Connect Wallet" → intercept click → show provider selector modal
2. User selects provider (Privy, Web3-Onboard, Para) → lazy load connector component
3. Auto-click connect button within selected provider
4. Provider handles wallet connection (EVM/Solana/Cosmos wallets)

**Provider Components**:
- `privyConnector.tsx` - Privy authentication (email, social login)
- `walletConnector.tsx` - Web3-Onboard (multi-wallet support via Blocknative)
- `paraConnector.tsx` - Para wallet (universal wallet for EVM, Solana, Cosmos)

**To add a new wallet provider**:
1. Create connector in `app/components/orderlyProvider/{name}Connector.tsx`
2. Add to `PROVIDER_REGISTRY` in `app/components/orderlyProvider/index.tsx`
3. Add option to `WalletProviderSelector.tsx`

### Routing Structure
Single-page application with React Router v7:
- `/` - Main trading page (redirects to `/perp`)
- `/perp` - Perpetual trading interface
- `/perp/:symbol` - Trading specific symbol
- `/portfolio/*` - Portfolio management (positions, orders, assets, history, settings)
- `/markets` - Market overview
- `/leaderboard` - Trading leaderboard
- `/rewards` - Trading rewards and affiliate program
- `/vaults` - Vault management
- `/amm-perp` - AMM perpetual trading (experimental)

All routes use lazy loading via `React.lazy()` in `app/main.tsx`.

### Application Initialization Flow
1. `app/main.tsx` loads runtime config from `public/config.js`
2. Injects analytics scripts if configured
3. Initializes React Router
4. Registers service worker for PWA support
5. `App.tsx` wraps everything in `OrderlyProvider`
6. `OrderlyProvider` sets up locale, network selection, wallet providers

### State Management
- Uses Orderly Network's SDK built-in state management via `OrderlyAppProvider`
- React Query (`@tanstack/react-query`) for server state
- Local storage for network ID (`orderly_network_id`) and language preferences
- No global state management library (Redux/Zustand) - relies on context and SDK

### PWA Manifest Generation
The `scripts/generate-manifest.ts` script:
- Reads theme colors from `app/styles/theme.css`
- Reads config from `public/config.js`
- Generates `manifest.json` with proper icons, colors, shortcuts
- Runs automatically before build and dev commands

## Customization Guide

### Branding
1. **Logos**: Replace `public/logo.webp` (primary), `public/logo-secondary.webp`, `public/favicon.webp`
2. **Theme**: Edit `app/styles/theme.css` or export from Orderly Storybook
3. **Colors**: Modify CSS variables in theme.css (e.g., `--oui-color-primary`, `--oui-color-base-7`)

### Navigation Menus
Edit `VITE_ENABLED_MENUS` in `public/config.js` to show/hide pages:
- Available: Trading, Portfolio, Markets, Swap, Rewards, Leaderboard, Vaults
- External links via `VITE_CUSTOM_MENUS`

### Chain Support
- Mainnet chains: `VITE_ORDERLY_MAINNET_CHAINS` (comma-separated chain IDs)
- Testnet chains: `VITE_ORDERLY_TESTNET_CHAINS`
- Disable networks: `VITE_DISABLE_MAINNET` / `VITE_DISABLE_TESTNET`

## Key Dependencies

### Orderly Network SDK
- `@orderly.network/react-app` - Core app provider
- `@orderly.network/trading` - Trading components
- `@orderly.network/portfolio` - Portfolio management
- `@orderly.network/markets` - Market data
- `@orderly.network/ui` / `@orderly.network/ui-scaffold` - UI components
- `@orderly.network/wallet-connector*` - Wallet connection utilities

### Wallet Integrations
- **EVM**: wagmi, viem, Web3-Onboard (Binance, Bitget, Phantom, Coinbase)
- **Solana**: @solana/wallet-adapter-* (Phantom, Solflare, Ledger)
- **Cosmos**: graz, @leapwallet/cosmos-social-login
- **Universal**: @getpara/react-sdk

### Build Tools
- Vite 7 - Build tool and dev server
- TypeScript 5.8 - Type checking
- TailwindCSS 3 - Styling
- React Router 7 - Routing

## Important Notes

### Wallet Connection Flow
The app intercepts ALL "Connect Wallet" button clicks globally to show a provider selector. This happens via event listener in `OrderlyProvider` component. When debugging wallet issues, check:
1. Provider selector modal appears
2. Correct provider loaded from registry
3. Auto-click triggers provider's connect button

### Network Switching
Switching between mainnet/testnet triggers a full page reload to reinitialize the Orderly SDK with new network configuration.

### Language Support
Configured via `VITE_AVAILABLE_LANGUAGES` (comma-separated locale codes). Language files loaded from `public/locales/{lang}.json`. URL parameter `?lang=xx` can override.

### Base Path Support
Supports deployment to subdirectories via `PUBLIC_PATH` env var or `VITE_BASE_URL` in config. All asset paths use `withBasePath()` utility from `app/utils/base-path.ts`.
