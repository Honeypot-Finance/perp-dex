// Shared types for Vercel API routes
export interface OrderlyConfig {
  baseUrl: string;
  accountId: string;
  orderlyKey: string;
  orderlySecret: string;
  brokerId: string;
}

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'LIMIT' | 'MARKET' | 'IOC' | 'FOK' | 'POST_ONLY' | 'ASK' | 'BID';
export type OrderStatus = 'NEW' | 'PARTIAL_FILLED' | 'FILLED' | 'CANCELLED' | 'REJECTED';

export interface CreateOrderRequest {
  symbol: string;
  side: OrderSide;
  order_type: OrderType;
  order_price?: number;
  order_quantity?: number;
  order_amount?: number;
  reduce_only?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: number;
}

export interface OrderlyResponse<T> {
  success: boolean;
  data?: T;
  code?: number;
  message?: string;
}
