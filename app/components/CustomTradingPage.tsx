import { FC, useState } from "react";
import startTradingBg from "@/assets/start_trading.png";
import {
  TradingPageProvider,
  OrderBookAndTradesWidget,
  DataListWidget,
  RiskRateWidget,
  AssetViewWidget,
  TradingPageProps,
} from "@orderly.network/trading";
import { OrderEntryWidget } from "@orderly.network/ui-order-entry";
import { TradingviewUI, useTradingviewScript } from "@orderly.network/ui-tradingview";
import { SymbolInfoBarWidget, SideMarketsWidget } from "@orderly.network/markets";
import { API } from "@orderly.network/types";

interface CustomTradingPageProps {
  symbol: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
  tradingViewConfig: TradingPageProps["tradingViewConfig"];
  sharePnLConfig?: TradingPageProps["sharePnLConfig"];
}

// Deposit/Assets tabs component
const DepositAssetsTabs: FC = () => {
  const [activeTab, setActiveTab] = useState<"deposit" | "assets">("deposit");

  return (
    <div className="oui-border-b" style={{ borderColor: "#26211b" }}>
      {/* Tab Headers */}
      <div className="oui-flex oui-border-b" style={{ borderColor: "#26211b" }}>
        <button
          className={`oui-flex-1 oui-py-2 oui-text-sm oui-font-medium oui-transition-colors ${
            activeTab === "deposit"
              ? "oui-text-white oui-border-b-2 oui-border-[#F7931A]"
              : "oui-text-white/50 hover:oui-text-white/80"
          }`}
          onClick={() => setActiveTab("deposit")}
        >
          Deposit
        </button>
        <button
          className={`oui-flex-1 oui-py-2 oui-text-sm oui-font-medium oui-transition-colors ${
            activeTab === "assets"
              ? "oui-text-white oui-border-b-2 oui-border-[#F7931A]"
              : "oui-text-white/50 hover:oui-text-white/80"
          }`}
          onClick={() => setActiveTab("assets")}
        >
          Assets
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "deposit" ? (
        <div className="oui-p-3">
          <div
            className="oui-rounded-xl oui-p-4 oui-relative oui-overflow-hidden"
            style={{
              backgroundImage: `url(${startTradingBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center right",
              minHeight: "180px",
            }}
          >
            <div className="oui-relative oui-z-10 oui-pt-4">
              <h3 className="oui-font-semibold oui-text-base oui-mb-0.5" style={{ color: "#000" }}>
                Start Trading
              </h3>
              <p className="oui-text-xs oui-mb-3" style={{ color: "rgba(0,0,0,0.7)" }}>
                You can deposit assets<br />from various networks
              </p>
              <button
                className="oui-bg-white oui-text-black oui-px-4 oui-py-2 oui-rounded-lg oui-text-sm oui-font-medium oui-flex oui-items-center oui-gap-2 hover:oui-bg-white/90 oui-transition-colors"
              >
                Deposit Now
                <span>↘</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="oui-p-3">
          <AssetViewWidget />
        </div>
      )}
    </div>
  );
};

// Wrapper component for TradingView that uses the SDK hook
const TradingViewWrapper: FC<{ symbol: string; tradingViewConfig: TradingPageProps["tradingViewConfig"] }> = ({
  symbol,
  tradingViewConfig,
}) => {
  const tradingviewState = useTradingviewScript({
    symbol,
    scriptSRC: tradingViewConfig?.scriptSRC,
    libraryPath: tradingViewConfig?.library_path, // Note: prop is libraryPath, config is library_path
    customCssUrl: tradingViewConfig?.customCssUrl,
    colorConfig: tradingViewConfig?.colorConfig,
  });

  return <TradingviewUI {...tradingviewState} />;
};

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
            {/* Deposit/Assets Widget with Tabs */}
            <DepositAssetsTabs />

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
                <TradingViewWrapper
                  symbol={symbol}
                  tradingViewConfig={tradingViewConfig}
                />
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
            className="oui-w-[300px] oui-flex-shrink-0 oui-border-l oui-overflow-hidden orderbook-full-width-tabs"
            style={{ borderColor: "#26211b" }}
          >
            <OrderBookAndTradesWidget symbol={symbol} />
          </div>

          {/* Far Right - Markets List */}
          <div
            className="oui-w-[120px] oui-flex-shrink-0 oui-border-l oui-overflow-hidden"
            style={{ borderColor: "#26211b" }}
          >
            <SideMarketsWidget
              symbol={symbol}
              onSymbolChange={onSymbolChange}
            />
          </div>
        </div>
      </div>
    </TradingPageProvider>
  );
};

export default CustomTradingPage;
