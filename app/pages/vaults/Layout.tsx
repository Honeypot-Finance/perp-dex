import { Outlet } from "react-router-dom";
import { useOrderlyConfig } from "@/utils/config";
import { useNav } from "@/hooks/useNav";
import { CustomHeader } from "@/components/CustomHeader";
import { CustomFooter } from "@/components/CustomFooter";
import { CustomBottomNav } from "@/components/CustomBottomNav";
import { useScreen } from "@orderly.network/ui";
import { WalletConnectorWidget } from "@orderly.network/ui-connector";

export default function VaultsLayout() {
  const config = useOrderlyConfig();
  const { onRouteChange } = useNav();
  const { isMobile } = useScreen();

  // Extract menus from config
  const menus = config.scaffold.mainNavProps.mainMenus || [];

  // Separate internal and external links
  const internalMenus = menus.filter(menu => !menu.target);
  const externalLinks = menus.filter(menu => menu.target);

  return (
    <div className="oui-flex oui-flex-col oui-min-h-screen">
      <CustomHeader
        menus={internalMenus}
        externalLinks={externalLinks}
        onRouteChange={onRouteChange}
      />

      <main className="oui-flex-1 oui-w-full" style={{ paddingBottom: isMobile ? "60px" : "0" }}>
        <Outlet />
      </main>

      <CustomFooter
        telegramUrl={config.scaffold.footerProps.telegramUrl}
        discordUrl={config.scaffold.footerProps.discordUrl}
        twitterUrl={config.scaffold.footerProps.twitterUrl}
      />

      {isMobile && config.scaffold.bottomNavProps.mainMenus && (
        <CustomBottomNav items={config.scaffold.bottomNavProps.mainMenus} />
      )}

      {/* Wallet Connector Widget - renders modals only, hidden from view */}
      <div style={{ display: 'none' }}>
        <WalletConnectorWidget />
      </div>
    </div>
  );
}
