"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAccount, useWalletClient } from "wagmi";

// Types for the Nexus SDK (simulated for demo purposes)
export interface ChainBalance {
  chainId: number;
  chainName: string;
  balance: bigint;
  formattedBalance: string;
}

export interface TokenBalance {
  symbol: string;
  name: string;
  decimals: number;
  total: bigint;
  formattedTotal: string;
  chains: ChainBalance[];
}

export interface UnifiedBalances {
  [symbol: string]: TokenBalance;
}

export interface Allowance {
  token: string;
  spender: string;
  allowance: bigint;
  formattedAllowance: string;
  isUnlimited: boolean;
}

export interface IntentSource {
  chainId: number;
  chainName: string;
  amount: bigint;
  formattedAmount: string;
}

export interface IntentFees {
  bridgeFee: bigint;
  gasFee: bigint;
  totalFee: bigint;
  formattedBridgeFee: string;
  formattedGasFee: string;
  formattedTotalFee: string;
}

export interface Intent {
  id: string;
  sources: IntentSource[];
  destination: {
    chainId: number;
    chainName: string;
    amount: bigint;
    formattedAmount: string;
  };
  fees: IntentFees;
  estimatedTime: number;
  status: "pending" | "approved" | "executing" | "completed" | "failed";
}

export interface NexusEvent {
  name: string;
  args: Record<string, unknown>;
  timestamp: number;
}

// Chain metadata
export const CHAIN_INFO: Record<
  number,
  { name: string; icon: string; color: string }
> = {
  1: { name: "Ethereum", icon: "⟠", color: "#627eea" },
  137: { name: "Polygon", icon: "⬡", color: "#8247e5" },
  42161: { name: "Arbitrum", icon: "◈", color: "#28a0f0" },
  10: { name: "Optimism", icon: "🔴", color: "#ff0420" },
  8453: { name: "Base", icon: "🔵", color: "#0052ff" },
  11155111: { name: "Sepolia", icon: "⟠", color: "#627eea" },
  80001: { name: "Mumbai", icon: "⬡", color: "#8247e5" },
  421614: { name: "Arb Sepolia", icon: "◈", color: "#28a0f0" },
  11155420: { name: "OP Sepolia", icon: "🔴", color: "#ff0420" },
  84532: { name: "Base Sepolia", icon: "🔵", color: "#0052ff" },
};

interface NexusContextType {
  // State
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;

  // Balances
  unifiedBalances: UnifiedBalances | null;
  bridgeBalances: UnifiedBalances | null;
  swapBalances: UnifiedBalances | null;
  isLoadingBalances: boolean;
  refreshBalances: () => Promise<void>;

  // Allowances
  allowances: Record<number, Allowance[]>;
  isLoadingAllowances: boolean;
  getAllowances: (chainId: number, tokens: string[]) => Promise<Allowance[]>;
  setAllowance: (
    chainId: number,
    token: string,
    amount: bigint | "max"
  ) => Promise<void>;
  revokeAllowance: (chainId: number, token: string) => Promise<void>;

  // Intent
  currentIntent: Intent | null;
  intentHistory: Intent[];
  createIntent: (params: {
    token: string;
    amount: bigint;
    toChainId: number;
    sourceChains?: number[];
  }) => Promise<Intent>;
  approveIntent: (intentId: string) => Promise<void>;
  denyIntent: (intentId: string) => void;

  // Bridge
  bridge: (params: {
    token: string;
    amount: bigint;
    toChainId: number;
    sourceChains?: number[];
    onEvent?: (event: NexusEvent) => void;
  }) => Promise<{ success: boolean; txHash?: string }>;

  bridgeAndTransfer: (params: {
    token: string;
    amount: bigint;
    toChainId: number;
    recipient: string;
    sourceChains?: number[];
    onEvent?: (event: NexusEvent) => void;
  }) => Promise<{ success: boolean; txHash?: string }>;

  // Swap
  swapExactIn: (params: {
    fromToken: string;
    fromChainId: number;
    amount: bigint;
    toToken: string;
    toChainId: number;
    onEvent?: (event: NexusEvent) => void;
  }) => Promise<{ success: boolean; txHash?: string; outputAmount?: bigint }>;

  swapExactOut: (params: {
    fromToken: string;
    fromChainId: number;
    maxAmount: bigint;
    toToken: string;
    toChainId: number;
    toAmount: bigint;
    onEvent?: (event: NexusEvent) => void;
  }) => Promise<{ success: boolean; txHash?: string; inputAmount?: bigint }>;
}

const NexusContext = createContext<NexusContextType | null>(null);

// Helper function to format token amounts
function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;
  const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
  const trimmedFractional = fractionalStr.slice(0, 4).replace(/0+$/, "");

  if (trimmedFractional) {
    return `${integerPart}.${trimmedFractional}`;
  }
  return integerPart.toString();
}

// Demo data generator
function generateDemoBalances(): UnifiedBalances {
  const tokens = [
    { symbol: "USDC", name: "USD Coin", decimals: 6 },
    { symbol: "USDT", name: "Tether", decimals: 6 },
    { symbol: "ETH", name: "Ethereum", decimals: 18 },
    { symbol: "WBTC", name: "Wrapped Bitcoin", decimals: 8 },
    { symbol: "DAI", name: "Dai", decimals: 18 },
  ];

  const chainIds = [1, 137, 42161, 10, 8453];

  const balances: UnifiedBalances = {};

  for (const token of tokens) {
    const chains: ChainBalance[] = [];
    let total = BigInt(0);

    for (const chainId of chainIds) {
      // Generate random balance for demo
      const randomBalance =
        BigInt(Math.floor(Math.random() * 1000)) *
        BigInt(10 ** (token.decimals - 2));
      if (randomBalance > 0) {
        total += randomBalance;
        chains.push({
          chainId,
          chainName: CHAIN_INFO[chainId]?.name || `Chain ${chainId}`,
          balance: randomBalance,
          formattedBalance: formatTokenAmount(randomBalance, token.decimals),
        });
      }
    }

    if (total > 0) {
      balances[token.symbol] = {
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        total,
        formattedTotal: formatTokenAmount(total, token.decimals),
        chains,
      };
    }
  }

  return balances;
}

interface NexusProviderProps {
  children: ReactNode;
}

export function NexusProvider({ children }: NexusProviderProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Balances
  const [unifiedBalances, setUnifiedBalances] = useState<UnifiedBalances | null>(
    null
  );
  const [bridgeBalances, setBridgeBalances] = useState<UnifiedBalances | null>(
    null
  );
  const [swapBalances, setSwapBalances] = useState<UnifiedBalances | null>(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // Allowances
  const [allowances, setAllowances] = useState<Record<number, Allowance[]>>({});
  const [isLoadingAllowances, setIsLoadingAllowances] = useState(false);

  // Intent
  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);
  const [intentHistory, setIntentHistory] = useState<Intent[]>([]);

  // Initialize SDK when wallet connects
  useEffect(() => {
    async function initializeSDK() {
      if (!isConnected || !address) {
        setIsInitialized(false);
        setUnifiedBalances(null);
        setBridgeBalances(null);
        setSwapBalances(null);
        return;
      }

      setIsInitializing(true);
      setError(null);

      try {
        // Simulate SDK initialization delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // In a real implementation, you would initialize the Nexus SDK here:
        // const sdk = new NexusSDK({ network: 'mainnet' });
        // await sdk.initialize(walletClient);

        setIsInitialized(true);

        // Load initial balances
        await refreshBalances();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize Nexus SDK"
        );
      } finally {
        setIsInitializing(false);
      }
    }

    initializeSDK();
  }, [isConnected, address]);

  // Refresh balances
  const refreshBalances = useCallback(async () => {
    if (!isConnected) return;

    setIsLoadingBalances(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate demo data (in real implementation, call SDK methods)
      const unified = generateDemoBalances();
      setUnifiedBalances(unified);

      // Bridge balances (subset of unified)
      const bridge: UnifiedBalances = {};
      ["USDC", "USDT", "ETH"].forEach((symbol) => {
        if (unified[symbol]) {
          bridge[symbol] = unified[symbol];
        }
      });
      setBridgeBalances(bridge);

      // Swap balances (same as unified for demo)
      setSwapBalances(unified);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch balances"
      );
    } finally {
      setIsLoadingBalances(false);
    }
  }, [isConnected]);

  // Get allowances for a chain
  const getAllowances = useCallback(
    async (chainId: number, tokens: string[]): Promise<Allowance[]> => {
      setIsLoadingAllowances(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Generate demo allowances
        const newAllowances: Allowance[] = tokens.map((token) => {
          const randomAllowance =
            Math.random() > 0.5
              ? BigInt(Math.floor(Math.random() * 1000)) * BigInt(10 ** 6)
              : BigInt(0);
          const isUnlimited = randomAllowance > BigInt(10 ** 12);

          return {
            token,
            spender: "0x1234567890123456789012345678901234567890",
            allowance: randomAllowance,
            formattedAllowance: isUnlimited
              ? "Unlimited"
              : formatTokenAmount(randomAllowance, 6),
            isUnlimited,
          };
        });

        setAllowances((prev) => ({ ...prev, [chainId]: newAllowances }));
        return newAllowances;
      } finally {
        setIsLoadingAllowances(false);
      }
    },
    []
  );

  // Set allowance
  const setAllowance = useCallback(
    async (chainId: number, token: string, amount: bigint | "max") => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const isUnlimited = amount === "max";
      const actualAmount =
        amount === "max" ? BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935") : amount;

      setAllowances((prev) => {
        const chainAllowances = prev[chainId] || [];
        const existingIndex = chainAllowances.findIndex((a) => a.token === token);
        const newAllowance: Allowance = {
          token,
          spender: "0x1234567890123456789012345678901234567890",
          allowance: actualAmount,
          formattedAllowance: isUnlimited
            ? "Unlimited"
            : formatTokenAmount(actualAmount, 6),
          isUnlimited,
        };

        if (existingIndex >= 0) {
          chainAllowances[existingIndex] = newAllowance;
        } else {
          chainAllowances.push(newAllowance);
        }

        return { ...prev, [chainId]: [...chainAllowances] };
      });
    },
    []
  );

  // Revoke allowance
  const revokeAllowance = useCallback(
    async (chainId: number, token: string) => {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setAllowances((prev) => {
        const chainAllowances = prev[chainId] || [];
        const existingIndex = chainAllowances.findIndex((a) => a.token === token);

        if (existingIndex >= 0) {
          chainAllowances[existingIndex] = {
            ...chainAllowances[existingIndex],
            allowance: BigInt(0),
            formattedAllowance: "0",
            isUnlimited: false,
          };
        }

        return { ...prev, [chainId]: [...chainAllowances] };
      });
    },
    []
  );

  // Create intent
  const createIntent = useCallback(
    async (params: {
      token: string;
      amount: bigint;
      toChainId: number;
      sourceChains?: number[];
    }): Promise<Intent> => {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const tokenInfo = unifiedBalances?.[params.token];
      const decimals = tokenInfo?.decimals || 6;

      // Determine sources based on available balances
      const sources: IntentSource[] = [];
      let remaining = params.amount;

      const eligibleChains = params.sourceChains || [1, 137, 42161, 10, 8453];

      for (const chainId of eligibleChains) {
        if (remaining <= 0) break;

        const chainBalance = tokenInfo?.chains.find(
          (c) => c.chainId === chainId
        );
        if (chainBalance && chainBalance.balance > 0) {
          const useAmount =
            chainBalance.balance < remaining ? chainBalance.balance : remaining;
          sources.push({
            chainId,
            chainName: CHAIN_INFO[chainId]?.name || `Chain ${chainId}`,
            amount: useAmount,
            formattedAmount: formatTokenAmount(useAmount, decimals),
          });
          remaining -= useAmount;
        }
      }

      // Calculate fees (simulated)
      const bridgeFee = (params.amount * BigInt(5)) / BigInt(10000); // 0.05%
      const gasFee = BigInt(1000000000000000); // 0.001 ETH in wei

      const intent: Intent = {
        id: `intent-${Date.now()}`,
        sources,
        destination: {
          chainId: params.toChainId,
          chainName:
            CHAIN_INFO[params.toChainId]?.name || `Chain ${params.toChainId}`,
          amount: params.amount - bridgeFee,
          formattedAmount: formatTokenAmount(params.amount - bridgeFee, decimals),
        },
        fees: {
          bridgeFee,
          gasFee,
          totalFee: bridgeFee + gasFee / BigInt(10 ** 12), // Rough conversion
          formattedBridgeFee: formatTokenAmount(bridgeFee, decimals),
          formattedGasFee: "0.001 ETH",
          formattedTotalFee: `${formatTokenAmount(bridgeFee, decimals)} + 0.001 ETH`,
        },
        estimatedTime: 30 + Math.floor(Math.random() * 60),
        status: "pending",
      };

      setCurrentIntent(intent);
      return intent;
    },
    [unifiedBalances]
  );

  // Approve intent
  const approveIntent = useCallback(async (intentId: string) => {
    setCurrentIntent((prev) => {
      if (prev?.id === intentId) {
        return { ...prev, status: "approved" };
      }
      return prev;
    });

    // Simulate execution
    await new Promise((resolve) => setTimeout(resolve, 500));

    setCurrentIntent((prev) => {
      if (prev?.id === intentId) {
        return { ...prev, status: "executing" };
      }
      return prev;
    });

    // Simulate completion
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setCurrentIntent((prev) => {
      if (prev?.id === intentId) {
        const completed = { ...prev, status: "completed" as const };
        setIntentHistory((history) => [completed, ...history]);
        return null;
      }
      return prev;
    });
  }, []);

  // Deny intent
  const denyIntent = useCallback((intentId: string) => {
    setCurrentIntent((prev) => {
      if (prev?.id === intentId) {
        const failed = { ...prev, status: "failed" as const };
        setIntentHistory((history) => [failed, ...history]);
        return null;
      }
      return prev;
    });
  }, []);

  // Bridge function
  const bridge = useCallback(
    async (params: {
      token: string;
      amount: bigint;
      toChainId: number;
      sourceChains?: number[];
      onEvent?: (event: NexusEvent) => void;
    }) => {
      const { onEvent } = params;

      onEvent?.({
        name: "STEPS_LIST",
        args: { steps: ["allowance", "deposit", "bridge", "receive"] },
        timestamp: Date.now(),
      });

      // Create and approve intent
      const intent = await createIntent(params);

      onEvent?.({
        name: "INTENT_CREATED",
        args: { intent },
        timestamp: Date.now(),
      });

      await approveIntent(intent.id);

      onEvent?.({
        name: "STEP_COMPLETE",
        args: {
          typeID: "bridge",
          transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
          explorerURL: "https://etherscan.io/tx/...",
        },
        timestamp: Date.now(),
      });

      return {
        success: true,
        txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      };
    },
    [createIntent, approveIntent]
  );

  // Bridge and transfer
  const bridgeAndTransfer = useCallback(
    async (params: {
      token: string;
      amount: bigint;
      toChainId: number;
      recipient: string;
      sourceChains?: number[];
      onEvent?: (event: NexusEvent) => void;
    }) => {
      const { onEvent, recipient, ...bridgeParams } = params;

      onEvent?.({
        name: "STEPS_LIST",
        args: { steps: ["allowance", "deposit", "bridge", "transfer"] },
        timestamp: Date.now(),
      });

      const result = await bridge({ ...bridgeParams, onEvent });

      onEvent?.({
        name: "TRANSFER_COMPLETE",
        args: { recipient },
        timestamp: Date.now(),
      });

      return result;
    },
    [bridge]
  );

  // Swap exact in
  const swapExactIn = useCallback(
    async (params: {
      fromToken: string;
      fromChainId: number;
      amount: bigint;
      toToken: string;
      toChainId: number;
      onEvent?: (event: NexusEvent) => void;
    }) => {
      const { onEvent } = params;

      onEvent?.({
        name: "STEPS_LIST",
        args: { steps: ["allowance", "swap", "bridge", "receive"] },
        timestamp: Date.now(),
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulated output amount (random rate)
      const rate = 0.0004 + Math.random() * 0.0001; // ~$2500/ETH
      const outputAmount = BigInt(
        Math.floor(Number(params.amount) * rate * 10 ** 12)
      );

      onEvent?.({
        name: "SWAP_COMPLETE",
        args: {
          inputAmount: params.amount.toString(),
          outputAmount: outputAmount.toString(),
          transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        },
        timestamp: Date.now(),
      });

      return {
        success: true,
        txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        outputAmount,
      };
    },
    []
  );

  // Swap exact out
  const swapExactOut = useCallback(
    async (params: {
      fromToken: string;
      fromChainId: number;
      maxAmount: bigint;
      toToken: string;
      toChainId: number;
      toAmount: bigint;
      onEvent?: (event: NexusEvent) => void;
    }) => {
      const { onEvent } = params;

      onEvent?.({
        name: "STEPS_LIST",
        args: { steps: ["allowance", "swap", "bridge", "receive"] },
        timestamp: Date.now(),
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulated input amount
      const rate = 2500 + Math.random() * 100;
      const inputAmount = BigInt(
        Math.floor((Number(params.toAmount) / 10 ** 18) * rate * 10 ** 6)
      );

      onEvent?.({
        name: "SWAP_COMPLETE",
        args: {
          inputAmount: inputAmount.toString(),
          outputAmount: params.toAmount.toString(),
          transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        },
        timestamp: Date.now(),
      });

      return {
        success: true,
        txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        inputAmount,
      };
    },
    []
  );

  const value: NexusContextType = {
    isInitialized,
    isInitializing,
    error,
    unifiedBalances,
    bridgeBalances,
    swapBalances,
    isLoadingBalances,
    refreshBalances,
    allowances,
    isLoadingAllowances,
    getAllowances,
    setAllowance,
    revokeAllowance,
    currentIntent,
    intentHistory,
    createIntent,
    approveIntent,
    denyIntent,
    bridge,
    bridgeAndTransfer,
    swapExactIn,
    swapExactOut,
  };

  return (
    <NexusContext.Provider value={value}>{children}</NexusContext.Provider>
  );
}

export function useNexus() {
  const context = useContext(NexusContext);
  if (!context) {
    throw new Error("useNexus must be used within a NexusProvider");
  }
  return context;
}
