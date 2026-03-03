# Web3 AI Skills

> 🚀 AI Agent templates for Web3 development — Solidity, Rust, DApp frontends, auditing, RPC, and indexing.

Supercharge your AI coding assistant with specialized Web3 knowledge. This package provides ready-to-use agent configurations, skills, and workflows for building on EVM chains, Solana, and beyond.

---

## Quick Start

### Option 1: npx (no install)
```bash
npx @dilukangelo/web3-ai-skills init
```

### Option 2: Global install
```bash
npm install -g @dilukangelo/web3-ai-skills
web3-ai-skills init
# or shorthand:
w3ai init
```

This creates a `.agent/` folder in your current directory with all Web3 agents, skills, and workflows.

---

## What's Included

### 🤖 6 Specialist Agents

| Agent | Focus |
|-------|-------|
| **solidity-expert** | EVM smart contracts, Foundry, Hardhat, gas optimization |
| **rust-web3** | Solana (Anchor), CosmWasm, Arbitrum Stylus |
| **web3-frontend** | Next.js 15+, RainbowKit v2, Wagmi v2, viem |
| **contract-auditor** | Slither, Mythril, Aderyn, manual review |
| **web3-infra** | RPC optimization, Multicall3, MEV protection |
| **web3-orchestrator** | Multi-agent coordination for full-stack DApps |

### 🧩 8 Skills

| Skill | Description |
|-------|-------------|
| **solidity-patterns** | Solidity 0.8.x+, ERC standards, gas optimization |
| **rust-smart-contracts** | Anchor/Solana, CosmWasm, Stylus |
| **rainbowkit-wagmi** | Wallet integration, SIWE, multi-chain |
| **smart-contract-auditing** | Audit methodology, vulnerability taxonomy |
| **dapp-patterns** | IPFS, ENS, token gating, account abstraction |
| **rpc-optimization** | Multicall3, batching, caching, MEV protection |
| **subgraph-indexing** | The Graph, Ponder, Subsquid, Envio |
| **clean-code** | Web3-specific coding standards |

### 🔄 4 Workflows

| Command | Description |
|---------|-------------|
| `/deploy-contract` | Deploy & verify smart contracts |
| `/audit` | Run security audit |
| `/create-dapp` | Scaffold new DApp |
| `/create-contract` | Scaffold new contract project |

---

## Usage

After running `init`, your project will have a `.agent/` folder:

```
.agent/
├── GEMINI.md            # Core AI instructions
├── ARCHITECTURE.md      # System overview
├── agents/              # 6 specialist agents
├── skills/              # 8 domain skills
├── workflows/           # 4 slash commands
└── scripts/             # Validation scripts
```

Your AI assistant will automatically pick the right agent based on your request:
- Writing Solidity? → `solidity-expert` agent activates
- Building a DApp frontend? → `web3-frontend` agent activates
- Auditing a contract? → `contract-auditor` agent activates

---

## CLI Options

```bash
# Init with default directory (.agent)
web3-ai-skills init

# Init to custom directory
web3-ai-skills init --dir .my-agents

# Force overwrite existing files
web3-ai-skills init --force
```

---

## Supported Chains & Ecosystems

**EVM**: Ethereum, Polygon, Arbitrum, Base, Optimism, Monad, ApeChain  
**Non-EVM**: Solana (Anchor), CosmWasm, Arbitrum Stylus  
**Indexers**: The Graph, Ponder, Subsquid, Envio, Goldsky  
**Wallets**: RainbowKit, ConnectKit, Privy, Dynamic, Web3Modal  

---

## License

MIT
