"use client";

import { useState } from "react";
import { useNexus, CHAIN_INFO } from "../nexus/NexusProvider";

export function UnifiedBalancesExample() {
  const {
    unifiedBalances,
    bridgeBalances,
    swapBalances,
    isLoadingBalances,
    refreshBalances,
  } = useNexus();

  const [activeView, setActiveView] = useState<"unified" | "bridge" | "swap">(
    "unified"
  );
  const [expandedToken, setExpandedToken] = useState<string | null>(null);

  const balances =
    activeView === "unified"
      ? unifiedBalances
      : activeView === "bridge"
      ? bridgeBalances
      : swapBalances;

  const getTokenIcon = (symbol: string) => {
    const icons: Record<string, string> = {
      USDC: "💵",
      USDT: "💴",
      ETH: "⟠",
      WBTC: "₿",
      DAI: "◈",
    };
    return icons[symbol] || "🪙";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">💰</span>
            Unified Balances
          </h2>
          <p className="text-gray-400 mt-2 max-w-2xl">
            View all your token balances aggregated across multiple blockchains.
            No more switching networks to check each balance individually!
          </p>
        </div>
        <button
          onClick={refreshBalances}
          disabled={isLoadingBalances}
          className="btn-secondary flex items-center gap-2"
        >
          <span className={isLoadingBalances ? "animate-spin" : ""}>🔄</span>
          {isLoadingBalances ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 p-1 bg-gray-900 rounded-lg w-fit">
        {[
          { id: "unified", label: "All Balances", icon: "📊" },
          { id: "bridge", label: "Bridge Balances", icon: "🌉" },
          { id: "swap", label: "Swap Balances", icon: "🔄" },
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id as typeof activeView)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === view.id
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <span className="mr-2">{view.icon}</span>
            {view.label}
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h4 className="font-medium text-purple-300">
              {activeView === "unified"
                ? "Unified View"
                : activeView === "bridge"
                ? "Bridge-Compatible Tokens"
                : "Swap-Compatible Tokens"}
            </h4>
            <p className="text-sm text-gray-400 mt-1">
              {activeView === "unified"
                ? "Shows all your balances across every supported chain. This gives you a complete picture of your holdings."
                : activeView === "bridge"
                ? "Shows tokens that can be bridged to other chains. These are the core tokens supported by Nexus bridges."
                : "Shows all tokens available for swapping. This includes additional tokens that can be exchanged via DEX aggregation."}
            </p>
          </div>
        </div>
      </div>

      {/* Total Value Card */}
      {balances && Object.keys(balances).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
            <div className="text-sm text-purple-300 mb-1">Total Tokens</div>
            <div className="text-3xl font-bold text-white">
              {Object.keys(balances).length}
            </div>
          </div>
          <div className="card bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border-cyan-500/30">
            <div className="text-sm text-cyan-300 mb-1">Active Chains</div>
            <div className="text-3xl font-bold text-white">
              {
                new Set(
                  Object.values(balances).flatMap((t) =>
                    t.chains.map((c) => c.chainId)
                  )
                ).size
              }
            </div>
          </div>
          <div className="card bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-500/30">
            <div className="text-sm text-emerald-300 mb-1">
              Total Stablecoin Value
            </div>
            <div className="text-3xl font-bold text-white">
              $
              {(
                parseFloat(balances["USDC"]?.formattedTotal || "0") +
                parseFloat(balances["USDT"]?.formattedTotal || "0") +
                parseFloat(balances["DAI"]?.formattedTotal || "0")
              ).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Balances List */}
      {isLoadingBalances ? (
        <div className="card">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin text-4xl">⏳</div>
            <span className="ml-4 text-gray-400">Loading balances...</span>
          </div>
        </div>
      ) : balances && Object.keys(balances).length > 0 ? (
        <div className="space-y-3">
          {Object.values(balances).map((token) => (
            <div
              key={token.symbol}
              className="card hover:border-purple-500/50 transition-all cursor-pointer"
              onClick={() =>
                setExpandedToken(
                  expandedToken === token.symbol ? null : token.symbol
                )
              }
            >
              {/* Token Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl">
                    {getTokenIcon(token.symbol)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {token.symbol}
                    </h3>
                    <p className="text-sm text-gray-400">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    {token.formattedTotal}
                  </div>
                  <div className="text-sm text-gray-400">
                    across {token.chains.length} chain
                    {token.chains.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Expanded Chain Details */}
              {expandedToken === token.symbol && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">
                    Balance Breakdown by Chain
                  </h4>
                  <div className="space-y-2">
                    {token.chains.map((chain) => {
                      const chainInfo = CHAIN_INFO[chain.chainId];
                      const percentage =
                        (Number(chain.balance) / Number(token.total)) * 100;

                      return (
                        <div
                          key={chain.chainId}
                          className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                        >
                          <span
                            className="text-xl"
                            style={{ color: chainInfo?.color }}
                          >
                            {chainInfo?.icon || "🔗"}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-white">
                                {chain.chainName}
                              </span>
                              <span className="text-white">
                                {chain.formattedBalance} {token.symbol}
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: chainInfo?.color || "#8b5cf6",
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-sm text-gray-400 w-16 text-right">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Expand Indicator */}
              <div className="flex justify-center mt-3">
                <span
                  className={`text-gray-500 transition-transform ${
                    expandedToken === token.symbol ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-white mb-2">No Balances Found</h3>
          <p className="text-gray-400">
            Your wallet doesn't have any balances on supported chains.
          </p>
        </div>
      )}

      {/* Visual Diagram */}
      <div className="card bg-gradient-to-r from-gray-900 to-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          📊 How Unified Balances Work
        </h3>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {[1, 137, 42161, 10, 8453].map((chainId, index) => {
            const info = CHAIN_INFO[chainId];
            return (
              <div key={chainId} className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${info.color}20` }}
                >
                  {info.icon}
                </div>
                {index < 4 && <span className="text-gray-500">+</span>}
              </div>
            );
          })}
          <span className="text-2xl text-purple-400 mx-4">=</span>
          <div className="px-6 py-3 bg-purple-600/30 border border-purple-500/50 rounded-lg">
            <span className="text-xl mr-2">💰</span>
            <span className="font-bold text-white">Unified View</span>
          </div>
        </div>
        <p className="text-center text-gray-400 mt-4 text-sm">
          All your balances from multiple chains, combined into one simple view
        </p>
      </div>
    </div>
  );
}
