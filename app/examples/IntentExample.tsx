"use client";

import { useState } from "react";
import { useNexus, CHAIN_INFO, Intent } from "../nexus/NexusProvider";

const SUPPORTED_CHAINS = [1, 137, 42161, 10, 8453];
const TOKENS = ["USDC", "USDT", "ETH"];

export function IntentExample() {
  const {
    unifiedBalances,
    currentIntent,
    intentHistory,
    createIntent,
    approveIntent,
    denyIntent,
  } = useNexus();

  const [selectedToken, setSelectedToken] = useState("USDC");
  const [amount, setAmount] = useState("100");
  const [destinationChain, setDestinationChain] = useState(137);
  const [selectedSources, setSelectedSources] = useState<number[]>([]);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const handleCreateIntent = async () => {
    setIsCreatingIntent(true);
    try {
      const decimals = selectedToken === "ETH" ? 18 : 6;
      const amountBigInt = BigInt(parseFloat(amount) * 10 ** decimals);

      await createIntent({
        token: selectedToken,
        amount: amountBigInt,
        toChainId: destinationChain,
        sourceChains: selectedSources.length > 0 ? selectedSources : undefined,
      });
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handleApprove = async () => {
    if (!currentIntent) return;
    setIsApproving(true);
    try {
      await approveIntent(currentIntent.id);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeny = () => {
    if (!currentIntent) return;
    denyIntent(currentIntent.id);
  };

  const toggleSource = (chainId: number) => {
    setSelectedSources((prev) =>
      prev.includes(chainId)
        ? prev.filter((id) => id !== chainId)
        : [...prev, chainId]
    );
  };

  const getStatusColor = (status: Intent["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "approved":
        return "bg-blue-500/20 text-blue-400";
      case "executing":
        return "bg-purple-500/20 text-purple-400";
      case "completed":
        return "bg-emerald-500/20 text-emerald-400";
      case "failed":
        return "bg-rose-500/20 text-rose-400";
    }
  };

  const getStatusIcon = (status: Intent["status"]) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "approved":
        return "✓";
      case "executing":
        return "⚡";
      case "completed":
        return "✅";
      case "failed":
        return "❌";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🎯</span>
          Intent & Solvers
        </h2>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Express what you want to achieve, not how to do it. Solvers compete to
          fulfill your intent with the best price and speed.
        </p>
      </div>

      {/* Intent Concept Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-300 mb-2">
            ❌ Traditional Approach
          </h4>
          <p className="text-sm text-gray-500">
            "Bridge 50 USDC from Ethereum using Stargate, then bridge 50 more
            from Arbitrum using Hop, pay gas in ETH..."
          </p>
        </div>
        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <h4 className="font-medium text-purple-300 mb-2">
            ✅ Intent Approach
          </h4>
          <p className="text-sm text-gray-400">
            "I want 100 USDC on Polygon." <br />
            <span className="text-purple-400">Nexus figures out the rest!</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Intent Form */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">
            Create Intent
          </h3>

          {/* Token Selection */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Token</label>
            <div className="flex gap-2">
              {TOKENS.map((token) => (
                <button
                  key={token}
                  onClick={() => setSelectedToken(token)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    selectedToken === token
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Amount</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input pr-16"
                placeholder="Enter amount"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {selectedToken}
              </span>
            </div>
            {unifiedBalances?.[selectedToken] && (
              <p className="text-xs text-gray-500 mt-1">
                Available: {unifiedBalances[selectedToken].formattedTotal}{" "}
                {selectedToken}
              </p>
            )}
          </div>

          {/* Destination Chain */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              Destination Chain
            </label>
            <div className="grid grid-cols-5 gap-2">
              {SUPPORTED_CHAINS.map((chainId) => {
                const info = CHAIN_INFO[chainId];
                return (
                  <button
                    key={chainId}
                    onClick={() => setDestinationChain(chainId)}
                    className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                      destinationChain === chainId
                        ? "bg-purple-600/30 border-2 border-purple-500"
                        : "bg-gray-800 border-2 border-transparent hover:border-gray-600"
                    }`}
                  >
                    <span style={{ color: info.color }}>{info.icon}</span>
                    <span className="text-xs text-gray-300">{info.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source Chain Selection (Optional) */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">
              Source Chains{" "}
              <span className="text-gray-500">(optional - auto if empty)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_CHAINS.filter((id) => id !== destinationChain).map(
                (chainId) => {
                  const info = CHAIN_INFO[chainId];
                  const isSelected = selectedSources.includes(chainId);
                  return (
                    <button
                      key={chainId}
                      onClick={() => toggleSource(chainId)}
                      className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? "bg-cyan-500/30 border border-cyan-500 text-cyan-300"
                          : "bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      <span style={{ color: info.color }}>{info.icon}</span>
                      {info.name}
                      {isSelected && <span>✓</span>}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateIntent}
            disabled={isCreatingIntent || !amount || parseFloat(amount) <= 0}
            className="btn-primary w-full py-3"
          >
            {isCreatingIntent ? (
              <>
                <span className="animate-spin inline-block mr-2">⏳</span>
                Creating Intent...
              </>
            ) : (
              <>🎯 Create Intent</>
            )}
          </button>
        </div>

        {/* Current Intent Display */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">
            {currentIntent ? "Review Intent" : "Intent Preview"}
          </h3>

          {currentIntent ? (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                    currentIntent.status
                  )}`}
                >
                  {getStatusIcon(currentIntent.status)} {currentIntent.status}
                </span>
              </div>

              {/* Sources */}
              <div>
                <div className="text-sm text-gray-400 mb-2">Source Chains</div>
                <div className="space-y-2">
                  {currentIntent.sources.map((source) => (
                    <div
                      key={source.chainId}
                      className="flex items-center justify-between p-2 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ color: CHAIN_INFO[source.chainId]?.color }}>
                          {CHAIN_INFO[source.chainId]?.icon}
                        </span>
                        <span className="text-white">{source.chainName}</span>
                      </div>
                      <span className="font-mono text-gray-300">
                        {source.formattedAmount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-2xl text-purple-400">
                ⬇️
              </div>

              {/* Destination */}
              <div>
                <div className="text-sm text-gray-400 mb-2">Destination</div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          color:
                            CHAIN_INFO[currentIntent.destination.chainId]?.color,
                        }}
                      >
                        {CHAIN_INFO[currentIntent.destination.chainId]?.icon}
                      </span>
                      <span className="text-white">
                        {currentIntent.destination.chainName}
                      </span>
                    </div>
                    <span className="font-mono text-purple-300 text-lg">
                      {currentIntent.destination.formattedAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fees */}
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Bridge Fee</span>
                  <span className="text-gray-300">
                    {currentIntent.fees.formattedBridgeFee}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-400">Gas Fee</span>
                  <span className="text-gray-300">
                    {currentIntent.fees.formattedGasFee}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-700">
                  <span className="text-gray-300">Estimated Time</span>
                  <span className="text-cyan-400">
                    ~{currentIntent.estimatedTime}s
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {currentIntent.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={handleDeny}
                    className="btn-secondary flex-1 text-rose-400"
                  >
                    ❌ Deny
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="btn-primary flex-1"
                  >
                    {isApproving ? (
                      <>
                        <span className="animate-spin inline-block mr-2">⏳</span>
                        Approving...
                      </>
                    ) : (
                      <>✅ Approve</>
                    )}
                  </button>
                </div>
              )}

              {currentIntent.status === "executing" && (
                <div className="text-center py-4">
                  <div className="text-4xl animate-pulse mb-2">⚡</div>
                  <p className="text-purple-400">
                    Solvers are executing your intent...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">🎯</div>
              <p>Create an intent to see it here</p>
            </div>
          )}
        </div>
      </div>

      {/* Solver Competition Visualization */}
      <div className="card bg-gradient-to-r from-gray-900 to-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          🏁 How Solvers Compete
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Solver A", fee: "0.3%", time: "30s", best: false },
            { name: "Solver B", fee: "0.2%", time: "45s", best: true },
            { name: "Solver C", fee: "0.4%", time: "20s", best: false },
          ].map((solver) => (
            <div
              key={solver.name}
              className={`p-4 rounded-lg ${
                solver.best
                  ? "bg-emerald-500/10 border-2 border-emerald-500"
                  : "bg-gray-800 border border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{solver.name}</span>
                {solver.best && (
                  <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded">
                    Best
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                Fee: <span className="text-white">{solver.fee}</span>
              </div>
              <div className="text-sm text-gray-400">
                Time: <span className="text-white">{solver.time}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-4 text-center">
          Solvers analyze your intent and compete to offer the best combination
          of fees and speed
        </p>
      </div>

      {/* Intent History */}
      {intentHistory.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">
            Intent History
          </h3>
          <div className="space-y-2">
            {intentHistory.slice(0, 5).map((intent) => (
              <div
                key={intent.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {getStatusIcon(intent.status)}
                  </span>
                  <div>
                    <div className="text-white">
                      {intent.destination.formattedAmount} to{" "}
                      {intent.destination.chainName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {intent.sources.length} source chain(s)
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${getStatusColor(
                    intent.status
                  )}`}
                >
                  {intent.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
