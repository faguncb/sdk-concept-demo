"use client";

import { useState } from "react";
import { useNexus, CHAIN_INFO, NexusEvent } from "../nexus/NexusProvider";

const SUPPORTED_CHAINS = [1, 137, 42161, 10, 8453];
const SWAP_TOKENS = ["USDC", "USDT", "ETH", "WBTC", "DAI"];

type SwapMode = "exactIn" | "exactOut";

export function SwapExample() {
  const { swapBalances, swapExactIn, swapExactOut } = useNexus();

  const [mode, setMode] = useState<SwapMode>("exactIn");
  const [fromToken, setFromToken] = useState("USDC");
  const [toToken, setToToken] = useState("ETH");
  const [fromChain, setFromChain] = useState(1);
  const [toChain, setToChain] = useState(137);
  const [amount, setAmount] = useState("100");
  const [maxAmount, setMaxAmount] = useState("3000");

  const [isSwapping, setIsSwapping] = useState(false);
  const [events, setEvents] = useState<NexusEvent[]>([]);
  const [result, setResult] = useState<{
    success: boolean;
    txHash?: string;
    inputAmount?: bigint;
    outputAmount?: bigint;
  } | null>(null);

  // Simulated price quote
  const getQuote = () => {
    const prices: Record<string, number> = {
      USDC: 1,
      USDT: 1,
      ETH: 2500,
      WBTC: 45000,
      DAI: 1,
    };

    const fromPrice = prices[fromToken] || 1;
    const toPrice = prices[toToken] || 1;

    if (mode === "exactIn") {
      const inputUSD = parseFloat(amount) * fromPrice;
      const outputAmount = inputUSD / toPrice;
      return {
        input: amount,
        output: outputAmount.toFixed(toToken === "ETH" ? 6 : 2),
        rate: (fromPrice / toPrice).toFixed(8),
      };
    } else {
      const outputUSD = parseFloat(amount) * toPrice;
      const inputAmount = outputUSD / fromPrice;
      return {
        input: inputAmount.toFixed(fromToken === "ETH" ? 6 : 2),
        output: amount,
        rate: (toPrice / fromPrice).toFixed(8),
      };
    }
  };

  const quote = getQuote();

  const handleSwap = async () => {
    setIsSwapping(true);
    setEvents([]);
    setResult(null);

    const onEvent = (event: NexusEvent) => {
      setEvents((prev) => [...prev, event]);
    };

    try {
      let swapResult;

      if (mode === "exactIn") {
        const decimals = fromToken === "ETH" ? 18 : 6;
        const amountBigInt = BigInt(parseFloat(amount) * 10 ** decimals);

        swapResult = await swapExactIn({
          fromToken,
          fromChainId: fromChain,
          amount: amountBigInt,
          toToken,
          toChainId: toChain,
          onEvent,
        });
      } else {
        const toDecimals = toToken === "ETH" ? 18 : 6;
        const fromDecimals = fromToken === "ETH" ? 18 : 6;
        const toAmountBigInt = BigInt(parseFloat(amount) * 10 ** toDecimals);
        const maxAmountBigInt = BigInt(
          parseFloat(maxAmount) * 10 ** fromDecimals
        );

        swapResult = await swapExactOut({
          fromToken,
          fromChainId: fromChain,
          maxAmount: maxAmountBigInt,
          toToken,
          toChainId: toChain,
          toAmount: toAmountBigInt,
          onEvent,
        });
      }

      setResult(swapResult);
    } catch (error) {
      setResult({ success: false });
    } finally {
      setIsSwapping(false);
    }
  };

  const swapTokenPositions = () => {
    const tempToken = fromToken;
    const tempChain = fromChain;
    setFromToken(toToken);
    setFromChain(toChain);
    setToToken(tempToken);
    setToChain(tempChain);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🔄</span>
          Swap Functions
        </h2>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Exchange tokens across different chains. Choose between exact input
          (you know what you're spending) or exact output (you know what you
          want to receive).
        </p>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setMode("exactIn")}
          className={`p-4 rounded-lg text-left transition-all ${
            mode === "exactIn"
              ? "bg-purple-600/30 border-2 border-purple-500"
              : "bg-gray-800 border-2 border-transparent hover:border-gray-600"
          }`}
        >
          <div className="text-2xl mb-2">📤</div>
          <div className="font-medium text-white">Exact Input</div>
          <div className="text-sm text-gray-400">
            "I want to spend exactly 100 USDC"
          </div>
        </button>
        <button
          onClick={() => setMode("exactOut")}
          className={`p-4 rounded-lg text-left transition-all ${
            mode === "exactOut"
              ? "bg-purple-600/30 border-2 border-purple-500"
              : "bg-gray-800 border-2 border-transparent hover:border-gray-600"
          }`}
        >
          <div className="text-2xl mb-2">📥</div>
          <div className="font-medium text-white">Exact Output</div>
          <div className="text-sm text-gray-400">
            "I want to receive exactly 1 ETH"
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Swap Form */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">
            {mode === "exactIn" ? "Swap Exact Input" : "Swap Exact Output"}
          </h3>

          {/* From Section */}
          <div className="p-4 bg-gray-800 rounded-lg mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                {mode === "exactIn" ? "You Pay" : "You Pay (max)"}
              </span>
              {swapBalances?.[fromToken] && (
                <span className="text-xs text-gray-500">
                  Balance: {swapBalances[fromToken].formattedTotal}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={mode === "exactIn" ? amount : quote.input}
                onChange={(e) =>
                  mode === "exactIn"
                    ? setAmount(e.target.value)
                    : setMaxAmount(e.target.value)
                }
                className="flex-1 bg-transparent text-2xl font-medium text-white outline-none"
                placeholder="0.0"
                readOnly={mode === "exactOut"}
              />
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                className="bg-gray-700 border-0 rounded-lg px-3 py-2 text-white"
              >
                {SWAP_TOKENS.map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3">
              <span className="text-xs text-gray-500">On Chain:</span>
              <div className="flex gap-1 mt-1">
                {SUPPORTED_CHAINS.map((chainId) => {
                  const info = CHAIN_INFO[chainId];
                  return (
                    <button
                      key={chainId}
                      onClick={() => setFromChain(chainId)}
                      className={`p-1.5 rounded transition-all ${
                        fromChain === chainId
                          ? "bg-purple-600/50"
                          : "hover:bg-gray-700"
                      }`}
                      title={info.name}
                    >
                      <span style={{ color: info.color }}>{info.icon}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={swapTokenPositions}
              className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-all border-4 border-gray-900"
            >
              ⇅
            </button>
          </div>

          {/* To Section */}
          <div className="p-4 bg-gray-800 rounded-lg mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                {mode === "exactOut" ? "You Receive" : "You Receive (est.)"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={mode === "exactOut" ? amount : quote.output}
                onChange={(e) =>
                  mode === "exactOut" ? setAmount(e.target.value) : null
                }
                className="flex-1 bg-transparent text-2xl font-medium text-white outline-none"
                placeholder="0.0"
                readOnly={mode === "exactIn"}
              />
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
                className="bg-gray-700 border-0 rounded-lg px-3 py-2 text-white"
              >
                {SWAP_TOKENS.filter((t) => t !== fromToken).map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3">
              <span className="text-xs text-gray-500">On Chain:</span>
              <div className="flex gap-1 mt-1">
                {SUPPORTED_CHAINS.map((chainId) => {
                  const info = CHAIN_INFO[chainId];
                  return (
                    <button
                      key={chainId}
                      onClick={() => setToChain(chainId)}
                      className={`p-1.5 rounded transition-all ${
                        toChain === chainId
                          ? "bg-purple-600/50"
                          : "hover:bg-gray-700"
                      }`}
                      title={info.name}
                    >
                      <span style={{ color: info.color }}>{info.icon}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Max Amount Input (Exact Out mode) */}
          {mode === "exactOut" && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <label className="block text-sm text-amber-400 mb-2">
                Maximum {fromToken} to spend
              </label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="input"
                placeholder="Max amount"
              />
            </div>
          )}

          {/* Price Info */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Rate</span>
              <span className="text-white">
                1 {fromToken} = {quote.rate} {toToken}
              </span>
            </div>
            <div className="flex justify-between text-gray-400 mt-1">
              <span>Route</span>
              <span className="text-white">
                {CHAIN_INFO[fromChain].name} → {CHAIN_INFO[toChain].name}
              </span>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={
              isSwapping ||
              !amount ||
              parseFloat(amount) <= 0 ||
              fromToken === toToken
            }
            className="btn-primary w-full py-3 mt-4"
          >
            {isSwapping ? (
              <>
                <span className="animate-spin inline-block mr-2">⏳</span>
                Swapping...
              </>
            ) : (
              <>🔄 Swap</>
            )}
          </button>
        </div>

        {/* Result & Events */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">
            Swap Progress
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
                      <div className="flex items-center gap-2 text-emerald-400 font-medium mb-2">
                        <span className="text-xl">🎉</span>
                        Swap Complete!
                      </div>
                      {result.txHash && (
                        <div className="text-xs font-mono text-gray-400">
                          TX: {result.txHash.slice(0, 20)}...
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-400 font-medium">
                      <span className="text-xl">❌</span>
                      Swap Failed
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">🔄</div>
              <p>Swap events will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">
          📊 Swap Types Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3">Feature</th>
                <th className="pb-3">Exact Input</th>
                <th className="pb-3">Exact Output</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-row">
                <td className="table-cell text-gray-300">What's Fixed</td>
                <td className="table-cell text-purple-400">Input amount</td>
                <td className="table-cell text-cyan-400">Output amount</td>
              </tr>
              <tr className="table-row">
                <td className="table-cell text-gray-300">What Varies</td>
                <td className="table-cell text-gray-400">Output amount</td>
                <td className="table-cell text-gray-400">Input amount</td>
              </tr>
              <tr className="table-row">
                <td className="table-cell text-gray-300">Use Case</td>
                <td className="table-cell text-gray-400">
                  "Spend all my USDC"
                </td>
                <td className="table-cell text-gray-400">
                  "I need exactly 1 ETH"
                </td>
              </tr>
              <tr className="table-row">
                <td className="table-cell text-gray-300">Risk</td>
                <td className="table-cell text-gray-400">
                  May get less output
                </td>
                <td className="table-cell text-gray-400">May pay more input</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Flow */}
      <div className="card bg-gradient-to-r from-gray-900 to-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          🔄 Cross-Chain Swap Flow
        </h3>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl mb-2">💵</div>
            <div className="text-sm text-gray-300">{fromToken}</div>
            <div className="text-xs text-gray-500">
              {CHAIN_INFO[fromChain].name}
            </div>
          </div>
          <span className="text-2xl text-gray-500">→</span>
          <div className="text-center p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg">
            <div className="text-2xl mb-2">🔄</div>
            <div className="text-sm text-purple-300">Nexus Swap</div>
            <div className="text-xs text-gray-500">DEX Aggregation</div>
          </div>
          <span className="text-2xl text-gray-500">→</span>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl mb-2">⟠</div>
            <div className="text-sm text-gray-300">{toToken}</div>
            <div className="text-xs text-gray-500">
              {CHAIN_INFO[toChain].name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
