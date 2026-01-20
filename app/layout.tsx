"use client";

import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Web3Provider } from "./providers/Web3Provider";
import { NexusProvider } from "./nexus/NexusProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Avail Nexus Concepts</title>
        <meta
          name="description"
          content="Interactive examples demonstrating Avail Nexus SDK concepts"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Web3Provider>
          <NexusProvider>{children}</NexusProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
