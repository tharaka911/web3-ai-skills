---
description: Scaffold a new DApp with wallet integration, contract hooks, and multi-chain support.
---

# /create-dapp - Scaffold New DApp

$ARGUMENTS

---

## Purpose

Scaffold a complete DApp frontend with wallet connection, contract interaction, and multi-chain configuration.

---

## Sub-commands

```
/create-dapp               - Interactive DApp wizard
/create-dapp next           - Next.js + RainbowKit
/create-dapp vite           - Vite + RainbowKit
```

---

## Scaffold Wizard

### Step 1: Framework
```
Which framework?
1. Next.js 15 (App Router) — recommended
2. Vite + React
```

### Step 2: Wallet Kit
```
Which wallet integration?
1. RainbowKit — recommended (beautiful, customizable)
2. ConnectKit — minimal
3. Privy — embedded wallets + social login
4. Dynamic — enterprise
```

### Step 3: Chains
```
Which chains? (multi-select)
1. Ethereum
2. Polygon
3. Arbitrum
4. Base
5. Optimism
6. Monad
7. Custom chain
```

### Step 4: Features
```
Include? (multi-select)
1. SIWE (Sign-In with Ethereum)
2. Contract interaction hooks
3. ENS resolution
4. Token gating
5. Dark mode
```

---

## Generated Structure

```
my-dapp/
├── app/
│   ├── layout.tsx         # Root + Providers
│   ├── page.tsx           # Landing
│   └── providers.tsx      # Wagmi + Rainbow + Query
├── components/
│   ├── ConnectButton.tsx
│   └── TransactionButton.tsx
├── hooks/
│   └── useContract.ts
├── lib/
│   ├── wagmi.ts           # Config
│   ├── chains.ts          # Chain definitions
│   └── contracts.ts       # ABIs + addresses
├── .env.example
├── package.json
└── next.config.ts
```

---

## Post-Scaffold

```markdown
## ✅ DApp Scaffolded!

### Quick Start
1. `cp .env.example .env.local`
2. Add your WalletConnect Project ID
3. Add your RPC URLs
4. `npm run dev`

### Next Steps
- [ ] Add contract ABIs to `lib/contracts.ts`
- [ ] Create contract interaction pages
- [ ] Deploy smart contracts
- [ ] Connect frontend to deployed contracts
```
