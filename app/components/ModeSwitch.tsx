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
    <>
      <button
        onClick={() => handleModeSwitch("orderbook")}
        className={cn(
          "oui-px-4 oui-py-2 oui-text-sm oui-font-medium oui-rounded-lg oui-transition-all"
        )}
        style={{
          backgroundColor: mode === "orderbook" ? "#F7931A" : "transparent",
          color: mode === "orderbook" ? "#000" : "#fff",
        }}
        onMouseEnter={(e) => {
          if (mode !== "orderbook") {
            e.currentTarget.style.backgroundColor = "#3d3428";
          }
        }}
        onMouseLeave={(e) => {
          if (mode !== "orderbook") {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        Orderbook
      </button>
      <button
        onClick={() => handleModeSwitch("amm")}
        className={cn(
          "oui-px-4 oui-py-2 oui-text-sm oui-font-medium oui-rounded-lg oui-transition-all"
        )}
        style={{
          backgroundColor: mode === "amm" ? "#F7931A" : "transparent",
          color: mode === "amm" ? "#000" : "#fff",
        }}
        onMouseEnter={(e) => {
          if (mode !== "amm") {
            e.currentTarget.style.backgroundColor = "#3d3428";
          }
        }}
        onMouseLeave={(e) => {
          if (mode !== "amm") {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        AMM
      </button>
    </>
  );
};
