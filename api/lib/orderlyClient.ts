import axios, { AxiosInstance } from 'axios';
import { getOrderlyConfig } from './config.js';
import { generateSignature, createSignatureMessage, getTimestamp } from './signature.js';
import { OrderlyResponse, CreateOrderRequest } from './types.js';

export class OrderlyClient {
  private client: AxiosInstance;
  private accountId: string;
  private orderlyKey: string;
  private orderlySecret: string;

  constructor(accountId?: string, orderlyKey?: string, orderlySecret?: string) {
    const config = getOrderlyConfig(accountId, orderlyKey, orderlySecret);
    this.accountId = config.accountId;
    this.orderlyKey = config.orderlyKey;
    this.orderlySecret = config.orderlySecret;

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
    });
  }

  private generateHeaders(method: string, path: string, body?: any) {
    const timestamp = getTimestamp().toString();
    const message = createSignatureMessage(parseInt(timestamp), method, path, body);
    const signature = generateSignature(this.orderlySecret, message);

    const headers: any = {
      'orderly-timestamp': timestamp,
      'orderly-account-id': this.accountId,
      'orderly-key': this.orderlyKey,
      'orderly-signature': signature,
    };

    // Set Content-Type based on method
    if (method === 'POST' || method === 'PUT') {
      headers['Content-Type'] = 'application/json';
    } else if (method === 'DELETE') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    return headers;
  }

  async request<T>(method: string, path: string, data?: any, isPrivate = true): Promise<OrderlyResponse<T>> {
    try {
      const config: any = { method, url: path };

      // For GET/DELETE with query params, append them to the path for signature calculation
      let signaturePath = path;
      let signatureBody = data;

      if (data && (method === 'GET' || method === 'DELETE')) {
        // Convert params to query string for signature
        const queryString = new URLSearchParams(data).toString();
        if (queryString) {
          signaturePath = `${path}?${queryString}`;
        }
        signatureBody = undefined; // GET/DELETE have no body in signature
        config.params = data;
      } else if (data) {
        config.data = data;
      }

      if (isPrivate) {
        config.headers = this.generateHeaders(method, signaturePath, signatureBody);
      } else {
        config.headers = {};
      }

      const response = await this.client.request<OrderlyResponse<T>>(config);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) return error.response.data;
      throw error;
    }
  }

  // Trading
  async createOrder(orderData: CreateOrderRequest) {
    return this.request('POST', '/v1/order', orderData);
  }

  async cancelOrder(orderId: string, symbol: string) {
    return this.request('DELETE', '/v1/order', { order_id: orderId, symbol });
  }

  async cancelAllOrders(symbol?: string) {
    return this.request('DELETE', '/v1/orders', symbol ? { symbol } : undefined);
  }

  async batchCancelOrders(orderIds: string[]) {
    if (orderIds.length === 0 || orderIds.length > 10) {
      throw new Error('Must provide 1-10 order IDs for batch cancellation');
    }
    return this.request('DELETE', '/v1/batch-order', { order_ids: orderIds.join(',') });
  }

  async editOrder(orderData: {
    order_id: string;
    order_type: string;
    side: string;
    symbol: string;
    order_price?: number;
    order_quantity?: number;
  }) {
    return this.request('PUT', '/v1/order', orderData);
  }

  async getOrder(orderId: string) {
    return this.request('GET', `/v1/order/${orderId}`);
  }

  async getOrders(symbol?: string) {
    return this.request('GET', '/v1/orders', symbol ? { symbol } : undefined);
  }

  async getOrderHistory(params?: any) {
    return this.request('GET', '/v1/orders/history', params);
  }

  async batchCreateOrders(orders: CreateOrderRequest[]) {
    if (orders.length === 0 || orders.length > 10) {
      throw new Error('Must provide 1-10 orders for batch creation');
    }
    return this.request('POST', '/v1/batch-order', { orders });
  }

  // Algo Orders
  async createAlgoOrder(orderData: any) {
    return this.request('POST', '/v1/algo/order', orderData);
  }

  async editAlgoOrder(algoOrderId: string, orderData: any) {
    return this.request('PUT', '/v1/algo/order', { ...orderData, algo_order_id: algoOrderId });
  }

  async cancelAlgoOrder(algoOrderId: string) {
    return this.request('DELETE', '/v1/algo/order', { algo_order_id: algoOrderId });
  }

  async getAlgoOrder(algoOrderId: string) {
    return this.request('GET', `/v1/algo/order/${algoOrderId}`);
  }

  async getAlgoOrders(params?: any) {
    return this.request('GET', '/v1/algo/orders', params);
  }

  // Positions
  async getPositions() {
    return this.request('GET', '/v1/positions');
  }

  async getPosition(symbol: string) {
    return this.request('GET', `/v1/position/${symbol}`);
  }

  // Account
  async getAccountInfo() {
    return this.request('GET', '/v1/client/info');
  }

  async getBalances() {
    return this.request('GET', '/v1/client/holding');
  }

  async getAccountStats() {
    return this.request('GET', '/v1/client/statistics');
  }

  // Registration (Public)
  async getRegistrationNonce() {
    return this.request('GET', '/v1/registration_nonce', undefined, false);
  }

  async registerAccount(data: {
    message: {
      brokerId: string;
      chainId: number;
      timestamp: string;
      registrationNonce: string;
    };
    signature: string;
    userAddress: string;
  }) {
    return this.request('POST', '/v1/register_account', data, false);
  }

  async addOrderlyKey(data: {
    message: {
      brokerId: string;
      chainId: number;
      orderlyKey: string;
      scope: string;
      timestamp: string;
      expiration: string;
    };
    signature: string;
    userAddress: string;
  }) {
    return this.request('POST', '/v1/orderly_key', data, false);
  }

  async checkAccountExists(address: string, brokerId?: string) {
    const broker = brokerId || this.accountId.split('_')[0] || 'honeypot';
    return this.request('GET', `/v1/get_account?address=${address}&broker_id=${broker}`, undefined, false);
  }

  // Market Data (Public)
  async getSymbols() {
    return this.request('GET', '/v1/public/info', undefined, false);
  }

  async getTicker(symbol: string) {
    return this.request('GET', `/v1/public/ticker/${symbol}`, undefined, false);
  }

  async getAllTickers() {
    return this.request('GET', '/v1/public/futures', undefined, false);
  }

  async getOrderbook(symbol: string, depth?: number) {
    const params = depth ? { max_level: depth } : undefined;
    return this.request('GET', `/v1/public/orderbook/${symbol}`, params, false);
  }

  async getTrades(symbol: string, limit?: number) {
    const params = limit ? { limit } : undefined;
    return this.request('GET', `/v1/public/trades/${symbol}`, params, false);
  }

  async getKlines(params: any) {
    return this.request('GET', '/v1/kline', params, true);
  }

  async getFundingRate(symbol: string) {
    return this.request('GET', `/v1/public/funding_rate/${symbol}`, undefined, false);
  }

  async getFundingRateHistory(params: any) {
    return this.request('GET', '/v1/public/funding_rate_history', params, false);
  }

  // Withdrawals
  async getWithdrawNonce() {
    return this.request('GET', '/v1/withdraw_nonce');
  }

  async requestWithdraw(params: {
    token: string;
    amount: number;
    chain_id: number;
    allow_cross_chain_withdrawal?: boolean;
    signature?: string;
    message?: any;
    userAddress?: string;
    verifyingContract?: string;
  }) {
    // If signature is provided, use the EIP-712 format
    if (params.signature && params.message) {
      return this.request('POST', '/v1/withdraw_request', {
        signature: params.signature,
        message: params.message,
        userAddress: params.userAddress,
        verifyingContract: params.verifyingContract,
      });
    }
    // Otherwise use the simple format (may require signature from Orderly)
    return this.request('POST', '/v1/withdraw_request', {
      token: params.token,
      amount: params.amount,
      chain_id: params.chain_id,
      allow_cross_chain_withdrawal: params.allow_cross_chain_withdrawal,
    });
  }

  async getWithdrawHistory(params?: any) {
    return this.request('GET', '/v1/asset/history', params);
  }

  async getWithdraw(withdrawId: string) {
    return this.request('GET', `/v1/withdraw/${withdrawId}`);
  }

  async getSettlementInfo() {
    return this.request('GET', '/v1/settle/check');
  }
}
