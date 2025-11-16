import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@orderly.network/ui";

export const ModeSwitch = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on the AMM page and sync state
  const [mode, setMode] = useState<"orderbook" | "amm">(
    location.pathname.startsWith("/amm-perp") ? "amm" : "orderbook"
  );

  // Keep mode in sync with location
  useEffect(() => {
    setMode(location.pathname.startsWith("/amm-perp") ? "amm" : "orderbook");
  }, [location.pathname]);

  const handleModeSwitch = (newMode: "orderbook" | "amm") => {
    if (newMode === "amm") {
      navigate("/amm-perp");
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className="oui-flex oui-items-center oui-gap-1 oui-px-2 oui-py-1 oui-rounded-md"
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
};
