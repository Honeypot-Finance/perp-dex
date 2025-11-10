import { FC, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Flex, cn } from "@orderly.network/ui";
import { useAccount } from "@orderly.network/hooks";
import CustomLeftNav from "@/components/CustomLeftNav";
import { withBasePath } from "@/utils/base-path";
import { getRuntimeConfigBoolean } from "@/utils/runtime-config";
import {
  // AccountSummaryWidget,
  AccountMenuWidget,
  ChainMenuWidget,
  LanguageSwitcherWidget,
  SubAccountWidget,
  // ScanQRCodeWidget,
  RouteOption,
} from "@orderly.network/ui-scaffold";

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
  const location = useLocation();
  const { account } = useAccount();

  // Custom breakpoint for header mobile view at 1200px
  const [isHeaderMobile, setIsHeaderMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1200 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsHeaderMobile(window.innerWidth < 1200);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if we're on the AMM page and sync state
  const [mode, setMode] = useState<"orderbook" | "amm">(
    location.pathname.startsWith("/amm-perp") ? "amm" : "orderbook"
  );

  // Keep mode in sync with location
  useEffect(() => {
    setMode(location.pathname.startsWith("/amm-perp") ? "amm" : "orderbook");
  }, [location.pathname]);

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
      <Link
        to="/"
        className={cn(
          "oui-px-3 oui-py-1.5 oui-text-xs oui-font-medium oui-rounded oui-transition-all oui-no-underline",
          mode === "orderbook" ? "oui-text-black" : "oui-text-white/60"
        )}
        style={{
          backgroundColor: mode === "orderbook" ? "#F7931A" : "transparent",
        }}
      >
        Orderbook
      </Link>
      <Link
        to="/amm-perp"
        className={cn(
          "oui-px-3 oui-py-1.5 oui-text-xs oui-font-medium oui-rounded oui-transition-all oui-no-underline",
          mode === "amm" ? "oui-text-black" : "oui-text-white/60"
        )}
        style={{
          backgroundColor: mode === "amm" ? "#F7931A" : "transparent",
        }}
      >
        AMM
      </Link>
    </div>
  );

  return (
    <header
      className="oui-w-full"
      style={{ backgroundColor: "#140E06" }}
    >
      {isHeaderMobile ? (
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
              <LanguageSwitcherWidget />
              {account.address && <SubAccountWidget />}
              <ChainMenuWidget />
              <AccountMenuWidget />
            </Flex>
          </Flex>

          {/* Mobile Mode Switch below header */}
          <div className="oui-flex oui-justify-center oui-px-6 oui-pb-3">
            <ModeSwitch />
          </div>
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
                  {/* <AccountSummaryWidget /> */}
                  {/* <ScanQRCodeWidget /> */}
                </>
              )}
              <LanguageSwitcherWidget />
              {account.address && <SubAccountWidget />}
              <ChainMenuWidget />
              <AccountMenuWidget />
            </Flex>
          </Flex>
        </div>
      )}
    </header>
  );
};
