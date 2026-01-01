import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@orderly.network/ui";
import { COLORS } from "@/constants/theme";

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

  const getButtonStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? COLORS.brand.primary : "transparent",
    color: isActive ? COLORS.text.dark : COLORS.text.light,
  });

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = COLORS.interactive.hover;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = "transparent";
    }
  };

  return (
    <>
      <button
        onClick={() => handleModeSwitch("orderbook")}
        className={cn(
          "oui-px-4 oui-py-2 oui-text-sm oui-font-medium oui-rounded-lg oui-transition-all"
        )}
        style={getButtonStyle(mode === "orderbook")}
        onMouseEnter={(e) => handleMouseEnter(e, mode === "orderbook")}
        onMouseLeave={(e) => handleMouseLeave(e, mode === "orderbook")}
      >
        Orderbook
      </button>
      <button
        onClick={() => handleModeSwitch("amm")}
        className={cn(
          "oui-px-4 oui-py-2 oui-text-sm oui-font-medium oui-rounded-lg oui-transition-all"
        )}
        style={getButtonStyle(mode === "amm")}
        onMouseEnter={(e) => handleMouseEnter(e, mode === "amm")}
        onMouseLeave={(e) => handleMouseLeave(e, mode === "amm")}
      >
        AMM
      </button>
    </>
  );
};
