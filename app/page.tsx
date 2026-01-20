"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useNexus } from "./nexus/NexusProvider";

// Import our concept example components
import { UnifiedBalancesExample } from "./examples/UnifiedBalancesExample";
import { AllowancesExample } from "./examples/AllowancesExample";
import { IntentExample } from "./examples/IntentExample";
import { BridgeExample } from "./examples/BridgeExample";
import { SwapExample } from "./examples/SwapExample";

// Navigation tabs for different concepts
const CONCEPTS = [
  { id: "unified-balances", name: "Unified Balances", icon: "💰" },
  { id: "allowances", name: "Allowances", icon: "🔐" },
  { id: "intent", name: "Intent & Solvers", icon: "🎯" },
  { id: "bridge", name: "Bridge Functions", icon: "🌉" },
  { id: "swap", name: "Swap Functions", icon: "🔄" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("unified-balances");
  const { isConnected } = useAccount();
  const { isInitialized, isInitializing, error } = useNexus();

  return (
    <main className="min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900 to-gray-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-3xl">🌉</span>
              <div className="absolute -inset-1 bg-purple-500/20 rounded-full blur-sm -z-10" />
            </div>
            <h1 className="text-xl font-bold text-white">
              Avail Nexus <span className="gradient-text">Concepts</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isInitialized && (
              <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-sm border border-emerald-500/30 flex items-center gap-2">
                <span className="status-dot-success" />
                SDK Ready
              </span>
            )}
            {isInitializing && (
              <span className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm border border-amber-500/30 animate-pulse flex items-center gap-2">
                <span className="status-dot-warning animate-pulse" />
                Initializing...
              </span>
            )}
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Hero Section */}
        <section className="mb-12 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-sm">
            ✨ Interactive Demo Environment
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Explore <span className="gradient-text">Nexus SDK</span> Concepts
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Learn cross-chain operations with interactive examples. Connect your
            wallet and experience the power of chain abstraction firsthand.
          </p>
        </section>

        {/* Concept Navigation */}
        <nav className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {CONCEPTS.map((concept) => (
              <button
                key={concept.id}
                onClick={() => setActiveTab(concept.id)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === concept.id
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30 scale-105"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/50"
                }`}
              >
                <span className="mr-2 text-lg">{concept.icon}</span>
                {concept.name}
              </button>
            ))}
          </div>
        </nav>

        {/* Concept Content */}
        <section className="glass rounded-2xl p-6 md:p-8 mb-8">
          {!isConnected ? (
            <div className="text-center py-16">
              <div className="text-7xl mb-6 animate-float">🔗</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Connect Your Wallet
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Connect your wallet to interact with the Nexus SDK examples and
                explore cross-chain operations.
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          ) : !isInitialized ? (
            <div className="text-center py-16">
              <div className="text-7xl mb-6 animate-spin-slow">⚡</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Initializing SDK...
              </h3>
              <p className="text-gray-400">
                Setting up the Nexus SDK for your wallet.
              </p>
              <div className="mt-6 w-48 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-shimmer" />
              </div>
            </div>
          ) : (
            <>
              {activeTab === "unified-balances" && <UnifiedBalancesExample />}
              {activeTab === "allowances" && <AllowancesExample />}
              {activeTab === "intent" && <IntentExample />}
              {activeTab === "bridge" && <BridgeExample />}
              {activeTab === "swap" && <SwapExample />}
            </>
          )}
        </section>

        {/* Code Preview */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📝</span>
            <h3 className="text-xl font-semibold text-white">
              Code Example:{" "}
              <span className="text-purple-400">
                {CONCEPTS.find((c) => c.id === activeTab)?.name}
              </span>
            </h3>
          </div>
          <CodePreview concept={activeTab} />
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500">
            Built with{" "}
            <a
              href="https://docs.availproject.org/nexus"
              className="text-purple-400 hover:text-purple-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Avail Nexus SDK
            </a>
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="https://docs.availproject.org/nexus"
              className="text-gray-400 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
            <a
              href="https://github.com/availproject/nexus-sdk"
              className="text-gray-400 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.availproject.org/"
              className="text-gray-400 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Avail Project
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Code preview component with syntax highlighting styles
function CodePreview({ concept }: { concept: string }) {
  const codeExamples: Record<string, string> = {
    "unified-balances": `// Unified Balances - See all your assets across chains
import { NexusSDK } from '@avail-project/nexus-core';

const sdk = new NexusSDK({ network: 'mainnet' });
await sdk.initialize(window.ethereum);

// Get aggregated balances across all supported chains
const balances = await sdk.getUnifiedBalances();
console.log('Total USDC:', balances.USDC.total);
console.log('Per chain:', balances.USDC.chains);

// Or get balances specifically for bridging
const bridgeBalances = await sdk.getBalancesForBridge();

// Or for swapping (includes more token types)
const swapBalances = await sdk.getBalancesForSwap();`,

    allowances: `// Allowances - Manage token spending permissions
import { NexusSDK } from '@avail-project/nexus-core';

const sdk = new NexusSDK({ network: 'mainnet' });
await sdk.initialize(window.ethereum);

// Check current allowances on Polygon
const allowances = await sdk.getAllowance(137, ['USDC', 'USDT']);

// Set allowance for USDC
await sdk.setAllowance(137, ['USDC'], 100_000_000n); // 100 USDC

// Or let Nexus handle it with hooks
sdk.setOnAllowanceHook(({ sources, allow, deny }) => {
  // 'min' = minimum needed (safest)
  // 'max' = unlimited (convenient)
  allow(['min']);
});

// Revoke allowance when done
await sdk.revokeAllowance(137, ['USDC']);`,

    intent: `// Intent & Solvers - Declare what you want
import { NexusSDK, NEXUS_EVENTS } from '@avail-project/nexus-core';

const sdk = new NexusSDK({ network: 'mainnet' });
await sdk.initialize(window.ethereum);

// Set up intent approval hook
sdk.setOnIntentHook(({ intent, allow, deny, refresh }) => {
  console.log('Intent sources:', intent.sources);
  console.log('Estimated fees:', intent.fees);
  console.log('Expected time:', intent.estimatedTime);
  
  // Show this to user for approval
  if (userApproves) {
    allow();
  } else {
    deny();
  }
});

// Now execute - solvers compete to fulfill your intent
const result = await sdk.bridge({
  token: 'USDC',
  amount: 100_000_000n, // 100 USDC
  toChainId: 137        // Polygon
});`,

    bridge: `// Bridge Functions - Move tokens across chains
import { NexusSDK, NEXUS_EVENTS } from '@avail-project/nexus-core';

const sdk = new NexusSDK({ network: 'mainnet' });
await sdk.initialize(window.ethereum);

// 1. Basic Bridge - Move to your wallet
await sdk.bridge({
  token: 'USDC',
  amount: 100_000_000n,
  toChainId: 137 // Polygon
});

// 2. Bridge and Transfer - Send to another address
await sdk.bridgeAndTransfer({
  token: 'USDC',
  amount: 100_000_000n,
  toChainId: 137,
  recipient: '0x...' // Friend's address
});

// 3. Bridge and Execute - Interact with DeFi
await sdk.bridgeAndExecute({
  token: 'USDC',
  amount: 100_000_000n,
  toChainId: 137,
  execute: {
    to: aavePoolAddress,
    data: depositCalldata,
    tokenApproval: { token: 'USDC', amount: 100_000_000n, spender: aavePoolAddress }
  }
});`,

    swap: `// Swap Functions - Exchange tokens across chains
import { NexusSDK } from '@avail-project/nexus-core';

const sdk = new NexusSDK({ network: 'mainnet' });
await sdk.initialize(window.ethereum);

// Swap Exact In - "I want to spend 100 USDC"
const swapIn = await sdk.swapWithExactIn({
  from: [{
    chainId: 10, // Optimism
    amount: 100_000_000n,
    tokenAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' // USDC
  }],
  toChainId: 8453, // Base
  toTokenAddress: '0x4200000000000000000000000000000000000006' // WETH
});

// Swap Exact Out - "I want exactly 1 ETH"
const swapOut = await sdk.swapWithExactOut({
  from: [{
    chainId: 137,
    tokenAddress: usdcAddress,
    maxAmount: 3000_000_000n // Max 3000 USDC
  }],
  toChainId: 1,
  toTokenAddress: wethAddress,
  toAmount: 1_000_000_000_000_000_000n // 1 ETH
});`,
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-xl blur opacity-50 group-hover:opacity-75 transition" />
      <pre className="relative bg-gray-950 rounded-xl p-5 overflow-x-auto border border-gray-800">
        <code className="text-sm text-gray-300 font-mono leading-relaxed">
          {codeExamples[concept]}
        </code>
      </pre>
    </div>
  );
}
