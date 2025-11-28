import { FC } from "react";
import {
  TradingPageProvider,
  OrderBookAndTradesWidget,
  DataListWidget,
  RiskRateWidget,
} from "@orderly.network/trading";
import { OrderEntryWidget } from "@orderly.network/ui-order-entry";
import { TradingviewUI } from "@orderly.network/ui-tradingview";
import { SymbolInfoBarWidget, MarketsListWidget } from "@orderly.network/markets";
import { API } from "@orderly.network/types";
import { TradingPageProps } from "@orderly.network/trading";

interface CustomTradingPageProps {
  symbol: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
  tradingViewConfig: TradingPageProps["tradingViewConfig"];
  sharePnLConfig?: TradingPageProps["sharePnLConfig"];
}

export const CustomTradingPage: FC<CustomTradingPageProps> = ({
  symbol,
  onSymbolChange,
  tradingViewConfig,
  sharePnLConfig,
}) => {
  return (
    <TradingPageProvider
      symbol={symbol}
      onSymbolChange={onSymbolChange}
      tradingViewConfig={tradingViewConfig}
      sharePnLConfig={sharePnLConfig}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          backgroundColor: "#0b0a09",
          height: "calc(100vh - 72px)",
        }}
      >
        {/* Main content area */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left Sidebar - Order Form */}
          <div
            className="oui-w-[280px] oui-flex-shrink-0 oui-flex oui-flex-col oui-border-r oui-overflow-y-auto"
            style={{ borderColor: "#26211b" }}
          >
            {/* Deposit Widget Placeholder */}
            <div
              className="oui-p-4 oui-border-b"
              style={{ borderColor: "#26211b" }}
            >
              <div
                className="oui-rounded-xl oui-p-4 oui-relative oui-overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #1a4d2e 0%, #0f2b1a 100%)",
                }}
              >
                <div className="oui-relative oui-z-10">
                  <h3 className="oui-text-white oui-font-semibold oui-text-lg oui-mb-1">
                    Start Trading
                  </h3>
                  <p className="oui-text-white/70 oui-text-sm oui-mb-3">
                    You can deposit assets from various networks
                  </p>
                  <button
                    className="oui-bg-white oui-text-black oui-px-4 oui-py-2 oui-rounded-lg oui-text-sm oui-font-medium oui-flex oui-items-center oui-gap-2"
                  >
                    Deposit Now
                    <span>→</span>
                  </button>
                </div>
                {/* Decorative elements */}
                <div
                  className="oui-absolute oui-right-0 oui-bottom-0 oui-w-24 oui-h-24 oui-opacity-50"
                  style={{
                    background: "radial-gradient(circle, #F7931A 0%, transparent 70%)",
                  }}
                />
              </div>
            </div>

            {/* Risk Rate */}
            <div
              className="oui-p-4 oui-border-b"
              style={{ borderColor: "#26211b" }}
            >
              <RiskRateWidget />
            </div>

            {/* Order Entry Form */}
            <div className="oui-flex-1 oui-p-4 oui-overflow-y-auto">
              <OrderEntryWidget symbol={symbol} />
            </div>
          </div>

          {/* Center - Chart and Positions */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
            {/* Symbol Header */}
            <div
              className="oui-border-b oui-flex-shrink-0"
              style={{ borderColor: "#26211b" }}
            >
              <SymbolInfoBarWidget symbol={symbol} />
            </div>

            {/* Chart Area */}
            <div
              style={{
                backgroundColor: "#0b0a09",
                flex: 1,
                minHeight: "400px",
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", inset: 0 }}>
                <TradingviewUI />
              </div>
            </div>

            {/* Positions/Orders Table */}
            <div
              className="oui-h-[300px] oui-border-t oui-flex-shrink-0 oui-overflow-hidden"
              style={{ borderColor: "#26211b" }}
            >
              <DataListWidget onSymbolChange={onSymbolChange} />
            </div>
          </div>

          {/* Right Sidebar - Order Book */}
          <div
            className="oui-w-[300px] oui-flex-shrink-0 oui-border-l oui-overflow-hidden"
            style={{ borderColor: "#26211b" }}
          >
            <OrderBookAndTradesWidget symbol={symbol} />
          </div>

          {/* Far Right - Markets List */}
          <div
            className="oui-w-[120px] oui-flex-shrink-0 oui-border-l oui-overflow-hidden"
            style={{ borderColor: "#26211b" }}
          >
            <MarketsListWidget onSymbolChange={onSymbolChange} />
          </div>
        </div>
      </div>
    </TradingPageProvider>
  );
};

export default CustomTradingPage;
