---
name: rpc-optimization
description: RPC provider management, Multicall3 batching, WebSocket streaming, MEV protection, retry strategies, load balancing, and caching for Web3 applications.
---

# RPC Optimization — Web3 Data Layer Performance

Expert knowledge for optimizing RPC communication between DApps and blockchains.

## Use this skill when

- Setting up RPC providers and failover
- Implementing Multicall3 for batch reads
- Optimizing DApp load times and data fetching
- Implementing MEV protection for transactions
- Setting up WebSocket event streaming
- Configuring multi-chain RPC infrastructure

---

## Multicall3

### Universal Address
All EVM chains: `0xcA11bde05977b3631167028862bE2a173976CA11`

### viem Multicall
```typescript
import { multicall } from 'viem/actions'

const results = await multicall(client, {
  contracts: [
    { address: token, abi: erc20Abi, functionName: 'balanceOf', args: [user] },
    { address: token, abi: erc20Abi, functionName: 'totalSupply' },
    { address: nft, abi: erc721Abi, functionName: 'ownerOf', args: [1n] },
  ],
  allowFailure: true, // Don't revert if one call fails
})

// results[0].result → balance
// results[1].result → totalSupply
// results[2].result → owner
```

### Batch Size Guidelines
| Chain | Recommended Batch | Max Batch |
|-------|------------------|-----------|
| Ethereum | 50-100 calls | ~500 |
| Polygon | 100-200 calls | ~1000 |
| Arbitrum | 100-200 calls | ~1000 |
| Base | 100-200 calls | ~1000 |
| Solana | Use getProgramAccounts | N/A |

---

## Provider Configuration

### Multi-Provider Failover
```typescript
import { createClient, http, fallback } from 'viem'

const client = createClient({
  chain: mainnet,
  transport: fallback([
    http('https://eth-mainnet.g.alchemy.com/v2/KEY'),
    http('https://mainnet.infura.io/v3/KEY'),
    http('https://rpc.ankr.com/eth'),
  ], {
    rank: true,        // Auto-rank by latency
    retryCount: 3,     // Retry failed requests
    retryDelay: 150,   // ms between retries
  }),
})
```

### WebSocket for Real-Time
```typescript
import { createPublicClient, webSocket } from 'viem'

const wsClient = createPublicClient({
  chain: mainnet,
  transport: webSocket('wss://eth-mainnet.g.alchemy.com/v2/KEY'),
})

// Watch for new blocks
const unwatch = wsClient.watchBlocks({
  onBlock: (block) => console.log('New block:', block.number),
})

// Watch contract events
wsClient.watchContractEvent({
  address: contractAddress,
  abi: contractAbi,
  eventName: 'Transfer',
  onLogs: (logs) => handleTransferEvents(logs),
})
```

---

## Caching Strategies

### Block Data Caching
```typescript
// Confirmed blocks are immutable — cache aggressively
const CACHE_DURATION = {
  latestBlock: 12_000,       // 12s (1 block)
  confirmedBlock: Infinity,  // Never expires
  pendingTx: 0,              // Never cache
  balance: 15_000,           // 15s
  contractState: 30_000,     // 30s
}
```

### TanStack Query Integration
```typescript
const { data } = useReadContract({
  ...contractConfig,
  query: {
    staleTime: 30_000,      // Consider fresh for 30s
    gcTime: 5 * 60_000,     // Keep in cache for 5min
    refetchInterval: 15_000, // Refresh every 15s
  },
})
```

---

## MEV Protection

### Transaction Submission
```typescript
import { createWalletClient, http } from 'viem'

// Use Flashbots Protect RPC for private submission
const protectedClient = createWalletClient({
  chain: mainnet,
  transport: http('https://rpc.flashbots.net'),
})

// Transaction goes to private mempool → no sandwich attacks
```

### Protection Methods
| Method | Provider | Chains |
|--------|----------|--------|
| **Flashbots Protect** | Flashbots | Ethereum |
| **MEV Blocker** | CoW Protocol | Ethereum |
| **Bloxroute** | Bloxroute | Ethereum, BSC |
| **Private RPCs** | Direct builder | Various |

---

## Rate Limiting & Error Handling

### Retry with Backoff
```typescript
async function rpcCallWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries) throw error
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Unreachable')
}
```

### Common RPC Error Codes
| Code | Meaning | Action |
|------|---------|--------|
| -32005 | Rate limited | Backoff and retry |
| -32000 | Execution error | Check tx params |
| -32602 | Invalid params | Fix request format |
| -32603 | Internal error | Try different provider |

---

## Provider Comparison (2026)

| Provider | Free Tier | Best Feature |
|----------|-----------|-------------|
| **Alchemy** | 300M CU/month | Enhanced APIs, NFT data |
| **Infura** | 100K req/day | MetaMask integration |
| **QuickNode** | 10M credits | Addon marketplace |
| **Ankr** | Limited free | Decentralized |
| **dRPC** | Pay-per-use | Multi-provider |
| **Chainstack** | 3M req/month | Dedicated nodes |
