# Perp DEX Trading API

This is a production-ready perpetual futures trading API that wraps the Orderly Network trading platform. It provides a simplified REST API for partners to integrate perpetual futures trading into their applications.

## Quick Start for Partners

**📖 Complete Integration Guide**: See [PARTNER_INTEGRATION.md](./PARTNER_INTEGRATION.md) for the full API documentation.

The integration guide includes:
- All API endpoints with request/response examples
- Authentication setup
- Complete trading flow examples
- EIP-712 withdrawal implementation
- Error handling and best practices

## Key Features

- **Perpetual Futures Trading**: Trade BTC, ETH, and other perpetual futures with up to 10x leverage
- **Complete Order Management**: Market orders, limit orders, and algo orders
- **Position Tracking**: Real-time position monitoring and management
- **Account Management**: Balance tracking, statistics, and account info
- **Secure Withdrawals**: EIP-712 signature-based withdrawals
- **Market Data**: Real-time tickers, orderbook, trades, and funding rates

## Project Structure

```
perp-dex/
├── app/                     # Frontend (Next.js)
├── public/                  # Static assets
└── api/                     # Backend API (Serverless)
    ├── lib/                 # Core libraries
    │   ├── orderlyClient.ts # Orderly Network API client
    │   ├── signature.ts     # Ed25519 cryptographic signing
    │   ├── auth.ts          # API key authentication
    │   ├── config.ts        # Environment configuration
    │   ├── db.ts            # Database connection
    │   └── types.ts         # TypeScript definitions
    ├── v1/                  # API endpoints
    │   ├── orders/          # Trading endpoints
    │   ├── positions/       # Position management
    │   ├── account/         # Account info & balances
    │   └── market/          # Market data
    ├── scripts/             # Utility scripts
    │   └── generate-api-key.ts
    └── PARTNER_INTEGRATION.md  # Complete API documentation
```

## Setup

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
# Orderly Network
ORDERLY_ACCOUNT_ID=your_account_id
ORDERLY_KEY=your_orderly_key
ORDERLY_SECRET=your_orderly_secret
ORDERLY_BASE_URL=https://api.orderly.org
ORDERLY_BROKER_ID=honeypot

# Database (for credential storage)
DATABASE_URL=postgresql://user:password@host:5432/database

# API Keys for partners (generated with npm run generate-key)
API_KEYS=partner1:$2a$10$...,partner2:$2a$10$...
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate API Keys for Partners

```bash
cd api
npm run generate-key
```

Follow the prompts to generate a partner API key. Add the hashed key to your `.env` file.

### 4. Development

```bash
# Start local development server (both frontend and API)
vercel dev

# Your app will be available at:
# - Frontend: http://localhost:3000
# - API: http://localhost:3000/api/v1/*
```

### 5. Testing

Test public endpoints (no authentication):

```bash
# Health check
curl http://localhost:3000/api/health

# Market symbols
curl http://localhost:3000/api/v1/market/symbols

# Ticker data
curl http://localhost:3000/api/v1/market/ticker/PERP_BTC_USDC
```

Test private endpoints (requires API key):

```bash
# Account info
curl -H "X-API-KEY: your_api_key" \
  http://localhost:3000/api/v1/account/info

# Create order
curl -X POST http://localhost:3000/api/v1/orders \
  -H "X-API-KEY: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "PERP_BTC_USDC",
    "side": "BUY",
    "order_type": "LIMIT",
    "order_price": 83500,
    "order_quantity": 0.001
  }'

# Get positions
curl -H "X-API-KEY: your_api_key" \
  http://localhost:3000/api/v1/positions
```

## Deployment

### Deploy to Vercel

```bash
# Link your project (first time only)
vercel link

# Deploy to production
vercel --prod
```

### Set Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add all variables from your `.env` file:
   - `ORDERLY_ACCOUNT_ID`
   - `ORDERLY_KEY`
   - `ORDERLY_SECRET`
   - `ORDERLY_BASE_URL`
   - `ORDERLY_BROKER_ID`
   - `DATABASE_URL`
   - `API_KEYS`

### Production URLs

After deployment, your API will be available at:

```
Frontend: https://your-domain.vercel.app
API:      https://your-domain.vercel.app/api/v1/*
```

## API Endpoints Overview

### Public Endpoints (No Authentication)

**Market Data:**
- `GET /api/health` - Health check
- `GET /api/v1/market/symbols` - All trading symbols
- `GET /api/v1/market/tickers` - All tickers
- `GET /api/v1/market/ticker/:symbol` - Single ticker
- `GET /api/v1/market/orderbook/:symbol` - Order book
- `GET /api/v1/market/trades/:symbol` - Recent trades
- `GET /api/v1/market/klines` - Candlestick data
- `GET /api/v1/market/funding-rate/:symbol` - Funding rate
- `GET /api/v1/market/funding-rate-history` - Funding history

### Private Endpoints (API Key Required)

**Trading:**
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - List active orders
- `DELETE /api/v1/orders` - Cancel all orders
- `GET /api/v1/orders/:orderId` - Get order by ID
- `DELETE /api/v1/orders/:orderId` - Cancel order
- `GET /api/v1/orders/history` - Order history

**Positions:**
- `GET /api/v1/positions` - All positions
- `GET /api/v1/positions/:symbol` - Position for symbol

**Account:**
- `GET /api/v1/account/info` - Account information
- `GET /api/v1/account/balance` - Account balance
- `GET /api/v1/account/stats` - Account statistics

See [PARTNER_INTEGRATION.md](./PARTNER_INTEGRATION.md) for complete endpoint documentation with request/response examples.

## Trading Example

```typescript
import { OrderlyClient } from './lib/orderlyClient';

const client = new OrderlyClient();

// Get account info
const account = await client.getAccountInfo();
console.log('Balance:', account.data);

// Place a limit order
const order = await client.createOrder({
  symbol: 'PERP_BTC_USDC',
  order_type: 'LIMIT',
  side: 'BUY',
  order_price: 83500,
  order_quantity: 0.001,
});
console.log('Order placed:', order.data);

// Check positions
const positions = await client.getPositions();
console.log('Positions:', positions.data);

// Cancel order
await client.cancelOrder(order.data.order_id, 'PERP_BTC_USDC');
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Error description"
}
```

## Security

- **API Key Authentication**: All private endpoints require API key in `X-API-KEY` header
- **Ed25519 Signatures**: All requests to Orderly Network are cryptographically signed
- **EIP-712 Signatures**: Withdrawals use Ethereum typed data signatures
- **Environment Variables**: Sensitive credentials stored securely
- **Rate Limiting**: Built-in rate limiting per partner
- **HTTPS Only**: Production deployment enforces HTTPS

## Troubleshooting

### 404 Not Found
- Make sure `vercel dev` is running (not `npm run dev`)
- Verify the endpoint path starts with `/api/v1/`

### 401 Unauthorized
- Check that API key is correct
- Ensure `X-API-KEY` header is included in request
- Verify API key is properly hashed in `.env`

### 500 Internal Server Error
- Check console for error details
- Verify all environment variables are set
- Ensure Orderly credentials are valid

### Order Rejected
- Check that order price is close to market price
- Verify minimum order value ($10 for BTC)
- Ensure sufficient balance with leverage
- Check order quantity precision (0.00001 for BTC)

## Support

For integration support:
- See [PARTNER_INTEGRATION.md](./PARTNER_INTEGRATION.md) for complete API documentation
- Contact the development team
- Visit [Orderly Network Documentation](https://docs-api.orderly.network)

---

Built with TypeScript, Vercel Serverless Functions, and the Orderly Network API.
