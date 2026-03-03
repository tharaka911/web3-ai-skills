---
name: subgraph-indexing
description: Chain indexing with The Graph, Ponder, Envio, and custom indexers. Event-driven data, GraphQL APIs, entity relationships, and real-time sync.
---

# Subgraph & Indexing — Blockchain Data Access

Expert knowledge for building efficient blockchain data indexing solutions.

## Use this skill when

- Building subgraphs for The Graph
- Setting up Ponder or Envio indexers
- Creating real-time data feeds from on-chain events
- Designing entity schemas for blockchain data
- Querying historical blockchain data efficiently

---

## The Graph (Subgraph)

### Project Structure
```
subgraph/
├── schema.graphql       # Entity definitions
├── subgraph.yaml        # Data source manifest
├── src/
│   ├── token.ts         # Event handlers
│   └── utils.ts         # Helper functions
├── tests/
│   └── token.test.ts    # Matchstick unit tests
├── package.json
└── tsconfig.json
```

### Schema Definition
```graphql
# schema.graphql
type Token @entity {
  id: Bytes!
  name: String!
  symbol: String!
  totalSupply: BigInt!
  holders: [TokenHolder!]! @derivedFrom(field: "token")
}

type TokenHolder @entity {
  id: Bytes!  # address
  token: Token!
  balance: BigInt!
  transferCount: BigInt!
}

type Transfer @entity(immutable: true) {
  id: Bytes!
  from: Bytes!
  to: Bytes!
  value: BigInt!
  blockNumber: BigInt!
  timestamp: BigInt!
  transactionHash: Bytes!
}
```

### Event Handlers
```typescript
// src/token.ts
import { Transfer as TransferEvent } from '../generated/Token/Token'
import { Token, TokenHolder, Transfer } from '../generated/schema'

export function handleTransfer(event: TransferEvent): void {
  // Create Transfer entity (immutable — never updated)
  let transfer = new Transfer(event.transaction.hash.concatI32(event.logIndex.toI32()))
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.value = event.params.value
  transfer.blockNumber = event.block.number
  transfer.timestamp = event.block.timestamp
  transfer.transactionHash = event.transaction.hash
  transfer.save()

  // Update holder balances
  updateHolder(event.params.from, event.params.value.neg())
  updateHolder(event.params.to, event.params.value)
}
```

### Deployment
```bash
# Build
graph codegen && graph build

# Deploy to Subgraph Studio
graph deploy --studio my-subgraph

# Deploy to hosted service
graph deploy --node https://api.thegraph.com/deploy/ my-org/my-subgraph
```

---

## Ponder (TypeScript Indexer)

### Configuration
```typescript
// ponder.config.ts
import { createConfig } from '@ponder/core'
import { http } from 'viem'
import { TokenAbi } from './abis/Token'

export default createConfig({
  networks: {
    mainnet: {
      chainId: 1,
      transport: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    Token: {
      network: 'mainnet',
      abi: TokenAbi,
      address: '0x...',
      startBlock: 18_000_000,
    },
  },
})
```

### Schema
```typescript
// ponder.schema.ts
import { createSchema } from '@ponder/core'

export default createSchema((p) => ({
  Token: p.createTable({
    id: p.hex(),
    name: p.string(),
    symbol: p.string(),
    totalSupply: p.bigint(),
  }),
  Transfer: p.createTable({
    id: p.string(),
    from: p.hex(),
    to: p.hex(),
    value: p.bigint(),
    timestamp: p.int(),
  }),
}))
```

### Event Handlers
```typescript
// src/Token.ts
import { ponder } from '@/generated'

ponder.on('Token:Transfer', async ({ event, context }) => {
  const { from, to, value } = event.args

  await context.db.Transfer.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: { from, to, value, timestamp: Number(event.block.timestamp) },
  })
})
```

---

## Indexer Selection Guide

| Tool | Best For | Language | Hosting |
|------|----------|----------|---------|
| **The Graph** | Decentralized, production | AssemblyScript | Decentralized |
| **Ponder** | TypeScript-native, fast dev | TypeScript | Self-hosted |
| **Envio** | High-performance, HyperSync | TypeScript | Managed |
| **Goldsky** | Mirror + Subgraphs | GraphQL | Managed |
| **Subsquid** | Multi-chain, archive data | TypeScript | Managed |
| **Custom** | Full control | Any | Self-hosted |

---

## GraphQL Query Patterns

```graphql
# Get recent transfers
query RecentTransfers {
  transfers(
    first: 10
    orderBy: blockNumber
    orderDirection: desc
    where: { value_gt: "1000000000000000000" }
  ) {
    from
    to
    value
    blockNumber
    transactionHash
  }
}

# Get top holders
query TopHolders($token: Bytes!) {
  tokenHolders(
    first: 100
    orderBy: balance
    orderDirection: desc
    where: { token: $token }
  ) {
    id
    balance
    transferCount
  }
}
```

---

## Best Practices

- Use `immutable: true` for event entities (never need updates)
- Cache derived values instead of computing in queries
- Use `@derivedFrom` for reverse lookups
- Index only the data you need — less storage, faster sync
- Handle chain reorgs gracefully
- Test handlers with Matchstick or local tests
- Monitor indexing health and sync lag
