---
name: rust-smart-contracts
description: Rust blockchain program development for Solana (Anchor), CosmWasm, and Arbitrum Stylus. Account model, PDAs, CPI, compute budget optimization.
---

# Rust Smart Contracts — Solana, CosmWasm, Stylus

Expert knowledge for building secure, efficient blockchain programs in Rust.

## Use this skill when

- Writing Solana programs (Anchor or native)
- Building CosmWasm smart contracts
- Developing Arbitrum Stylus contracts
- Optimizing compute units on Solana
- Implementing cross-program invocations (CPI)

## Do not use this skill when

- Writing Solidity/EVM contracts (use `solidity-patterns`)
- Building DApp frontends (use `rainbowkit-wagmi`)

## Instructions

1. Identify the target runtime (Solana, CosmWasm, Stylus)
2. Design account/state structure appropriate for the runtime
3. Implement with proper validation and error handling
4. Write comprehensive tests
5. Deploy and verify

---

## Solana / Anchor Patterns

### Account Validation
```rust
#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut, has_one = authority)]
    pub from: Account<'info, TokenAccount>,

    #[account(mut)]
    pub to: Account<'info, TokenAccount>,

    pub authority: Signer<'info>,

    /// CHECK: Validated by constraint
    #[account(
        seeds = [b"vault", from.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,
}
```

### PDA Derivation
```rust
// Deterministic address from seeds
let (pda, bump) = Pubkey::find_program_address(
    &[b"user-stats", user.key().as_ref()],
    program_id,
);

// In Anchor
#[account(
    init,
    payer = user,
    space = 8 + UserStats::INIT_SPACE,
    seeds = [b"user-stats", user.key().as_ref()],
    bump,
)]
pub user_stats: Account<'info, UserStats>,
```

### Cross-Program Invocation (CPI)
```rust
// Transfer SOL via CPI
let cpi_context = CpiContext::new(
    ctx.accounts.system_program.to_account_info(),
    system_program::Transfer {
        from: ctx.accounts.payer.to_account_info(),
        to: ctx.accounts.recipient.to_account_info(),
    },
);
system_program::transfer(cpi_context, amount)?;
```

### Compute Unit Optimization
| Technique | CU Savings |
|-----------|-----------|
| Avoid `msg!` in production | ~100 CU each |
| Use `zero_copy` for large accounts | Significant |
| Minimize account validations | ~200 CU per check |
| Use `Box<Account<>>` for large accounts | Stack savings |
| Batch operations in single ix | Reduced overhead |

### Security Checklist
- ✅ Validate all account ownership
- ✅ Check signer authority
- ✅ Validate PDA seeds match expected
- ✅ Prevent reinitialization
- ✅ Use checked arithmetic
- ✅ Close accounts properly (return rent)
- ✅ Validate token mint matches expected
- ❌ Never trust account data without validation
- ❌ Never use unchecked arithmetic

---

## CosmWasm Patterns

### Message Types
```rust
#[cw_serde]
pub enum ExecuteMsg {
    Transfer { recipient: String, amount: Uint128 },
    UpdateConfig { admin: Option<String> },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(BalanceResponse)]
    Balance { address: String },
}
```

### Entry Points
```rust
#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    let state = State { owner: info.sender, count: msg.count };
    STATE.save(deps.storage, &state)?;
    Ok(Response::new().add_attribute("method", "instantiate"))
}
```

### IBC (Inter-Blockchain Communication)
- Implement `ibc_channel_open`, `ibc_channel_connect`
- Handle `ibc_packet_receive` for cross-chain messages
- Use `IbcMsg::Transfer` for token transfers

---

## Stylus (Rust on EVM)

### Key Pattern
```rust
use stylus_sdk::{alloy_primitives::*, prelude::*};

#[storage]
pub struct Counter {
    count: StorageU256,
}

#[public]
impl Counter {
    pub fn increment(&mut self) {
        let count = self.count.get() + U256::from(1);
        self.count.set(count);
    }

    pub fn get(&self) -> U256 {
        self.count.get()
    }
}
```

---

## Testing

### Anchor Tests (TypeScript)
```typescript
it("initializes correctly", async () => {
  await program.methods
    .initialize()
    .accounts({ state: statePda, user: provider.wallet.publicKey })
    .rpc();

  const state = await program.account.state.fetch(statePda);
  expect(state.count.toNumber()).to.equal(0);
});
```

### Rust Unit Tests
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_process_instruction() {
        // Use solana-program-test or bankrun
    }
}
```
