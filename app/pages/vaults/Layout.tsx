import { Outlet } from "react-router-dom";
import { useOrderlyConfig } from "@/utils/config";
import { useNav } from "@/hooks/useNav";
import { CustomHeader } from "@/components/CustomHeader";
import { CustomFooter } from "@/components/CustomFooter";
import { CustomBottomNav } from "@/components/CustomBottomNav";
import { useScreen } from "@orderly.network/ui";
import { Scaffold } from "@orderly.network/ui-scaffold";

export default function VaultsLayout() {
  const config = useOrderlyConfig();
  const { onRouteChange } = useNav();
  const { isMobile } = useScreen();

  // Extract menus from config
  const menus = config.scaffold.mainNavProps.mainMenus || [];

  // Separate internal and external links
  const internalMenus = menus.filter((menu) => !menu.target);
  const externalLinks = menus.filter((menu) => menu.target);

  return (
    <div className="oui-flex oui-flex-col oui-min-h-screen">
      <Scaffold
        routerAdapter={{
          onRouteChange,
          currentPath: "/vaults",
        }}
        topBar={
          <CustomHeader
            menus={internalMenus}
            externalLinks={externalLinks}
            onRouteChange={onRouteChange}
          />
        }
        bottomNav={
          isMobile &&
          config.scaffold.bottomNavProps.mainMenus && (
            <CustomBottomNav items={config.scaffold.bottomNavProps.mainMenus} />
          )
        }
        footer={
          <CustomFooter
            telegramUrl={config.scaffold.footerProps.telegramUrl}
            discordUrl={config.scaffold.footerProps.discordUrl}
            twitterUrl={config.scaffold.footerProps.twitterUrl}
          />
        }
      >
        <Outlet />
      </Scaffold>
    </div>
  );
}
