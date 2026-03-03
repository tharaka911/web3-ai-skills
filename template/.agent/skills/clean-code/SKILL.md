---
name: clean-code
description: Pragmatic coding standards for Web3 development. Concise, secure, gas-aware code. No over-engineering, no unnecessary comments. Applied globally to all Web3 code.
---

# Clean Code — Web3 Standards

Pragmatic coding standards applied globally to all Web3 development.

## Core Principles

1. **Security over cleverness** — Simple code is auditable code
2. **Gas-aware** — Every line costs money on-chain
3. **Self-documenting** — Good names eliminate the need for comments
4. **Test everything** — Untested code is broken code
5. **Fail fast** — Revert early with descriptive errors

---

## Solidity Standards

### Naming
```solidity
// Constants: UPPER_SNAKE_CASE
uint256 public constant MAX_SUPPLY = 10_000;

// State variables: camelCase
uint256 public totalMinted;

// Functions: camelCase, verb-first
function mintToken(address to) external;
function _validateInput(uint256 amount) internal;

// Events: PascalCase, past tense
event TokenMinted(address indexed to, uint256 tokenId);

// Custom errors: PascalCase, descriptive
error InsufficientBalance(uint256 available, uint256 required);
```

### File Organization
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// 1. Imports
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// 2. Interfaces
// 3. Libraries
// 4. Contract

contract MyToken is ERC721 {
    // a. Type declarations
    // b. State variables
    // c. Events
    // d. Errors
    // e. Modifiers
    // f. Constructor
    // g. External functions
    // h. Public functions
    // i. Internal functions
    // j. Private functions
    // k. View/Pure functions
}
```

---

## TypeScript / Frontend Standards

### Naming
```typescript
// Components: PascalCase
function MintButton() {}

// Hooks: camelCase, 'use' prefix
function useTokenBalance() {}

// Constants: UPPER_SNAKE_CASE
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL

// Types: PascalCase
interface TokenMetadata { name: string; symbol: string }
```

### Patterns
```typescript
// ✅ Early returns
function validateAddress(address: string) {
  if (!address) return null
  if (!isAddress(address)) return null
  return getAddress(address) // checksummed
}

// ✅ Exhaustive error handling
try {
  await writeContract({ ... })
} catch (error) {
  if (error instanceof UserRejectedRequestError) {
    toast.error('Transaction rejected')
  } else if (error instanceof ContractFunctionExecutionError) {
    toast.error(`Contract error: ${error.shortMessage}`)
  } else {
    toast.error('Unexpected error')
    console.error(error)
  }
}
```

---

## Rust Standards

### Naming
```rust
// Structs/Enums: PascalCase
pub struct UserAccount { ... }

// Functions/Methods: snake_case
pub fn process_transfer() -> Result<()> { ... }

// Constants: UPPER_SNAKE_CASE
pub const MAX_STAKE: u64 = 1_000_000;

// Modules: snake_case
mod instructions;
```

---

## Anti-Patterns (Global)

| ❌ Don't | ✅ Do |
|----------|-------|
| Comment obvious code | Write self-documenting code |
| Over-engineer for "future needs" | Solve today's problem well |
| Copy-paste code | Extract into shared functions |
| Ignore errors | Handle every error path explicitly |
| Use magic numbers | Define named constants |
| Leave dead code | Delete unused code |
| Skip tests | Write tests alongside code |
