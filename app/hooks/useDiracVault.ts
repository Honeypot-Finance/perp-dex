import { useState, useCallback, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { formatUnits, parseUnits, maxUint256 } from "viem";
import { DIRAC_VAULT_ABI, ERC20_ABI } from "@/utils/dirac-vault/abi";
import {
  DIRAC_VAULT_CONFIG,
  getTradeCycleStatusLabel,
} from "@/utils/dirac-vault/config";

const { vaultAddress } = DIRAC_VAULT_CONFIG;

// Hook to get vault metadata and stats
export function useVaultData() {
  const { address: userAddress } = useAccount();

  // Batch read vault data
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "name",
      },
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "symbol",
      },
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "decimals",
      },
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "totalAssets",
      },
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "totalSupply",
      },
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "totalTVL",
      },
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "totalUsers",
      },
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "maxUserDeposit",
      },
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "paused",
      },
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "asset",
      },
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "currentTradeCycleId",
      },
    ],
  });

  const vaultData = useMemo(() => {
    if (!data) return null;

    const [
      name,
      symbol,
      decimals,
      totalAssets,
      totalSupply,
      totalTVL,
      totalUsers,
      maxUserDeposit,
      paused,
      assetAddress,
      currentCycleId,
    ] = data;

    const dec = (decimals?.result as number) ?? 18;

    return {
      name: (name?.result as string) ?? "Dirac Vault",
      symbol: (symbol?.result as string) ?? "dVAULT",
      decimals: dec,
      totalAssets: totalAssets?.result as bigint | undefined,
      totalAssetsFormatted: totalAssets?.result
        ? formatUnits(totalAssets.result as bigint, dec)
        : "0",
      totalSupply: totalSupply?.result as bigint | undefined,
      totalSupplyFormatted: totalSupply?.result
        ? formatUnits(totalSupply.result as bigint, dec)
        : "0",
      totalTVL: totalTVL?.result as bigint | undefined,
      totalTVLFormatted: totalTVL?.result
        ? formatUnits(totalTVL.result as bigint, dec)
        : "0",
      totalUsers: totalUsers?.result
        ? Number(totalUsers.result as bigint)
        : 0,
      maxUserDeposit: maxUserDeposit?.result as bigint | undefined,
      maxUserDepositFormatted: maxUserDeposit?.result
        ? formatUnits(maxUserDeposit.result as bigint, dec)
        : "0",
      paused: (paused?.result as boolean) ?? false,
      assetAddress: assetAddress?.result as `0x${string}` | undefined,
      currentCycleId: currentCycleId?.result
        ? Number(currentCycleId.result as bigint)
        : 0,
    };
  }, [data]);

  return {
    vaultData,
    isLoading,
    refetch,
  };
}

// Hook to get current trade cycle info
export function useTradeCycle() {
  const { data: cycleId } = useReadContract({
    address: vaultAddress,
    abi: DIRAC_VAULT_ABI,
    functionName: "currentTradeCycleId",
  });

  const { data: cycleData, isLoading } = useReadContract({
    address: vaultAddress,
    abi: DIRAC_VAULT_ABI,
    functionName: "tradeCycles",
    args: cycleId ? [cycleId] : undefined,
    query: {
      enabled: !!cycleId,
    },
  });

  const tradeCycle = useMemo(() => {
    if (!cycleData) return null;

    const [status, startedAt, endedAt, amountAvailable] = cycleData as [
      number,
      bigint,
      bigint,
      bigint
    ];

    return {
      id: cycleId ? Number(cycleId) : 0,
      status,
      statusLabel: getTradeCycleStatusLabel(status),
      startedAt: Number(startedAt),
      startedAtDate: startedAt ? new Date(Number(startedAt) * 1000) : null,
      endedAt: Number(endedAt),
      endedAtDate: endedAt ? new Date(Number(endedAt) * 1000) : null,
      amountAvailable,
    };
  }, [cycleId, cycleData]);

  return { tradeCycle, isLoading };
}

// Hook to get user's position in the vault
export function useUserVaultPosition() {
  const { address: userAddress } = useAccount();
  const { vaultData } = useVaultData();

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "balanceOf",
        args: userAddress ? [userAddress] : undefined,
      },
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "userDeposits",
        args: userAddress ? [userAddress] : undefined,
      },
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "maxWithdraw",
        args: userAddress ? [userAddress] : undefined,
      },
      {
        address: vaultAddress,
        abi: DIRAC_VAULT_ABI,
        functionName: "maxRedeem",
        args: userAddress ? [userAddress] : undefined,
      },
    ],
    query: {
      enabled: !!userAddress,
    },
  });

  // Get user's share value in assets
  const shares = data?.[0]?.result as bigint | undefined;
  const { data: assetsValue } = useReadContract({
    address: vaultAddress,
    abi: DIRAC_VAULT_ABI,
    functionName: "convertToAssets",
    args: shares ? [shares] : undefined,
    query: {
      enabled: !!shares && shares > 0n,
    },
  });

  const position = useMemo(() => {
    if (!data || !userAddress) return null;

    const [sharesResult, depositsResult, maxWithdrawResult, maxRedeemResult] =
      data;
    const decimals = vaultData?.decimals ?? 18;

    const userShares = (sharesResult?.result as bigint) ?? 0n;
    const userDeposits = (depositsResult?.result as bigint) ?? 0n;
    const maxWithdraw = (maxWithdrawResult?.result as bigint) ?? 0n;
    const maxRedeem = (maxRedeemResult?.result as bigint) ?? 0n;
    const currentValue = (assetsValue as bigint) ?? 0n;

    // Calculate PnL
    const pnl = currentValue - userDeposits;
    const pnlPercentage =
      userDeposits > 0n
        ? Number((pnl * 10000n) / userDeposits) / 100
        : 0;

    return {
      shares: userShares,
      sharesFormatted: formatUnits(userShares, decimals),
      deposits: userDeposits,
      depositsFormatted: formatUnits(userDeposits, decimals),
      currentValue,
      currentValueFormatted: formatUnits(currentValue, decimals),
      maxWithdraw,
      maxWithdrawFormatted: formatUnits(maxWithdraw, decimals),
      maxRedeem,
      maxRedeemFormatted: formatUnits(maxRedeem, decimals),
      pnl,
      pnlFormatted: formatUnits(pnl, decimals),
      pnlPercentage,
    };
  }, [data, userAddress, assetsValue, vaultData?.decimals]);

  return { position, isLoading, refetch };
}

// Hook for asset token interactions
export function useAssetToken() {
  const { address: userAddress } = useAccount();
  const { vaultData } = useVaultData();
  const assetAddress = vaultData?.assetAddress;

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        address: assetAddress,
        abi: ERC20_ABI,
        functionName: "name",
      },
      {
        address: assetAddress,
        abi: ERC20_ABI,
        functionName: "symbol",
      },
      {
        address: assetAddress,
        abi: ERC20_ABI,
        functionName: "decimals",
      },
      {
        address: assetAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: userAddress ? [userAddress] : undefined,
      },
      {
        address: assetAddress,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: userAddress ? [userAddress, vaultAddress] : undefined,
      },
    ],
    query: {
      enabled: !!assetAddress,
    },
  });

  const assetToken = useMemo(() => {
    if (!data || !assetAddress) return null;

    const [name, symbol, decimals, balance, allowance] = data;
    const dec = (decimals?.result as number) ?? 18;

    return {
      address: assetAddress,
      name: (name?.result as string) ?? "Unknown",
      symbol: (symbol?.result as string) ?? "???",
      decimals: dec,
      balance: (balance?.result as bigint) ?? 0n,
      balanceFormatted: balance?.result
        ? formatUnits(balance.result as bigint, dec)
        : "0",
      allowance: (allowance?.result as bigint) ?? 0n,
      hasApproval: (allowance?.result as bigint) > 0n,
    };
  }, [data, assetAddress]);

  return { assetToken, isLoading, refetch };
}

// Hook for deposit operations
export function useVaultDeposit() {
  const { address: userAddress } = useAccount();
  const { vaultData } = useVaultData();
  const { assetToken, refetch: refetchAsset } = useAssetToken();
  const { refetch: refetchPosition } = useUserVaultPosition();
  const publicClient = usePublicClient();

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [depositError, setDepositError] = useState<string | null>(null);

  const approve = useCallback(
    async (amount?: bigint) => {
      if (!assetToken?.address || !userAddress) {
        setDepositError("Wallet not connected");
        return;
      }

      setDepositError(null);

      try {
        writeContract({
          address: assetToken.address,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [vaultAddress, amount ?? maxUint256],
        });
      } catch (error) {
        setDepositError(
          error instanceof Error ? error.message : "Approval failed"
        );
      }
    },
    [assetToken?.address, userAddress, writeContract]
  );

  const deposit = useCallback(
    async (amount: string) => {
      if (!userAddress || !vaultData) {
        setDepositError("Wallet not connected");
        return;
      }

      setDepositError(null);

      try {
        const amountBigInt = parseUnits(amount, vaultData.decimals);

        // Check allowance first
        if (assetToken && assetToken.allowance < amountBigInt) {
          setDepositError("Insufficient allowance. Please approve first.");
          return;
        }

        writeContract({
          address: vaultAddress,
          abi: DIRAC_VAULT_ABI,
          functionName: "deposit",
          args: [amountBigInt, userAddress],
        });
      } catch (error) {
        setDepositError(
          error instanceof Error ? error.message : "Deposit failed"
        );
      }
    },
    [userAddress, vaultData, assetToken, writeContract]
  );

  // Refetch data after successful transaction
  const handleSuccess = useCallback(() => {
    if (isSuccess) {
      refetchAsset();
      refetchPosition();
    }
  }, [isSuccess, refetchAsset, refetchPosition]);

  return {
    approve,
    deposit,
    txHash,
    isApproving: isWritePending,
    isDepositing: isWritePending,
    isConfirming,
    isSuccess,
    error: depositError || writeError?.message,
    reset: () => {
      reset();
      setDepositError(null);
    },
    handleSuccess,
  };
}

// Hook for withdraw/redeem operations
export function useVaultWithdraw() {
  const { address: userAddress } = useAccount();
  const { vaultData } = useVaultData();
  const { refetch: refetchAsset } = useAssetToken();
  const { refetch: refetchPosition } = useUserVaultPosition();

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Withdraw by asset amount
  const withdraw = useCallback(
    async (amount: string) => {
      if (!userAddress || !vaultData) {
        setWithdrawError("Wallet not connected");
        return;
      }

      setWithdrawError(null);

      try {
        const amountBigInt = parseUnits(amount, vaultData.decimals);

        writeContract({
          address: vaultAddress,
          abi: DIRAC_VAULT_ABI,
          functionName: "withdraw",
          args: [amountBigInt, userAddress, userAddress],
        });
      } catch (error) {
        setWithdrawError(
          error instanceof Error ? error.message : "Withdraw failed"
        );
      }
    },
    [userAddress, vaultData, writeContract]
  );

  // Redeem by shares amount
  const redeem = useCallback(
    async (shares: string) => {
      if (!userAddress || !vaultData) {
        setWithdrawError("Wallet not connected");
        return;
      }

      setWithdrawError(null);

      try {
        const sharesBigInt = parseUnits(shares, vaultData.decimals);

        writeContract({
          address: vaultAddress,
          abi: DIRAC_VAULT_ABI,
          functionName: "redeem",
          args: [sharesBigInt, userAddress, userAddress],
        });
      } catch (error) {
        setWithdrawError(
          error instanceof Error ? error.message : "Redeem failed"
        );
      }
    },
    [userAddress, vaultData, writeContract]
  );

  // Refetch data after successful transaction
  const handleSuccess = useCallback(() => {
    if (isSuccess) {
      refetchAsset();
      refetchPosition();
    }
  }, [isSuccess, refetchAsset, refetchPosition]);

  return {
    withdraw,
    redeem,
    txHash,
    isWithdrawing: isWritePending,
    isConfirming,
    isSuccess,
    error: withdrawError || writeError?.message,
    reset: () => {
      reset();
      setWithdrawError(null);
    },
    handleSuccess,
  };
}

// Preview functions
export function useVaultPreview() {
  const { vaultData } = useVaultData();

  const previewDeposit = useCallback(
    async (amount: string, publicClient: ReturnType<typeof usePublicClient>) => {
      if (!vaultData || !publicClient) return null;

      try {
        const amountBigInt = parseUnits(amount, vaultData.decimals);
        const shares = await publicClient.readContract({
          address: vaultAddress,
          abi: DIRAC_VAULT_ABI,
          functionName: "previewDeposit",
          args: [amountBigInt],
        });
        return {
          shares: shares as bigint,
          sharesFormatted: formatUnits(shares as bigint, vaultData.decimals),
        };
      } catch {
        return null;
      }
    },
    [vaultData]
  );

  const previewWithdraw = useCallback(
    async (amount: string, publicClient: ReturnType<typeof usePublicClient>) => {
      if (!vaultData || !publicClient) return null;

      try {
        const amountBigInt = parseUnits(amount, vaultData.decimals);
        const shares = await publicClient.readContract({
          address: vaultAddress,
          abi: DIRAC_VAULT_ABI,
          functionName: "previewWithdraw",
          args: [amountBigInt],
        });
        return {
          shares: shares as bigint,
          sharesFormatted: formatUnits(shares as bigint, vaultData.decimals),
        };
      } catch {
        return null;
      }
    },
    [vaultData]
  );

  const previewRedeem = useCallback(
    async (shares: string, publicClient: ReturnType<typeof usePublicClient>) => {
      if (!vaultData || !publicClient) return null;

      try {
        const sharesBigInt = parseUnits(shares, vaultData.decimals);
        const assets = await publicClient.readContract({
          address: vaultAddress,
          abi: DIRAC_VAULT_ABI,
          functionName: "previewRedeem",
          args: [sharesBigInt],
        });
        return {
          assets: assets as bigint,
          assetsFormatted: formatUnits(assets as bigint, vaultData.decimals),
        };
      } catch {
        return null;
      }
    },
    [vaultData]
  );

  return { previewDeposit, previewWithdraw, previewRedeem };
}
