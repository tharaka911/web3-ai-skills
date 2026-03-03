---
name: smart-contract-auditing
description: Smart contract security audit methodology. Slither, Mythril, Aderyn, Echidna, manual review patterns. Vulnerability classification, attack vectors, DeFi exploit patterns.
---

# Smart Contract Auditing — Security Analysis Methodology

Expert knowledge for systematically identifying vulnerabilities in smart contracts.

## Use this skill when

- Performing pre-deployment security audits
- Reviewing smart contract code for vulnerabilities
- Analyzing DeFi protocol security
- Investigating post-exploit incidents
- Preparing contracts for bug bounty programs

---

## Audit Workflow

```
1. SCOPE DEFINITION
   └── Identify contracts, dependencies, trust assumptions

2. AUTOMATED ANALYSIS
   └── Slither → Mythril → Aderyn → Echidna

3. MANUAL REVIEW
   └── Line-by-line, state machine analysis

4. EXPLOIT DEVELOPMENT
   └── PoC for each finding

5. REPORT
   └── Findings, severity, recommendations
```

---

## Automated Tools

### Slither (Static Analysis)
```bash
# Full analysis
slither . --detect all --exclude-low

# Specific detectors
slither . --detect reentrancy-eth,reentrancy-no-eth

# Print contract summary
slither . --print contract-summary

# Check for upgradeable issues
slither . --detect delegatecall-loop
```

### Mythril (Symbolic Execution)
```bash
# Analyze single contract
myth analyze contracts/Token.sol --solv 0.8.24

# Deep analysis with more solvers
myth analyze contracts/Token.sol --execution-timeout 300 --solver-timeout 60
```

### Aderyn (Rust-Based)
```bash
# Fast Rust-based analysis
aderyn .

# With specific output
aderyn . --output report.md
```

### Echidna (Fuzzing)
```yaml
# echidna.config.yaml
testMode: assertion
testLimit: 50000
shrinkLimit: 5000
```
```solidity
// Property test
function echidna_total_supply_invariant() public view returns (bool) {
    return token.totalSupply() <= MAX_SUPPLY;
}
```

---

## Vulnerability Taxonomy

### Critical (Immediate fund loss)

| Vulnerability | Pattern | Check |
|---------------|---------|-------|
| **Reentrancy** | External call before state update | CEI pattern enforced? |
| **Access Control Bypass** | Missing `onlyOwner` / role check | All admin functions protected? |
| **Uninitialized Proxy** | Proxy without `_disableInitializers()` | Constructor blocks init? |
| **Oracle Manipulation** | Spot price as oracle | TWAP with sufficient window? |
| **Arbitrary External Call** | User-controlled `target.call(data)` | Target address validated? |

### High (Conditional fund loss)

| Vulnerability | Pattern | Check |
|---------------|---------|-------|
| **Flash Loan Attack** | State manipulable in single tx | Same-block protections? |
| **Front-Running** | Profitable tx ordering | Commit-reveal or MEV protection? |
| **Signature Replay** | Missing nonce/chainId in signature | EIP-712 with full domain? |
| **Integer Overflow** | Unsafe `unchecked` blocks | Bounds validated before unchecked? |
| **Delegate Call Injection** | User-controlled delegatecall target | Target hardcoded or validated? |

### Medium (Limited impact)

| Vulnerability | Pattern | Check |
|---------------|---------|-------|
| **Centralization Risk** | Single admin key controls funds | Timelock + multisig? |
| **Precision Loss** | Division before multiplication | Correct order of operations? |
| **DoS via Revert** | Loop depends on external call | Pull pattern used? |
| **Timestamp Dependence** | Business logic on `block.timestamp` | Acceptable tolerance? |
| **Storage Collision** | Proxy upgrade changes layout | Storage gap pattern? |

---

## DeFi-Specific Attack Vectors

### Price Oracle Attacks
```solidity
// ❌ VULNERABLE: Spot price manipulation
uint256 price = pair.getReserves()[0] / pair.getReserves()[1];

// ✅ SAFE: TWAP oracle with sufficient window
uint256 price = oracle.consult(token, 1e18, TWAP_PERIOD);
```

### ERC-4626 Inflation Attack
```solidity
// ❌ VULNERABLE: First depositor can inflate share price
function deposit(uint256 assets) {
    uint256 shares = (totalSupply == 0) ? assets : assets * totalSupply / totalAssets;
}

// ✅ SAFE: Virtual shares and assets
function deposit(uint256 assets) {
    uint256 shares = assets * (totalSupply + 1) / (totalAssets + 1);
}
```

### Governance Attack
- Flash-borrow governance tokens
- Create and vote on malicious proposal
- Execute in same block

### Cross-Chain Bridge Exploits
- Message verification failures
- Replay across chains
- Race conditions in finality

---

## Report Template

```markdown
# Security Audit Report

## Summary
- **Project:** [Name]
- **Commit:** [Hash]
- **Scope:** [Contracts audited]
- **Duration:** [Days]

## Findings Summary

| ID | Title | Severity | Status |
|----|-------|----------|--------|
| H-01 | [Title] | High | Open |
| M-01 | [Title] | Medium | Fixed |

## Detailed Findings

### [H-01] Title

**Severity:** High
**Location:** `Contract.sol#L45-L62`

**Description:**
[Detailed description]

**Impact:**
[What an attacker can achieve]

**Proof of Concept:**
[Exploit code or test]

**Recommendation:**
[How to fix]
```
