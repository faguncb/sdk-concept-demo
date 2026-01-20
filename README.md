# 🌉 Avail Nexus Concepts - A Beginner's Guide

> **Avail Nexus** is a meta-interoperability protocol that makes blockchain interactions seamless across multiple chains. Think of it as a universal translator and courier service for your crypto assets.

---

## 📑 Table of Contents

1. [Chain Abstraction](#1-chain-abstraction)
2. [Unified Balances](#2-unified-balances)
3. [Allowances](#3-allowances)
4. [Intent](#4-intent)
5. [Solvers](#5-solvers)
6. [Intent Lifecycle](#6-intent-lifecycle)
7. [Bridge Functions](#7-bridge-functions)
8. [Swap Functions](#8-swap-functions)
9. [Source Chain Selection](#9-source-chain-selection)
10. [Bridge vs Swap Balances](#10-bridge-vs-swap-balances)

---

## 1. Chain Abstraction

### What is it? 🤔

**Chain Abstraction** is the core philosophy of Nexus. Imagine you have money in different bank accounts across different countries. Normally, you'd need to manually transfer money between accounts, deal with exchange rates, and wait for processing. Chain Abstraction eliminates all that hassle.

### The Problem It Solves

Without Chain Abstraction:
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Ethereum   │    │   Polygon   │    │    Base     │
│   100 USDC  │    │   50 USDC   │    │   30 USDC   │
└─────────────┘    └─────────────┘    └─────────────┘
        │                 │                  │
        └─────────────────┼──────────────────┘
                          │
              User needs to manually:
              1. Switch networks
              2. Bridge tokens
              3. Pay multiple gas fees
              4. Wait for confirmations
```

With Chain Abstraction:
```
┌─────────────────────────────────────────────────────┐
│              Your Unified Balance: 180 USDC         │
│                                                      │
│   Ethereum (100) + Polygon (50) + Base (30)         │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
              One transaction, one approval!
```

### Real-World Analogy

Think of it like Apple Pay. You don't care which card the money comes from - you just tap your phone and pay. Chain Abstraction works the same way for blockchain transactions.

### Code Example

```typescript
// Without Nexus (old way) 😫
// Step 1: Switch to Ethereum
await wallet.switchNetwork(1);
// Step 2: Approve USDC
await usdcContract.approve(bridgeAddress, amount);
// Step 3: Bridge to Polygon
await bridge.transfer(amount, polygonChainId);
// Step 4: Wait 10-30 minutes...
// Step 5: Switch to Polygon
await wallet.switchNetwork(137);
// Step 6: Finally use your tokens
await defiApp.deposit(amount);

// With Nexus (new way) 🎉
const sdk = new NexusSDK({ network: 'mainnet' });
await sdk.bridgeAndExecute({
  token: 'USDC',
  amount: 100_000_000n, // 100 USDC
  toChainId: 137,       // Polygon
  execute: {
    to: defiAppAddress,
    data: depositCalldata
  }
});
// Done! One approval, one transaction!
```

---

## 2. Unified Balances

### What is it? 🤔

**Unified Balances** aggregate all your token balances across multiple blockchains into a single view. Instead of checking each chain separately, you see one total balance.

### The Problem It Solves

Without Unified Balances:
```
You: "How much USDC do I have?"

Answer: "Well, you need to check:
- Ethereum: 100 USDC
- Polygon: 50 USDC  
- Arbitrum: 75 USDC
- Base: 25 USDC
- Optimism: 30 USDC
...and remember to add them up!"
```

With Unified Balances:
```
You: "How much USDC do I have?"

Answer: "280 USDC total"
```

### Code Example

```typescript
import { NexusSDK } from '@avail-project/nexus-core';

const sdk = new NexusSDK({ network: 'mainnet' });
await sdk.initialize(window.ethereum);

// Get all your balances across chains
const balances = await sdk.getUnifiedBalances();

console.log(balances);
// Output:
// {
//   USDC: {
//     total: 280000000n,  // 280 USDC (6 decimals)
//     chains: {
//       1: 100000000n,    // Ethereum
//       137: 50000000n,   // Polygon
//       42161: 75000000n, // Arbitrum
//       8453: 25000000n,  // Base
//       10: 30000000n     // Optimism
//     }
//   },
//   ETH: {
//     total: 2500000000000000000n,  // 2.5 ETH
//     chains: { ... }
//   }
// }
```

### Visual Representation

```
┌────────────────────────────────────────────────────────────┐
│                    UNIFIED BALANCE VIEW                     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│   💵 USDC                                     280.00 USDC   │
│   ├── Ethereum (Chain ID: 1)                 100.00 USDC   │
│   ├── Polygon (Chain ID: 137)                 50.00 USDC   │
│   ├── Arbitrum (Chain ID: 42161)              75.00 USDC   │
│   ├── Base (Chain ID: 8453)                   25.00 USDC   │
│   └── Optimism (Chain ID: 10)                 30.00 USDC   │
│                                                             │
│   ⟠ ETH                                          2.50 ETH   │
│   ├── Ethereum (Chain ID: 1)                     1.00 ETH   │
│   ├── Arbitrum (Chain ID: 42161)                 0.80 ETH   │
│   └── Base (Chain ID: 8453)                      0.70 ETH   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Allowances

### What is it? 🤔

**Allowances** are permissions you give to smart contracts to spend your tokens on your behalf. Think of it like authorizing a recurring payment - you're telling the contract "you can take up to X amount from my wallet."

### Why Are They Needed?

In ERC-20 tokens, a contract can't just take your tokens. You must explicitly approve it first. This is a security feature!

### The Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ALLOWANCE FLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Check Current Allowance                             │
│  ┌────────────────────────────────────────┐                  │
│  │  "Contract X can spend 0 USDC"         │                  │
│  └────────────────────────────────────────┘                  │
│                          │                                   │
│                          ▼                                   │
│  Step 2: Set Allowance (User Approval Required)              │
│  ┌────────────────────────────────────────┐                  │
│  │  🔐 "Allow Contract X to spend          │                  │
│  │      up to 100 USDC?"                   │                  │
│  │                                         │                  │
│  │     [Approve] [Reject]                 │                  │
│  └────────────────────────────────────────┘                  │
│                          │                                   │
│                          ▼                                   │
│  Step 3: Transaction Can Now Proceed                         │
│  ┌────────────────────────────────────────┐                  │
│  │  Contract X transfers 50 USDC          │                  │
│  │  Remaining allowance: 50 USDC          │                  │
│  └────────────────────────────────────────┘                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Code Example

```typescript
import { NexusSDK } from '@avail-project/nexus-core';

const sdk = new NexusSDK({ network: 'mainnet' });
await sdk.initialize(window.ethereum);

// Check current allowances
const allowances = await sdk.getAllowance(137, ['USDC', 'USDT']);
console.log(allowances);
// [
//   { token: 'USDC', allowance: 0n, spender: '0x...' },
//   { token: 'USDT', allowance: 1000000n, spender: '0x...' }
// ]

// Set allowance (minimum amount needed)
await sdk.setAllowance(137, ['USDC'], 100_000_000n);

// Or let Nexus handle it automatically with hooks
sdk.setOnAllowanceHook(({ sources, allow, deny }) => {
  // Show user a dialog explaining what's being approved
  if (userApproves) {
    allow(['min']); // Approve minimum needed (safest)
    // or allow(['max']); // Approve unlimited (convenient but less safe)
  } else {
    deny();
  }
});

// Revoke allowance when done (good security practice!)
await sdk.revokeAllowance(137, ['USDC']);
```

### Security Tips 🔒

| Approach | Pros | Cons |
|----------|------|------|
| **Minimum Allowance** | Most secure | Requires approval each time |
| **Exact Amount** | Balanced approach | Still needs multiple approvals |
| **Unlimited (Max)** | Most convenient | Risky if contract is compromised |

---

## 4. Intent

### What is it? 🤔

An **Intent** is a declaration of what you want to achieve, rather than how to achieve it. Instead of specifying exact steps, you tell Nexus: "I want to end up with 100 USDC on Polygon" and let the system figure out the best way to make it happen.

### Traditional Transaction vs Intent

```
┌─────────────────────────────────────────────────────────────┐
│              TRADITIONAL TRANSACTION                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  You must specify EXACTLY:                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  • From: Ethereum                                       ││
│  │  • To: Polygon                                          ││
│  │  • Amount: 100 USDC                                     ││
│  │  • Bridge: Stargate                                     ││
│  │  • Route: ETH → Stargate → Polygon                      ││
│  │  • Gas: 0.005 ETH                                       ││
│  │  • Slippage: 0.5%                                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      INTENT                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  You simply say:                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  "I want 100 USDC on Polygon"                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  Nexus figures out:                                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  ✓ Best source chain (where you have funds)             ││
│  │  ✓ Optimal bridge route                                 ││
│  │  ✓ Gas optimization                                     ││
│  │  ✓ Best price execution                                 ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Real-World Analogy

**Traditional**: "I want you to drive on Highway 101, then take Exit 45, turn left at the light, go 2 miles, then turn right..."

**Intent**: "Take me to the airport." (The driver/GPS figures out the best route)

### Code Example

```typescript
import { NexusSDK } from '@avail-project/nexus-core';

const sdk = new NexusSDK({ network: 'mainnet' });
await sdk.initialize(window.ethereum);

// The Intent Hook - where you review and approve intents
sdk.setOnIntentHook(({ intent, allow, deny, refresh }) => {
  console.log('Intent Details:', intent);
  // {
  //   sources: [
  //     { chainId: 1, amount: 50000000n },   // 50 USDC from Ethereum
  //     { chainId: 42161, amount: 50000000n } // 50 USDC from Arbitrum
  //   ],
  //   destination: {
  //     chainId: 137,
  //     amount: 100000000n  // 100 USDC to Polygon
  //   },
  //   fees: {
  //     bridgeFee: 500000n,     // 0.5 USDC
  //     gasFee: 1000000000000n  // 0.001 ETH
  //   },
  //   estimatedTime: 45 // seconds
  // }
  
  // Show this to the user and let them decide
  if (userApproves) {
    allow();
  } else {
    deny();
  }
  
  // Or refresh to get updated prices
  // refresh();
});

// Execute your intent
await sdk.bridge({
  token: 'USDC',
  amount: 100_000_000n,
  toChainId: 137
});
```

---

## 5. Solvers

### What is it? 🤔

**Solvers** are specialized entities that compete to fulfill your intents. When you express an intent, solvers analyze it and determine the most efficient way to execute it. Think of them as contractors bidding for your job.

### How Solvers Work

```
┌─────────────────────────────────────────────────────────────┐
│                    SOLVER NETWORK                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Intent: "I want 100 USDC on Polygon"                  │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │               SOLVER COMPETITION                        ││
│  ├─────────────────────────────────────────────────────────┤│
│  │                                                         ││
│  │  Solver A: "I can do it for 0.3 USDC fee, 30 seconds"  ││
│  │  Solver B: "I can do it for 0.5 USDC fee, 15 seconds"  ││
│  │  Solver C: "I can do it for 0.2 USDC fee, 45 seconds"  ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Best solver selected based on:                         ││
│  │  • Fee (lowest)                                         ││
│  │  • Speed (fastest)                                      ││
│  │  • Reliability (track record)                           ││
│  │  • Liquidity (can they fulfill it?)                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Real-World Analogy

Imagine you want to ship a package:
- **FedEx**: Fast but expensive
- **UPS**: Balanced speed and price
- **USPS**: Cheap but slower

Solvers work similarly - they compete to offer you the best deal!

### What Solvers Do Behind the Scenes

1. **Liquidity Aggregation**: Find the best sources of tokens
2. **Route Optimization**: Calculate optimal paths across chains
3. **Price Discovery**: Find the best exchange rates
4. **Gas Optimization**: Minimize transaction costs
5. **Execution**: Actually move the tokens

### Benefits for Users

| Benefit | Description |
|---------|-------------|
| **Better Prices** | Competition drives down fees |
| **Faster Execution** | Solvers optimize for speed |
| **More Reliability** | Multiple solvers = redundancy |
| **No Manual Work** | Solvers handle complexity |

---

## 6. Intent Lifecycle

### What is it? 🤔

The **Intent Lifecycle** describes the journey of an intent from creation to completion. Understanding this helps you track transactions and handle edge cases.

### The Complete Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                   INTENT LIFECYCLE                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1️⃣ CREATION                                                 │
│  ┌─────────────────────────────────────────┐                 │
│  │ User calls sdk.bridge() or similar      │                 │
│  │ Intent object is created                │                 │
│  └─────────────────────────────────────────┘                 │
│                     │                                        │
│                     ▼                                        │
│  2️⃣ SIMULATION                                               │
│  ┌─────────────────────────────────────────┐                 │
│  │ System calculates:                       │                 │
│  │ • Required source chains                │                 │
│  │ • Fees and gas estimates                │                 │
│  │ • Expected output amount                │                 │
│  └─────────────────────────────────────────┘                 │
│                     │                                        │
│                     ▼                                        │
│  3️⃣ USER APPROVAL                                            │
│  ┌─────────────────────────────────────────┐                 │
│  │ onIntentHook is triggered               │                 │
│  │ User reviews and approves/denies        │                 │
│  └─────────────────────────────────────────┘                 │
│                     │                                        │
│              ┌──────┴──────┐                                 │
│              ▼             ▼                                 │
│          [Denied]     [Approved]                             │
│              │             │                                 │
│              ▼             ▼                                 │
│  4️⃣ ALLOWANCE CHECK                                          │
│  ┌─────────────────────────────────────────┐                 │
│  │ Check if tokens are approved            │                 │
│  │ Request approval if needed              │                 │
│  └─────────────────────────────────────────┘                 │
│                     │                                        │
│                     ▼                                        │
│  5️⃣ EXECUTION                                                │
│  ┌─────────────────────────────────────────┐                 │
│  │ Solvers execute the intent              │                 │
│  │ Tokens are moved across chains          │                 │
│  │ Events are emitted for tracking         │                 │
│  └─────────────────────────────────────────┘                 │
│                     │                                        │
│                     ▼                                        │
│  6️⃣ COMPLETION                                               │
│  ┌─────────────────────────────────────────┐                 │
│  │ Tokens arrive at destination            │                 │
│  │ Final event emitted with tx hash        │                 │
│  │ User balance updated                    │                 │
│  └─────────────────────────────────────────┘                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Code Example: Tracking the Lifecycle

```typescript
import { NexusSDK, NEXUS_EVENTS } from '@avail-project/nexus-core';

const sdk = new NexusSDK({ network: 'mainnet' });
await sdk.initialize(window.ethereum);

// Track the complete lifecycle
const result = await sdk.bridge(
  {
    token: 'USDC',
    amount: 100_000_000n,
    toChainId: 137
  },
  {
    onEvent: (event) => {
      switch (event.name) {
        case NEXUS_EVENTS.STEPS_LIST:
          console.log('📋 Steps planned:', event.args);
          // ['allowance', 'deposit', 'bridge', 'receive']
          break;
          
        case NEXUS_EVENTS.STEP_COMPLETE:
          console.log('✅ Step completed:', event.args);
          // { 
          //   typeID: 'deposit',
          //   transactionHash: '0x...',
          //   explorerURL: 'https://etherscan.io/tx/...'
          // }
          break;
          
        case NEXUS_EVENTS.ERROR:
          console.error('❌ Error:', event.args);
          break;
      }
    }
  }
);

console.log('🎉 Intent completed!', result);
```

### Lifecycle States

| State | Description | User Action |
|-------|-------------|-------------|
| **Created** | Intent object initialized | Wait |
| **Simulated** | Fees and routes calculated | Review |
| **Pending Approval** | Waiting for user | Approve/Deny |
| **Pending Allowance** | Needs token approval | Sign transaction |
| **Executing** | Being processed by solvers | Wait |
| **Completed** | Successfully finished | Done! |
| **Failed** | Error occurred | Retry or contact support |

---

## 7. Bridge Functions

### What is it? 🤔

**Bridge Functions** are the core operations that move tokens between different blockchains. Nexus provides three main bridge operations:

### The Three Bridge Operations

```
┌─────────────────────────────────────────────────────────────┐
│                    BRIDGE OPERATIONS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1️⃣ BRIDGE                                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Move tokens from multiple chains to ONE destination    ││
│  │                                                         ││
│  │  [ETH: 50 USDC] ─────┐                                  ││
│  │  [ARB: 30 USDC] ─────┼────► [Polygon: 80 USDC]         ││
│  │                      │      (same wallet)               ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  2️⃣ BRIDGE AND TRANSFER                                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Move tokens AND send to a DIFFERENT address            ││
│  │                                                         ││
│  │  Your wallet ─────► Bridge ─────► Friend's wallet       ││
│  │  [ETH: 100 USDC]            [Polygon: 100 USDC]        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  3️⃣ BRIDGE AND EXECUTE                                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Move tokens AND call a smart contract                  ││
│  │                                                         ││
│  │  Your wallet ─► Bridge ─► Smart Contract (e.g., AAVE)  ││
│  │  [ETH: 100 USDC]      [Deposit 100 USDC to AAVE]       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Code Examples

```typescript
import { NexusSDK } from '@avail-project/nexus-core';

const sdk = new NexusSDK({ network: 'mainnet' });
await sdk.initialize(window.ethereum);

// 1️⃣ Basic Bridge - Move to your own wallet
const bridgeResult = await sdk.bridge({
  token: 'USDC',
  amount: 100_000_000n,  // 100 USDC
  toChainId: 137         // To Polygon
});

// 2️⃣ Bridge and Transfer - Send to someone else
const transferResult = await sdk.bridgeAndTransfer({
  token: 'USDC',
  amount: 100_000_000n,
  toChainId: 137,
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96c4b4Db45' // Friend's address
});

// 3️⃣ Bridge and Execute - Deposit to AAVE
const executeResult = await sdk.bridgeAndExecute({
  token: 'USDC',
  amount: 100_000_000n,
  toChainId: 137,
  sourceChains: [1, 42161], // Pull from Ethereum and Arbitrum
  execute: {
    to: '0x794a61358D6845594F94dc1DB02A252b5b4814aD', // AAVE Pool
    data: '0x617ba037...', // Encoded deposit function call
    tokenApproval: {
      token: 'USDC',
      amount: 100_000_000n,
      spender: '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
    }
  }
});
```

### When to Use Each

| Operation | Use Case |
|-----------|----------|
| **Bridge** | Moving tokens to yourself on another chain |
| **Bridge & Transfer** | Sending tokens to someone on another chain |
| **Bridge & Execute** | Using a DeFi app on another chain |

---

## 8. Swap Functions

### What is it? 🤔

**Swap Functions** allow you to exchange one token for another across different chains. Unlike bridges (which move the same token), swaps convert between different tokens.

### Swap Types

```
┌─────────────────────────────────────────────────────────────┐
│                      SWAP TYPES                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1️⃣ EXACT IN (You know what you're spending)                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                         ││
│  │  "I want to spend exactly 100 USDC"                     ││
│  │                                                         ││
│  │  Input:  100 USDC (fixed)                               ││
│  │  Output: ~0.04 ETH (variable, best available)           ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  2️⃣ EXACT OUT (You know what you want to receive)            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                         ││
│  │  "I want to receive exactly 1 ETH"                      ││
│  │                                                         ││
│  │  Input:  ~2,500 USDC (variable, as needed)             ││
│  │  Output: 1 ETH (fixed)                                  ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Code Examples

```typescript
import { NexusSDK } from '@avail-project/nexus-core';

const sdk = new NexusSDK({ network: 'mainnet' });
await sdk.initialize(window.ethereum);

// 1️⃣ Swap Exact In - "I want to spend 100 USDC"
const swapInResult = await sdk.swapWithExactIn(
  {
    from: [
      { 
        chainId: 10,        // Optimism
        amount: 100_000_000n,  // 100 USDC
        tokenAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' // USDC on Optimism
      }
    ],
    toChainId: 8453,  // Base
    toTokenAddress: '0x4200000000000000000000000000000000000006' // WETH on Base
  },
  {
    onEvent: (event) => {
      console.log('Swap progress:', event);
    }
  }
);

// 2️⃣ Swap Exact Out - "I want exactly 1 ETH"
const swapOutResult = await sdk.swapWithExactOut(
  {
    from: [
      {
        chainId: 137,  // Polygon
        tokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
        maxAmount: 3000_000_000n // Max willing to spend (3000 USDC)
      }
    ],
    toChainId: 1,
    toTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    toAmount: 1_000_000_000_000_000_000n // 1 ETH
  }
);
```

### Swap vs Bridge Comparison

| Feature | Bridge | Swap |
|---------|--------|------|
| **Token Change** | Same token (USDC → USDC) | Different tokens (USDC → ETH) |
| **Use Case** | Move assets | Exchange assets |
| **Price Impact** | Minimal (just fees) | Market-dependent |
| **Speed** | Usually faster | May take longer |

---

## 9. Source Chain Selection

### What is it? 🤔

**Source Chain Selection** determines which of your blockchain wallets the funds come from when making a cross-chain operation. Nexus can automatically choose the best sources, or you can specify them manually.

### Automatic vs Manual Selection

```
┌─────────────────────────────────────────────────────────────┐
│                 SOURCE CHAIN SELECTION                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Your Balances:                                              │
│  • Ethereum: 100 USDC                                        │
│  • Polygon: 50 USDC                                          │
│  • Arbitrum: 75 USDC                                         │
│                                                              │
│  You want: 120 USDC on Base                                  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🤖 AUTOMATIC (Nexus chooses)                           ││
│  │                                                         ││
│  │  Nexus analyzes:                                        ││
│  │  • Gas costs on each chain                              ││
│  │  • Bridge fees from each source                         ││
│  │  • Speed of bridging                                    ││
│  │                                                         ││
│  │  Decision: Use Arbitrum (75) + Polygon (45)             ││
│  │  Reason: Lowest total fees!                             ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  👤 MANUAL (You choose)                                 ││
│  │                                                         ││
│  │  You specify: sourceChains: [1]  // Only Ethereum       ││
│  │                                                         ││
│  │  Result: Uses only Ethereum                             ││
│  │  Note: You need 120 USDC but only have 100!            ││
│  │        Transaction will fail.                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Code Examples

```typescript
import { NexusSDK } from '@avail-project/nexus-core';

const sdk = new NexusSDK({ network: 'mainnet' });
await sdk.initialize(window.ethereum);

// 🤖 Automatic Selection (Recommended)
// Let Nexus choose the best sources
const autoResult = await sdk.bridge({
  token: 'USDC',
  amount: 120_000_000n,  // 120 USDC
  toChainId: 8453        // Base
  // No sourceChains specified = automatic
});

// 👤 Manual Selection
// You control exactly where funds come from
const manualResult = await sdk.bridge({
  token: 'USDC',
  amount: 120_000_000n,
  toChainId: 8453,
  sourceChains: [1, 42161]  // Only use Ethereum and Arbitrum
});

// 🎯 Single Source
// Force using only one chain
const singleResult = await sdk.bridge({
  token: 'USDC',
  amount: 50_000_000n,
  toChainId: 8453,
  sourceChains: [137]  // Only Polygon
});
```

### When to Use Each Approach

| Approach | Best For |
|----------|----------|
| **Automatic** | Most users - optimizes for cost/speed |
| **Manual** | When you want to preserve balances on certain chains |
| **Single Source** | Cleaning up small balances from one chain |

---

## 10. Bridge vs Swap Balances

### What is it? 🤔

There are two types of balances in Nexus, and they serve different purposes:

### The Difference

```
┌─────────────────────────────────────────────────────────────┐
│              BRIDGE BALANCES vs SWAP BALANCES                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🌉 BRIDGE BALANCES                                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Tokens that can be MOVED to another chain              ││
│  │                                                         ││
│  │  Supported tokens: USDC, USDT, ETH, etc.                ││
│  │  Supported chains: Ethereum, Polygon, Arbitrum, etc.   ││
│  │                                                         ││
│  │  Example: Move 100 USDC from Ethereum to Polygon        ││
│  │  • Same token on both sides                             ││
│  │  • Uses bridge infrastructure                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  🔄 SWAP BALANCES                                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Tokens that can be EXCHANGED for another token         ││
│  │                                                         ││
│  │  Wider range of tokens supported                        ││
│  │  Uses DEX aggregation                                   ││
│  │                                                         ││
│  │  Example: Convert 100 USDC to ETH                       ││
│  │  • Different tokens involved                            ││
│  │  • Uses swap/exchange infrastructure                    ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Code Example

```typescript
import { NexusSDK } from '@avail-project/nexus-core';

const sdk = new NexusSDK({ network: 'mainnet' });
await sdk.initialize(window.ethereum);

// Get balances for bridging operations
const bridgeBalances = await sdk.getBalancesForBridge();
console.log('Bridge Balances:', bridgeBalances);
// {
//   USDC: { total: 280000000n, chains: {...} },
//   USDT: { total: 150000000n, chains: {...} },
//   ETH: { total: 2500000000000000000n, chains: {...} }
// }

// Get balances for swap operations
const swapBalances = await sdk.getBalancesForSwap();
console.log('Swap Balances:', swapBalances);
// {
//   USDC: { ... },
//   USDT: { ... },
//   ETH: { ... },
//   WBTC: { ... },  // Additional tokens!
//   DAI: { ... },
//   // More tokens available for swaps
// }
```

### Visual Comparison

```
┌────────────────────────────────────────────────────────────┐
│                    BALANCE COMPARISON                       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Token    │  Bridge Balance  │  Swap Balance  │  Notes     │
│  ─────────┼──────────────────┼────────────────┼─────────── │
│  USDC     │    ✅ 280.00     │   ✅ 280.00    │  Both      │
│  USDT     │    ✅ 150.00     │   ✅ 150.00    │  Both      │
│  ETH      │    ✅ 2.50       │   ✅ 2.50      │  Both      │
│  WBTC     │    ❌ N/A        │   ✅ 0.05      │  Swap only │
│  DAI      │    ❌ N/A        │   ✅ 500.00    │  Swap only │
│  LINK     │    ❌ N/A        │   ✅ 25.00     │  Swap only │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### When to Check Each

| Balance Type | Check When |
|--------------|------------|
| **Bridge Balances** | Moving the same token to another chain |
| **Swap Balances** | Converting between different tokens |

---

## 🎓 Summary

Avail Nexus simplifies cross-chain interactions through these key concepts:

| Concept | Purpose | Analogy |
|---------|---------|---------|
| **Chain Abstraction** | Hide blockchain complexity | Apple Pay for crypto |
| **Unified Balances** | See all assets in one place | Bank account summary |
| **Allowances** | Permission to spend tokens | Recurring payment auth |
| **Intent** | Declare what you want | "Take me to the airport" |
| **Solvers** | Compete to fulfill intents | Contractors bidding |
| **Intent Lifecycle** | Track transaction progress | Package tracking |
| **Bridge Functions** | Move tokens between chains | Wire transfer |
| **Swap Functions** | Exchange different tokens | Currency exchange |
| **Source Selection** | Choose where funds come from | Pick payment method |
| **Balance Types** | Different pools for different ops | Checking vs Savings |

---

## 🚀 Next Steps

Ready to start building? Check out:

1. **[Nexus SDK Quickstart](https://docs.availproject.org/nexus/nexus-quickstart)**
2. **[Nexus Examples](https://docs.availproject.org/nexus/nexus-examples)**
3. **[API Reference](https://docs.availproject.org/nexus/avail-nexus-sdk/api-reference)**

---

## 📚 Resources

- **Documentation**: [docs.availproject.org/nexus](https://docs.availproject.org/nexus)
- **GitHub**: [github.com/availproject/nexus-sdk](https://github.com/availproject/nexus-sdk)
- **NPM**: [@avail-project/nexus-core](https://www.npmjs.com/package/@avail-project/nexus-core)
