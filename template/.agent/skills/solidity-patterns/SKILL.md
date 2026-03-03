---
name: solidity-patterns
description: Solidity 0.8.x+ patterns, ERC standards, gas optimization, upgradeable contracts, DeFi integrations. Use when writing or reviewing Solidity smart contracts.
---

# Solidity Patterns — EVM Smart Contract Mastery

Expert knowledge for writing secure, gas-efficient Solidity smart contracts on EVM chains.

## Use this skill when

- Writing new Solidity contracts
- Optimizing gas consumption
- Implementing ERC standards
- Creating upgradeable proxy contracts
- Integrating with DeFi protocols

## Do not use this skill when

- Working with Solana or non-EVM chains (use `rust-smart-contracts`)
- Building frontend code (use `rainbowkit-wagmi`)

## Instructions

1. Identify the contract type and ERC standard needed
2. Apply security patterns (CEI, access control, reentrancy guards)
3. Optimize gas with storage packing, calldata usage, custom errors
4. Write comprehensive Foundry tests (unit, fuzz, invariant)
5. Create deployment scripts with verification

---

## Core Patterns

### Storage Optimization
```solidity
// ❌ BAD: 3 storage slots (96 bytes used, 96 bytes allocated)
uint256 amount;     // slot 0
address owner;      // slot 1
bool active;        // slot 2

// ✅ GOOD: 2 storage slots (53 bytes used, 64 bytes allocated)
uint256 amount;     // slot 0
address owner;      // slot 1 (20 bytes)
bool active;        // slot 1 (1 byte, packed with address)
```

### Custom Errors (Gas Efficient)
```solidity
// ❌ BAD: ~50+ bytes for string
require(balance >= amount, "Insufficient balance");

// ✅ GOOD: 4 bytes selector only
error InsufficientBalance(uint256 available, uint256 required);
if (balance < amount) revert InsufficientBalance(balance, amount);
```

### Check-Effects-Interactions (CEI)
```solidity
function withdraw(uint256 amount) external {
    // 1. CHECK
    if (balances[msg.sender] < amount) revert InsufficientBalance();

    // 2. EFFECTS (state changes BEFORE external calls)
    balances[msg.sender] -= amount;

    // 3. INTERACTIONS (external calls LAST)
    (bool success, ) = msg.sender.call{value: amount}("");
    if (!success) revert TransferFailed();
}
```

### Transient Storage (EIP-1153, Solidity 0.8.24+)
```solidity
// Gas-efficient reentrancy guard using transient storage
modifier nonReentrant() {
    assembly {
        if tload(0) { revert(0, 0) }
        tstore(0, 1)
    }
    _;
    assembly {
        tstore(0, 0)
    }
}
```

### Upgradeable Contracts (UUPS)
```solidity
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract MyContract is UUPSUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize() public initializer {
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
```

---

## ERC Implementation Quick Reference

### ERC-20 (Fungible Token)
- Use OpenZeppelin `ERC20` base
- Add `permit` for gasless approvals (ERC-2612)
- Consider `ERC20Votes` for governance tokens
- Handle fee-on-transfer and rebasing edge cases

### ERC-721 (NFT)
- Use `ERC721Enumerable` only if on-chain enumeration needed (expensive)
- Implement `ERC2981` for royalties
- Use `_safeMint` to check receiver compatibility
- Consider `ERC721A` for batch minting optimization

### ERC-1155 (Multi-Token)
- Ideal for gaming assets and mixed fungible/non-fungible
- Batch operations reduce gas significantly
- Implement `uri()` with token ID substitution

### ERC-4626 (Tokenized Vault)
- Standard for yield-bearing vaults
- Beware of inflation attack on first deposit
- Always round against the user (deposit up, withdraw down)

---

## Gas Optimization Checklist

| Technique | Savings |
|-----------|---------|
| Custom errors | ~50 gas per revert |
| `calldata` instead of `memory` | ~60 gas per param |
| `unchecked` (safe arithmetic) | ~20-40 gas per op |
| Storage packing | ~20,000 gas per slot saved |
| `immutable` / `constant` | ~2,100 gas on read |
| Caching `.length` in loops | ~6 gas per iteration |
| `bytes32` instead of `string` | ~100+ gas |
| `mapping` instead of `array` | Variable, often significant |

---

## Testing Patterns (Foundry)

```solidity
// Unit Test
function test_Transfer() public {
    token.mint(alice, 1000);
    vm.prank(alice);
    token.transfer(bob, 500);
    assertEq(token.balanceOf(bob), 500);
}

// Fuzz Test
function testFuzz_Transfer(uint256 amount) public {
    amount = bound(amount, 1, MAX_SUPPLY);
    token.mint(alice, amount);
    vm.prank(alice);
    token.transfer(bob, amount);
    assertEq(token.balanceOf(bob), amount);
}

// Invariant Test
function invariant_TotalSupplyMatchesBalances() public {
    uint256 sum = token.balanceOf(alice) + token.balanceOf(bob);
    assertEq(token.totalSupply(), sum);
}
```

---

## Deployment Script (Foundry)
```solidity
// script/Deploy.s.sol
contract DeployScript is Script {
    function run() public {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        MyContract c = new MyContract();

        vm.stopBroadcast();

        // Verify
        // forge verify-contract <address> MyContract --chain <chain-id>
    }
}
```
