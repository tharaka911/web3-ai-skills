---
name: subgraph-indexing
description: Chain indexing with The Graph, Ponder, Subsquid, Envio, and custom indexers. Event-driven data, GraphQL APIs, entity relationships, and real-time sync.
---

# Subgraph & Indexing — Blockchain Data Access

Expert knowledge for building efficient blockchain data indexing solutions.

## Use this skill when

- Building subgraphs for The Graph
- Setting up Ponder, Subsquid, or Envio indexers
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

## Subsquid (SQD / Squid SDK)

### Overview
Subsquid is a batch-processing blockchain indexer optimized for high-throughput multi-chain data. Uses the **SQD Network** as a decentralized data lake.

### Project Structure
```
squid/
├── src/
│   ├── processor.ts     # EvmBatchProcessor config
│   ├── main.ts          # Processing logic
│   ├── model/           # TypeORM entities
│   └── abi/             # Generated type-safe ABI wrappers
├── db/
│   └── migrations/      # Database migrations
├── schema.graphql       # Entity definitions (generates model/)
├── squid.yaml           # Deployment manifest
├── commands.json        # CLI commands
└── docker-compose.yml   # Local Postgres + GraphQL
```

### Installation
```bash
# Install Squid CLI
npm i -g @subsquid/cli

# Create new squid from EVM template
sqd init my-squid -t evm

# Generate ABI types
npx squid-evm-typegen src/abi erc721.json
# or from Etherscan:
npx squid-evm-typegen src/abi 0x...contractAddress --etherscan-api https://api.etherscan.io/api
```

### Processor Configuration
```typescript
// src/processor.ts
import { EvmBatchProcessor } from '@subsquid/evm-processor'
import { lookupArchive } from '@subsquid/archive-registry'

export const processor = new EvmBatchProcessor()
  // Use SQD Network for fast batch data access
  .setGateway(lookupArchive('eth-mainnet'))
  // Also connect to RPC for real-time blocks
  .setRpcEndpoint(process.env.RPC_ENDPOINT)
  .setFinalityConfirmation(75)
  .setBlockRange({ from: 18_000_000 })
  .addLog({
    address: ['0x...'], // Contract address
    topic0: [
      // Transfer(address,address,uint256)
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    ],
  })
  .addTransaction({
    to: ['0x...'],
    sighash: ['0xa9059cbb'], // transfer(address,uint256)
  })
  .setFields({
    log: { transactionHash: true },
    transaction: { from: true, value: true, hash: true },
  })
```

### Entity Schema
```graphql
# schema.graphql — generates TypeORM entities
type Token @entity {
  id: ID!
  name: String!
  symbol: String!
  totalSupply: BigInt!
  transfers: [Transfer!]! @derivedFrom(field: "token")
}

type Transfer @entity {
  id: ID!
  token: Token!
  from: String! @index
  to: String! @index
  value: BigInt!
  blockNumber: Int!
  timestamp: DateTime!
}
```
```bash
# Generate TypeORM entities from schema
npx squid-typeorm-codegen
npx squid-typeorm-migration generate
```

### Batch Processing Logic
```typescript
// src/main.ts
import { TypeormDatabase } from '@subsquid/typeorm-store'
import { processor } from './processor'
import { Transfer } from './model'
import * as erc721 from './abi/erc721'

processor.run(new TypeormDatabase(), async (ctx) => {
  const transfers: Transfer[] = []

  for (const block of ctx.blocks) {
    for (const log of block.logs) {
      if (log.topics[0] === erc721.events.Transfer.topic) {
        const { from, to, tokenId } = erc721.events.Transfer.decode(log)

        transfers.push(new Transfer({
          id: log.id,
          from,
          to,
          tokenId: tokenId.toString(),
          blockNumber: block.header.height,
          timestamp: new Date(block.header.timestamp),
        }))
      }
    }
  }

  // Batch insert — much faster than individual saves
  await ctx.store.insert(transfers)
})
```

### Deployment
```bash
# Local development
docker compose up -d   # Start Postgres
npx squid-typeorm-migration apply
node -r dotenv/config lib/main.js

# Deploy to SQD Cloud
sqd deploy .
```

### Key Advantages
| Feature | Detail |
|---------|--------|
| **Batch Processing** | Process 1000s of blocks per batch (faster than event-by-event) |
| **SQD Network** | Decentralized data lake, no RPC needed for historical data |
| **Multi-chain** | 100+ EVM and Substrate networks supported |
| **Type-safe** | ABI typegen for events, functions, and multicall |
| **Multicall Support** | Built-in `Multicall` facade for batch RPC reads |
| **Real-time** | Connect RPC endpoint for latest blocks |

---

## Envio (HyperSync)

### Setup
```bash
npx envio init

# envio.config.ts
export default {
  networks: [{
    id: 1,
    rpc_url: process.env.ETH_RPC_URL,
    contracts: [{
      name: 'Token',
      address: '0x...',
      abi_file_path: './abis/Token.json',
      events: ['Transfer'],
      start_block: 18_000_000,
    }],
  }],
}
```

### Event Handlers (Envio)
```typescript
import { TokenContract } from '../generated/src/Handlers.gen'

TokenContract.Transfer.handler(async ({ event, context }) => {
  const transfer = {
    id: event.transactionHash + '-' + event.logIndex,
    from: event.params.from,
    to: event.params.to,
    value: event.params.value,
  }
  context.Transfer.set(transfer)
})
```

### HyperSync Advantage
- **100x faster** than RPC for historical data
- Raw data streamed from Envio's optimized indices
- No rate limits or throttling

---

## Indexer Selection Guide

| Tool | Best For | Language | Speed | Hosting | Multi-chain |
|------|----------|----------|-------|---------|-------------|
| **The Graph** | Decentralized, production | AssemblyScript | Medium | Decentralized | ✅ |
| **Ponder** | TypeScript-native, fast dev | TypeScript | Fast | Self-hosted | ✅ |
| **Subsquid** | High-throughput, archive data | TypeScript | Very Fast | SQD Cloud | ✅ 100+ |
| **Envio** | Ultra-fast historical sync | TypeScript | Fastest | Managed | ✅ |
| **Goldsky** | Mirror + Subgraphs | GraphQL | Fast | Managed | ✅ |
| **Custom** | Full control | Any | Variable | Self-hosted | Manual |

### When to Use What
- **Decentralized & battle-tested?** → The Graph
- **TypeScript-native, fast iteration?** → Ponder
- **Multi-chain with batch processing?** → Subsquid
- **Fastest historical sync possible?** → Envio (HyperSync)
- **Need subgraphs + real-time streams?** → Goldsky

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

# Subsquid-style query with pagination
query NFTTransfers($owner: String!, $offset: Int) {
  transfers(
    where: { to_eq: $owner }
    limit: 50
    offset: $offset
    orderBy: blockNumber_DESC
  ) {
    tokenId
    from
    to
    blockNumber
    timestamp
  }
}
```

---

## Best Practices

- Use `immutable: true` (Graph) or batch inserts (Subsquid) for event entities
- Cache derived values instead of computing in queries
- Use `@derivedFrom` / `@index` for relationship lookups
- Index only the data you need — less storage, faster sync
- Handle chain reorgs gracefully (use finality confirmations)
- Test handlers with Matchstick (Graph) or unit tests (others)
- Monitor indexing health, sync lag, and data freshness
- Use multicall for batch on-chain reads during indexing
