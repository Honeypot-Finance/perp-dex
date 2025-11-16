import { Outlet } from "react-router-dom";
import { useMemo } from "react";
import { useOrderlyConfig } from "@/utils/config";
import { useNav } from "@/hooks/useNav";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { CustomFooter } from "@/components/CustomFooter";

export default function SwapLayout() {
  const config = useOrderlyConfig();
  const { onRouteChange } = useNav();

  const routerAdapter = useMemo(() => ({
    onRouteChange,
    currentPath: "/swap",
  }), [onRouteChange]);

  return (
    <div className="oui-flex oui-flex-col oui-min-h-screen">
      <Scaffold
        routerAdapter={routerAdapter}
        mainNavProps={config.scaffold.mainNavProps}
        bottomNavProps={config.scaffold.bottomNavProps}
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
