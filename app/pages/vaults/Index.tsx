import { VaultsPage as VaultsPageComponent } from "@orderly.network/vaults";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";

function DiracVaultCard() {
  return (
    <div
      className="oui-rounded-xl oui-p-5 oui-relative oui-overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)",
        border: "1px solid rgba(168, 85, 247, 0.3)",
        boxShadow: "0 0 30px rgba(168, 85, 247, 0.15)",
      }}
    >
      {/* Header */}
      <div className="oui-flex oui-items-center oui-justify-between oui-mb-3">
        <div className="oui-flex oui-items-center oui-gap-2">
          <div
            className="oui-w-8 oui-h-8 oui-rounded-full oui-flex oui-items-center oui-justify-center"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            }}
          >
            <svg
              className="oui-w-4 oui-h-4 oui-text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <span className="oui-text-sm oui-font-semibold oui-text-white">
            Dirac Vault
          </span>
          {/* Chain icon */}
          <div className="oui-flex oui-items-center oui-gap-1 oui-ml-1">
            <div
              className="oui-w-4 oui-h-4 oui-rounded-full oui-flex oui-items-center oui-justify-center oui-text-[8px] oui-font-bold"
              style={{ background: "#FFB800" }}
            >
              B
            </div>
          </div>
        </div>
        <a
          href="https://dirac.finance/vaults"
          target="_blank"
          rel="noopener noreferrer"
          className="oui-text-base-contrast-54 hover:oui-text-white oui-transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Description */}
      <p className="oui-text-xs oui-text-base-contrast-54 oui-mb-4 oui-leading-relaxed">
        Earn passive yields effortlessly, no trading expertise required. Dirac deploys market-making strategies on Orderly Network.
      </p>

      {/* Button */}
      <a
        href="https://dirac.finance/vaults"
        target="_blank"
        rel="noopener noreferrer"
        className="oui-block oui-w-full oui-py-2.5 oui-rounded-lg oui-font-semibold oui-text-sm oui-text-center oui-text-white oui-transition-all hover:oui-scale-[1.02] active:oui-scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
          boxShadow: "0 4px 14px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        View on Dirac
      </a>
    </div>
  );
}

export default function VaultsIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Vaults");

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}
      <div className="oui-flex oui-flex-col">
        <VaultsPageComponent />
        {/* Dirac Vault Section */}
        <div className="oui-w-full oui-px-4 lg:oui-px-6 oui-pb-6">
          <div className="oui-mx-auto" style={{ maxWidth: "1200px" }}>
            <h2 className="oui-text-base oui-font-semibold oui-text-white oui-mb-4">
              Partner Vaults
            </h2>
            <div className="oui-grid oui-grid-cols-1 md:oui-grid-cols-2 lg:oui-grid-cols-3 oui-gap-4">
              <DiracVaultCard />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

