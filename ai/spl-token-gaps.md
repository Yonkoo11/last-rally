# SPL Token Support - Gaps & Known Issues

## What Was Fixed (Just Now)
1. ✅ **Token balance fetching** - Added USDC/BONK balance display
   - Fetches associated token account balances on wallet connect
   - Shows correct balance for selected token in UI
   - Handles missing ATAs gracefully (shows 0 balance)

2. ✅ **Balance-aware UI** - Wager presets now check actual token balance
   - Can't select wager amount greater than token balance
   - Create button disabled if insufficient balance

## Remaining Gaps (Need Testing to Fix)

### 1. ATA Creation Not Handled ❌
**Problem**: Player ATAs might not exist when creating/joining match

**Current Code**: Uses `UncheckedAccount` in Anchor program - doesn't auto-create ATAs

**What Happens**: Transaction will fail if:
- Player1 creates BONK match but doesn't have BONK ATA
- Player2 tries to join but doesn't have BONK ATA
- Escrow ATA doesn't exist (first BONK match ever)

**Solutions**:
- **Option A (Frontend)**: Check if ATAs exist before tx, create them first
- **Option B (Program)**: Change to `init_if_needed` constraint on token accounts
- **Option C (Hybrid)**: Frontend creates player ATAs, program creates escrow ATA

**Recommendation**: Option B - Update Anchor program:
```rust
#[account(
    init_if_needed,
    payer = player1,
    associated_token::mint = mint,
    associated_token::authority = match_account,
)]
pub escrow_token_account: Account<'info, TokenAccount>,
```

### 2. Token Account Derivation - Unverified ❌
**Status**: Using `getAssociatedTokenAddressSync()` - standard pattern
**Risk**: Low - this is the correct way to derive ATAs
**Needs**: Runtime testing to confirm accounts match program expectations

### 3. Error Handling - Missing ❌
**Current**: Generic error messages
**Needs**:
- Specific error for "ATA doesn't exist"
- Specific error for "Insufficient token balance"
- User-friendly instructions (e.g., "Get BONK tokens first")

### 4. Token Approval - Not Implemented ❌
**Problem**: SPL token transfers require approval
**Current**: Assuming wallet auto-approves
**Needs**: Explicit token approval UI if needed

### 5. Escrow ATA Authority - Unverified ❌
**Current**: Escrow ATA authority = match PDA
**Needs**: Verify PDA can sign for token transfers (should work with seeds)

## Testing Checklist (When Program Deploys)

### Test 1: SOL Match (Baseline)
- [ ] Create SOL match → succeeds
- [ ] Join SOL match → succeeds
- [ ] Settle SOL match → winner receives SOL

### Test 2: USDC Match (Happy Path)
- [ ] Player has USDC ATA → create match succeeds
- [ ] Player2 has USDC ATA → join succeeds
- [ ] Settle → winner receives USDC

### Test 3: BONK Match (Edge Cases)
- [ ] Player has no BONK ATA → create match (expect failure)
- [ ] Create BONK ATA → retry create match (expect success)
- [ ] Player2 no BONK ATA → join fails
- [ ] Create BONK ATA → join succeeds

### Test 4: Balance Checks
- [ ] Select BONK, balance shows "0 BONK" if no ATA
- [ ] Select BONK, balance shows correct amount if ATA exists
- [ ] Can't create match with amount > balance

### Test 5: Escrow
- [ ] First BONK match creates escrow ATA
- [ ] Second BONK match reuses escrow ATA
- [ ] Escrow ATA authority is match PDA
- [ ] PDA can sign token transfers

## Priority Fixes (Pre-Testing)
1. **Add init_if_needed to Anchor program** (prevents most ATA failures)
2. **Add ATA existence check in frontend** (better UX)
3. **Improve error messages** (guide users to solutions)

## Current Confidence
- **SOL matches**: High (similar to existing code)
- **SPL matches**: Medium (untested, ATA creation gap)
- **Overall**: Ready for testing, expect 1-2 bugs to fix
