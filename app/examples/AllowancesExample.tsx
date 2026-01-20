"use client";

import { useState, useEffect } from "react";
import { useNexus, CHAIN_INFO, Allowance } from "../nexus/NexusProvider";

const SUPPORTED_CHAINS = [1, 137, 42161, 10, 8453];
const TOKENS = ["USDC", "USDT", "ETH"];

export function AllowancesExample() {
  const {
    allowances,
    isLoadingAllowances,
    getAllowances,
    setAllowance,
    revokeAllowance,
  } = useNexus();

  const [selectedChain, setSelectedChain] = useState(1);
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [customAmount, setCustomAmount] = useState("");
  const [isSettingAllowance, setIsSettingAllowance] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  // Load allowances when chain changes
  useEffect(() => {
    getAllowances(selectedChain, TOKENS);
  }, [selectedChain, getAllowances]);

  const currentAllowances = allowances[selectedChain] || [];
  const currentTokenAllowance = currentAllowances.find(
    (a) => a.token === selectedToken
  );

  const handleSetAllowance = async (amount: bigint | "max") => {
    setIsSettingAllowance(true);
    try {
      await setAllowance(selectedChain, selectedToken, amount);
    } finally {
      setIsSettingAllowance(false);
    }
  };

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      await revokeAllowance(selectedChain, selectedToken);
    } finally {
      setIsRevoking(false);
    }
  };

  const getAllowanceStatus = (allowance: Allowance) => {
    if (allowance.isUnlimited) {
      return { label: "Unlimited", color: "text-amber-400", bg: "bg-amber-500/20" };
    }
    if (allowance.allowance === BigInt(0)) {
      return { label: "None", color: "text-gray-400", bg: "bg-gray-500/20" };
    }
    return { label: "Limited", color: "text-emerald-400", bg: "bg-emerald-500/20" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🔐</span>
          Token Allowances
        </h2>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Manage permissions for smart contracts to spend your tokens. This is a
          required step before any bridge or swap operation.
        </p>
      </div>

      {/* Security Info */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="font-medium text-amber-300">Security Best Practice</h4>
            <p className="text-sm text-gray-400 mt-1">
              Always set the minimum allowance needed for your transaction.
              Unlimited allowances are convenient but risky if a contract is
              compromised. Revoke allowances after use when possible.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chain & Token Selector */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">
            Select Chain & Token
          </h3>

          {/* Chain Selector */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Network</label>
            <div className="grid grid-cols-5 gap-2">
              {SUPPORTED_CHAINS.map((chainId) => {
                const info = CHAIN_INFO[chainId];
                return (
                  <button
                    key={chainId}
                    onClick={() => setSelectedChain(chainId)}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
                      selectedChain === chainId
                        ? "bg-purple-600/30 border-2 border-purple-500"
                        : "bg-gray-800 border-2 border-transparent hover:border-gray-600"
                    }`}
                  >
                    <span className="text-xl" style={{ color: info.color }}>
                      {info.icon}
                    </span>
                    <span className="text-xs text-gray-300">{info.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Token Selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Token</label>
            <div className="flex gap-2">
              {TOKENS.map((token) => (
                <button
                  key={token}
                  onClick={() => setSelectedToken(token)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
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
        </div>

        {/* Current Allowance Display */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">
            Current Allowance
          </h3>

          {isLoadingAllowances ? (
            <div className="flex items-center justify-center py-8">
              <span className="animate-spin text-2xl mr-3">⏳</span>
              <span className="text-gray-400">Loading allowances...</span>
            </div>
          ) : currentTokenAllowance ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Token</span>
                  <span className="font-medium text-white">
                    {selectedToken} on {CHAIN_INFO[selectedChain].name}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-mono text-white">
                    {currentTokenAllowance.formattedAllowance}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  {(() => {
                    const status = getAllowanceStatus(currentTokenAllowance);
                    return (
                      <span
                        className={`px-2 py-1 rounded text-sm ${status.bg} ${status.color}`}
                      >
                        {status.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Spender: {currentTokenAllowance.spender.slice(0, 10)}...
                {currentTokenAllowance.spender.slice(-8)}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No allowance data available
            </div>
          )}
        </div>
      </div>

      {/* Set Allowance Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Set Allowance</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Minimum */}
          <button
            onClick={() => handleSetAllowance(BigInt(100_000_000))}
            disabled={isSettingAllowance}
            className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-all disabled:opacity-50"
          >
            <div className="text-emerald-400 font-medium mb-1">🛡️ Minimum</div>
            <div className="text-sm text-gray-400">
              Set to 100 {selectedToken}
            </div>
            <div className="text-xs text-emerald-500/80 mt-2">Recommended</div>
          </button>

          {/* Custom */}
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="text-cyan-400 font-medium mb-2">📝 Custom</div>
            <div className="flex gap-2">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Amount"
                className="input flex-1 py-2 text-sm"
              />
              <button
                onClick={() =>
                  handleSetAllowance(
                    BigInt(parseFloat(customAmount) * 10 ** 6)
                  )
                }
                disabled={isSettingAllowance || !customAmount}
                className="btn-primary px-3 py-2 text-sm"
              >
                Set
              </button>
            </div>
          </div>

          {/* Unlimited */}
          <button
            onClick={() => handleSetAllowance("max")}
            disabled={isSettingAllowance}
            className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-all disabled:opacity-50"
          >
            <div className="text-amber-400 font-medium mb-1">♾️ Unlimited</div>
            <div className="text-sm text-gray-400">Set maximum allowance</div>
            <div className="text-xs text-amber-500/80 mt-2">⚠️ Use with caution</div>
          </button>
        </div>

        {/* Revoke Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div>
            <div className="font-medium text-white">Revoke Allowance</div>
            <div className="text-sm text-gray-400">
              Remove all spending permissions
            </div>
          </div>
          <button
            onClick={handleRevoke}
            disabled={
              isRevoking || currentTokenAllowance?.allowance === BigInt(0)
            }
            className="btn-secondary text-rose-400 hover:text-rose-300 disabled:text-gray-500"
          >
            {isRevoking ? (
              <>
                <span className="animate-spin inline-block mr-2">⏳</span>
                Revoking...
              </>
            ) : (
              "🗑️ Revoke"
            )}
          </button>
        </div>
      </div>

      {/* All Allowances Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">
          All Allowances on {CHAIN_INFO[selectedChain].name}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400">
                <th className="pb-3">Token</th>
                <th className="pb-3">Allowance</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingAllowances ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    <span className="animate-spin inline-block mr-2">⏳</span>
                    Loading...
                  </td>
                </tr>
              ) : currentAllowances.length > 0 ? (
                currentAllowances.map((allowance) => {
                  const status = getAllowanceStatus(allowance);
                  return (
                    <tr key={allowance.token} className="table-row">
                      <td className="table-cell font-medium text-white">
                        {allowance.token}
                      </td>
                      <td className="table-cell font-mono text-gray-300">
                        {allowance.formattedAllowance}
                      </td>
                      <td className="table-cell">
                        <span
                          className={`px-2 py-1 rounded text-xs ${status.bg} ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="table-cell text-right">
                        <button
                          onClick={() => {
                            setSelectedToken(allowance.token);
                          }}
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          Manage →
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No allowances found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allowance Flow Diagram */}
      <div className="card bg-gradient-to-r from-gray-900 to-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          📋 Allowance Flow
        </h3>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl mb-2">🔐</div>
            <div className="text-sm text-gray-300">Check Allowance</div>
          </div>
          <span className="text-2xl text-gray-500">→</span>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl mb-2">✍️</div>
            <div className="text-sm text-gray-300">Set Permission</div>
          </div>
          <span className="text-2xl text-gray-500">→</span>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-sm text-gray-300">Execute Transaction</div>
          </div>
          <span className="text-2xl text-gray-500">→</span>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl mb-2">🗑️</div>
            <div className="text-sm text-gray-300">Revoke (Optional)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
