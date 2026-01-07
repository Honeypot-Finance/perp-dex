import { FC } from "react";
import startTradingBg from "@/assets/start_trading.png";
import {
  TradingPageProvider,
  OrderBookAndTradesWidget,
  DataListWidget,
  RiskRateWidget,
  TradingPageProps,
} from "@orderly.network/trading";
import { OrderEntryWidget } from "@orderly.network/ui-order-entry";
import { TradingviewUI, useTradingviewScript } from "@orderly.network/ui-tradingview";
import { SymbolInfoBarFullWidget, SideMarketsWidget } from "@orderly.network/markets";
import { API } from "@orderly.network/types";
import { modal } from "@orderly.network/ui";
import { DepositAndWithdrawWithDialogId } from "@orderly.network/ui-transfer";
import { COLORS, LAYOUT, getMainContentHeight } from "@/constants/theme";

interface CustomTradingPageProps {
  symbol: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
  tradingViewConfig: TradingPageProps["tradingViewConfig"];
  sharePnLConfig?: TradingPageProps["sharePnLConfig"];
}

// Start Trading card with Deposit Now button
const StartTradingCard: FC = () => {
  const handleDeposit = () => {
    modal.show(DepositAndWithdrawWithDialogId, { activeTab: "deposit" });
  };

  return (
    <div className="oui-p-3">
      <div
        className="oui-rounded-xl oui-p-4 oui-relative oui-overflow-hidden"
        style={{
          backgroundImage: `url(${startTradingBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center right",
          minHeight: LAYOUT.startTradingCardMinHeight,
        }}
      >
        <div className="oui-relative oui-z-10 oui-pt-4">
          <h3
            className="oui-font-semibold oui-text-base oui-mb-0.5"
            style={{ color: COLORS.text.dark }}
          >
            Start Trading
          </h3>
          <p className="oui-text-xs oui-mb-3" style={{ color: COLORS.text.darkMuted }}>
            You can deposit assets<br />from various networks
          </p>
          <button
            onClick={handleDeposit}
            className="oui-bg-white oui-text-black oui-w-full oui-py-2.5 oui-rounded-full oui-text-sm oui-font-medium oui-flex oui-items-center oui-justify-center oui-gap-2 hover:oui-bg-white/90 oui-transition-colors"
            style={{ border: `2px solid ${COLORS.text.dark}` }}
          >
            Deposit Now
            <span>↘</span>
          </button>
        </div>
      </div>
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
    libraryPath: tradingViewConfig?.library_path,
    customCssUrl: tradingViewConfig?.customCssUrl,
    colorConfig: tradingViewConfig?.colorConfig,
  });

  return <TradingviewUI {...tradingviewState} />;
};

// Common border style to reduce redundancy
const borderStyle = { borderColor: COLORS.border.primary };

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
          backgroundColor: COLORS.background.primary,
          height: getMainContentHeight(),
        }}
      >
        {/* Main content area */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left Sidebar - Order Form */}
          <div
            className="oui-flex-shrink-0 oui-flex oui-flex-col oui-border-r oui-overflow-y-auto"
            style={{ ...borderStyle, width: LAYOUT.leftSidebarWidth }}
          >
            {/* Start Trading Card */}
            <div className="oui-border-b" style={borderStyle}>
              <StartTradingCard />
            </div>

            {/* Risk Rate */}
            <div className="oui-p-4 oui-border-b" style={borderStyle}>
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
            <div className="oui-border-b oui-flex-shrink-0" style={borderStyle}>
              <SymbolInfoBarFullWidget symbol={symbol} onSymbolChange={onSymbolChange} />
            </div>

            {/* Chart Area */}
            <div
              style={{
                backgroundColor: COLORS.background.primary,
                flex: 1,
                minHeight: LAYOUT.chartMinHeight,
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
              className="oui-border-t oui-flex-shrink-0"
              style={{
                ...borderStyle,
                height: LAYOUT.positionsTableHeight,
                minHeight: LAYOUT.positionsTableHeight,
              }}
            >
              <DataListWidget onSymbolChange={onSymbolChange} sharePnLConfig={sharePnLConfig} />
            </div>
          </div>

          {/* Right Sidebar - Order Book */}
          <div
            className="oui-flex-shrink-0 oui-border-l oui-overflow-hidden orderbook-full-width-tabs"
            style={{ ...borderStyle, width: LAYOUT.orderBookWidth }}
          >
            <OrderBookAndTradesWidget symbol={symbol} />
          </div>

          {/* Far Right - Markets List */}
          <div
            className="oui-flex-shrink-0 oui-border-l oui-overflow-hidden"
            style={{ ...borderStyle, width: LAYOUT.marketsListWidth }}
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
