import { FC, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Flex, cn, useScreen, Button } from "@orderly.network/ui";
import { useAccount } from "@orderly.network/hooks";
import { modal } from "@orderly.network/ui";
import CustomLeftNav from "@/components/CustomLeftNav";
import { withBasePath } from "@/utils/base-path";
import { getRuntimeConfigBoolean } from "@/utils/runtime-config";
import {
  AccountSummaryWidget,
  ChainMenuWidget,
  LanguageSwitcherWidget,
  SubAccountWidget,
  ScanQRCodeWidget,
  RouteOption,
} from "@orderly.network/ui-scaffold";
import {
  WalletConnectorModalId,
  WalletConnectorSheetId,
} from "@orderly.network/ui-connector";

interface MenuItem {
  name: string;
  href: string;
  target?: string;
}

interface CustomHeaderProps {
  menus: MenuItem[];
  externalLinks?: MenuItem[];
  onRouteChange?: (option: RouteOption) => void;
}

export const CustomHeader: FC<CustomHeaderProps> = ({
  menus,
  externalLinks,
  onRouteChange,
}) => {
  const { isMobile } = useScreen();
  const { account } = useAccount();
  const location = useLocation();
  const navigate = useNavigate();

  // Custom breakpoint for mobile view at 1200px
  const [isCustomMobile, setIsCustomMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1200 : false
  );

  // Track if we should show switch in navbar (600-1200px) or below (<600px)
  const [showSwitchInNav, setShowSwitchInNav] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 600 && window.innerWidth < 1200 : false
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsCustomMobile(width < 1200);
      setShowSwitchInNav(width >= 600 && width < 1200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use custom mobile breakpoint instead of default
  const showMobileView = isCustomMobile;

  // Check if we're on the AMM page and sync state
  const [mode, setMode] = useState<"orderbook" | "amm">(
    location.pathname.startsWith("/amm-perp") ? "amm" : "orderbook"
  );

  // Keep mode in sync with location
  useEffect(() => {
    setMode(location.pathname.startsWith("/amm-perp") ? "amm" : "orderbook");
  }, [location.pathname]);

  const handleConnectWallet = () => {
    const modalId = isMobile ? WalletConnectorSheetId : WalletConnectorModalId;
    modal.show(modalId);
  };

  const handleModeSwitch = (newMode: "orderbook" | "amm") => {
    if (newMode === "amm") {
      navigate("/amm-perp");
    } else {
      navigate("/");
    }
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname.startsWith("/perp");
    }
    return location.pathname.startsWith(href);
  };

  // Reusable Mode Switch Component
  const ModeSwitch = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={cn(
        "oui-flex oui-items-center oui-gap-1 oui-px-2 oui-py-1 oui-rounded-md",
        compact ? "" : ""
      )}
      style={{ backgroundColor: "#2a2a2a" }}
    >
      <button
        onClick={() => handleModeSwitch("orderbook")}
        className={cn(
          "oui-px-3 oui-py-1.5 oui-text-xs oui-font-medium oui-rounded oui-transition-all",
          mode === "orderbook" ? "oui-text-black" : "oui-text-white/60"
        )}
        style={{
          backgroundColor: mode === "orderbook" ? "#F7931A" : "transparent",
        }}
      >
        Orderbook
      </button>
      <button
        onClick={() => handleModeSwitch("amm")}
        className={cn(
          "oui-px-3 oui-py-1.5 oui-text-xs oui-font-medium oui-rounded oui-transition-all",
          mode === "amm" ? "oui-text-black" : "oui-text-white/60"
        )}
        style={{
          backgroundColor: mode === "amm" ? "#F7931A" : "transparent",
        }}
      >
        AMM
      </button>
    </div>
  );

  return (
    <header
      className="oui-w-full"
      style={{ backgroundColor: "#140E06" }}
    >
      {showMobileView ? (
        <div className="oui-w-full oui-mx-auto oui-max-w-[1920px]">
          <Flex
            justify="between"
            className="oui-w-full oui-px-6 oui-py-4"
          >
            {/* Mobile Layout */}
            <Flex
              itemAlign="center"
              className={cn("oui-gap-6", "oui-overflow-hidden")}
            >
              <CustomLeftNav
                menus={menus}
                externalLinks={externalLinks}
              />
              <Link
                to="/"
                className="oui-flex oui-items-center"
              >
                {getRuntimeConfigBoolean("VITE_HAS_SECONDARY_LOGO") ? (
                  <img
                    src={withBasePath("/logo-secondary.webp")}
                    alt="logo"
                    style={{ height: "32px" }}
                  />
                ) : getRuntimeConfigBoolean("VITE_HAS_PRIMARY_LOGO") ? (
                  <img
                    src={withBasePath("/logo.webp")}
                    alt="logo"
                    style={{ height: "40px" }}
                  />
                ) : (
                  <img
                    src={withBasePath("/orderly-logo.svg")}
                    alt="logo"
                    style={{ height: "40px" }}
                  />
                )}
              </Link>
            </Flex>

            <Flex
              itemAlign="center"
              className="oui-gap-3"
            >
              {account.address && (
                <>
                  <AccountSummaryWidget />
                  <ScanQRCodeWidget />
                </>
              )}
              {showSwitchInNav && <ModeSwitch />}
              <LanguageSwitcherWidget />
              {account.address && <SubAccountWidget />}
              <ChainMenuWidget />
              <Button
                onClick={handleConnectWallet}
                size="sm"
              >
                {account.address
                  ? `${account.address.slice(0, 6)}...${account.address.slice(
                      -4
                    )}`
                  : "Connect Wallet"}
              </Button>
            </Flex>
          </Flex>

          {/* Mobile Mode Switch - only show below navbar when screen < 600px */}
          {!showSwitchInNav && (
            <div className="oui-flex oui-justify-center oui-px-6 oui-pb-3">
              <ModeSwitch />
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout with centered nav */
        <div className="oui-relative oui-w-full oui-px-6 oui-py-4 oui-mx-auto oui-max-w-[1920px]">
          <Flex
            justify="between"
            itemAlign="center"
            className="oui-w-full"
          >
            {/* Left - Logo */}
            <div className="oui-flex oui-items-center oui-flex-shrink-0">
              <Link
                to="/"
                className="oui-flex oui-items-center"
              >
                {getRuntimeConfigBoolean("VITE_HAS_PRIMARY_LOGO") ? (
                  <img
                    src={withBasePath("/logo.webp")}
                    alt="logo"
                    style={{ height: "40px" }}
                  />
                ) : (
                  <img
                    src={withBasePath("/orderly-logo.svg")}
                    alt="logo"
                    style={{ height: "40px" }}
                  />
                )}
              </Link>
            </div>

            {/* Center - Navigation (Absolutely positioned) */}
            <div
              className="oui-absolute oui-left-1/2 oui-top-1/2"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <nav
                className="oui-flex oui-gap-1 oui-px-4 oui-py-2 oui-rounded-lg"
                style={{ backgroundColor: "#1B1308" }}
              >
                {menus.map((menu) => {
                  const active = isActive(menu.href);
                  return (
                    <Link
                      key={menu.name}
                      to={menu.href}
                      className="oui-px-4 oui-py-2 oui-text-white oui-no-underline oui-text-sm oui-font-medium oui-rounded-md oui-transition-all"
                      style={{
                        backgroundColor: active ? "#F7931A1A" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = "#F7931A1A";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                      onClick={() =>
                        onRouteChange?.({
                          name: menu.name,
                          href: menu.href,
                          target: menu.target,
                        })
                      }
                    >
                      {menu.name}
                    </Link>
                  );
                })}
                {externalLinks?.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target={link.target || "_blank"}
                    rel="noopener noreferrer"
                    className="oui-px-4 oui-py-2 oui-text-white oui-no-underline oui-text-sm oui-font-medium oui-rounded-md oui-transition-all"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F7931A1A";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {link.name}
                  </a>
                ))}

                {/* Mode Switch */}
                <div className="oui-ml-2">
                  <ModeSwitch />
                </div>
              </nav>
            </div>

            {/* Right - Wallet and Account Controls */}
            <Flex
              itemAlign="center"
              className="oui-gap-3 oui-flex-shrink-0"
            >
              {account.address && (
                <>
                  <AccountSummaryWidget />
                  <ScanQRCodeWidget />
                </>
              )}
              <LanguageSwitcherWidget />
              {account.address && <SubAccountWidget />}
              <ChainMenuWidget />
              <Button
                onClick={handleConnectWallet}
                size="sm"
              >
                {account.address
                  ? `${account.address.slice(0, 6)}...${account.address.slice(
                      -4
                    )}`
                  : "Connect Wallet"}
              </Button>
            </Flex>
          </Flex>
        </div>
      )}
    </header>
  );
};
