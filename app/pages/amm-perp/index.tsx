import { useState } from "react";
import { Button } from "@orderly.network/ui";

export default function AMMPerpPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    // Placeholder validation - all codes are rejected for now
    setError("Oops, wrong code");
    setIsShaking(true);

    // Reset shake animation after it completes
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  };

  const handleEmailSubmit = async () => {
    if (email && email.includes("@")) {
      setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setEmailSubmitted(true);

        // Close modal after 2 seconds
        setTimeout(() => {
          setShowWaitlistModal(false);
          setEmail("");
          setEmailSubmitted(false);
        }, 2000);
      } catch (error) {
        console.error("Error submitting email:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>

      <div className="oui-w-full oui-flex oui-items-center oui-justify-center oui-pb-6 sm:oui-pb-12 oui-pt-8 oui-min-h-[calc(100vh-200px)]">
        <div className="oui-w-full xl:oui-mx-auto xl:oui-max-w-[1200px] 2xl:oui-max-w-[1500px] oui-px-2 sm:oui-px-4 md:oui-px-8 xl:oui-px-0">
          <div
            className="oui-w-full oui-rounded-2xl oui-border oui-p-8 sm:oui-p-12"
            style={{ backgroundColor: "#140D06", borderColor: "#2a2318" }}
          >
            <div className="oui-max-w-md oui-mx-auto oui-text-center">
              {/* Header */}
              <h1 className="oui-text-3xl sm:oui-text-4xl oui-font-bold oui-text-white oui-mb-4">
                AMM Perpetual Trading
              </h1>
              <p className="oui-text-base-contrast-54 oui-mb-8">
                Enter your invite code to access AMM perpetual trading features
              </p>

              {/* Invite Code Input */}
              <div className="oui-mb-6">
                <label
                  htmlFor="invite-code"
                  className="oui-block oui-text-left oui-text-sm oui-font-medium oui-text-base-contrast-80 oui-mb-2"
                >
                  Invite Code
                </label>
                <input
                  id="invite-code"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your invite code"
                  className="oui-w-full oui-px-4 oui-py-3 oui-rounded-lg oui-text-white placeholder:oui-text-base-contrast-36 oui-border"
                  style={{
                    backgroundColor: "#1A0F06",
                    borderColor: "#2a2318",
                  }}
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!inviteCode}
                className={`oui-w-full oui-px-6 oui-py-3 oui-font-medium oui-rounded-lg ${
                  isShaking ? "animate-shake" : ""
                }`}
                style={{
                  backgroundColor: "#6B4423",
                }}
              >
                Continue
              </Button>

              {/* Error Message */}
              {error && (
                <p
                  className="oui-mt-4 oui-text-sm oui-font-medium"
                  style={{ color: "#ef4444" }}
                >
                  {error}
                </p>
              )}

              {/* Waitlist Button */}
              <div
                className="oui-mt-6 oui-pt-6 oui-border-t"
                style={{ borderColor: "#2a2318" }}
              >
                <p className="oui-text-base-contrast-54 oui-text-sm oui-mb-3">
                  Don&apos;t have a code?
                </p>
                <button
                  onClick={() => setShowWaitlistModal(true)}
                  className="oui-font-medium oui-text-sm oui-underline"
                  style={{ color: "#D4A574" }}
                >
                  Join the waitlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div className="oui-fixed oui-inset-0 oui-z-50 oui-flex oui-items-center oui-justify-center oui-p-4">
          {/* Backdrop */}
          <div
            className="oui-absolute oui-inset-0"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowWaitlistModal(false)}
          />

          {/* Modal Content */}
          <div
            className="oui-relative oui-w-full oui-max-w-lg oui-rounded-3xl oui-border-2 oui-p-8 oui-shadow-2xl"
            style={{
              backgroundColor: "#140D06",
              borderColor: "#F59E0B",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowWaitlistModal(false)}
              className="oui-absolute oui-top-4 oui-right-4 oui-text-base-contrast-54 hover:oui-text-white"
            >
              <svg
                className="oui-w-6 oui-h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Title */}
            <h2
              className="oui-text-2xl oui-font-bold oui-mb-3"
              style={{ color: "#F7931A" }}
            >
              Join our waitlist for early access to our{" "}
              <span style={{ color: "#FCD729" }}>Perp dex!</span>
            </h2>

            {/* Subtitle */}
            <p
              className="oui-text-sm oui-mb-6"
              style={{ color: "#E7CDB1" }}
            >
              Get notified when our perpetual trading feature drops! Plus stay
              up to date with the latest news!
            </p>

            {emailSubmitted ? (
              <div className="oui-text-center oui-py-8">
                <div
                  className="oui-text-lg oui-font-medium oui-mb-2"
                  style={{ color: "#10b981" }}
                >
                  ✓ Thank you for joining!
                </div>
                <p className="oui-text-base-contrast-54 oui-text-sm">
                  We&apos;ll be in touch soon.
                </p>
              </div>
            ) : (
              <>
                {/* Email Input */}
                <div className="oui-mb-6">
                  <label
                    htmlFor="waitlist-email"
                    className="oui-block oui-text-sm oui-font-black oui-mb-2"
                    style={{ color: "#E7CDB1" }}
                  >
                    Enter email
                  </label>
                  <input
                    id="waitlist-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@gmail.com"
                    className="oui-w-full oui-px-4 oui-py-3 oui-font-black oui-border oui-rounded-lg oui-text-white placeholder:oui-text-base-contrast-36"
                    style={{
                      backgroundColor: "#1A0F06",
                      borderColor: "#2a2318",
                    }}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleEmailSubmit}
                  disabled={!email || !email.includes("@") || isSubmitting}
                  className="oui-w-full oui-px-6 oui-py-4 oui-text-black oui-font-bold oui-shadow-lg"
                  style={{
                    backgroundColor: "#F59E0B",
                    borderRadius: "2rem",
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Get notified"}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
