"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import {
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
  sepolia,
  polygonMumbai,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
} from "wagmi/chains";
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from "@rainbow-me/rainbowkit";

// Configure chains for Nexus SDK
const config = getDefaultConfig({
  appName: "Avail Nexus Concepts",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "demo-project-id",
  chains: [
    mainnet,
    polygon,
    arbitrum,
    optimism,
    base,
    // Testnets
    sepolia,
    polygonMumbai,
    arbitrumSepolia,
    optimismSepolia,
    baseSepolia,
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
    [polygonMumbai.id]: http(),
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Custom RainbowKit theme matching our design
const nexusTheme = darkTheme({
  accentColor: "#8b5cf6",
  accentColorForeground: "white",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "small",
});

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={nexusTheme}
          modalSize="compact"
          initialChain={mainnet}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
