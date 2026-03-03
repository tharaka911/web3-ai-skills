---
name: rainbowkit-wagmi
description: RainbowKit v2, Wagmi v2, viem v2, wallet integration patterns, SIWE, multi-chain configuration, contract interaction hooks. Use when building DApp frontends with wallet connectivity.
---

# RainbowKit + Wagmi — DApp Wallet Integration

Expert knowledge for building Web3 frontend applications with modern wallet integration libraries.

## Use this skill when

- Setting up wallet connection in a DApp
- Writing contract interaction hooks with Wagmi
- Configuring multi-chain support
- Implementing SIWE (Sign-In with Ethereum)
- Building transaction UIs with proper state management

## Do not use this skill when

- Writing smart contracts (use `solidity-patterns` or `rust-smart-contracts`)
- Setting up RPC infrastructure (use `rpc-optimization`)

---

## Setup (Next.js 15 + App Router)

### Installation
```bash
npm install @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

### Configuration
```typescript
// lib/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'My DApp',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!, // WalletConnect
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
})
```

### Provider Setup
```typescript
// app/providers.tsx
'use client'

import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### Root Layout
```typescript
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

---

## Contract Interaction Patterns

### Reading Contract Data
```typescript
import { useReadContract, useReadContracts } from 'wagmi'
import { formatEther } from 'viem'

// Single read
const { data: balance } = useReadContract({
  address: TOKEN_ADDRESS,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [userAddress],
})

// Batch reads (Multicall under the hood)
const { data: results } = useReadContracts({
  contracts: [
    { address: TOKEN, abi: erc20Abi, functionName: 'name' },
    { address: TOKEN, abi: erc20Abi, functionName: 'symbol' },
    { address: TOKEN, abi: erc20Abi, functionName: 'totalSupply' },
  ],
})
```

### Writing to Contracts
```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'

function MintButton() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  return (
    <button
      disabled={isPending || isConfirming}
      onClick={() =>
        writeContract({
          address: NFT_ADDRESS,
          abi: nftAbi,
          functionName: 'mint',
          args: [1n],
          value: parseEther('0.05'),
        })
      }
    >
      {isPending ? 'Confirm in wallet...' :
       isConfirming ? 'Confirming...' :
       isSuccess ? 'Minted!' : 'Mint NFT'}
    </button>
  )
}
```

### Event Watching
```typescript
import { useWatchContractEvent } from 'wagmi'

useWatchContractEvent({
  address: TOKEN_ADDRESS,
  abi: erc20Abi,
  eventName: 'Transfer',
  onLogs(logs) {
    logs.forEach(log => {
      console.log('Transfer:', log.args.from, '→', log.args.to, log.args.value)
    })
  },
})
```

---

## Account & Chain Hooks

```typescript
import { useAccount, useChainId, useSwitchChain, useBalance } from 'wagmi'

// Current wallet state
const { address, isConnected, chain } = useAccount()

// Native balance
const { data: balance } = useBalance({ address })

// Chain switching
const { switchChain } = useSwitchChain()
switchChain({ chainId: base.id })
```

---

## SIWE (Sign-In with Ethereum)

```typescript
import { useSignMessage } from 'wagmi'
import { SiweMessage } from 'siwe'

const { signMessageAsync } = useSignMessage()

async function signIn() {
  const message = new SiweMessage({
    domain: window.location.host,
    address: userAddress,
    statement: 'Sign in to My DApp',
    uri: window.location.origin,
    version: '1',
    chainId: chainId,
    nonce: await fetchNonce(), // from your backend
  })

  const signature = await signMessageAsync({
    message: message.prepareMessage(),
  })

  // Send signature + message to backend for verification
  await verifyOnBackend(message, signature)
}
```

---

## Custom Chain Configuration

```typescript
import { defineChain } from 'viem'

export const monad = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
})
```

---

## Alternative Wallet Libraries

### ConnectKit
```bash
npm install connectkit wagmi viem
```
Minimal, focused wallet modal with great defaults.

### Privy
```bash
npm install @privy-io/react-auth
```
Embedded wallets, email/social login for Web2 → Web3 onboarding.

### Dynamic
```bash
npm install @dynamic-labs/sdk-react-core
```
Enterprise-grade, supports MPC wallets.

---

## Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Use ethers.js | Use viem (type-safe, tree-shakeable) |
| Hardcode chain IDs | Use wagmi chain objects |
| Skip pending states | Show full tx lifecycle |
| Ignore wallet errors | Catch and display user-friendly messages |
| Fetch on every render | Use TanStack Query caching |
| Store wallet state manually | Let wagmi manage it |
