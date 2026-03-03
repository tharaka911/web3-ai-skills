---
description: Scaffold a new smart contract project with Foundry or Hardhat.
---

# /create-contract - Scaffold Smart Contract Project

$ARGUMENTS

---

## Purpose

Scaffold a new smart contract project with testing framework, deployment scripts, and CI configuration.

---

## Sub-commands

```
/create-contract             - Interactive wizard
/create-contract foundry      - Foundry project
/create-contract hardhat      - Hardhat project
```

---

## Scaffold Wizard

### Step 1: Framework
```
Which framework?
1. Foundry — recommended (fast, Solidity tests)
2. Hardhat — mature (TypeScript tests, plugins)
```

### Step 2: Contract Type
```
What type of contract?
1. ERC-20 Token
2. ERC-721 NFT
3. ERC-1155 Multi-Token
4. ERC-4626 Vault
5. Governor (Governance)
6. Custom
```

### Step 3: Features
```
Include? (multi-select)
1. Upgradeable (UUPS)
2. Access Control (Ownable / Roles)
3. Pausable
4. Permit (Gasless approvals)
5. Royalties (ERC-2981)
```

---

## Generated Structure (Foundry)

```
my-contracts/
├── src/
│   ├── MyToken.sol
│   ├── interfaces/
│   │   └── IMyToken.sol
│   └── libraries/
│       └── MathLib.sol
├── test/
│   ├── MyToken.t.sol
│   └── invariants/
│       └── MyToken.invariant.sol
├── script/
│   └── Deploy.s.sol
├── foundry.toml
├── remappings.txt
├── .env.example
└── .github/
    └── workflows/
        └── ci.yml
```

---

## Generated foundry.toml

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.24"
optimizer = true
optimizer_runs = 200
via_ir = false

[profile.default.fuzz]
runs = 1000
max_test_rejects = 65536

[profile.default.invariant]
runs = 256
depth = 15

[fmt]
bracket_spacing = true
int_types = "long"
line_length = 120
multiline_func_header = "attributes_first"
number_underscore = "thousands"
quote_style = "double"
tab_width = 4
```

---

## Post-Scaffold

```markdown
## ✅ Contract Project Created!

### Quick Start
1. `cp .env.example .env`
2. Add deployer private key and RPC URLs
3. `forge build` — compile
4. `forge test` — run tests
5. `forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast` — deploy

### Next Steps
- [ ] Write contract logic
- [ ] Add comprehensive tests (unit + fuzz + invariant)
- [ ] Run `/audit` before deploying
- [ ] Deploy to testnet first
```
