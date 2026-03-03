---
description: Run security audit on smart contracts. Automated tools + manual review checklist.
---

# /audit - Smart Contract Security Audit

$ARGUMENTS

---

## Purpose

Run a comprehensive security audit on smart contracts using automated tools and manual review.

---

## Sub-commands

```
/audit                 - Full audit (automated + manual)
/audit quick           - Slither + Aderyn only
/audit full            - All tools + manual review
/audit report          - Generate audit report from findings
```

---

## Audit Workflow

```
┌─────────────────┐
│  /audit         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  1. Scope       │  Identify contracts, LOC, dependencies
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. Automated   │  Slither → Mythril → Aderyn
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. Manual      │  Line-by-line, attack vectors
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  4. Fuzzing     │  Foundry fuzz + Echidna
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  5. Report      │  Findings + recommendations
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ✅ Complete    │
└─────────────────┘
```

---

## Tool Commands

```bash
# Static Analysis
slither . --detect all --exclude-low
aderyn .

# Symbolic Execution
myth analyze contracts/Target.sol --solv 0.8.24

# Fuzz Testing
forge test --fuzz-runs 10000

# Gas Report
forge test --gas-report
```

---

## Manual Review Checklist

### Critical Checks
- [ ] Reentrancy (CEI pattern enforced?)
- [ ] Access control (all admin functions protected?)
- [ ] Flash loan attack vectors
- [ ] Oracle manipulation risks
- [ ] Integer overflow in `unchecked` blocks

### High Priority
- [ ] Front-running vulnerabilities
- [ ] Signature replay attacks
- [ ] Delegate call safety
- [ ] Proxy storage layout

### Medium Priority
- [ ] Centralization risks (single admin key?)
- [ ] Precision loss in calculations
- [ ] DoS vectors (unbounded loops?)
- [ ] Event emission completeness

---

## Output: Audit Report

```markdown
# Security Audit Report

## Summary
| Severity | Count |
|----------|-------|
| Critical | 0     |
| High     | 1     |
| Medium   | 2     |
| Low      | 3     |
| Info     | 5     |

## Findings
[Detailed findings with severity, description, impact, PoC, and recommendations]
```
