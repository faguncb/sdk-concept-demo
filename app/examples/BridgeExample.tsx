"use client";

import { useState } from "react";
import { useNexus, CHAIN_INFO, NexusEvent } from "../nexus/NexusProvider";

const SUPPORTED_CHAINS = [1, 137, 42161, 10, 8453];
const TOKENS = ["USDC", "USDT", "ETH"];

type BridgeMode = "bridge" | "transfer" | "execute";

export function BridgeExample() {
  const { unifiedBalances, bridge, bridgeAndTransfer } = useNexus();

  const [mode, setMode] = useState<BridgeMode>("bridge");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [amount, setAmount] = useState("50");
  const [destinationChain, setDestinationChain] = useState(137);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [contractAddress, setContractAddress] = useState("");

  const [isBridging, setIsBridging] = useState(false);
  const [events, setEvents] = useState<NexusEvent[]>([]);
  const [result, setResult] = useState<{
    success: boolean;
    txHash?: string;
  } | null>(null);

  const handleBridge = async () => {
    setIsBridging(true);
    setEvents([]);
    setResult(null);

    const decimals = selectedToken === "ETH" ? 18 : 6;
    const amountBigInt = BigInt(parseFloat(amount) * 10 ** decimals);

    const onEvent = (event: NexusEvent) => {
      setEvents((prev) => [...prev, event]);
    };

    try {
      let bridgeResult;

      if (mode === "bridge") {
        bridgeResult = await bridge({
          token: selectedToken,
          amount: amountBigInt,
          toChainId: destinationChain,
          onEvent,
        });
      } else if (mode === "transfer") {
        bridgeResult = await bridgeAndTransfer({
          token: selectedToken,
          amount: amountBigInt,
          toChainId: destinationChain,
          recipient: recipientAddress,
          onEvent,
        });
      } else {
        // Execute mode - simulated
        bridgeResult = await bridge({
          token: selectedToken,
          amount: amountBigInt,
          toChainId: destinationChain,
          onEvent,
        });
      }

      setResult(bridgeResult);
    } catch (error) {
      setResult({ success: false });
    } finally {
      setIsBridging(false);
    }
  };

  const getModeInfo = () => {
    switch (mode) {
      case "bridge":
        return {
          icon: "🌉",
          title: "Bridge",
          description: "Move tokens to your wallet on another chain",
        };
      case "transfer":
        return {
          icon: "📤",
          title: "Bridge & Transfer",
          description: "Bridge tokens and send to a different address",
        };
      case "execute":
        return {
          icon: "⚡",
          title: "Bridge & Execute",
          description: "Bridge tokens and call a smart contract",
        };
    }
  };

  const modeInfo = getModeInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🌉</span>
          Bridge Functions
        </h2>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Move your tokens seamlessly across different blockchains. Choose from
          three powerful bridge operations.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["bridge", "transfer", "execute"] as BridgeMode[]).map((m) => {
          const info =
            m === "bridge"
              ? {
                  icon: "🌉",
                  title: "Bridge",
                  desc: "To your wallet",
                }
              : m === "transfer"
              ? {
                  icon: "📤",
                  title: "Bridge & Transfer",
                  desc: "To another address",
                }
              : {
                  icon: "⚡",
                  title: "Bridge & Execute",
                  desc: "Call a contract",
                };

          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`p-4 rounded-lg text-left transition-all ${
                mode === m
                  ? "bg-purple-600/30 border-2 border-purple-500"
                  : "bg-gray-800 border-2 border-transparent hover:border-gray-600"
              }`}
            >
              <div className="text-2xl mb-2">{info.icon}</div>
              <div className="font-medium text-white">{info.title}</div>
              <div className="text-sm text-gray-400">{info.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bridge Form */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{modeInfo.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {modeInfo.title}
              </h3>
              <p className="text-sm text-gray-400">{modeInfo.description}</p>
            </div>
          </div>

          {/* Token & Amount */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Token</label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="input"
              >
                {TOKENS.map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
                placeholder="0.0"
              />
            </div>
          </div>

          {unifiedBalances?.[selectedToken] && (
            <p className="text-xs text-gray-500 mb-4">
              Available: {unifiedBalances[selectedToken].formattedTotal}{" "}
              {selectedToken}
            </p>
          )}

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

          {/* Recipient Address (Transfer mode) */}
          {mode === "transfer" && (
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="input font-mono text-sm"
                placeholder="0x..."
              />
            </div>
          )}

          {/* Contract Address (Execute mode) */}
          {mode === "execute" && (
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Contract Address
                </label>
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="input font-mono text-sm"
                  placeholder="0x..."
                />
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm">
                <span className="text-amber-400">⚠️ Demo Mode:</span>{" "}
                <span className="text-gray-400">
                  In production, you would also provide encoded function call
                  data and token approval details.
                </span>
              </div>
            </div>
          )}

          {/* Bridge Button */}
          <button
            onClick={handleBridge}
            disabled={
              isBridging ||
              !amount ||
              parseFloat(amount) <= 0 ||
              (mode === "transfer" && !recipientAddress)
            }
            className="btn-primary w-full py-3"
          >
            {isBridging ? (
              <>
                <span className="animate-spin inline-block mr-2">⏳</span>
                Bridging...
              </>
            ) : (
              <>
                {modeInfo.icon} {modeInfo.title}
              </>
            )}
          </button>
        </div>

        {/* Event Log & Result */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">
            Transaction Progress
          </h3>

          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-800 rounded-lg animate-fade-in"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-400">✓</span>
                    <span className="font-medium text-white">{event.name}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono pl-6">
                    {JSON.stringify(event.args, null, 2)}
                  </div>
                </div>
              ))}

              {result && (
                <div
                  className={`p-4 rounded-lg ${
                    result.success
                      ? "bg-emerald-500/20 border border-emerald-500/50"
                      : "bg-rose-500/20 border border-rose-500/50"
                  }`}
                >
                  {result.success ? (
                    <>
                      <div className="flex items-center gap-2 text-emerald-400 font-medium">
                        <span className="text-xl">🎉</span>
                        Bridge Complete!
                      </div>
                      {result.txHash && (
                        <div className="mt-2 text-xs font-mono text-gray-400">
                          TX: {result.txHash.slice(0, 20)}...
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-400 font-medium">
                      <span className="text-xl">❌</span>
                      Bridge Failed
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">📋</div>
              <p>Transaction events will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Bridge Flow Diagram */}
      <div className="card bg-gradient-to-r from-gray-900 to-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          🔄 Bridge Flow
        </h3>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { icon: "🔐", label: "Allowance" },
            { icon: "📥", label: "Deposit" },
            { icon: "🌉", label: "Bridge" },
            { icon: "📤", label: "Receive" },
          ].map((step, index) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="text-center p-3 bg-gray-800 rounded-lg min-w-[80px]">
                <div className="text-xl mb-1">{step.icon}</div>
                <div className="text-xs text-gray-300">{step.label}</div>
              </div>
              {index < 3 && <span className="text-gray-500">→</span>}
            </div>
          ))}
        </div>
        {mode === "transfer" && (
          <div className="flex items-center justify-center mt-4 gap-2">
            <span className="text-gray-500">→</span>
            <div className="text-center p-3 bg-cyan-500/20 border border-cyan-500/50 rounded-lg">
              <div className="text-xl mb-1">👤</div>
              <div className="text-xs text-cyan-300">Transfer to Recipient</div>
            </div>
          </div>
        )}
        {mode === "execute" && (
          <div className="flex items-center justify-center mt-4 gap-2">
            <span className="text-gray-500">→</span>
            <div className="text-center p-3 bg-amber-500/20 border border-amber-500/50 rounded-lg">
              <div className="text-xl mb-1">⚡</div>
              <div className="text-xs text-amber-300">Execute Contract</div>
            </div>
          </div>
        )}
      </div>

      {/* Use Cases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h4 className="font-medium text-white mb-2">🌉 Bridge</h4>
          <p className="text-sm text-gray-400">
            Move tokens to yourself on another chain. Perfect for accessing DeFi
            on cheaper networks.
          </p>
        </div>
        <div className="card">
          <h4 className="font-medium text-white mb-2">📤 Bridge & Transfer</h4>
          <p className="text-sm text-gray-400">
            Send tokens to a friend or another wallet on any chain. Cross-chain
            payments made easy.
          </p>
        </div>
        <div className="card">
          <h4 className="font-medium text-white mb-2">⚡ Bridge & Execute</h4>
          <p className="text-sm text-gray-400">
            Bridge and interact with DeFi in one transaction. Deposit to AAVE,
            swap on Uniswap, etc.
          </p>
        </div>
      </div>
    </div>
  );
}
