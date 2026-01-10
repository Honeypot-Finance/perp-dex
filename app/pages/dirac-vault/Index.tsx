import { useState, useEffect } from "react";
import { WagmiProvider, createConfig, http, useAccount } from "wagmi";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import {
  useVaultData,
  useUserVaultPosition,
  useAssetToken,
  useTradeCycle,
  useVaultDeposit,
  useVaultWithdraw,
} from "@/hooks/useDiracVault";
import {
  DIRAC_VAULT_CONFIG,
  TradeCycleStatus,
  berachain,
} from "@/utils/dirac-vault/config";
import { formatNumber, useWalletChain } from "./components/utils";

// Wagmi config for Berachain (isolated from main app's wallet context)
const wagmiConfig = createConfig({
  chains: [berachain],
  connectors: [injected()],
  transports: {
    [berachain.id]: http(),
  },
  ssr: false,
});

// Query client for wagmi
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function StatCard({
  label,
  value,
  subValue,
  icon,
  accentColor,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}) {
  const color = accentColor || "#6366f1";
  return (
    <div
      className="oui-relative oui-overflow-hidden oui-rounded-xl oui-p-3 oui-group oui-transition-all oui-duration-300 hover:oui-scale-[1.02]"
      style={{
        background: "rgba(15, 15, 25, 0.8)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: `0 0 20px ${color}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      <div
        className="oui-absolute oui-inset-0 oui-opacity-0 group-hover:oui-opacity-100 oui-transition-opacity oui-duration-300"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${color}20 0%, transparent 70%)`,
        }}
      />
      <div className="oui-flex oui-items-start oui-justify-between oui-relative oui-z-10">
        <div>
          <p className="oui-text-[10px] oui-text-base-contrast-54 oui-mb-0.5 oui-uppercase oui-tracking-wider oui-font-medium">
            {label}
          </p>
          <p className="oui-text-lg oui-font-bold oui-text-white">
            {value}
          </p>
          {subValue && (
            <p className="oui-text-[10px] oui-text-base-contrast-54">
              {subValue}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="oui-p-1.5 oui-rounded-lg"
            style={{ background: `${color}20` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
        )}
      </div>
      <div
        className="oui-absolute oui-bottom-0 oui-left-0 oui-right-0 oui-h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.5 }}
      />
    </div>
  );
}

function VaultHeader() {
  const { vaultData } = useVaultData();
  const { tradeCycle } = useTradeCycle();

  const isActive = !vaultData?.paused && tradeCycle?.status === TradeCycleStatus.ACTIVE;

  return (
    <div
      className="oui-relative oui-overflow-hidden oui-rounded-2xl oui-p-4 oui-mb-4"
      style={{
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 24px rgba(99, 102, 241, 0.1)",
      }}
    >
      {/* Animated gradient orbs */}
      <div
        className="oui-absolute oui-w-32 oui-h-32 oui-rounded-full oui-blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)",
          top: "-20%",
          left: "10%",
        }}
      />
      <div
        className="oui-absolute oui-w-24 oui-h-24 oui-rounded-full oui-blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)",
          bottom: "-10%",
          right: "15%",
        }}
      />

      <div className="oui-relative oui-z-10">
        <div className="oui-flex oui-items-center oui-justify-between oui-flex-wrap oui-gap-3">
          <div className="oui-flex oui-items-center oui-gap-3">
            <div
              className="oui-w-10 oui-h-10 oui-rounded-xl oui-flex oui-items-center oui-justify-center oui-bg-white"
              style={{
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
              }}
            >
              <img
                src="/images/walletproviders/dirac-icon.avif"
                alt="Dirac"
                className="oui-w-7 oui-h-7"
              />
            </div>
            <div>
              <div className="oui-flex oui-items-center oui-gap-2">
                <h1 className="oui-text-lg oui-font-bold oui-text-white">
                  {vaultData?.name || DIRAC_VAULT_CONFIG.name}
                </h1>
                <div
                  className={`oui-px-2 oui-py-0.5 oui-rounded-full oui-text-[10px] oui-font-semibold oui-flex oui-items-center oui-gap-1 ${
                    isActive
                      ? "oui-text-emerald-400"
                      : "oui-text-amber-400"
                  }`}
                  style={{
                    background: isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                    border: isActive ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <span
                    className="oui-w-1.5 oui-h-1.5 oui-rounded-full"
                    style={{
                      background: isActive ? "#10b981" : "#f59e0b",
                      boxShadow: isActive ? "0 0 6px #10b981" : "0 0 6px #f59e0b",
                    }}
                  />
                  {isActive ? "Active" : vaultData?.paused ? "Paused" : "Pending"}
                </div>
              </div>
              <p className="oui-text-base-contrast-54 oui-text-xs oui-mt-0.5">
                {DIRAC_VAULT_CONFIG.description}
              </p>
            </div>
          </div>

          <div className="oui-flex oui-items-center oui-gap-1.5">
            {["Dirac", "Orderly", "Berachain"].map((tag) => (
              <span
                key={tag}
                className="oui-px-2 oui-py-1 oui-rounded-lg oui-text-[10px] oui-font-medium oui-text-base-contrast-80"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VaultStatsContent() {
  const { vaultData, isLoading } = useVaultData();
  const { tradeCycle } = useTradeCycle();

  if (isLoading) {
    return (
      <>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="oui-animate-pulse oui-rounded-xl oui-h-14"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
        ))}
      </>
    );
  }

  return (
    <>
      <StatCard
        label="Total Value Locked"
        value={`$${formatNumber(vaultData?.totalTVLFormatted || "0")}`}
        accentColor="#22c55e"
        icon={
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        }
      />
      <StatCard
        label="Total Depositors"
        value={vaultData?.totalUsers || 0}
        accentColor="#a855f7"
        icon={
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        }
      />
      <StatCard
        label="Trade Cycle"
        value={`#${tradeCycle?.id || 0}`}
        subValue={tradeCycle?.statusLabel || "Unknown"}
        accentColor="#3b82f6"
        icon={
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        }
      />
      <StatCard
        label="Max Deposit"
        value={`$${formatNumber(vaultData?.maxUserDepositFormatted || "0")}`}
        subValue="per user"
        accentColor="#f59e0b"
        icon={
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
              clipRule="evenodd"
            />
          </svg>
        }
      />
    </>
  );
}

function UserPosition() {
  const { isConnected } = useAccount();
  const { position, isLoading } = useUserVaultPosition();
  const { assetToken } = useAssetToken();

  if (!isConnected) {
    return (
      <div
        className="oui-rounded-xl oui-p-3 oui-mb-4 oui-relative oui-overflow-hidden"
        style={{
          background: "rgba(15, 15, 25, 0.6)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="oui-absolute oui-top-0 oui-left-0 oui-right-0 oui-h-px"
          style={{ background: "linear-gradient(90deg, transparent, #6366f160, transparent)" }}
        />
        <div className="oui-flex oui-items-center oui-justify-center oui-gap-3">
          <div
            className="oui-w-8 oui-h-8 oui-rounded-lg oui-flex oui-items-center oui-justify-center"
            style={{ background: "rgba(99, 102, 241, 0.15)" }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#6366f1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
              />
            </svg>
          </div>
          <div className="oui-text-left">
            <h3 className="oui-text-xs oui-font-semibold oui-text-white">
              Your Position
            </h3>
            <p className="oui-text-[10px] oui-text-base-contrast-54">
              Connect wallet to view
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="oui-animate-pulse oui-rounded-xl oui-h-14 oui-mb-4"
        style={{ background: "rgba(255,255,255,0.03)" }}
      />
    );
  }

  const hasPosition = position && position.shares > 0n;

  return (
    <div
      className="oui-rounded-xl oui-p-3 oui-mb-4 oui-relative oui-overflow-hidden"
      style={{
        background: "rgba(15, 15, 25, 0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="oui-absolute oui-top-0 oui-left-0 oui-right-0 oui-h-px"
        style={{ background: "linear-gradient(90deg, transparent, #6366f160, transparent)" }}
      />
      <div className="oui-flex oui-items-center oui-justify-between oui-flex-wrap oui-gap-3">
        <h3 className="oui-text-xs oui-font-semibold oui-text-white oui-flex oui-items-center oui-gap-2">
          <span style={{ color: "#6366f1" }}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          </span>
          Your Position
        </h3>

        {hasPosition ? (
          <div className="oui-flex oui-items-center oui-gap-5 oui-flex-wrap">
            <div>
              <p className="oui-text-[10px] oui-text-base-contrast-54 oui-uppercase oui-font-medium">
                Deposited
              </p>
              <p className="oui-text-sm oui-font-bold oui-text-white">
                {formatNumber(position.depositsFormatted)}
                <span className="oui-text-[10px] oui-font-normal oui-text-base-contrast-54 oui-ml-1">
                  {assetToken?.symbol}
                </span>
              </p>
            </div>

            <div>
              <p className="oui-text-[10px] oui-text-base-contrast-54 oui-uppercase oui-font-medium">
                Value
              </p>
              <p className="oui-text-sm oui-font-bold oui-text-white">
                {formatNumber(position.currentValueFormatted)}
                <span className="oui-text-[10px] oui-font-normal oui-text-base-contrast-54 oui-ml-1">
                  {assetToken?.symbol}
                </span>
              </p>
            </div>

            <div>
              <p className="oui-text-[10px] oui-text-base-contrast-54 oui-uppercase oui-font-medium">
                PnL
              </p>
              <p
                className="oui-text-sm oui-font-bold"
                style={{ color: position.pnl >= 0n ? "#22c55e" : "#ef4444" }}
              >
                {position.pnl >= 0n ? "+" : ""}
                {formatNumber(position.pnlFormatted)}
                <span className="oui-text-[10px] oui-font-normal oui-ml-1">
                  ({position.pnlPercentage >= 0 ? "+" : ""}
                  {position.pnlPercentage.toFixed(2)}%)
                </span>
              </p>
            </div>

            <div>
              <p className="oui-text-[10px] oui-text-base-contrast-54 oui-uppercase oui-font-medium">
                Shares
              </p>
              <p className="oui-text-sm oui-font-bold oui-text-white">
                {formatNumber(position.sharesFormatted, 4)}
              </p>
            </div>
          </div>
        ) : (
          <p className="oui-text-[10px] oui-text-base-contrast-54">
            No deposits yet
          </p>
        )}
      </div>
    </div>
  );
}

function ActionCard({
  title,
  children,
  icon,
  accentColor,
}: {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  accentColor?: string;
}) {
  const color = accentColor || "#6366f1";
  return (
    <div
      className="oui-rounded-xl oui-p-3 oui-relative oui-overflow-hidden"
      style={{
        background: "rgba(15, 15, 25, 0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      <div
        className="oui-absolute oui-top-0 oui-left-0 oui-right-0 oui-h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
      />
      <h3 className="oui-text-xs oui-font-semibold oui-text-white oui-mb-2.5 oui-flex oui-items-center oui-gap-1.5">
        <span style={{ color }}>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function DepositForm() {
  const { isConnected } = useAccount();
  const walletChainId = useWalletChain();
  const isWrongChain = walletChainId !== null && walletChainId !== berachain.id;
  const { vaultData } = useVaultData();
  const { assetToken, refetch: refetchAsset } = useAssetToken();
  const { refetch: refetchPosition } = useUserVaultPosition();
  const {
    approve,
    deposit,
    isApproving,
    isDepositing,
    isConfirming,
    isSuccess,
    error,
    reset,
  } = useVaultDeposit();

  const [amount, setAmount] = useState("");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [pendingDeposit, setPendingDeposit] = useState(false);

  useEffect(() => {
    if (assetToken && amount) {
      try {
        const amountBigInt = BigInt(
          Math.floor(parseFloat(amount) * 10 ** assetToken.decimals)
        );
        setNeedsApproval(assetToken.allowance < amountBigInt);
      } catch {
        setNeedsApproval(false);
      }
    } else {
      setNeedsApproval(false);
    }
  }, [assetToken, amount]);

  // After approval success, refetch allowance and proceed with deposit
  useEffect(() => {
    if (isSuccess && pendingDeposit) {
      // Refetch to get updated allowance, then deposit
      refetchAsset().then(() => {
        setPendingDeposit(false);
        reset();
        // Small delay to ensure state is updated
        setTimeout(() => {
          deposit(amount);
        }, 500);
      });
    } else if (isSuccess && !pendingDeposit) {
      // Regular deposit success
      setAmount("");
      refetchAsset();
      refetchPosition();
      reset();
    }
  }, [isSuccess, pendingDeposit, refetchAsset, refetchPosition, reset, deposit, amount]);

  const handleMaxClick = () => {
    if (assetToken) {
      setAmount(assetToken.balanceFormatted);
    }
  };

  const handleDeposit = async () => {
    if (needsApproval) {
      setPendingDeposit(true);
      await approve();
    } else {
      setPendingDeposit(false);
      await deposit(amount);
    }
  };

  const isDisabled =
    !isConnected ||
    isWrongChain ||
    !amount ||
    parseFloat(amount) <= 0 ||
    isApproving ||
    isDepositing ||
    isConfirming ||
    vaultData?.paused;

  return (
    <ActionCard
      title="Deposit"
      accentColor="#22c55e"
      icon={
        <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            clipRule="evenodd"
          />
        </svg>
      }
    >
      <div className="oui-space-y-2">
        <div>
          <div className="oui-flex oui-justify-between oui-mb-1">
            <label className="oui-text-[10px] oui-text-base-contrast-54">Amount</label>
            <span className="oui-text-[10px] oui-text-base-contrast-54">
              Bal: <span className="oui-text-base-contrast">{formatNumber(assetToken?.balanceFormatted || "0")}</span>
            </span>
          </div>
          <div
            className="oui-flex oui-items-center oui-rounded oui-overflow-hidden"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="oui-flex-1 oui-bg-transparent oui-px-2 oui-py-1.5 oui-text-xs oui-text-base-contrast focus:oui-outline-none"
              style={{ minWidth: 0 }}
            />
            <button
              onClick={handleMaxClick}
              className="oui-px-2 oui-py-1.5 oui-text-[10px] oui-font-medium oui-text-primary hover:oui-bg-primary/10 oui-flex-shrink-0"
            >
              MAX
            </button>
          </div>
        </div>

        {error && (
          <div className="oui-text-[10px] oui-text-red-400 oui-bg-red-500/10 oui-px-2 oui-py-1 oui-rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleDeposit}
          disabled={isDisabled}
          className={`oui-w-full oui-py-2.5 oui-rounded-lg oui-font-semibold oui-text-sm oui-transition-all ${
            isDisabled
              ? "oui-bg-base-600 oui-text-base-contrast-36 oui-cursor-not-allowed"
              : "oui-text-white hover:oui-scale-[1.02] active:oui-scale-[0.98]"
          }`}
          style={
            isDisabled
              ? {}
              : {
                  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  boxShadow: "0 4px 14px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                }
          }
        >
          {!isConnected
            ? "Connect Wallet"
            : isApproving || isDepositing || isConfirming
            ? pendingDeposit
              ? "Approving..."
              : "Depositing..."
            : needsApproval
            ? `Approve & Deposit`
            : vaultData?.paused
            ? "Vault Paused"
            : "Deposit"}
        </button>
      </div>
    </ActionCard>
  );
}

function WithdrawForm() {
  const { isConnected } = useAccount();
  const walletChainId = useWalletChain();
  const isWrongChain = walletChainId !== null && walletChainId !== berachain.id;
  const { position, refetch: refetchPosition } = useUserVaultPosition();
  const { assetToken, refetch: refetchAsset } = useAssetToken();
  const { tradeCycle } = useTradeCycle();
  const { redeem, isWithdrawing, isConfirming, isSuccess, error, reset } =
    useVaultWithdraw();

  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (isSuccess) {
      setAmount("");
      refetchAsset();
      refetchPosition();
      reset();
    }
  }, [isSuccess, refetchAsset, refetchPosition, reset]);

  const handleMaxClick = () => {
    if (position) {
      setAmount(position.sharesFormatted);
    }
  };

  const handleWithdraw = async () => {
    await redeem(amount);
  };

  const canWithdraw =
    tradeCycle?.status === TradeCycleStatus.ENDED ||
    tradeCycle?.status === TradeCycleStatus.INITIALIZED;

  const isDisabled =
    !isConnected ||
    isWrongChain ||
    !amount ||
    parseFloat(amount) <= 0 ||
    isWithdrawing ||
    isConfirming ||
    !canWithdraw;

  return (
    <ActionCard
      title="Withdraw"
      accentColor="#f59e0b"
      icon={
        <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
            clipRule="evenodd"
          />
        </svg>
      }
    >
      <div className="oui-space-y-2">
        <div>
          <div className="oui-flex oui-justify-between oui-mb-1">
            <label className="oui-text-[10px] oui-text-base-contrast-54">Shares</label>
            <span className="oui-text-[10px] oui-text-base-contrast-54">
              Avail: <span className="oui-text-base-contrast">{formatNumber(position?.sharesFormatted || "0", 4)}</span>
            </span>
          </div>
          <div
            className="oui-flex oui-items-center oui-rounded oui-overflow-hidden"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="oui-flex-1 oui-bg-transparent oui-px-2 oui-py-1.5 oui-text-xs oui-text-base-contrast focus:oui-outline-none"
              style={{ minWidth: 0 }}
            />
            <button
              onClick={handleMaxClick}
              className="oui-px-2 oui-py-1.5 oui-text-[10px] oui-font-medium oui-text-primary hover:oui-bg-primary/10 oui-flex-shrink-0"
            >
              MAX
            </button>
          </div>
        </div>

        {!canWithdraw && (
          <div className="oui-text-[10px] oui-text-yellow-400 oui-bg-yellow-500/10 oui-px-2 oui-py-2 oui-rounded oui-space-y-1.5">
            <div className="oui-flex oui-items-center oui-gap-1 oui-font-medium">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Trade Cycle Active
            </div>
            <p className="oui-text-yellow-400/80">
              Funds are currently deployed for trading. Withdrawals unlock when the cycle ends.
            </p>
            {tradeCycle?.startedAtDate && (
              <div className="oui-text-yellow-400/60 oui-pt-1 oui-border-t oui-border-yellow-400/20">
                <span>Started: {tradeCycle.startedAtDate.toLocaleDateString()}</span>
                <span className="oui-mx-1">•</span>
                <span>End: Managed by vault operator</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="oui-text-[10px] oui-text-red-400 oui-bg-red-500/10 oui-px-2 oui-py-1 oui-rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleWithdraw}
          disabled={isDisabled}
          className={`oui-w-full oui-py-2.5 oui-rounded-lg oui-font-semibold oui-text-sm oui-transition-all ${
            isDisabled
              ? "oui-bg-base-600 oui-text-base-contrast-36 oui-cursor-not-allowed"
              : "oui-text-white hover:oui-scale-[1.02] active:oui-scale-[0.98]"
          }`}
          style={
            isDisabled
              ? {}
              : {
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                }
          }
        >
          {!isConnected
            ? "Connect Wallet"
            : isWithdrawing || isConfirming
            ? "Processing..."
            : !canWithdraw
            ? "Cycle Active"
            : "Withdraw"}
        </button>
      </div>
    </ActionCard>
  );
}

function QuickInfo() {
  return (
    <ActionCard
      title="Vault Info"
      accentColor="#3b82f6"
      icon={
        <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      }
    >
      <div className="oui-space-y-1">
        <div className="oui-flex oui-justify-between oui-items-center oui-py-1 oui-border-b oui-border-white/5">
          <span className="oui-text-[10px] oui-text-base-contrast-54">Strategy</span>
          <span className="oui-text-[10px] oui-font-medium oui-text-base-contrast">
            {DIRAC_VAULT_CONFIG.strategy.type}
          </span>
        </div>
        <div className="oui-flex oui-justify-between oui-items-center oui-py-1 oui-border-b oui-border-white/5">
          <span className="oui-text-[10px] oui-text-base-contrast-54">Partners</span>
          <span className="oui-text-[10px] oui-font-medium oui-text-base-contrast">
            {DIRAC_VAULT_CONFIG.strategy.partner}
          </span>
        </div>
        <div className="oui-flex oui-justify-between oui-items-center oui-py-1 oui-border-b oui-border-white/5">
          <span className="oui-text-[10px] oui-text-base-contrast-54">Risk</span>
          <span className="oui-text-[10px] oui-font-medium oui-text-yellow-400">
            {DIRAC_VAULT_CONFIG.strategy.risk}
          </span>
        </div>
        <div className="oui-flex oui-justify-between oui-items-center oui-py-1">
          <span className="oui-text-[10px] oui-text-base-contrast-54">Network</span>
          <span className="oui-text-[10px] oui-font-medium oui-text-base-contrast">Berachain</span>
        </div>
        <a
          href={`https://berascan.com/address/${DIRAC_VAULT_CONFIG.vaultAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="oui-flex oui-items-center oui-justify-center oui-gap-1 oui-text-primary hover:oui-underline oui-text-[10px] oui-mt-1 oui-pt-1 oui-border-t oui-border-white/5"
        >
          View Contract
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </ActionCard>
  );
}

function VaultDescription() {
  return (
    <ActionCard
      title="How It Works"
      accentColor="#a855f7"
      icon={
        <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      }
    >
      <div className="oui-space-y-2">
        <p className="oui-text-[10px] oui-text-base-contrast-80 oui-leading-relaxed">
          {DIRAC_VAULT_CONFIG.description}
        </p>
        <div className="oui-pt-1 oui-border-t oui-border-white/5">
          <p className="oui-text-[10px] oui-font-medium oui-text-base-contrast oui-mb-1">Trade Cycles</p>
          <p className="oui-text-[10px] oui-text-base-contrast-54 oui-leading-relaxed">
            The vault operates in cycles. During an active cycle, funds are deployed for trading and withdrawals are locked. When the cycle ends, you can withdraw your shares plus any profits earned.
          </p>
        </div>
      </div>
    </ActionCard>
  );
}

function AdvancedInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="oui-rounded-xl oui-overflow-hidden oui-mt-3"
      style={{
        background: "rgba(15, 15, 25, 0.4)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="oui-w-full oui-flex oui-items-center oui-justify-between oui-px-3 oui-py-2.5 oui-transition-colors hover:oui-bg-white/5"
      >
        <span className="oui-text-xs oui-font-semibold oui-text-white oui-flex oui-items-center oui-gap-2">
          <span style={{ color: "#6366f1" }}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          Advanced Info
        </span>
        <svg
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className={`oui-text-base-contrast-54 oui-transition-transform oui-duration-200 ${
            isOpen ? "oui-rotate-180" : ""
          }`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`oui-transition-all oui-duration-300 oui-ease-in-out oui-overflow-hidden ${
          isOpen ? "oui-max-h-[1000px] oui-opacity-100" : "oui-max-h-0 oui-opacity-0"
        }`}
      >
        <div className="oui-px-3 oui-pb-3 oui-space-y-3">
          {/* Stats Grid */}
          <div className="oui-grid oui-grid-cols-2 oui-gap-2">
            <VaultStatsContent />
          </div>

          {/* Info Cards */}
          <div className="oui-grid oui-grid-cols-1 sm:oui-grid-cols-2 oui-gap-2">
            <QuickInfo />
            <VaultDescription />
          </div>
        </div>
      </div>
    </div>
  );
}

function WrongChainBanner() {
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitchChain = async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    setIsSwitching(true);
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${berachain.id.toString(16)}` }],
      });
    } catch (switchError: any) {
      // Chain not added, try to add it
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${berachain.id.toString(16)}`,
                chainName: berachain.name,
                nativeCurrency: berachain.nativeCurrency,
                rpcUrls: [berachain.rpcUrls.default.http[0]],
                blockExplorerUrls: [berachain.blockExplorers.default.url],
              },
            ],
          });
        } catch {
          // User rejected adding chain - silently fail
        }
      }
      // User rejected or other error - silently fail
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div
      className="oui-rounded-xl oui-p-4 oui-mb-4 oui-text-center"
      style={{
        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)",
        border: "1px solid rgba(245, 158, 11, 0.3)",
      }}
    >
      <div className="oui-flex oui-flex-col oui-items-center oui-gap-3">
        <div
          className="oui-w-12 oui-h-12 oui-rounded-full oui-flex oui-items-center oui-justify-center"
          style={{ background: "rgba(245, 158, 11, 0.2)" }}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#f59e0b">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h3 className="oui-text-sm oui-font-semibold oui-text-white oui-mb-1">
            Wrong Network
          </h3>
          <p className="oui-text-xs oui-text-base-contrast-54 oui-mb-3">
            Please switch to Berachain to use this vault
          </p>
        </div>
        <button
          onClick={handleSwitchChain}
          disabled={isSwitching}
          className="oui-px-8 oui-py-3 oui-rounded-lg oui-font-semibold oui-text-sm oui-transition-all oui-text-white hover:oui-scale-[1.02] active:oui-scale-[0.98] disabled:oui-opacity-50 disabled:hover:oui-scale-100"
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
            boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          {isSwitching ? "Switching..." : "Switch to Berachain"}
        </button>
      </div>
    </div>
  );
}

function DiracVaultContent() {
  const walletChainId = useWalletChain();
  const isWrongChain = walletChainId !== null && walletChainId !== berachain.id;

  return (
    <div className="oui-flex oui-justify-center oui-w-full oui-py-4 oui-px-4">
      <div style={{ maxWidth: "700px", width: "100%" }}>
        <VaultHeader />
        {isWrongChain ? (
          <WrongChainBanner />
        ) : (
          <>
            <UserPosition />
            <div className="oui-grid oui-grid-cols-1 sm:oui-grid-cols-2 oui-gap-3">
              <DepositForm />
              <WithdrawForm />
            </div>
          </>
        )}
        <AdvancedInfo />
      </div>
    </div>
  );
}

export default function DiracVaultIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Dirac Vault");

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <DiracVaultContent />
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}
