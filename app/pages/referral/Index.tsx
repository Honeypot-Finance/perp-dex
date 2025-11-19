import { Helmet } from "react-helmet-async";
import { generatePageTitle } from "@/utils/utils";
import { ReferralProvider, Dashboard } from "@orderly.network/affiliate";

export default function ReferralIndex() {
  return (
    <>
      <Helmet>
        <title>{generatePageTitle("Referral")}</title>
      </Helmet>

      <ReferralProvider
        becomeAnAffiliateUrl="https://discord.com/invite/NfnK78KJxH"
        learnAffiliateUrl="https://discord.com/invite/NfnK78KJxH"
        referralLinkUrl={
          typeof window !== "undefined"
            ? window.location.origin
            : "https://orderly.network"
        }
      >
        <div className="oui-flex oui-justify-center">
          <div className="oui-py-6 oui-px-4 lg:oui-px-6 lg:oui-py-12 xl:oui-pl-4 lx:oui-pr-6">
            <div className="oui-py-6 oui-px-4 lg:oui-px-6 xl:oui-pl-3 lx:oui-pr-6">
              <Dashboard.DashboardPage />
            </div>
          </div>
        </div>
      </ReferralProvider>
    </>
  );
}
