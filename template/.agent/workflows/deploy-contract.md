---
description: Deploy and verify smart contracts on EVM chains using Foundry or Hardhat.
---

# /deploy-contract - Smart Contract Deployment

$ARGUMENTS

---

## Purpose

Deploy and verify smart contracts on EVM-compatible chains with pre-flight security checks.

---

## Sub-commands

```
/deploy-contract              - Interactive deployment wizard
/deploy-contract testnet      - Deploy to testnet
/deploy-contract mainnet      - Deploy to mainnet
/deploy-contract verify       - Verify already-deployed contract
```

---

## Pre-Deployment Checklist

```markdown
## 🚀 Smart Contract Pre-Deploy Checklist

### Security
- [ ] All tests passing (`forge test` or `npx hardhat test`)
- [ ] No Slither critical/high findings
- [ ] Access control verified on all admin functions
- [ ] Reentrancy guards in place
- [ ] Custom errors used (not require strings)

### Gas Optimization
- [ ] Storage variables packed
- [ ] `calldata` used for read-only params
- [ ] No unbounded loops

### Configuration
- [ ] Constructor args correct for target chain
- [ ] RPC URL and deployer key set in `.env`
- [ ] Etherscan/Blockscout API key for verification
- [ ] Chain ID matches target network

### Ready to deploy? (y/n)
```

---

## Deployment Flow

### Foundry
```bash
# Deploy
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_KEY \
  -vvvv

# Verify separately
forge verify-contract <ADDRESS> MyContract \
  --chain <CHAIN_ID> \
  --etherscan-api-key $ETHERSCAN_KEY
```

### Hardhat
```bash
# Deploy
npx hardhat run scripts/deploy.ts --network mainnet

# Verify
npx hardhat verify --network mainnet <ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## Post-Deployment

```markdown
## ✅ Deployment Complete

### Summary
- **Contract:** MyToken
- **Address:** 0x...
- **Chain:** Base (8453)
- **Tx Hash:** 0x...
- **Block:** 12345678
- **Gas Used:** 1,234,567

### Verification
- ✅ Verified on BaseScan
- 🔗 https://basescan.org/address/0x...

### Next Steps
- [ ] Transfer ownership to multisig
- [ ] Set up monitoring (Tenderly/OpenZeppelin Defender)
- [ ] Update frontend contract addresses
- [ ] Create subgraph for indexing
```

---

## Supported Chains

| Chain | RPC | Explorer |
|-------|-----|----------|
| Ethereum | `ETH_RPC_URL` | etherscan.io |
| Polygon | `POLYGON_RPC_URL` | polygonscan.com |
| Arbitrum | `ARBITRUM_RPC_URL` | arbiscan.io |
| Base | `BASE_RPC_URL` | basescan.org |
| Optimism | `OP_RPC_URL` | optimistic.etherscan.io |
| Monad | `MONAD_RPC_URL` | monadexplorer.com |
