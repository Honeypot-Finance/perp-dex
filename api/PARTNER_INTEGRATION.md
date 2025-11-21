# Orderly Network Trading API - Partner Integration Guide

Complete guide for integrating with the Orderly Network perpetual futures trading API.

## Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Account Management](#account-management)
  - [Trading Operations](#trading-operations)
  - [Market Data](#market-data)
  - [Withdrawals](#withdrawals)
- [Error Handling](#error-handling)
- [Code Examples](#code-examples)

---

## Overview

This API provides a simplified interface to Orderly Network's perpetual futures trading platform on BSC (Binance Smart Chain). It handles:

- User account registration and management
- Deposit and withdrawal operations
- Order placement, modification, and cancellation
- Position management
- Real-time market data access

**Base URL:** `https://your-api-domain.com/api/v1`

**Network:** BSC Mainnet (Chain ID: 56)

---

## Quick Start

### Prerequisites

1. **API Key**: Contact us to get your API key
2. **User Wallet**: Your users need a BSC-compatible wallet (MetaMask, WalletConnect, etc.)
3. **USDC Balance**: Users need USDC on BSC for deposits

### Integration Flow

```
1. Register Account → 2. Deposit USDC → 3. Trade → 4. Withdraw
```

---

## Authentication

All API requests require authentication headers:

```javascript
headers: {
  'X-API-KEY': 'your-api-key',
  'X-Account-ID': 'user-orderly-account-id',  // After registration
  'Content-Type': 'application/json'
}
```

---

## API Endpoints

### Account Management

#### 1. Check if Account Exists

**GET** `/account/check`

Query parameters:
- `address` (required): User's wallet address
- `brokerId` (optional): Your broker ID (default: 'honeypot')

**Response:**
```json
{
  "success": true,
  "data": {
    "account_id": "0xabc...",
    "account_exists": true
  }
}
```

---

#### 2. Register New Account

**POST** `/account/register`

**Request Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "brokerId": "honeypot",
  "chainId": 56,
  "message": {
    "brokerId": "honeypot",
    "chainId": 56,
    "timestamp": "1234567890000",
    "registrationNonce": "123"
  },
  "signature": "0xabc...",
  "orderlyKey": "ed25519:Abc123..."
}
```

**Important Notes:**
- Get `registrationNonce` from `/registration/nonce` first
- `message` must be signed using EIP-712
- `orderlyKey` is an ed25519 key pair for trading

**Response:**
```json
{
  "success": true,
  "data": {
    "account_id": "0xc365b75d6384b23e0cd7d03f455fbdfba75c8f743390e89d504bd8cdc326d72c",
    "user_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }
}
```

---

#### 3. Get Account Info

**GET** `/account/info`

**Response:**
```json
{
  "success": true,
  "data": {
    "account_id": "0xabc...",
    "email": "",
    "account_mode": "SPOT_FUTURES",
    "max_leverage": 10,
    "taker_fee_rate": 10,
    "maker_fee_rate": 10
  }
}
```

---

#### 4. Get Account Balance

**GET** `/account/balance`

**Response:**
```json
{
  "success": true,
  "data": {
    "holding": [
      {
        "token": "USDC",
        "holding": 100.5,
        "frozen": 10.2,
        "pending_short": 0
      }
    ]
  }
}
```

---

### Trading Operations

#### 5. Get Available Symbols

**GET** `/symbols`

**Response:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "symbol": "PERP_BTC_USDC",
        "quote_min": 0,
        "quote_max": 200000,
        "base_min": 0.00001,
        "base_max": 27,
        "base_tick": 0.00001,
        "min_notional": 10
      }
    ]
  }
}
```

---

#### 6. Place Order

**POST** `/orders`

**Request Body:**
```json
{
  "symbol": "PERP_BTC_USDC",
  "side": "BUY",
  "order_type": "LIMIT",
  "order_price": 83500,
  "order_quantity": 0.001
}
```

**Order Types:**
- `LIMIT`: Standard limit order
- `MARKET`: Market order (no price needed)
- `POST_ONLY`: Post-only limit order (maker only)
- `IOC`: Immediate or cancel
- `FOK`: Fill or kill

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": 18436093892,
    "client_order_id": null,
    "status": "NEW",
    "symbol": "PERP_BTC_USDC",
    "price": 83500,
    "quantity": 0.001
  }
}
```

---

#### 7. Get Open Orders

**GET** `/orders`

Query parameters:
- `symbol` (optional): Filter by symbol

**Response:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "order_id": 18436093892,
        "symbol": "PERP_BTC_USDC",
        "status": "NEW",
        "side": "BUY",
        "price": 83500,
        "quantity": 0.001,
        "executed": 0
      }
    ]
  }
}
```

---

#### 8. Get Order by ID

**GET** `/orders/:orderId`

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": 18436093892,
    "symbol": "PERP_BTC_USDC",
    "status": "NEW",
    "side": "BUY",
    "price": 83500,
    "quantity": 0.001,
    "executed": 0,
    "created_time": 1763712113709
  }
}
```

---

#### 9. Edit Order

**PUT** `/orders/:orderId`

**Request Body:**
```json
{
  "symbol": "PERP_BTC_USDC",
  "order_price": 84000,
  "order_quantity": 0.002
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": 18436093892,
    "status": "FILLED"
  }
}
```

---

#### 10. Cancel Order

**DELETE** `/orders/:orderId?symbol=PERP_BTC_USDC`

Query parameters:
- `symbol` (required): Trading symbol

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "CANCEL_SENT"
  }
}
```

---

#### 11. Cancel All Orders

**DELETE** `/orders/all`

Query parameters:
- `symbol` (optional): Cancel orders for specific symbol only

**Response:**
```json
{
  "success": true,
  "data": {
    "cancelled_count": 5
  }
}
```

---

#### 12. Get Positions

**GET** `/positions`

**Response:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "symbol": "PERP_BTC_USDC",
        "position_qty": 0.001,
        "average_open_price": 83500,
        "unrealized_pnl": 5.23,
        "mark_price": 83750
      }
    ],
    "total_collateral_value": 100,
    "free_collateral": 85.5
  }
}
```

---

#### 13. Get Position by Symbol

**GET** `/positions/:symbol`

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "PERP_BTC_USDC",
    "position_qty": 0.001,
    "average_open_price": 83500,
    "unrealized_pnl": 5.23,
    "mark_price": 83750,
    "leverage": 10
  }
}
```

---

### Market Data

#### 14. Get Market Ticker

**GET** `/market/ticker/:symbol`

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "PERP_BTC_USDC",
    "open": 83000,
    "high": 84500,
    "low": 82500,
    "close": 83982,
    "volume": 1234567.89,
    "amount": "103.45",
    "count": 5678
  }
}
```

---

#### 15. Get All Tickers

**GET** `/market/tickers`

**Response:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "symbol": "PERP_BTC_USDC",
        "close": 83982,
        "change": 2.3
      }
    ]
  }
}
```

---

#### 16. Get Order Book

**GET** `/market/orderbook/:symbol`

Query parameters:
- `depth` (optional): Max levels (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "asks": [[83990, 0.5], [84000, 1.2]],
    "bids": [[83980, 0.8], [83970, 1.5]],
    "timestamp": 1763712113709
  }
}
```

---

### Withdrawals

#### 17. Get Withdrawal Nonce

**GET** `/withdraw/nonce`

**Response:**
```json
{
  "success": true,
  "data": {
    "withdraw_nonce": 1
  }
}
```

---

#### 18. Request Withdrawal

**POST** `/withdraw`

**Request Body:**
```json
{
  "token": "USDC",
  "amount": 2000000,
  "chain_id": 56,
  "signature": "0x9d91dc8f...",
  "message": {
    "brokerId": "honeypot",
    "chainId": 56,
    "receiver": "0x930f4676be08036522d8c0af94b4ce2df1ab8478",
    "token": "USDC",
    "amount": "2000000",
    "withdrawNonce": "1",
    "timestamp": "1763714048520"
  },
  "userAddress": "0x930f4676be08036522d8c0af94b4ce2df1ab8478",
  "verifyingContract": "0x6F7a338F2aA472838dEFD3283eB360d4Dff5D203"
}
```

**Important Notes:**
- Amount must be in token's smallest unit (USDC: 6 decimals)
- Minimum withdrawal: 2 USDC (2000000 smallest units)
- Message must be signed using EIP-712 by the account owner
- Use the same wallet that registered the account

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "12345",
    "status": "PROCESSING"
  }
}
```

---

#### 19. Get Withdrawal History

**GET** `/withdraw/history`

Query parameters:
- `status` (optional): Filter by status (PROCESSING, COMPLETED, FAILED)
- `page` (optional): Page number
- `size` (optional): Results per page

**Response:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "12345",
        "token": "USDC",
        "amount": 2.0,
        "status": "COMPLETED",
        "created_time": 1763714048520
      }
    ],
    "meta": {
      "total": 10,
      "current_page": 1
    }
  }
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  },
  "timestamp": 1763714048520
}
```

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `AUTHENTICATION_FAILED` | Invalid API key | API key is missing or invalid |
| `ACCOUNT_NOT_FOUND` | Account does not exist | User account not registered |
| `INSUFFICIENT_BALANCE` | Insufficient balance | Not enough funds for operation |
| `INVALID_SYMBOL` | Invalid trading symbol | Symbol doesn't exist or unsupported |
| `INVALID_ORDER_SIZE` | Order size out of bounds | Check min/max order size |
| `INVALID_PRICE` | Price out of bounds | Price too high/low |
| `ORDER_NOT_FOUND` | Order not found | Order ID doesn't exist |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Slow down request rate |

### Orderly Network Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `-1005` | Content type not supported | Invalid request format |
| `-1004` | Orderly key error | Invalid Orderly key signature |
| `5` | Amount error | Invalid withdrawal amount (< minimum) |
| `9` | Address and signature do not match | EIP-712 signature doesn't match account owner |
| `-1101` | Insufficient margin | Not enough margin for order |
| `-1104` | Order filter requirement | Order size/price precision invalid |

---

## Code Examples

### Complete Trading Flow Example

```javascript
const API_BASE = 'https://your-api-domain.com/api/v1';
const API_KEY = 'your-api-key';

// 1. Check if account exists
async function checkAccount(walletAddress) {
  const response = await fetch(
    `${API_BASE}/account/check?address=${walletAddress}`,
    {
      headers: {
        'X-API-KEY': API_KEY,
      }
    }
  );
  return response.json();
}

// 2. Get account balance
async function getBalance(accountId) {
  const response = await fetch(
    `${API_BASE}/account/balance`,
    {
      headers: {
        'X-API-KEY': API_KEY,
        'X-Account-ID': accountId,
      }
    }
  );
  return response.json();
}

// 3. Place a limit order
async function placeOrder(accountId, orderData) {
  const response = await fetch(
    `${API_BASE}/orders`,
    {
      method: 'POST',
      headers: {
        'X-API-KEY': API_KEY,
        'X-Account-ID': accountId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: 'PERP_BTC_USDC',
        side: 'BUY',
        order_type: 'LIMIT',
        order_price: 83500,
        order_quantity: 0.001
      })
    }
  );
  return response.json();
}

// 4. Get open orders
async function getOrders(accountId) {
  const response = await fetch(
    `${API_BASE}/orders`,
    {
      headers: {
        'X-API-KEY': API_KEY,
        'X-Account-ID': accountId,
      }
    }
  );
  return response.json();
}

// 5. Cancel order
async function cancelOrder(accountId, orderId, symbol) {
  const response = await fetch(
    `${API_BASE}/orders/${orderId}?symbol=${symbol}`,
    {
      method: 'DELETE',
      headers: {
        'X-API-KEY': API_KEY,
        'X-Account-ID': accountId,
      }
    }
  );
  return response.json();
}

// Complete flow
async function tradingFlow() {
  const walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  // Check account
  const accountCheck = await checkAccount(walletAddress);
  if (!accountCheck.data.account_exists) {
    console.log('Account needs registration');
    return;
  }

  const accountId = accountCheck.data.account_id;

  // Get balance
  const balance = await getBalance(accountId);
  console.log('Balance:', balance.data);

  // Place order
  const order = await placeOrder(accountId);
  console.log('Order placed:', order.data);

  // Get orders
  const orders = await getOrders(accountId);
  console.log('Open orders:', orders.data);

  // Cancel order
  if (orders.data.rows.length > 0) {
    const firstOrder = orders.data.rows[0];
    const cancelled = await cancelOrder(
      accountId,
      firstOrder.order_id,
      firstOrder.symbol
    );
    console.log('Cancelled:', cancelled);
  }
}
```

---

### EIP-712 Signature Example (Withdrawal)

```javascript
import { ethers } from 'ethers';

async function signWithdrawal(wallet, message) {
  const domain = {
    name: 'Orderly',
    version: '1',
    chainId: 56,
    verifyingContract: '0x6F7a338F2aA472838dEFD3283eB360d4Dff5D203'
  };

  const types = {
    Withdraw: [
      { name: 'brokerId', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'receiver', type: 'string' },
      { name: 'token', type: 'string' },
      { name: 'amount', type: 'uint256' },
      { name: 'withdrawNonce', type: 'uint64' },
      { name: 'timestamp', type: 'uint64' }
    ]
  };

  const signature = await wallet.signTypedData(domain, types, message);
  return signature;
}

// Usage
async function requestWithdrawal(accountId, walletPrivateKey) {
  const wallet = new ethers.Wallet(walletPrivateKey);

  // 1. Get withdrawal nonce
  const nonceResponse = await fetch(
    `${API_BASE}/withdraw/nonce`,
    {
      headers: {
        'X-API-KEY': API_KEY,
        'X-Account-ID': accountId,
      }
    }
  );
  const nonceData = await nonceResponse.json();
  const withdrawNonce = nonceData.data.withdraw_nonce;

  // 2. Create message
  const message = {
    brokerId: 'honeypot',
    chainId: 56,
    receiver: wallet.address.toLowerCase(),
    token: 'USDC',
    amount: 2000000, // 2 USDC
    withdrawNonce,
    timestamp: Date.now()
  };

  // 3. Sign message
  const signature = await signWithdrawal(wallet, message);

  // 4. Convert to API format
  const apiMessage = {
    brokerId: message.brokerId,
    chainId: message.chainId,
    receiver: message.receiver,
    token: message.token,
    amount: message.amount.toString(),
    withdrawNonce: message.withdrawNonce.toString(),
    timestamp: message.timestamp.toString()
  };

  // 5. Submit withdrawal
  const response = await fetch(
    `${API_BASE}/withdraw`,
    {
      method: 'POST',
      headers: {
        'X-API-KEY': API_KEY,
        'X-Account-ID': accountId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signature,
        message: apiMessage,
        userAddress: wallet.address,
        verifyingContract: '0x6F7a338F2aA472838dEFD3283eB360d4Dff5D203'
      })
    }
  );

  return response.json();
}
```

---

## Best Practices

### 1. Order Pricing
- Always price orders close to the current market price to minimize margin requirements
- Use `/market/ticker/:symbol` to get current market price before placing orders
- Orders too far from market may require excessive margin and fail

### 2. Order Size Precision
- Check `base_tick` for the symbol (from `/symbols`)
- BTC orders must be in multiples of 0.00001
- Ensure order notional value >= `min_notional` (usually $10)

### 3. Leverage Management
- Default leverage is 10x
- With 10x leverage, $1 USDC gives $10 trading power
- Monitor positions regularly to avoid liquidation

### 4. Error Handling
- Implement retry logic for network errors
- Check error codes and handle appropriately
- Log all errors for debugging

### 5. Withdrawals
- Minimum withdrawal: 2 USDC
- Must use the same wallet that registered the account
- Wait for settlement if you have open positions
- EIP-712 signature is mandatory for security

---

## Support

For integration support:
- Technical Issues: [Your support email]
- API Key Requests: [Your API key request process]
- Documentation: This guide

---

## Changelog

### v1.0.0 (2025-01-21)
- Initial release
- Complete trading API
- EIP-712 withdrawal support
- BSC Mainnet support
