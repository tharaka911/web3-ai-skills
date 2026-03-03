---
name: dapp-patterns
description: DApp architecture patterns, IPFS, ENS, token gating, gasless transactions, account abstraction, signing patterns, and metadata standards.
---

# DApp Patterns — Web3 Application Architecture

Expert knowledge for designing and building decentralized application architectures.

## Use this skill when

- Designing DApp architecture and data flow
- Implementing token gating or access control
- Working with IPFS and decentralized storage
- Setting up gasless transactions (meta-transactions)
- Implementing account abstraction (ERC-4337)
- Building NFT metadata and reveal systems

---

## Architecture Patterns

### DApp Data Flow
```
User Wallet → DApp Frontend → Contract Interaction
                    ↓
              Wagmi/viem → RPC Provider → Blockchain
                    ↓
              Subgraph/Indexer → Read Historical Data
                    ↓
              IPFS/Arweave → Decentralized Storage
```

### Backend for DApps
| Pattern | When to Use |
|---------|-------------|
| **Fully On-Chain** | Simple contracts, low data requirements |
| **Hybrid** | On-chain state + off-chain metadata/API |
| **Indexed** | Complex queries via The Graph/Ponder |
| **Off-Chain + Proof** | Large data with on-chain verification |

---

## Token Gating

```typescript
// Check NFT ownership for access
import { useReadContract } from 'wagmi'

function useTokenGate(contractAddress: Address, userAddress: Address) {
  const { data: balance } = useReadContract({
    address: contractAddress,
    abi: erc721Abi,
    functionName: 'balanceOf',
    args: [userAddress],
  })

  return { hasAccess: balance && balance > 0n }
}
```

---

## Decentralized Storage

### IPFS
```typescript
// Upload to IPFS via Pinata
const uploadToIPFS = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  })

  const { IpfsHash } = await res.json()
  return `ipfs://${IpfsHash}`
}
```

### NFT Metadata Standard
```json
{
  "name": "My NFT #1",
  "description": "Description of the NFT",
  "image": "ipfs://Qm.../1.png",
  "animation_url": "ipfs://Qm.../1.mp4",
  "external_url": "https://myproject.com/nft/1",
  "attributes": [
    { "trait_type": "Background", "value": "Blue" },
    { "trait_type": "Power", "value": 85, "display_type": "number" }
  ]
}
```

---

## Account Abstraction (ERC-4337)

### Key Concepts
- **Smart Contract Wallets**: Wallets are contracts, not EOAs
- **UserOperations**: Bundled transactions via alt-mempool
- **Paymasters**: Sponsor gas for users
- **Bundlers**: Submit UserOps to chain

### Libraries
| Library | Purpose |
|---------|---------|
| **Pimlico** | Bundler + Paymaster infrastructure |
| **ZeroDev** | SDK for smart accounts |
| **Alchemy AA SDK** | Account abstraction toolkit |
| **Safe{Core}** | Modular smart account |

---

## Gasless Transactions

### ERC-2771 (Meta-Transactions)
```solidity
// Trusted forwarder pattern
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract MyContract is ERC2771Context {
    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}

    function doSomething() external {
        address sender = _msgSender(); // Works with meta-tx
    }
}
```

### ERC-2612 (Permit)
```typescript
// Gasless token approval via signature
const { signTypedDataAsync } = useSignTypedData()

const signature = await signTypedDataAsync({
  domain: { name: 'Token', version: '1', chainId, verifyingContract: tokenAddress },
  types: { Permit: [/* EIP-2612 types */] },
  primaryType: 'Permit',
  message: { owner, spender, value, nonce, deadline },
})
```

---

## Signing Patterns

### EIP-712 (Typed Structured Data)
```solidity
bytes32 public constant DOMAIN_TYPEHASH = keccak256(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
);

bytes32 public constant ORDER_TYPEHASH = keccak256(
    "Order(address maker,address token,uint256 amount,uint256 nonce,uint256 deadline)"
);
```

### Best Practices
- Always include `chainId` to prevent cross-chain replay
- Always include `nonce` to prevent same-chain replay
- Always include `deadline` for time-bounded signatures
- Use `EIP-712` for human-readable signature requests

---

## ENS Integration

```typescript
import { useEnsName, useEnsAddress, useEnsAvatar } from 'wagmi'

// Address → ENS name
const { data: ensName } = useEnsName({ address: '0x...' })

// ENS name → Address
const { data: address } = useEnsAddress({ name: 'vitalik.eth' })

// ENS avatar
const { data: avatar } = useEnsAvatar({ name: 'vitalik.eth' })
```
