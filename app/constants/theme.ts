// Theme constants for consistent styling across the application
// These values can be easily modified or replaced with a theme system later

export const COLORS = {
  // Background colors
  background: {
    primary: "#0b0a09",
    header: "#140E06",
  },
  // Border colors
  border: {
    primary: "#26211b",
  },
  // Brand colors
  brand: {
    primary: "#F7931A",
    primaryGradientEnd: "#FFB347",
  },
  // Interactive states
  interactive: {
    hover: "#3d3428",
  },
  // Text colors
  text: {
    dark: "#000",
    darkMuted: "rgba(0,0,0,0.7)",
    light: "#fff",
  },
} as const;

export const LAYOUT = {
  // Header
  headerHeight: 72,
  headerMaxWidth: 1920,
  headerMobileBreakpoint: 1000,

  // Sidebar widths
  leftSidebarWidth: 280,
  orderBookWidth: 300,
  marketsListWidth: 120,

  // Chart and positions
  chartMinHeight: 300,
  positionsTableHeight: 280,

  // Start trading card
  startTradingCardMinHeight: 180,
} as const;

// Helper to get calc string for main content height
export const getMainContentHeight = () =>
  `calc(100vh - ${LAYOUT.headerHeight}px)`;
