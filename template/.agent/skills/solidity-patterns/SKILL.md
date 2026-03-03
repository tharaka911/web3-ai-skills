---
name: solidity-patterns
description: Solidity 0.8.x+ patterns, ERC standards, gas optimization, upgradeable contracts, DeFi integrations, LimitBreak Creator Tokens, Ethereum 2026 features. Use when writing or reviewing Solidity smart contracts.
---

# Solidity Patterns — EVM Smart Contract Mastery

Expert knowledge for writing secure, gas-efficient Solidity smart contracts on EVM chains.

## Use this skill when

- Writing new Solidity contracts
- Optimizing gas consumption
- Implementing ERC standards or LimitBreak Creator Tokens
- Creating upgradeable proxy contracts
- Using Ethereum 2026 features (Pectra/Dencun)

---

## Core Patterns

### Check-Effects-Interactions (CEI)
```solidity
function withdraw(uint256 amount) external {
    // 1. CHECK
    if (balances[msg.sender] < amount) revert InsufficientBalance();
    // 2. EFFECTS
    balances[msg.sender] -= amount;
    // 3. INTERACTIONS
    (bool ok, ) = msg.sender.call{value: amount}("");
    if (!ok) revert TransferFailed();
}
```

### Custom Errors
```solidity
error InsufficientBalance(uint256 available, uint256 required);
if (balance < amount) revert InsufficientBalance(balance, amount);
```

### Transient Storage (EIP-1153)
```solidity
modifier nonReentrant() {
    assembly {
        if tload(0) { revert(0, 0) }
        tstore(0, 1)
    }
    _;
    assembly { tstore(0, 0) }
}
```

### Storage Optimization
```solidity
// Pack variables into single slots (32 bytes)
uint128 amount;   // slot 0 (16 bytes)
uint64 timestamp; // slot 0 (8 bytes)
address owner;    // slot 1 (20 bytes)
bool active;      // slot 1 (1 byte)
```

---

## Solidity Design Patterns

### Factory Pattern
```solidity
contract TokenFactory {
    event TokenCreated(address indexed token, address indexed owner);

    function createToken(string memory name, string memory symbol) external returns (address) {
        MyToken token = new MyToken(name, symbol, msg.sender);
        emit TokenCreated(address(token), msg.sender);
        return address(token);
    }
}
```

### Minimal Proxy (EIP-1167 Clones)
```solidity
import "@openzeppelin/contracts/proxy/Clones.sol";

contract VaultFactory {
    address public immutable implementation;

    constructor() {
        implementation = address(new Vault());
    }

    function createVault(address owner) external returns (address) {
        address clone = Clones.clone(implementation);
        Vault(clone).initialize(owner);
        return clone;
    }
}
// Gas: ~45k per clone vs ~500k+ for full deployment
```

### Diamond Pattern (EIP-2535)
```solidity
// Multi-facet proxy — unlimited contract size
// Each facet handles a subset of functions
struct FacetCut {
    address facetAddress;
    FacetCutAction action;  // Add, Replace, Remove
    bytes4[] functionSelectors;
}

// Use when: contract exceeds 24KB limit, need modular upgrades
// Avoid when: simple contracts, gas-sensitive operations
```

### UUPS Upgradeable
```solidity
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract MyContract is UUPSUpgradeable, OwnableUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address owner) public initializer {
        __Ownable_init(owner);
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
```

### Pull Payment (Withdrawal Pattern)
```solidity
mapping(address => uint256) public pendingWithdrawals;

function _asyncTransfer(address dest, uint256 amount) internal {
    pendingWithdrawals[dest] += amount;
}

function withdraw() external {
    uint256 amount = pendingWithdrawals[msg.sender];
    if (amount == 0) revert NothingToWithdraw();
    pendingWithdrawals[msg.sender] = 0;
    (bool ok, ) = msg.sender.call{value: amount}("");
    if (!ok) revert TransferFailed();
}
```

### Commit-Reveal
```solidity
mapping(address => bytes32) public commits;
mapping(address => uint256) public commitBlock;

function commit(bytes32 hash) external {
    commits[msg.sender] = hash;
    commitBlock[msg.sender] = block.number;
}

function reveal(uint256 value, bytes32 salt) external {
    if (block.number <= commitBlock[msg.sender]) revert TooEarly();
    if (keccak256(abi.encodePacked(value, salt)) != commits[msg.sender]) revert InvalidReveal();
    delete commits[msg.sender];
    // Use revealed value...
}
```

### State Machine
```solidity
enum State { Created, Active, Paused, Finalized }
State public state;

modifier inState(State expected) {
    if (state != expected) revert InvalidState(state, expected);
    _;
}

function activate() external onlyOwner inState(State.Created) {
    state = State.Active;
}
```

### CREATE2 Deterministic Deployment
```solidity
// Same address across all EVM chains
bytes32 salt = keccak256(abi.encodePacked(deployer, nonce));

address predicted = address(uint160(uint256(keccak256(abi.encodePacked(
    bytes1(0xff), factory, salt, keccak256(bytecode)
)))));

// Deploy
address deployed = Create2.deploy(0, salt, bytecode);
```

### Access Control (OpenZeppelin v5)
```solidity
// Simple: Ownable
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Role-based: AccessControl
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

// Advanced: AccessManager (OZ v5)
// Centralized permission management across multiple contracts
import {AccessManager} from "@openzeppelin/contracts/access/manager/AccessManager.sol";
```

---

## LimitBreak Creator Token Standards

### Overview
LimitBreak's Creator Token Standards enforce on-chain royalties via **transfer security profiles** — the foundation for programmable, enforceable royalties that cannot be bypassed.

### Core Standards
| Standard | Base | Purpose |
|----------|------|---------|
| **ERC721C** | OZ ERC721 | NFT + enforceable royalties |
| **ERC721AC** | Azuki ERC721A | Batch mint + enforceable royalties |
| **ERC1155C** | OZ ERC1155 | Multi-token + enforceable royalties |
| **ERC20C** | OZ ERC20 | Fungible + transfer security |
| **AdventureERC721** | ERC721 | On-chain quests, hard/soft staking |
| **AdventureERC721C** | AdventureERC721 | Adventure + enforceable royalties |

### ERC721C Implementation
```solidity
import "@limitbreak/creator-token-standards/src/erc721c/ERC721C.sol";
import "@limitbreak/creator-token-standards/src/programmable-royalties/BasicRoyalties.sol";

contract MyNFT is ERC721C, BasicRoyalties {
    constructor(
        address royaltyReceiver,
        uint96 royaltyFeeNumerator
    )
        ERC721C("MyNFT", "MNFT")
        BasicRoyalties(royaltyReceiver, royaltyFeeNumerator)
    {}

    // Required: connect to Transfer Validator
    function _requireCallerIsContractOwner() internal view override {
        if (msg.sender != owner()) revert Unauthorized();
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721C, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
```

### Transfer Validator
The `CreatorTokenTransferValidator` is the core infrastructure. Creators configure **security levels** per collection:

| Security Level | Description |
|----------------|-------------|
| **0 - Recommended** | Transfers allowed to verified EOAs and whitelisted contracts |
| **1 - Level One** | Caller must be whitelisted or an EOA |
| **2 - Level Two** | Caller and receiver must be whitelisted or EOA |
| **3 - Level Three** | No code callers allowed (EOA only) |
| **4 - Level Four** | Soulbound (no transfers except mint/burn) |

```solidity
// Creator sets security level for their collection
ITransferValidator validator = ITransferValidator(TRANSFER_VALIDATOR_ADDRESS);

// Set security level
validator.setTransferSecurityLevelOfCollection(address(myNFT), 1);

// Manage whitelist
validator.addToWhitelist(whitelistId, trustedMarketplace);
```

### Wrapper Standards (Upgrade Vanilla → Creator Tokens)
```solidity
import "@limitbreak/creator-token-standards/src/erc721c/extensions/ERC721CW.sol";

contract UpgradedNFT is ERC721CW {
    // Users can stake their vanilla ERC721 to receive a Creator Token version
    // Presets: Permanent, PaidUnstake, TimeLockedUnstake
}
```

### Programmable Royalties
| Mix-in | Description |
|--------|-------------|
| `ImmutableMinterRoyalties` | Fixed royalty to minter, cannot change |
| `MutableMinterRoyalties` | Minter can update their royalty % |
| `MinterCreatorSharedRoyalties` | Split royalties between minter + creator |
| `BasicRoyalties` | Standard ERC-2981 implementation |

### Installation
```bash
# Foundry
forge install limitbreakinc/creator-token-standards

# Hardhat
npm install @limitbreak/creator-token-standards
```

---

## ERC Standards Quick Reference

### ERC-20 (Fungible Token)
- Use OZ `ERC20` + `ERC20Permit` for gasless approvals
- `ERC20Votes` for governance tokens
- Handle fee-on-transfer edge cases

### ERC-721 (NFT)
- Use `ERC721C` for enforceable royalties, or OZ `ERC721` for standard
- `ERC721A` (Azuki) for gas-efficient batch minting
- `ERC2981` for royalty info standard
- `_safeMint` to verify receiver compatibility

### ERC-1155 (Multi-Token)
- Batch operations reduce gas significantly
- Ideal for gaming assets (weapons, items, currencies)
- `uri()` with token ID substitution

### ERC-4626 (Tokenized Vault)
- Standard for yield-bearing vaults (DeFi)
- Virtual shares to prevent inflation attack on first deposit
- Always round against the user

### ERC-6551 (Token Bound Accounts)
- NFTs that own assets (wallet per NFT)
- Used for gaming characters, identity

---

## Ethereum 2026 Features

### Pectra Upgrade (Live — Prague/Electra)

#### EIP-7702: Native Account Abstraction for EOAs
EOAs can delegate to smart contract code without deploying a new contract.

```solidity
// EOA signs authorization to delegate to an implementation
// The EOA temporarily gains smart contract capabilities:
// - Batched transactions
// - Gas sponsorship
// - Custom validation logic

// Impact: replaces ERC-4337 for many use cases
// EOAs keep their existing address (no migration needed)
```

```typescript
// Using viem with EIP-7702
import { sendTransaction } from 'viem'

const hash = await sendTransaction(walletClient, {
  authorizationList: [{
    contractAddress: smartAccountImpl,
    chainId: 1,
    nonce: 0,
  }],
  to: targetContract,
  data: calldata,
})
```

#### EIP-7251: Max Effective Balance Increase
- Validators can now have >32 ETH effective balance (up to 2048 ETH)
- Reduces number of consensus messages
- Enables solo staker consolidation

#### EIP-6110: Supply On-Chain Deposits
- Validator deposits processed directly by execution layer
- Removes dependency on the deposit contract event log
- Faster validator activation

#### EIP-7685: General Purpose Execution Layer Requests
- Standardized way for EL to make requests to CL
- Foundation for future cross-layer features

### Dencun Features (Already Live)

#### EIP-1153: Transient Storage
```solidity
// TSTORE/TLOAD — storage that resets after each transaction
// Much cheaper than regular SSTORE/SLOAD
// Perfect for: reentrancy locks, callback data, flash loan state
assembly {
    tstore(slot, value)  // Write — cheaper than SSTORE
    let v := tload(slot) // Read — cheaper than SLOAD
}
// Clears automatically at end of transaction
```

#### EIP-4844: Blob Transactions (Proto-Danksharding)
- New transaction type carrying data "blobs"
- Used by L2 rollups (Optimism, Arbitrum, Base) for cheaper data availability
- 128KB blobs with separate fee market
- Reduced L2 gas costs by ~10-100x

### Osaka (Next — Expected 2026)

#### EOF: EVM Object Format
- New bytecode format with validation at deploy time
- Separates code from data sections
- Removes `JUMPDEST` analysis overhead
- Adds subroutines (`CALLF`/`RETF`)
- Breaking change for bytecode analysis tools

#### Verkle Trees
- Replace Merkle Patricia Trees for state storage
- Much smaller proofs (~150 bytes vs ~1KB+)
- Enables stateless clients
- Major step toward Ethereum scalability

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
| Transient storage (EIP-1153) | ~80% cheaper than SSTORE |
| Minimal Proxy (EIP-1167) | ~90% cheaper deploys |

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
