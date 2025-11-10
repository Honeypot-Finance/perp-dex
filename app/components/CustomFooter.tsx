import { FC } from "react";
import { Flex } from "@orderly.network/ui";
import { Send } from "lucide-react";
import { withBasePath } from "@/utils/base-path";
import {
  getRuntimeConfig,
  getRuntimeConfigBoolean,
} from "@/utils/runtime-config";

interface CustomFooterProps {
  telegramUrl?: string;
  discordUrl?: string;
  twitterUrl?: string;
}

export const CustomFooter: FC<CustomFooterProps> = ({
  telegramUrl,
  discordUrl,
  twitterUrl,
}) => {
  const currentYear = new Date().getFullYear();
  const brokerName = getRuntimeConfig("VITE_ORDERLY_BROKER_NAME") || "Honeypot";

  return (
    <footer className="oui-w-full oui-bg-[#140E06] oui-border-t oui-border-[#2a2a2a] oui-py-3">
      <Flex
        justify="between"
        itemAlign="center"
        className="oui-w-full oui-px-6 oui-mx-auto oui-max-w-[1920px]"
      >
        {/* Logo and Title */}
        <Flex itemAlign="center" className="oui-gap-2">
          {getRuntimeConfigBoolean("VITE_HAS_PRIMARY_LOGO") ? (
            <img
              src={withBasePath("/logo.webp")}
              alt="logo"
              style={{ height: "24px" }}
            />
          ) : (
            <div className="oui-w-6 oui-h-6 oui-rounded-full oui-bg-[#FFB800] oui-flex oui-items-center oui-justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 32 32"
                fill="none"
              >
                <circle
                  cx="16"
                  cy="12"
                  r="2"
                  fill="#140E06"
                />
                <circle
                  cx="16"
                  cy="18"
                  r="2"
                  fill="#140E06"
                />
                <circle
                  cx="16"
                  cy="24"
                  r="2"
                  fill="#140E06"
                />
              </svg>
            </div>
          )}
          <h2 className="oui-text-[#FFB800] oui-text-sm oui-font-bold oui-uppercase oui-tracking-wide">
            {brokerName}
          </h2>
        </Flex>

        {/* Social Links */}
        <Flex className="oui-gap-2">
          {telegramUrl && (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="oui-w-8 oui-h-8 oui-rounded-lg oui-bg-[#2a2a2a] oui-flex oui-items-center oui-justify-center oui-text-[#FFB800] hover:oui-bg-[#3a3a3a] oui-transition-colors"
              aria-label="Telegram"
            >
              <Send size={16} />
            </a>
          )}
          {twitterUrl && (
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="oui-w-8 oui-h-8 oui-rounded-lg oui-bg-[#2a2a2a] oui-flex oui-items-center oui-justify-center oui-text-[#FFB800] hover:oui-bg-[#3a3a3a] oui-transition-colors"
              aria-label="X (Twitter)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          )}
          {discordUrl && (
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="oui-w-8 oui-h-8 oui-rounded-lg oui-bg-[#2a2a2a] oui-flex oui-items-center oui-justify-center oui-text-[#FFB800] hover:oui-bg-[#3a3a3a] oui-transition-colors"
              aria-label="Discord"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
          )}
        </Flex>

        {/* Copyright */}
        <span className="oui-text-xs oui-text-white/60">
          © Copyright {currentYear}, All Rights Reserved by {brokerName}
        </span>
      </Flex>
    </footer>
  );
};
