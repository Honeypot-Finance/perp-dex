import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Flex } from "@orderly.network/ui";

interface BottomNavItem {
  name: string;
  href: string;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
}

interface CustomBottomNavProps {
  items: BottomNavItem[];
}

export const CustomBottomNav: FC<CustomBottomNavProps> = ({ items }) => {
  const location = useLocation();

  return (
    <nav className="oui-fixed oui-bottom-0 oui-left-0 oui-right-0 oui-bg-base-9 oui-border-t oui-border-line-12 oui-z-50">
      <Flex justify="around" className="oui-w-full oui-px-2 oui-py-2">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className="oui-flex oui-flex-col oui-items-center oui-gap-1 oui-px-4 oui-py-2 oui-no-underline oui-min-w-[60px]"
            >
              <div className="oui-w-5 oui-h-5">
                {isActive ? item.activeIcon : item.inactiveIcon}
              </div>
              <span
                className={`oui-text-2xs ${
                  isActive
                    ? "oui-text-base-contrast-80 oui-font-semibold"
                    : "oui-text-base-contrast-54"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </Flex>
    </nav>
  );
};
