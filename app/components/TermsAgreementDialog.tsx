import { useState, useEffect } from "react";
import { SimpleDialog } from "@orderly.network/ui";

const TERMS_ACCEPTED_KEY = "terms_and_privacy_accepted";

interface PolicyData {
  html: string;
  css: string;
}

interface TermsContent {
  privacyPolicy: PolicyData;
  termsOfUse: PolicyData;
}

const TermsAgreementDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<TermsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem(TERMS_ACCEPTED_KEY);
    if (!hasAccepted) {
      setIsOpen(true);
      fetchContent();
    }
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [privacyRes, termsRes] = await Promise.all([
        fetch("https://honeypotfinance.xyz/api/privacy-policy"),
        fetch("https://honeypotfinance.xyz/api/terms-of-use"),
      ]);

      const privacyData = await privacyRes.json();
      const termsData = await termsRes.json();

      setContent({
        privacyPolicy: {
          html: privacyData.html || "",
          css: privacyData.css || "",
        },
        termsOfUse: {
          html: termsData.html || "",
          css: termsData.css || "",
        },
      });
    } catch (error) {
      console.error("Failed to fetch terms content:", error);
      setContent({
        privacyPolicy: {
          html: "Failed to load privacy policy. Please try again later.",
          css: "",
        },
        termsOfUse: {
          html: "Failed to load terms of use. Please try again later.",
          css: "",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAgree = () => {
    localStorage.setItem(TERMS_ACCEPTED_KEY, "true");
    setIsOpen(false);
  };

  const handleTabChange = (tab: "terms" | "privacy") => {
    setActiveTab(tab);
    if (tab === "terms") {
      setHasReadTerms(true);
    } else {
      setHasReadPrivacy(true);
    }
  };

  const canAgree = hasReadTerms && hasReadPrivacy;

  useEffect(() => {
    if (activeTab === "terms") {
      setHasReadTerms(true);
    } else {
      setHasReadPrivacy(true);
    }
  }, [activeTab]);

  const actions = {
    primary: {
      label: canAgree ? "I Agree" : "Please read both documents",
      onClick: handleAgree,
      disabled: !canAgree,
    },
  };

  return (
    <SimpleDialog
      open={isOpen}
      onOpenChange={() => {}}
      title=""
      size="lg"
      closable={false}
      actions={actions}
    >
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Terms of Use & Privacy Policy
        </h2>

        <p className="text-sm text-white/80">
          Please read and agree to our Terms of Use and Privacy Policy before
          continuing.
        </p>

        <div className="flex gap-2 border-b border-white/20 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange("terms")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "terms"
                  ? "text-[#F7931A] border-b-2 border-[#F7931A]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Terms of Use {hasReadTerms && <span className="text-green-500 ml-1">&#10003;</span>}
            </button>
            <button
              onClick={() => handleTabChange("privacy")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "privacy"
                  ? "text-[#F7931A] border-b-2 border-[#F7931A]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Privacy Policy {hasReadPrivacy && <span className="text-green-500 ml-1">&#10003;</span>}
            </button>
          </div>
          <a
            href={activeTab === "terms" ? "https://honeypotfinance.xyz/terms-of-use" : "https://honeypotfinance.xyz/privacy-policy"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#F7931A] hover:underline"
          >
            View full document ↗
          </a>
        </div>

        <div className="h-[400px] overflow-y-auto bg-white/5 rounded-lg p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/60">Loading...</div>
            </div>
          ) : (
            <>
              <style>
                {activeTab === "terms"
                  ? content?.termsOfUse.css || ""
                  : content?.privacyPolicy.css || ""}
              </style>
              <div
                className="policy-content"
                dangerouslySetInnerHTML={{
                  __html:
                    activeTab === "terms"
                      ? content?.termsOfUse.html || ""
                      : content?.privacyPolicy.html || "",
                }}
              />
            </>
          )}
        </div>

        {!canAgree && (
          <p className="text-xs text-white/50 text-center">
            Please view both the Terms of Use and Privacy Policy tabs before agreeing.
          </p>
        )}
      </div>
    </SimpleDialog>
  );
};

export default TermsAgreementDialog;
